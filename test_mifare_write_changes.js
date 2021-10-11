'use strict';

/* IMPORTED LIBS */
const _ = require('lodash');
const { of, forkJoin, from, iif, throwError, merge, EMPTY, defer } = require("rxjs");
const { mergeMap, catchError, map, toArray, tap, filter, first, expand, takeWhile } = require('rxjs/operators');
const { error: { CustomError }, log: { ConsoleLogger } } = require("@nebulae/backend-node-tools");

const { MifareTools, PaymentMediumMifareInterpreter } = require('./smartcard');
const HSM = require("./hsm/HSM").singleton();
const SecurityMediumProductionKeys = require('./entities/SecurityMediumProductionKeys');

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

const buildErrorResponse = (paymentMediumSession, errorDesc) => ({ ...paymentMediumSession, nextStep: { step: null, requestApdus: null, desc: null, error: errorDesc } });


const readCardBeforeMods$ = async (paymentMediumSession, paymentMediumType, profile, responseApdus, authToken) => {
    const { paymentMedium } = paymentMediumSession;
    const thisStep = STEPS.READ_CARD_BEFORE_MODS;
    if (!paymentMediumSession.steps[thisStep]) paymentMediumSession.steps[thisStep] = {};
    paymentMediumSession.step = thisStep;
    paymentMediumSession.nextStep = null;
    const [specs, specsVersion, specsError] = extractPaymentMediumSpecs(paymentMediumSession, paymentMediumType);
    if (specsError) return specsError;

    const STATES = {
        READ: ['PENDING', 'READ_SENT', 'READ_VERIFIED'],
        AUTH: ['PENDING', 'AUTH_PHASE_I_SENT', 'AUTH_PHASE_I_VERIFIED', 'AUTH_PHASE_II_SENT', 'AUTH_PHASE_II_VERIFIED', 'AUTH_PHASE_II_PROCESSED']
    };
    const FINAL_STATES = Object.values(STATES).map(sts => sts[sts.length - 1]);
    const findNextReadingStep = (cardReadingStates) => cardReadingStates ? cardReadingStates.find(reading => !FINAL_STATES.includes(reading.state)) : undefined;

    let cardReadingStates = paymentMediumSession.steps[thisStep].cardReadingStates;   
    if (!cardReadingStates) {
        //having no cardReadingStates means this is the first time the session gets into this step, so we have to build or the inner steps to follow
        paymentMediumSession = resetPaymentMediumSession(paymentMediumSession);// we reset just as a precautions        
        paymentMediumSession.steps[thisStep].cardReadingStates = cardReadingStates = buildReadingProcessSteps(specs);
    }
    
    let currentCardReadingState = findNextReadingStep(cardReadingStates);//this give us the next step in the process to execute    
    /* EVAL AND PROCESS PREV-REQUEST'S RESPONSES */
    if (currentCardReadingState && responseApdus.length > 0) { // eval the response from previous request
        logStep(paymentMedium, paymentMediumType, thisStep, 'Leyendo tarjeta', 'responseApdus', responseApdus);
        for (let i in responseApdus) {
            const response = responseApdus[i];
            if (!response || !response.isValid || !response.responseApdu || !response.responseApdu.startsWith('90')) {
                const errMsg = currentCardReadingState.state === 'READ_SENT'
                    ? `No fue posible realizar la lectura`
                    : currentCardReadingState.state === 'AUTH_PHASE_I_SENT'
                        ? 'Falló primer paso de autenticación'
                        : currentCardReadingState.state === 'AUTH_PHASE_II_SENT'
                            ? 'Falló segundo paso de autenticación'
                            : '???' + currentCardReadingState.state + '???';
                return buildErrorResponse(paymentMedium, `${errMsg}.  request=${response.requestApdu} response=${response.responseApdu}`);
            }
            if (currentCardReadingState.state === 'READ_SENT') {
                const readResponse = MifareTools.hexToBytes(response.responseApdu.substring(2));
                const { blocks, processVars } = MifareTools.extractDataFromReadResponse(readResponse, paymentMediumSession.processVars);
                for (const block in blocks) {// convert bytes to hex block by block
                    blocks[block] = MifareTools.bytesToHex(blocks[block]);
                }
                paymentMediumSession.processVars = { ...paymentMediumSession.processVars, ...processVars };//update processVars 
                paymentMediumSession.steps[thisStep].cardBlocks = { ...paymentMediumSession.steps[thisStep].cardBlocks, ...blocks };//append newly read blocks
            }
        }
        //The current state was successful. now we need to move to the next state
        currentCardReadingState.state = STATES[currentCardReadingState.type][STATES[currentCardReadingState.type].indexOf(currentCardReadingState.state) + 1];
    }

    /* NEXT REQUEST GENERATION */
    currentCardReadingState = findNextReadingStep(cardReadingStates);// get next step
    const requestApdus = [];
    let nextStepDesc = '???';
    if (currentCardReadingState && currentCardReadingState.type === 'AUTH') {
        switch (currentCardReadingState.state) {
            case 'PENDING':
                const { apdu: authPhaseIApdu, processVars: authPhaseIProcessVars } = MifareTools.generateFirstAuthPhaseIApdu(currentCardReadingState.sector * 4, currentCardReadingState.key.type === 'KEYB');
                paymentMediumSession.processVars = { ...paymentMediumSession.processVars, step: thisStep, block: currentCardReadingState.sector * 4, ext: 1, ...authPhaseIProcessVars };
                requestApdus.push(MifareTools.bytesToHex(authPhaseIApdu));
                currentCardReadingState.auth = { authPhaseIApdu };
                currentCardReadingState.state = 'AUTH_PHASE_I_SENT';
                nextStepDesc = `Leyendo tarjeta: Auth I, sector ${currentCardReadingState.sector}`;
                break;
            case 'AUTH_PHASE_I_VERIFIED':
                const { keyA, keyB } = await generateMifareKeys$(
                    paymentMediumSession,
                    paymentMediumType,
                    currentCardReadingState.key.type === 'KEYA' ? currentCardReadingState.key.productionKeyName : null,
                    currentCardReadingState.key.type === 'KEYB' ? currentCardReadingState.key.productionKeyName : null
                );
                const firstAuthPhase1 = MifareTools.hexToBytes(responseApdus[0].responseApdu.substring(2));
                const { apdu: authPhaseIIApdu, processVars: authPhaseIIProcessVars } = MifareTools.generateFirstAuthPhaseIIApdu(
                    firstAuthPhase1,
                    MifareTools.hexToBytes(keyA || keyB)
                );
                paymentMediumSession.processVars = { ...paymentMediumSession.processVars, ...authPhaseIIProcessVars };
                requestApdus.push(MifareTools.bytesToHex(authPhaseIIApdu));
                currentCardReadingState.auth = { ...currentCardReadingState.auth, firstAuthPhase1, authPhaseIIApdu };
                currentCardReadingState.state = 'AUTH_PHASE_II_SENT';
                nextStepDesc = `Leyendo tarjeta: Auth II, sector  ${currentCardReadingState.sector}`;
                break;
            case 'AUTH_PHASE_II_VERIFIED':
                const firstAuthPhase2 = MifareTools.hexToBytes(responseApdus[0].responseApdu.substring(2));
                const ParametersFromFirstAuth = MifareTools.extractParametersFromFirstAuthResult(firstAuthPhase2, paymentMediumSession.processVars);
                paymentMediumSession.processVars = { ...paymentMediumSession.processVars, ...ParametersFromFirstAuth };
                currentCardReadingState.auth = { ...currentCardReadingState.auth, firstAuthPhase2, ParametersFromFirstAuth };
                currentCardReadingState.state = 'AUTH_PHASE_II_PROCESSED';
                //Auth sptep is done.  we are ready for next step                
                currentCardReadingState = findNextReadingStep(cardReadingStates);
                break;
        }
    }
    if (currentCardReadingState && currentCardReadingState.type === 'READ') {
        switch (currentCardReadingState.state) {
            case 'PENDING':
                const { apdu: readBlocksApdu, processVars } = MifareTools.generateReadCmdApdu({ ...paymentMediumSession.processVars, bNr: currentCardReadingState.block, ext: currentCardReadingState.numberOfBlocksToRead });
                paymentMediumSession.processVars = { ...paymentMediumSession.processVars, ...processVars };
                logStep(paymentMedium, paymentMediumType, thisStep, 'Leyendo tarjeta', 'requestApdus', [readBlocksApdu]);
                requestApdus.push(MifareTools.bytesToHex(readBlocksApdu));
                currentCardReadingState.state = 'READ_SENT';
                nextStepDesc = `Leyendo tarjeta: Lectura, sector  ${currentCardReadingState.sector}, bloque ${currentCardReadingState.block}, cant  ${currentCardReadingState.numberOfBlocksToRead}`;
                break;
        }
    }

    const areAllBlocksVerified = !currentCardReadingState;
    paymentMediumSession.nextStep = {
        step: areAllBlocksVerified ? STEPS.APPLY_MODS : thisStep,
        requestApdus: areAllBlocksVerified
            ? ['FFCA000000']
            : requestApdus,
        desc: areAllBlocksVerified
            ? 'Lectura realizada con éxito'
            : nextStepDesc,
        error: null,
        resetReaderSession: areAllBlocksVerified,
    };


    if (areAllBlocksVerified) {
        const interpreter = new PaymentMediumMifareInterpreter(specsVersion);
        const cardData = interpreter.binaryToCardDataMap(paymentMediumSession.steps[thisStep].cardBlocks);
        paymentMediumSession.steps[thisStep].cardData = cardData;

        console.log('====>',paymentMediumSession.steps[thisStep].cardBlocks,JSON.stringify(cardData,null,2))
    }
    logStep(paymentMedium, paymentMediumType, paymentMediumSession.nextStep.step, paymentMediumSession.nextStep.desc, 'requestApdus', paymentMediumSession.nextStep.requestApdus);
    paymentMediumSession.step = thisStep;
    
    return { paymentMediumSession };
};


const applyMods$ = async (ppaymentMediumSession, paymentMediumType, profile, responseApdus, authToken) => {
    // /* PREV RESPONSE VALIDATION */
    // resetSession(paymentMedium);
    // logStep(paymentMedium, paymentMediumType, responseStep, 'Cliente inicia comunicación', 'responseApdus', responseApdus);

    // /* NEXT REQUEST */
    // const nextStep = { step: 1, requestApdus: ['FFCA000000'], desc: 'Solicitando UUID', error: null };
    // logStep(paymentMedium, paymentMediumType, nextStep.step, nextStep.desc, 'requestApdus', nextStep.requestApdus);
    // return { paymentMedium, nextStep };
};


const readCardAfterMods$ = async (paymentMediumSession, paymentMediumType, profile, responseApdus, authToken) => {
    // /* PREV RESPONSE VALIDATION */
    // resetSession(paymentMedium);
    // logStep(paymentMedium, paymentMediumType, responseStep, 'Cliente inicia comunicación', 'responseApdus', responseApdus);

    // /* NEXT REQUEST */
    // const nextStep = { step: 1, requestApdus: ['FFCA000000'], desc: 'Solicitando UUID', error: null };
    // logStep(paymentMedium, paymentMediumType, nextStep.step, nextStep.desc, 'requestApdus', nextStep.requestApdus);
    // return { paymentMedium, nextStep };
};

const extractPaymentMediumSpecs = ({ paymentMedium }, paymentMediumType) => {
    const specsVersion = paymentMediumType.mappings.filter(m => m.active).sort((m1, m2) => m1.version - m2.version).pop();
    const specs = specsVersion ? specsVersion.mapping : null;
    return [specs, specsVersion, specs ? null : buildErrorResponse(paymentMedium, `Mapping activo no encontrado en el tipo de medio de pago ${paymentMediumType.code}`)];
};

const generateMifareKeys$ = async (paymentMediumSession, paymentMediumType, productionKeyNameForKeyA, productionKeyNameForKeyB) => {
    const uuidBytes = MifareTools.hexToBytes(paymentMediumSession.paymentMedium.mediumId).slice(0, 8);
    const diversifiedDataBytes = [0x01].concat([...uuidBytes, ...[...uuidBytes].reverse()]);
    const diversifiedData = MifareTools.bytesToHex(diversifiedDataBytes);
    const commonHsmPAth = "/keyRings/" + paymentMediumSession.organizationId + "/cryptoKeys/";
    const commonHsmBody = { data: diversifiedData };

    let { keyA, keyB } = await forkJoin([
        of(productionKeyNameForKeyA ? SecurityMediumProductionKeys[productionKeyNameForKeyA] : 'NA'),
        of(productionKeyNameForKeyB ? SecurityMediumProductionKeys[productionKeyNameForKeyB] : 'NA'),
    ]).pipe(
        tap(([prodKeyA, prodKeyB]) => {
            if (!prodKeyA) throw new CustomError(`PaymentMediumReadAndWriteHelper.generateMifareKeys: ProductionKey for KeyA(${productionKeyNameForKeyA}) not found`);
            if (prodKeyA !== 'NA' && !prodKeyA.versions.find(v => v.active)) throw new CustomError(`PaymentMediumReadAndWriteHelper.generateMifareKeys: ProductionKey for KeyA(${productionKeyNameForKeyA}) does not have an active version`);
            if (!prodKeyB) throw new CustomError(`PaymentMediumReadAndWriteHelper.generateMifareKeys: ProductionKey for KeyA(${productionKeyNameForKeyB}) not found`);
            if (prodKeyB !== 'NA' && !prodKeyB.versions.find(v => v.active)) throw new CustomError(`PaymentMediumReadAndWriteHelper.generateMifareKeys: ProductionKey for KeyB(${productionKeyNameForKeyB}) does not have an active version`);
        }),
        mergeMap(([prodKeyA, prodKeyB]) => forkJoin([
            prodKeyA === 'NA' ? of({ diversifiedKey: null }) : HSM.callHsmRestService$("POST", commonHsmPAth + prodKeyA.id + "/versions/" + prodKeyA.versions.find(v => v.active).id + "/generateDiversifiedKey", 'application/json', commonHsmBody),
            prodKeyB === 'NA' ? of({ diversifiedKey: null }) : HSM.callHsmRestService$("POST", commonHsmPAth + prodKeyB.id + "/versions/" + prodKeyB.versions.find(v => v.active).id + "/generateDiversifiedKey", 'application/json', commonHsmBody)
        ])),
        map(([hsmResultA, hsmResultB]) => ({ keyA: hsmResultA.diversifiedKey, keyB: hsmResultB.diversifiedKey }))
    ).toPromise();

    console.log('=== TODO: DELETE THIS LOG ==>>>>', { keyA, keyB, diversifiedData, productionKeyNameForKeyA, productionKeyNameForKeyB });
    return { keyA, keyB, diversifiedData };
};

const buildReadingProcessSteps = (specs) => {
    const blocksToRead = specs.EMISSION_VARS.APPS
        .map(app => specs[app])
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

const finishSession = (paymentMedium, authToken) => {
    delete paymentMedium.readWriteSession;
    console.log('============ finishSession =========');
    console.log(JSON.stringify(paymentMedium));
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
        tap(({ paymentMediumSession:{nextStep} }) => console.log('Server returned nextStep', nextStep)),
        tap(({ paymentMediumSession }) => { if (paymentMediumSession.nextStep.error) throw new Error(paymentMediumSession.nextStep.error); }),
        mergeMap(({ paymentMediumSession} ) => {
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

//session , paymentMediumType,  profile,  [response apdus], authToken
of([paymentMediumSession, paymentMediumType, profile, [], { _id: 'test-user', name: 'test-user' }]).pipe(
    expand(args => simulateClientServerFlow$(args)),
    takeWhile((nextServerRequest) => nextServerRequest && nextServerRequest !== null)
).subscribe(
    //evt => console.log(evt),
    () => { },
    err => console.error(err),
    () => console.log('Completed!!!!')
);