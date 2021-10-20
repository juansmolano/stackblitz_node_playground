'use strict';

/* IMPORTED LIBS */
const _ = require('lodash');
const { of, forkJoin, from } = require("rxjs");
const { mergeMap, map, filter, expand, takeWhile, last, tap } = require('rxjs/operators');
const { error: { CustomError }, log: { ConsoleLogger } } = require("@nebulae/backend-node-tools");

const { MifareTools, PaymentMediumMifareInterpreter } = require('./smartcard');
const HSM = require("./hsm/HSM").singleton();
const securityMediumProductionKeys = require('./entities/SecurityMediumProductionKeys');
const securityMediumProductionKeysMap = securityMediumProductionKeys.reduce((map, key) => {
    map[key.name] = key;
    return map;
}, {});

const STEPS = {
    READ_CARD_BEFORE_MODS: 0,
    APPLY_MODS: 1,
    READ_CARD_AFTER_MODS: 2,
};

const httpRequest = require("./HttpRequest"); // NEEDS ENV ==> NODE_TLS_REJECT_UNAUTHORIZED=0



/* DB ENTITY SIMULATION */
const paymentMediumSession = require('./entities/PaymentMediumSession');
const profile = require('./entities/Profile');
const paymentMediumType = require('./entities/PaymentMediumType');


/* CLIENT (FRONTEND) SIMULATION VARS */
const PCSC_DAEMON_END_POINT = 'https://pcsc-daemon:1215/pcsc-daemon';
const READER_END_POINT = PCSC_DAEMON_END_POINT + '/readers/5C5C3F5C535744235363446576696365456E756D23315F4143535F414352313235325F31535F434C5F5265616465725F504943435F30237B64656562653661642D396530312D343765322D613362322D6136366161326330333663397D';
//const READER_END_POINT = PCSC_DAEMON_END_POINT + '/readers/5C5C3F5C535744235363446576696365456E756D23315F4143535F414352313235325F31535F434C5F5265616465725F504943435F30237B64656562653661642D396530312D343765322D613362322D6136366161326330333663397D';
const SMARTCARD_APDUS_END_POINT = READER_END_POINT + '/smartcard/sendApdus';
let __readerSessionId = Math.random() + '';


const logStep = (paymentMedium, paymentMediumType, step, stepName, logType, logData, timestamp = Date.now(), error = null) => {
    if (!paymentMediumSession.steps[step]) paymentMediumSession.steps[step] = { stepName, createTimestamp: timestamp };
    if (!paymentMediumSession.steps[step][logType]) paymentMediumSession.steps[step][logType] = {};
    paymentMediumSession.steps[step][logType] = { logType, data: logData, timestamp, error };
    //console.log('logStep[', step, '][', logType, '] = ', paymentMediumSession.steps[step][logType]);
};

const resetPaymentMediumSession = (paymentMediumSession) => {
    return {
        ...paymentMediumSession,
        step: 0,
        nextStep: null,
        processVars: {}
    };
};

const buildErrorResponse = (paymentMediumSession, errorDesc) => ({ paymentMediumSession: { ...paymentMediumSession, nextStep: { step: null, requestApdus: null, desc: null, error: errorDesc } } });

const readCard$ = async (paymentMediumSession, paymentMediumType, profile, responseApdus, authToken, thisStepNumber) => {
    const { paymentMedium } = paymentMediumSession;
    if (!paymentMediumSession.steps[thisStepNumber]) paymentMediumSession.steps[thisStepNumber] = {};
    paymentMediumSession.step = thisStepNumber;
    paymentMediumSession.nextStep = null;
    const [mapping, mappingVersion, mappingError] = extractPaymentMediumSpecs(paymentMediumSession, paymentMediumType);
    if (mappingError) return mappingError;

    const STATES = {
        READ: ['PENDING', 'READ_SENT', 'READ_VERIFIED'],
        AUTH: ['PENDING', 'AUTH_PHASE_I_SENT', 'AUTH_PHASE_I_VERIFIED', 'AUTH_PHASE_II_SENT', 'AUTH_PHASE_II_VERIFIED', 'AUTH_PHASE_II_PROCESSED']
    };
    const FINAL_STATES = Object.values(STATES).map(sts => sts[sts.length - 1]);
    const findNextProcessStep = (processStates) => processStates ? processStates.find(reading => !FINAL_STATES.includes(reading.state)) : undefined;

    let processStates = paymentMediumSession.steps[thisStepNumber].processStates;
    if (!processStates) {
        //having no processStates means this is the first time the session gets into this step, so we have to build or the inner steps to follow
        paymentMediumSession = resetPaymentMediumSession(paymentMediumSession);// we reset just as a precautions        
        paymentMediumSession.step = thisStepNumber;
        paymentMediumSession.steps[thisStepNumber].processStates = processStates = buildReadingProcessSteps(mapping);
    }

    let currentProcessState = findNextProcessStep(processStates);//this give us the next step in the process to execute    
    /* EVAL AND PROCESS PREV-REQUEST'S RESPONSES */
    if (currentProcessState && currentProcessState.state !== 'PENDING' && responseApdus.length > 0) { // eval the response from previous request
        logStep(paymentMedium, paymentMediumType, thisStepNumber, 'Leyendo tarjeta', 'responseApdus', responseApdus);
        for (let i in responseApdus) {
            const response = responseApdus[i];
            if (!response || !response.isValid || !response.responseApdu || !response.responseApdu.startsWith('90')) {
                const errMsg = currentProcessState.state === 'READ_SENT'
                    ? `No fue posible realizar la lectura`
                    : currentProcessState.state === 'AUTH_PHASE_I_SENT'
                        ? 'Falló primer paso de autenticación'
                        : currentProcessState.state === 'AUTH_PHASE_II_SENT'
                            ? 'Falló segundo paso de autenticación'
                            : '???' + currentProcessState.state + '???';
                return buildErrorResponse(paymentMediumSession, `${errMsg}.  request=${response.requestApdu} response=${response.responseApdu}`);
            }
            if (currentProcessState.state === 'READ_SENT') {
                const readResponse = MifareTools.hexToBytes(response.responseApdu.substring(2));
                const { blocks, processVars } = MifareTools.extractDataFromReadResponse(readResponse, paymentMediumSession.processVars);
                for (const block in blocks) {// convert bytes to hex block by block
                    blocks[block] = MifareTools.bytesToHex(blocks[block]);
                }
                paymentMediumSession.processVars = { ...paymentMediumSession.processVars, ...processVars };//update processVars 
                paymentMediumSession.steps[thisStepNumber].cardBlocks = { ...paymentMediumSession.steps[thisStepNumber].cardBlocks, ...blocks };//append newly read blocks
            }
        }
        //The current state was successful. now we need to move to the next state
        currentProcessState.state = STATES[currentProcessState.type][STATES[currentProcessState.type].indexOf(currentProcessState.state) + 1];
    }

    /* NEXT REQUEST GENERATION */
    currentProcessState = findNextProcessStep(processStates);// get next step
    const requestApdus = [];
    let nextStepDesc = '???';
    if (currentProcessState && currentProcessState.type === 'AUTH') {
        switch (currentProcessState.state) {
            case 'PENDING':
                const { apdu: authPhaseIApdu, processVars: authPhaseIProcessVars } = MifareTools.generateFirstAuthPhaseIApdu(currentProcessState.sector * 4, currentProcessState.key.type === 'KEYB');
                paymentMediumSession.processVars = { ...paymentMediumSession.processVars, step: thisStepNumber, block: currentProcessState.sector * 4, ext: 1, ...authPhaseIProcessVars };
                requestApdus.push(MifareTools.bytesToHex(authPhaseIApdu));
                currentProcessState.auth = { authPhaseIApdu };
                currentProcessState.state = 'AUTH_PHASE_I_SENT';
                nextStepDesc = `Leyendo tarjeta: Auth I, sector ${currentProcessState.sector}`;
                break;
            case 'AUTH_PHASE_I_VERIFIED':
                const { keyA, keyB } = await generateMifareKeys$(
                    paymentMediumSession,
                    paymentMediumType,
                    currentProcessState.key.type === 'KEYA' ? currentProcessState.key.productionKeyName : null,
                    currentProcessState.key.type === 'KEYB' ? currentProcessState.key.productionKeyName : null
                );
                const firstAuthPhase1 = MifareTools.hexToBytes(responseApdus[0].responseApdu.substring(2));
                const { apdu: authPhaseIIApdu, processVars: authPhaseIIProcessVars } = MifareTools.generateFirstAuthPhaseIIApdu(
                    firstAuthPhase1,
                    MifareTools.hexToBytes(keyA || keyB)
                );
                paymentMediumSession.processVars = { ...paymentMediumSession.processVars, ...authPhaseIIProcessVars };
                requestApdus.push(MifareTools.bytesToHex(authPhaseIIApdu));
                currentProcessState.auth = { ...currentProcessState.auth, firstAuthPhase1, authPhaseIIApdu };
                currentProcessState.state = 'AUTH_PHASE_II_SENT';
                nextStepDesc = `Leyendo tarjeta: Auth II, sector  ${currentProcessState.sector}`;
                break;
            case 'AUTH_PHASE_II_VERIFIED':
                const firstAuthPhase2 = MifareTools.hexToBytes(responseApdus[0].responseApdu.substring(2));
                const ParametersFromFirstAuth = MifareTools.extractParametersFromFirstAuthResult(firstAuthPhase2, paymentMediumSession.processVars);
                paymentMediumSession.processVars = { ...paymentMediumSession.processVars, ...ParametersFromFirstAuth };
                currentProcessState.auth = { ...currentProcessState.auth, firstAuthPhase2, ParametersFromFirstAuth };
                currentProcessState.state = 'AUTH_PHASE_II_PROCESSED';
                //Auth sptep is done.  we are ready for next step                
                currentProcessState = findNextProcessStep(processStates);
                break;
        }
    }
    if (currentProcessState && currentProcessState.type === 'READ') {
        switch (currentProcessState.state) {
            case 'PENDING':
                const { apdu: readBlocksApdu, processVars } = MifareTools.generateReadCmdApdu({ ...paymentMediumSession.processVars, bNr: currentProcessState.block, ext: currentProcessState.numberOfBlocksToRead });
                paymentMediumSession.processVars = { ...paymentMediumSession.processVars, ...processVars };
                logStep(paymentMedium, paymentMediumType, thisStepNumber, 'Leyendo tarjeta', 'requestApdus', [readBlocksApdu]);
                requestApdus.push(MifareTools.bytesToHex(readBlocksApdu));
                currentProcessState.state = 'READ_SENT';
                nextStepDesc = `Leyendo tarjeta: Lectura, sector  ${currentProcessState.sector}, bloque ${currentProcessState.block}, cant  ${currentProcessState.numberOfBlocksToRead}`;
                break;
        }
    }

    const areAllBlocksRead = !currentProcessState;
    if (areAllBlocksRead) {
        const interpreter = new PaymentMediumMifareInterpreter(mappingVersion);
        const cardData = interpreter.binaryToCardDataMap(paymentMediumSession.steps[thisStepNumber].cardBlocks);
        paymentMediumSession.steps[thisStepNumber].cardData = cardData;
        paymentMediumSession.steps[thisStepNumber].areAllBlocksRead = true;
    } else {
        paymentMediumSession.nextStep = {
            step: thisStepNumber,
            requestApdus: requestApdus,
            desc: nextStepDesc,
            error: null,
            resetReaderSession: false,
        };
        logStep(paymentMedium, paymentMediumType, paymentMediumSession.nextStep.step, paymentMediumSession.nextStep.desc, 'requestApdus', paymentMediumSession.nextStep.requestApdus);
    }

    paymentMediumSession.step = thisStepNumber;
    return paymentMediumSession;
};

const readCardBeforeMods$ = async (paymentMediumSession, paymentMediumType, profile, responseApdus, authToken) => {
    const thisStep = STEPS.READ_CARD_BEFORE_MODS;
    const nextStep = STEPS.APPLY_MODS;

    paymentMediumSession = await readCard$(paymentMediumSession, paymentMediumType, profile, responseApdus, authToken, thisStep);

    if (paymentMediumSession.steps[thisStep].areAllBlocksRead) {
        paymentMediumSession.nextStep = {
            step: nextStep,
            requestApdus: ['FFCA000000'],
            desc: 'Lectura realizada con éxito',
            error: null,
            resetReaderSession: true,
        };
        paymentMediumSession.processVars = {};
        delete paymentMediumSession.steps[thisStep].processStates;
        delete paymentMediumSession.steps[thisStep].requestApdus;
        delete paymentMediumSession.steps[thisStep].responseApdus;
    }
    return { paymentMediumSession };
};

const readCardAfterMods$ = async (paymentMediumSession, paymentMediumType, profile, responseApdus, authToken) => {
    const thisStep = STEPS.READ_CARD_AFTER_MODS;
    paymentMediumSession = await readCard$(paymentMediumSession, paymentMediumType, profile, responseApdus, authToken, thisStep);
    if (paymentMediumSession.steps[thisStep].areAllBlocksRead) {
        paymentMediumSession.nextStep = null;
        const { cardBlocks: cardBlocksBefore, cardData: cardDataBefore } = paymentMediumSession.steps[STEPS.READ_CARD_BEFORE_MODS];
        const { cardBlocks: cardBlocksProjected, cardData: cardDataProjected } = paymentMediumSession.steps[STEPS.APPLY_MODS];
        const { cardBlocks: cardBlocksAfter, cardData: cardDataAfter } = paymentMediumSession.steps[STEPS.READ_CARD_AFTER_MODS];

        paymentMediumSession.processVars = {};
        delete paymentMediumSession.steps[thisStep].processStates;
        delete paymentMediumSession.steps[thisStep].requestApdus;
        delete paymentMediumSession.steps[thisStep].responseApdus;

        const errors = [];
        for (const block in cardBlocksProjected) {
            if (cardBlocksProjected[block] !== cardBlocksAfter[block]) {
                const hadChanged = cardBlocksBefore[block] !== cardBlocksAfter[block];
                errors.push(`Bloque ${block} ${hadChanged ? 'fue parcialmente escrito' : 'no fue escrito'}`);
            }
        }
        if (errors.length > 0) {
            return buildErrorResponse(paymentMediumSession, `${errors.join(', ')}`);
        }
    }
    return { paymentMediumSession };
};


const applyMods$ = async (paymentMediumSession, paymentMediumType, profile, responseApdus, authToken) => {
    const thisStep = STEPS.APPLY_MODS;
    if (!paymentMediumSession.steps[thisStep]) paymentMediumSession.steps[thisStep] = {};
    paymentMediumSession.step = thisStep;
    paymentMediumSession.nextStep = null;
    const [mapping, mappingVersion, mappingError] = extractPaymentMediumSpecs(paymentMediumSession, paymentMediumType);
    if (mappingError) return mappingError;

    const MOD_PROCESS_STATE = ['PENDING', 'APPLYING', 'APPLIED'];
    const findNextModProcessToExecute = (modProcesses) => modProcesses ? modProcesses.find(modProcess => modProcess.state !== 'APPLIED') : undefined;

    let modProcesses = paymentMediumSession.steps[thisStep].modProcesses;
    if (!modProcesses) {
        //having no processStates means this is the first time the session gets into this step, so we have to build or the inner steps to follow
        paymentMediumSession = resetPaymentMediumSession(paymentMediumSession);// we reset just as a precautions        
        paymentMediumSession.step = thisStep;
        const { modificationProcesses, projectedValues } = buildWritingProcessSteps(paymentMediumSession, paymentMediumType, mappingVersion);
        paymentMediumSession.steps[thisStep].modProcesses = modProcesses = modificationProcesses;
        paymentMediumSession.steps[thisStep].cardBlocks = projectedValues.cardBlocks;
        paymentMediumSession.steps[thisStep].cardData = projectedValues.cardData;
    }

    let currenModProcess;
    let nextStep;
    while (!nextStep) {
        currenModProcess = findNextModProcessToExecute(modProcesses);//this give us the modification process to execute or continue
        if (!currenModProcess) break;
        nextStep = await evalMod$(currenModProcess, thisStep, paymentMediumSession, paymentMediumType, profile, responseApdus, authToken);
    }

    const areModificationsApplied = !currenModProcess;
    paymentMediumSession.nextStep = areModificationsApplied
        ? {
            step: STEPS.READ_CARD_AFTER_MODS,
            requestApdus: ['FFCA000000'],
            desc: 'Modificaciones aplciadas con éxito',
            error: null,
            resetReaderSession: true,
        }
        : nextStep;
    paymentMediumSession.step = thisStep;
    return { paymentMediumSession };
};

const evalMod$ = async (modProcess, thisStep, paymentMediumSession, paymentMediumType, profile, responseApdus, authToken) => {
    const { paymentMedium } = paymentMediumSession;
    const STATES = {
        WRITE: ['PENDING', 'WRITE_SENT', 'WRITE_VERIFIED'],
        AUTH: ['PENDING', 'AUTH_PHASE_I_SENT', 'AUTH_PHASE_I_VERIFIED', 'AUTH_PHASE_II_SENT', 'AUTH_PHASE_II_VERIFIED', 'AUTH_PHASE_II_PROCESSED']
    };
    const FINAL_STATES = Object.values(STATES).map(sts => sts[sts.length - 1]);
    const findNextStep = (steps) => steps ? steps.find(step => !FINAL_STATES.includes(step.state)) : undefined;

    let currentStep = findNextStep(modProcess.steps);//this give us the next step in the process to execute    

    /* EVAL AND PROCESS PREV-REQUEST'S RESPONSES */
    if (currentStep && currentStep.state !== 'PENDING' && responseApdus.length > 0) { // eval the response from previous request
        logStep(paymentMedium, paymentMediumType, thisStep, `Aplicando ${modProcess.mod.type}`, 'responseApdus', responseApdus);
        for (let i in responseApdus) {
            const response = responseApdus[i];
            if (!response || !response.isValid || !response.responseApdu || !response.responseApdu.startsWith('90')) {
                const errMsg = currentStep.state === 'WRITE_SENT'
                    ? `No fue posible realizar la escritura`
                    : currentStep.state === 'AUTH_PHASE_I_SENT'
                        ? 'Falló primer paso de autenticación'
                        : currentStep.state === 'AUTH_PHASE_II_SENT'
                            ? 'Falló segundo paso de autenticación'
                            : '???' + currentStep.state + '???';
                return buildErrorResponse(paymentMediumSession, `${errMsg}.  request=${response.requestApdu} response=${response.responseApdu}`);
            }
        }
        //The current state was successful. now we need to move to the next state
        currentStep.state = STATES[currentStep.type][STATES[currentStep.type].indexOf(currentStep.state) + 1];
    }


    /* NEXT REQUEST GENERATION */
    currentStep = findNextStep(modProcess.steps);// get next step
    const requestApdus = [];
    let nextStepDesc = `Aplicando ${modProcess.mod.type}`;
    if (currentStep && currentStep.type === 'AUTH') {
        switch (currentStep.state) {
            case 'PENDING':
                const { apdu: authPhaseIApdu, processVars: authPhaseIProcessVars } = MifareTools.generateFirstAuthPhaseIApdu(currentStep.sector * 4, currentStep.key.type === 'KEYB');
                paymentMediumSession.processVars = { ...paymentMediumSession.processVars, step: thisStep, block: currentStep.sector * 4, ext: 1, ...authPhaseIProcessVars };
                requestApdus.push(MifareTools.bytesToHex(authPhaseIApdu));
                currentStep.auth = { authPhaseIApdu };
                currentStep.state = 'AUTH_PHASE_I_SENT';
                nextStepDesc = `${nextStepDesc}: Auth I, sector ${currentStep.sector}`;
                break;
            case 'AUTH_PHASE_I_VERIFIED':
                const { keyA, keyB } = await generateMifareKeys$(
                    paymentMediumSession,
                    paymentMediumType,
                    currentStep.key.type === 'KEYA' ? currentStep.key.productionKeyName : null,
                    currentStep.key.type === 'KEYB' ? currentStep.key.productionKeyName : null
                );
                const firstAuthPhase1 = MifareTools.hexToBytes(responseApdus[0].responseApdu.substring(2));
                const { apdu: authPhaseIIApdu, processVars: authPhaseIIProcessVars } = MifareTools.generateFirstAuthPhaseIIApdu(
                    firstAuthPhase1,
                    MifareTools.hexToBytes(keyA || keyB)
                );
                paymentMediumSession.processVars = { ...paymentMediumSession.processVars, ...authPhaseIIProcessVars };
                requestApdus.push(MifareTools.bytesToHex(authPhaseIIApdu));
                currentStep.auth = { ...currentStep.auth, firstAuthPhase1, authPhaseIIApdu };
                currentStep.state = 'AUTH_PHASE_II_SENT';
                nextStepDesc = `${nextStepDesc}: Auth II, sector  ${currentStep.sector}`;
                break;
            case 'AUTH_PHASE_II_VERIFIED':
                const firstAuthPhase2 = MifareTools.hexToBytes(responseApdus[0].responseApdu.substring(2));
                const ParametersFromFirstAuth = MifareTools.extractParametersFromFirstAuthResult(firstAuthPhase2, paymentMediumSession.processVars);
                paymentMediumSession.processVars = { ...paymentMediumSession.processVars, ...ParametersFromFirstAuth };
                currentStep.auth = { ...currentStep.auth, firstAuthPhase2, ParametersFromFirstAuth };
                currentStep.state = 'AUTH_PHASE_II_PROCESSED';
                //Auth sptep is done.  we are ready for next step                
                currentStep = findNextStep(modProcess.steps);
                break;
        }
    }
    if (currentStep && currentStep.type === 'WRITE') {
        switch (currentStep.state) {
            case 'PENDING':
                const { apdu: writeBlocksApdu, processVars } = MifareTools.generateWriteCmdApdu(currentStep.block, MifareTools.hexToBytes(currentStep.hexData), { ...paymentMediumSession.processVars, bNr: currentStep.block, ext: currentStep.numberOfBlocksToRead });
                paymentMediumSession.processVars = { ...paymentMediumSession.processVars, ...processVars };
                logStep(paymentMedium, paymentMediumType, thisStep, 'Escribiendo tarjeta', 'requestApdus', [writeBlocksApdu]);
                requestApdus.push(MifareTools.bytesToHex(writeBlocksApdu));
                currentStep.state = 'WRITE_SENT';
                nextStepDesc = `${nextStepDesc}: Escribiendo tarjeta: sector  ${currentStep.sector}, bloque ${currentStep.block}`;
                break;
        }
    }

    const isModificationApplied = !currentStep;
    if (isModificationApplied) {
        paymentMediumSession.processVars = {};
        delete paymentMediumSession.steps[thisStep].processStates;
        delete paymentMediumSession.steps[thisStep].requestApdus;
        delete paymentMediumSession.steps[thisStep].responseApdus;
    }
    modProcess.state = isModificationApplied ? 'APPLIED' : 'APPLYING';
    return isModificationApplied
        ? null
        : {
            step: thisStep,
            requestApdus: requestApdus,
            desc: nextStepDesc,
            error: null,
            resetReaderSession: false,
        };
};

const extractPaymentMediumSpecs = ({ paymentMedium }, paymentMediumType) => {
    const mappingVersion = paymentMediumType.mappings.filter(m => m.active).sort((m1, m2) => m1.version - m2.version).pop();
    const mapping = mappingVersion ? mappingVersion.mapping : null;
    return [mapping, mappingVersion, mapping ? null : buildErrorResponse(paymentMediumSession, `Mapping activo no encontrado en el tipo de medio de pago ${paymentMediumType.code}`)];
};

const generateMifareKeys$ = async (paymentMediumSession, paymentMediumType, productionKeyNameForKeyA, productionKeyNameForKeyB) => {
    const uuidBytes = MifareTools.hexToBytes(paymentMediumSession.paymentMedium.mediumId).slice(0, 8);
    const diversifiedDataBytes = [0x01].concat([...uuidBytes, ...[...uuidBytes].reverse()]);
    const diversifiedData = MifareTools.bytesToHex(diversifiedDataBytes);
    const commonHsmPAth = "/keyRings/" + paymentMediumSession.organizationId + "/cryptoKeys/";
    const commonHsmBody = { data: diversifiedData };

    let { keyA, keyB } = await forkJoin([
        of(productionKeyNameForKeyA ? securityMediumProductionKeysMap[productionKeyNameForKeyA] : 'NA'),
        of(productionKeyNameForKeyB ? securityMediumProductionKeysMap[productionKeyNameForKeyB] : 'NA'),
    ]).pipe(        
        tap(([prodKeyA, prodKeyB]) => {
            if (!prodKeyA) throw new CustomError(`PaymentMediumReadAndWriteHelper.generateMifareKeys: ProductionKey for KeyA(${productionKeyNameForKeyA}) not found`);
            if (prodKeyA !== 'NA' && !prodKeyA.versions.find(v => v.active)) throw new CustomError(`PaymentMediumReadAndWriteHelper.generateMifareKeys: ProductionKey for KeyA(${productionKeyNameForKeyA}) does not have an active version`);
            if (!prodKeyB) throw new CustomError(`PaymentMediumReadAndWriteHelper.generateMifareKeys: ProductionKey for KeyA(${productionKeyNameForKeyB}) not found`);
            if (prodKeyB !== 'NA' && !prodKeyB.versions.find(v => v.active)) throw new CustomError(`PaymentMediumReadAndWriteHelper.generateMifareKeys: ProductionKey for KeyB(${productionKeyNameForKeyB}) does not have an active version`);
        }),
        mergeMap(([prodKeyA, prodKeyB]) => forkJoin([
            prodKeyA === 'NA' ? of({ diversifiedKey: null }) : HSM.callHsmRestService$("POST", commonHsmPAth + prodKeyA._id + "/versions/" + prodKeyA.versions.find(v => v.active).id + "/generateDiversifiedKey", 'application/json', commonHsmBody),
            prodKeyB === 'NA' ? of({ diversifiedKey: null }) : HSM.callHsmRestService$("POST", commonHsmPAth + prodKeyB._id + "/versions/" + prodKeyB.versions.find(v => v.active).id + "/generateDiversifiedKey", 'application/json', commonHsmBody)
        ])),
        map(([hsmResultA, hsmResultB]) => ({ keyA: hsmResultA.diversifiedKey, keyB: hsmResultB.diversifiedKey }))
    ).toPromise();
    return { keyA, keyB, diversifiedData };
};

const buildReadingProcessSteps = (mapping) => {
    const blocksToRead = mapping.EMISSION_VARS.APPS
        .map(app => mapping[app])
        .reduce((acc, val, index, array) => {
            const { access, data: fields } = val;
            acc.access = { ...acc.access, ...access };
            for (const fieldName in fields) {
                const field = fields[fieldName];
                const len = parseInt(field.start) + (
                    field.type.startsWith('STRING')
                        ? parseInt(field.type.replace('STRING', ''))
                        : field.type.startsWith('UINT') || field.type.startsWith('INT')
                            ? parseInt(field.type.replace('UINT', '').replace('INT', '')) / 8
                            : 16
                );
                const blocks = new Array(Math.ceil(len / 16)).fill(parseInt(field.block)).map((bl, i) => bl + i);
                acc.blocksToRead = acc.blocksToRead.concat(blocks);
            }
            const isLastElement = index === array.length - 1;
            if (isLastElement) {
                acc.blocksToRead.sort((a, b) => a - b);
                return [...new Set(acc.blocksToRead)]
                    .map(bl => {
                        return {
                            block: bl,
                            keys: {
                                read: Object.entries(acc.access[bl].readKeys).map(([key, val]) => ({ productionKeyName: key, type: val })),
                                write: Object.entries(acc.access[bl].writeKeys).map(([key, val]) => ({ productionKeyName: key, type: val })),
                            }
                        };
                    });
            } else {
                return acc;
            }
        }, { access: {}, blocksToRead: [] });
    const { steps } = blocksToRead.reduce((acc, val, index, array) => {
        const buildReadStep = () => ({
            type: 'READ',
            state: 'PENDING',
            block: val.block,
            sector: parseInt(val.block / 4),
            numberOfBlocksToRead: 1,
            key: val.keys.read[0],
        });
        const buildAuthStep = () => ({
            type: 'AUTH',
            state: 'PENDING',
            block: val.block,
            sector: parseInt(val.block / 4),
            key: val.keys.read[0],
        });
        const areBlocksConesecutive = ({ block: prevBlock }, { block: nextBlock }) => {
            const consecutive =
                (prevBlock + 1 === nextBlock)
                || ((prevBlock + 2) % 4 === 0) && (prevBlock + 2 === nextBlock);
            return consecutive;
        };
        const canReadWithCurrentKey = (currentKey, nextBlockKeys) => {
            return nextBlockKeys.find(({ productionKeyName, type }) => currentKey.type === type && currentKey.productionKeyName === productionKeyName);
        };

        if (!acc.stepUnderConstruction) {
            acc.steps.push(buildAuthStep());
            acc.stepUnderConstruction = buildReadStep();
        } else if (acc.prevData.block !== val.block) {
            if (areBlocksConesecutive(acc.prevData, val) && canReadWithCurrentKey(acc.stepUnderConstruction.key, val.keys.read)) {
                acc.stepUnderConstruction.numberOfBlocksToRead++;
            } else {
                acc.steps.push(acc.stepUnderConstruction);
                acc.steps.push(buildAuthStep());
                acc.stepUnderConstruction = buildReadStep();
            }
        }
        if (index === array.length - 1) {
            acc.steps.push(acc.stepUnderConstruction);
        }
        acc.prevData = val;
        return acc;
    }, { prevData: null, stepUnderConstruction: null, steps: [] });

    return steps;
};

const buildWritingProcessSteps = (paymentMediumSession, paymentMediumType, mappingVersion) => {

    const { paymentMedium, steps: sessionSteps } = paymentMediumSession;
    const { cardBlocks, cardData } = sessionSteps[STEPS.READ_CARD_BEFORE_MODS];
    const paymentMediumAccessMap = Object.entries(mappingVersion.mapping)
        .filter(([key, val]) => key.startsWith('APP_'))
        .map(([key, val]) => val.access)
        .filter(u => u)
        .reduce((acc, access) => ({ ...acc, ...access }), {});
    function projectCardModification({ mod, cardBlocks: originalCardBlocks, cardData: originalCardData }) {
        const cardData = _.cloneDeep(originalCardData);
        const currentBalance = Math.min(cardData.ST$, cardData.STB$);
        const { minNumber: oldestRechargeHistoryNumber, maxNumber: latestRechargeHistoryNumber } = ['1', '2'].reduce((acc, number) => {
            if (cardData[`HISTR_FT_${number}`] < acc.min) {
                acc.min = cardData[`HISTR_FT_${number}`];
                acc.minNumber = number;
            }
            if (cardData[`HISTR_FT_${number}`] > acc.max) {
                acc.max = cardData[`HISTR_FT_${number}`];
                acc.maxNumber = number;
            }
            return acc;
        }, { minNumber: null, min: Number.MAX_VALUE, maxNumber: null, max: Number.MIN_VALUE });

        switch (mod.type) {
            case 'BALANCE_RECHARGE':
                switch (mod.payload.pocket) {
                    case 'REGULAR':
                        if ((paymentMediumType.specs || {}).validityPeriodExtension > 0) {
                            cardData.FV = parseInt(Date.now() / 1000) + paymentMediumType.specs.validityPeriodExtension;// Fecha de validez del medio de pago
                        }
                        cardData.ST$ = cardData.STB$ = currentBalance + parseInt(mod.payload.value);
                        cardData[`HISTR_FT_${oldestRechargeHistoryNumber}`] = parseInt(Date.now() / 1000);//Marca de tiempo (timeStamp sec)
                        cardData[`HISTR_CT_${oldestRechargeHistoryNumber}`] = paymentMediumSession.sequential; //Consecutivo Transaccion
                        cardData[`HISTR_VT_${oldestRechargeHistoryNumber}`] = parseInt(mod.payload.value); //Monto de la transacción 
                        cardData[`HISTR_IDV_${oldestRechargeHistoryNumber}`] = 1; //Id del dispositivo // 1 => read/write widget
                        cardData[`HISTR_TT_${oldestRechargeHistoryNumber}`] = 1; //Tipo de transacción
                        cardData[`HISTR_CK_${oldestRechargeHistoryNumber}`] = 0; //CheckSum
                        break;
                    default: throw new CustomError(`PaymentMediumReadAndWriteHelper.buildWritingProcessSteps.BALANCE_RECHARGE: invalid pocket= ${mod.payload.pocket}`);
                }
                break;
            case 'BALANCE_DEBIT':
                switch (mod.payload.pocket) {
                    case 'REGULAR':
                        cardData.ST$ = cardData.STB$ = currentBalance - parseInt(mod.payload.value);
                        break;
                    default: throw new CustomError(`PaymentMediumReadAndWriteHelper.buildWritingProcessSteps.BALANCE_DEBIT: invalid pocket= ${mod.payload.pocket}`);
                }
                break;
            case 'BLOCK':
                cardData.B = 1; // Bloqueo temporal
                break;
            case 'UNBLOCK':
                if ((paymentMediumType.specs || {}).validityPeriodExtension > 0) {
                    cardData.FV = parseInt(Date.now() / 1000) + paymentMediumType.specs.validityPeriodExtension;// Fecha de validez del medio de pago
                }
                cardData.B = 0; // Bloqueo temporal
                break;
            default: throw new CustomError(`PaymentMediumReadAndWriteHelper.buildWritingProcessSteps: not valid mod.type = ${mod.type}`);
        }

        const interpreter = new PaymentMediumMifareInterpreter(mappingVersion);
        const cardBlocks = interpreter.cardDataMapToBinary(cardData);
        const cardBlocksToWrite = Object.entries(cardBlocks).reduce((acc, [bl, value]) => {
            if (value !== originalCardBlocks[bl]) {
                acc[bl] = value;
            }
            return acc;
        }, {});

        return { cardBlocks, cardData, cardBlocksToWrite };
    }

    function buildSteps(cardBlocksToWrite, paymentMediumAccessMap) {
        const buildWriteStep = (block, hexData) => ({
            type: 'WRITE',
            state: 'PENDING',
            block: block,
            sector: parseInt(block / 4),
            hexData
        });
        const buildAuthStep = (block) => ({
            type: 'AUTH',
            state: 'PENDING',
            block: block,
            sector: parseInt(block / 4),
            key: Object.entries(paymentMediumAccessMap[block].writeKeys)
                .map(([productionKeyName, type]) => ({ productionKeyName, type }))
                .find(u => u)
        });
        const canWriteWithCurrentAuth = (currentAuth, blockToWrite) => {
            const accessKey = paymentMediumAccessMap[blockToWrite].writeKeys[currentAuth.key.productionKeyName];
            return accessKey === currentAuth.key.type;
        };


        const { steps } = Object.entries(cardBlocksToWrite).reduce((acc, [block, hexData]) => {
            if (!acc.currentAuth || !canWriteWithCurrentAuth(acc.currentAuth, block)) {
                acc.currentAuth = buildAuthStep(block, paymentMediumAccessMap);
                acc.steps.push(acc.currentAuth);
            }
            acc.steps.push(buildWriteStep(block, hexData));
            return acc;
        }, { steps: [], currentAuth: null });
        return steps;
    }

    const { steps: modificationProcesses, projectedValues } = paymentMedium.mods
        .filter(mod => !mod.applied)
        .reduce((acc, mod, index, array) => {
            const { cardBlocks, cardData, cardBlocksToWrite } = projectCardModification({
                state: 'PENDING',
                mod,
                cardBlocks: acc.projectedValues.cardBlocks,
                cardData: acc.projectedValues.cardData,
            });
            const steps = buildSteps(cardBlocksToWrite, paymentMediumAccessMap);
            acc.steps.push({ mod, cardBlocksToWrite, steps });
            acc.projectedValues = { cardBlocks, cardData };
            return acc;
        }, {
            steps: [],
            projectedValues: {
                cardBlocks: _.cloneDeep(cardBlocks),
                cardData: _.cloneDeep(cardData),
            }
        });
    return { modificationProcesses, projectedValues };
};

const dispatchToStepProcess$ = (paymentMediumSession, paymentMediumType, profile, responseApdus, authToken) => {
    switch (paymentMediumSession.nextStep.step) {
        case STEPS.READ_CARD_BEFORE_MODS: return readCardBeforeMods$(paymentMediumSession, paymentMediumType, profile, responseApdus, authToken);
        case STEPS.APPLY_MODS: return applyMods$(paymentMediumSession, paymentMediumType, profile, responseApdus, authToken);
        case STEPS.READ_CARD_AFTER_MODS: return readCardAfterMods$(paymentMediumSession, paymentMediumType, profile, responseApdus, authToken);
        default: throw new CustomError(`PaymentMediumReadAndWriteHelper.dispatchToStepProcess: step ${paymentMediumSession.nextStep.step} not found`);
    }
};

const simulateClientServerFlow$ = (clientArgs) => {
    const [paymentMediumSession, paymentMediumType, profile, responseApdus, authToken] = clientArgs;
    if (paymentMediumSession.nextStep === null) return of(null);
    console.log('========== Reporting to server step #', paymentMediumSession.step, '============');
    return from(dispatchToStepProcess$(...clientArgs)).pipe(
        tap(({ paymentMediumSession: { nextStep } }) => console.log('Server returned nextStep', nextStep)),
        filter(({ paymentMediumSession }) => paymentMediumSession.nextStep),
        tap(({ paymentMediumSession }) => { if (paymentMediumSession.nextStep.error) throw new Error(paymentMediumSession.nextStep.error); }),
        mergeMap(({ paymentMediumSession }) => {
            const readerCommand = { sessionId: __readerSessionId, closeSession: false, requests: paymentMediumSession.nextStep.requestApdus };
            console.log('Sending CMD to SmartCard ', readerCommand.requests);
            return from(httpRequest(SMARTCARD_APDUS_END_POINT, { method: 'POST', headers: { 'Content-Type': 'application/json' } }, readerCommand)).pipe(
                tap(({ body }) => console.log('SmartCard response', body)),
                map(({ body }) => JSON.parse(body)),
                map(responses => responses.map(({ apdu: requestApdu, response: responseApdu, isValid }) => ({ requestApdu, responseApdu, isValid }))),
                map((response) => [paymentMediumSession, paymentMediumType, profile, response, authToken])
            );
        }),
    );
};

const initTs = Date.now();

//session , paymentMediumType,  profile,  [response apdus], authToken
of([paymentMediumSession, paymentMediumType, profile, [], { _id: 'test-user', name: 'test-user' }]).pipe(
    expand(args => simulateClientServerFlow$(args)),
    takeWhile((nextServerRequest) => nextServerRequest && nextServerRequest !== null),
    last()
).subscribe(
    //evt => console.log(evt),
    ([paymentMediumSession, paymentMediumType, profile, response, authToken]) => {
        console.log('');
        console.log('');
        console.log('=======================');
        console.log('========== END ========');
        console.log('=======================');
        console.log(JSON.stringify({ paymentMediumSession }));

    },
    err => console.error(err),
    () => console.log('Completed!!!!  ' + (Date.now() - initTs))
);