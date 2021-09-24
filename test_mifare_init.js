'use strict';

/* IMPORTED LIBS */
const _ = require('lodash');
const { of, forkJoin, from, iif, throwError, merge, EMPTY, defer } = require("rxjs");
const { mergeMap, catchError, map, toArray, tap, filter, first, expand, takeWhile } = require('rxjs/operators');
const { error: { CustomError }, log: { ConsoleLogger } } = require("@nebulae/backend-node-tools");

const { MifareTools, PaymentMediumMifareInterpreter } = require('./smartcard');
const HSM = require("./hsm/HSM").singleton();
const SecurityMediumProductionKeys = require('./entities/SecurityMediumProductionKeys');


const httpRequest = require("./HttpRequest"); // NEEDS ENV ==> NODE_TLS_REJECT_UNAUTHORIZED=0


/* DB ENTITY SIMULATION */
const endUser = require('./entities/EndUser');
const profile = require('./entities/Profile');
const paymentMediumType = require('./entities/PaymentMediumType');
const paymentMediumAcquisition = require('./entities/PaymentMediumAcquisition');
const paymentMedium = require('./entities/PaymentMedium');


/* CLIENT (FRONTEND) SIMULATION VARS */
const PCSC_DAEMON_END_POINT = 'https://pcsc-daemon:1215/pcsc-daemon';
//const READER_END_POINT = PCSC_DAEMON_END_POINT + '/readers/5C5C3F5C535744235363446576696365456E756D23315F4143535F414352313235325F31535F434C5F5265616465725F504943435F30237B64656562653661642D396530312D343765322D613362322D6136366161326330333663397D';
const READER_END_POINT = PCSC_DAEMON_END_POINT + '/readers/5C5C3F5C535744235363446576696365456E756D23315F4143535F414352313235325F31535F434C5F5265616465725F504943435F30237B64656562653661642D396530312D343765322D613362322D6136366161326330333663397D';
const SMARTCARD_APDUS_END_POINT = READER_END_POINT + '/smartcard/sendApdus';
let __readerSessionId = Math.random() + '';


const logStep = (paymentMedium, paymentMediumType, step, stepName, logType, logData, timestamp = Date.now(), error = null) => {
    if (!paymentMedium.emissionProcess.steps[step]) paymentMedium.emissionProcess.steps[step] = { stepName, createTimestamp: timestamp };
    if (!paymentMedium.emissionProcess.steps[step][logType]) paymentMedium.emissionProcess.steps[step][logType] = {};
    paymentMedium.emissionProcess.steps[step][logType] = { logType, data: logData, timestamp, error };
    console.log('logStep[', step, '][', logType, '] = ', paymentMedium.emissionProcess.steps[step][logType]);
};

const resetEmissionProcess = (paymentMedium) => {
    const prevProcess = { ...paymentMedium.emissionProcess, prevProcesses: undefined };
    paymentMedium.emissionProcess = {
        initTimeStamp: Date.now(),
        steps: {},
        prevProcesses: [...paymentMedium.emissionProcess.prevProcesses]
    };
    if (prevProcess.initTimeStamp) paymentMedium.emissionProcess.prevProcesses.push(prevProcess);
};

const buildErrorResponse = (paymentMedium, errorDesc) => ({ paymentMedium, nextStep: { step: null, requestApdus: null, desc: null, error: errorDesc } });

const requestUuid$ = async (paymentMedium, paymentMediumType, responseStep, responseApdus) => {
    /* PREV RESPONSE VALIDATION */
    resetEmissionProcess(paymentMedium);
    logStep(paymentMedium, paymentMediumType, responseStep, 'Cliente inicia comunicación', 'responseApdus', responseApdus);

    /* NEXT REQUEST */
    const nextStep = { step: 1, requestApdus: ['FFCA000000'], desc: 'Solicitando UUID', error: null };
    logStep(paymentMedium, paymentMediumType, nextStep.step, nextStep.desc, 'requestApdus', nextStep.requestApdus);
    return { paymentMedium, nextStep };
};

const verifyUuid_and_requestFirstAuthPhaseI$ = async (paymentMedium, paymentMediumType, responseStep, responseApdus) => {
    /* PREV RESPONSE VALIDATION */
    logStep(paymentMedium, paymentMediumType, responseStep, 'Solicitando UUID', 'responseApdus', responseApdus);
    const response = (responseApdus || [])[0];
    if (!response || !response.isValid) {
        const nextStep = buildErrorResponse(paymentMedium, `No fue posible extraer UUID.  request=${response.requestApdu} response=${response.responseApdu}`);
        return { paymentMedium, nextStep };
    }
    const uuid = response.responseApdu.slice(0, -4).toUpperCase();
    if (paymentMedium.mediumId !== uuid) {
        const nextStep = buildErrorResponse(paymentMedium, `UUID de la tarjeta no coincide con el UUID original.  original=${paymentMedium.mediumId} uuid=${uuid}`);
        return { paymentMedium, nextStep };
    }

    /* NEXT REQUEST GENERATION */
    const specs = paymentMediumType.mappings.filter(m => m.active).sort((m1, m2) => m1.version - m2.version).pop().mapping;
    if (!specs) return buildErrorResponse(paymentMedium, `Mapping activo no encontrado en el tipo de medio de pago ${paymentMediumType.code}`);
    const getMinMaxBlock = (data) => Object.values(data)
        .map(({ block }) => block)
        .reduce((minMax, block) => {
            if (block < minMax.min) minMax.min = block;
            if (block > minMax.max) minMax.max = block;
            return minMax;
        }, { min: 9999, max: 0 });
    const mins = [];
    const maxs = [];
    specs.EMISSION_VARS.APPS
        .map(app => getMinMaxBlock(specs[app].data))
        .forEach(({ min, max }) => { mins.push(min); maxs.push(max); });
    const block = Math.min(...mins);
    let ext = (Math.max(...maxs) - block);
    ext = ext - parseInt((ext) / 4) + 1;
    const { apdu, processVars } = MifareTools.generateFirstAuthPhaseIApdu(block, specs.EMISSION_VARS.KEY_TO_READ_WRITE === 'KEYB');
    const nextStep = { step: 2, requestApdus: [MifareTools.bytesToHex(apdu)], desc: 'Autenticación Fase I', error: null };
    paymentMedium.emissionProcess.processVars = { step: 0, block, ext, initTs: Date.now(), ...processVars };

    logStep(paymentMedium, paymentMediumType, nextStep.step, nextStep.desc, 'requestApdus', nextStep.requestApdus);
    return { paymentMedium, nextStep };
};


const validateFirstAuthPhaseI_and_requestFirstAuthPhaseII$ = async (paymentMedium, paymentMediumType, responseStep, responseApdus) => {
    /* PREV RESPONSE VALIDATION */
    logStep(paymentMedium, paymentMediumType, responseStep, 'Autenticación Fase I', 'responseApdus', responseApdus);
    const response = (responseApdus || [])[0];
    if (!response || !response.isValid || !response.responseApdu || !response.responseApdu.startsWith('90')) {
        return buildErrorResponse(paymentMedium, `No fue posible obtener respuesta de la primera fase de FirstAuth.  request=${response.requestApdu} response=${response.responseApdu}`);
    }

    /* NEXT REQUEST GENERATION */
    const specs = paymentMediumType.mappings.filter(m => m.active).sort((m1, m2) => m1.version - m2.version).pop().mapping;
    if (!specs) return buildErrorResponse(paymentMedium, `Mapping activo no encontrado en el tipo de medio de pago ${paymentMediumType.code}`);
    const firstAuthPhase1 = MifareTools.hexToBytes(response.responseApdu.substring(2));
    const { apdu, processVars } = MifareTools.generateFirstAuthPhaseIIApdu(firstAuthPhase1, MifareTools.hexToBytes(specs.EMISSION_VARS[specs.EMISSION_VARS.KEY_TO_READ_WRITE]));
    paymentMedium.emissionProcess.processVars = { ...paymentMedium.emissionProcess.processVars, ...processVars };
    const nextStep = { step: 3, requestApdus: [MifareTools.bytesToHex(apdu)], desc: 'Autenticación Fase II', error: null };
    logStep(paymentMedium, paymentMediumType, nextStep.step, nextStep.desc, 'requestApdus', nextStep.requestApdus);
    return { paymentMedium, nextStep };
};
const validateFirstAuthPhaseII_and_requestReadBlankCardData$ = async (paymentMedium, paymentMediumType, responseStep, responseApdus) => {
    /* PREV RESPONSE VALIDATION */
    logStep(paymentMedium, paymentMediumType, responseStep, 'Autenticación Fase II', 'responseApdus', responseApdus);
    const response = (responseApdus || [])[0];
    if (!response || !response.isValid || !response.responseApdu || !response.responseApdu.startsWith('90')) {
        return buildErrorResponse(paymentMedium, `No fue posible obtener respuesta de la segunda fase de FirstAuth.  request=${response.requestApdu} response=${response.responseApdu}`);
    }
    const firstAuthPhase2 = MifareTools.hexToBytes(response.responseApdu.substring(2));
    const ParametersFromFirstAuth = MifareTools.extractParametersFromFirstAuthResult(firstAuthPhase2, paymentMedium.emissionProcess.processVars);
    paymentMedium.emissionProcess.processVars = { ...paymentMedium.emissionProcess.processVars, ...ParametersFromFirstAuth };

    /* NEXT REQUEST GENERATION */
    const { apdu, processVars } = MifareTools.generateReadCmdApdu(paymentMedium.emissionProcess.processVars);
    paymentMedium.emissionProcess.processVars = { ...paymentMedium.emissionProcess.processVars, ...processVars };
    const nextStep = { step: 4, requestApdus: [MifareTools.bytesToHex(apdu)], desc: 'Leer Tarjeta en Blanco', error: null };
    logStep(paymentMedium, paymentMediumType, nextStep.step, nextStep.desc, 'requestApdus', nextStep.requestApdus);
    return { paymentMedium, nextStep };
};
const validateBlankCardData_and_requestWriteCardData$ = async (paymentMedium, paymentMediumType, responseStep, responseApdus, endUser, profile, authToken, initialBalance) => {
    const specsVersion = paymentMediumType.mappings.filter(m => m.active).sort((m1, m2) => m1.version - m2.version).pop();
    const specs = specsVersion.mapping;
    if (!specs) return buildErrorResponse(paymentMedium, `Mapping activo no encontrado en el tipo de medio de pago ${paymentMediumType.code}`);
    const interpreter = new PaymentMediumMifareInterpreter(specsVersion);

    /* PREV RESPONSE VALIDATION */
    logStep(paymentMedium, paymentMediumType, responseStep, 'Leer Tarjeta en Blanco', 'responseApdus', responseApdus);
    const response = (responseApdus || [])[0];
    if (!response || !response.isValid || !response.responseApdu || !response.responseApdu.startsWith('90')) {
        return buildErrorResponse(paymentMedium, `No fue posible obtener respuesta lectura de bloques.  request=${response.requestApdu} response=${response.responseApdu}`);
    }
    const readResponse = MifareTools.hexToBytes(response.responseApdu.substring(2));
    const { blocks, processVars } = MifareTools.extractDataFromReadResponse(readResponse, paymentMedium.emissionProcess.processVars);
    paymentMedium.emissionProcess.processVars = { ...paymentMedium.emissionProcess.processVars, ...processVars };
    const blankReadData = {
        ...Object.keys(blocks).reduce((acc, key) => {
            acc[key] = MifareTools.bytesToHex(blocks[key]);
            return acc;
        }, {})
    };
    const blankReadCardData = interpreter.binaryToCardDataMap(blankReadData);
    paymentMedium.emissionProcess.processVars.blankReadCardData = blankReadCardData;

    paymentMedium.pockets.REGULAR.balance = blankReadCardData.ST$ + initialBalance;
    paymentMedium.pockets.REGULAR.balanceBk = blankReadCardData.STB$ + initialBalance;

    logStep(paymentMedium, paymentMediumType, responseStep, 'Leer Tarjeta en Blanco', 'blankReadData', blankReadData);


    /* NEXT REQUEST GENERATION */
    const dataCardMap = interpreter.paymentMediumToCardDataMap(paymentMedium, endUser, profile);
    const encodedBinaryData = interpreter.cardDataMapToBinary(dataCardMap);
    const requestApdus = [];
    Object.entries(encodedBinaryData).forEach(([block, hex]) => {
        const { apdu, processVars } = MifareTools.generateWriteCmdApdu(parseInt(block), MifareTools.hexToBytes(hex), paymentMedium.emissionProcess.processVars);
        paymentMedium.emissionProcess.processVars = { ...paymentMedium.emissionProcess.processVars, ...processVars };
        requestApdus.push(MifareTools.bytesToHex(apdu));
    });
    paymentMedium.emissionProcess.processVars = { ...paymentMedium.emissionProcess.processVars, encodedBinaryData };
    const nextStep = { step: 5, requestApdus, desc: 'Escribir Datos', error: null };
    logStep(paymentMedium, paymentMediumType, nextStep.step, nextStep.desc, 'requestApdus', nextStep.requestApdus);
    return { paymentMedium, nextStep };
};
const validateWriteResponse_and_requestReadWrittenCardData$ = async (paymentMedium, paymentMediumType, responseStep, response) => {
    /* PREV RESPONSE VALIDATION */
    logStep(paymentMedium, paymentMediumType, responseStep, 'Escribir Datos', 'responseApdus', response);
    for (let i in response) {
        const responseApdu = response[i];
        if (!responseApdu || !responseApdu.isValid || !responseApdu.responseApdu || !responseApdu.responseApdu.startsWith('90')) {
            return buildErrorResponse(paymentMedium, `No fue posible obtener respuesta escritura de bloques.  request=${responseApdu.requestApdu} response=${responseApdu.responseApdu}`);
        }
        const writeResponse = MifareTools.hexToBytes(responseApdu.responseApdu.substring(2));
        const { processVars } = MifareTools.verifyDataFromWriteResponse(writeResponse, paymentMedium.emissionProcess.processVars);
        paymentMedium.emissionProcess.processVars = { ...paymentMedium.emissionProcess.processVars, ...processVars };
    }

    /* NEXT REQUEST GENERATION */
    const { apdu, processVars } = MifareTools.generateReadCmdApdu(paymentMedium.emissionProcess.processVars);
    paymentMedium.emissionProcess.processVars = { ...paymentMedium.emissionProcess.processVars, ...processVars };
    const nextStep = { step: 6, requestApdus: [MifareTools.bytesToHex(apdu)], desc: 'Verificar Datos Escritos', error: null };
    logStep(paymentMedium, paymentMediumType, nextStep.step, nextStep.desc, 'requestApdus', nextStep.requestApdus);
    return { paymentMedium, nextStep };
};
const validateReadWrittenCardData_and_requestRestartSesion$ = async (paymentMedium, paymentMediumType, responseStep, responseApdus) => {

    const specsVersion = paymentMediumType.mappings.filter(m => m.active).sort((m1, m2) => m1.version - m2.version).pop();
    const specs = specsVersion.mapping;
    if (!specs) return buildErrorResponse(paymentMedium, `Mapping activo no encontrado en el tipo de medio de pago ${paymentMediumType.code}`);

    /* PREV RESPONSE VALIDATION */
    logStep(paymentMedium, paymentMediumType, responseStep, 'Verificar Datos Escritos', 'responseApdus', responseApdus);
    const response = (responseApdus || [])[0];
    if (!response || !response.isValid || !response.responseApdu || !response.responseApdu.startsWith('90')) {
        return buildErrorResponse(paymentMedium, `No fue posible obtener lectura de bloques escritos.  request=${response.requestApdu} response=${response.responseApdu}`);
    }

    const readResponse = MifareTools.hexToBytes(response.responseApdu.substring(2));
    const { blocks, processVars: processVarsMut } = MifareTools.extractDataFromReadResponse(readResponse, paymentMedium.emissionProcess.processVars);
    paymentMedium.emissionProcess.processVars = { ...paymentMedium.emissionProcess.processVars, ...processVarsMut };
    const rawDataAfter = {
        ...Object.keys(blocks).reduce((acc, key) => {
            acc[key] = MifareTools.bytesToHex(blocks[key]);
            return acc;
        }, {})
    };

    const interpreter = new PaymentMediumMifareInterpreter(specsVersion);
    const decodedCardData = interpreter.binaryToCardDataMap(rawDataAfter);
    logStep(paymentMedium, paymentMediumType, responseStep, 'Verificar Datos Escritos', 'rawDataAfter', rawDataAfter);
    logStep(paymentMedium, paymentMediumType, responseStep, 'Verificar Datos Escritos', 'decodedCardData', decodedCardData);

    const entries = Object.entries(paymentMedium.emissionProcess.processVars.encodedBinaryData);
    for (let i in entries) {
        const [block, value] = entries[i];
        if (value !== rawDataAfter[block]) {
            if (block == 4) {
                ConsoleLogger.w(`PaymentMediumInitializerHelper.validateReadWrittenCardData_and_requestRestartSesion: detected mismatch between written and read data.  bl=${block}, written=${value}, read=${rawDataAfter[block]}`);
                //TODO:  HIGH PRIORITY fix bl 4 mismatch
            } else {
                return buildErrorResponse(paymentMedium, `Validacion de Escritura ha Fallado. bloque=${block}, escrito=${value}, leido=${rawDataAfter[block]}`);
            }
        }
    }


    /* NEXT REQUEST GENERATION */

    const nextStep = {
        step: 7,
        requestApdus: ['FFCA000000'],
        desc: 'Escribir bits de acceso y llaves',
        error: null,
        resetReaderSession: true,
    };

    logStep(paymentMedium, paymentMediumType, nextStep.step, nextStep.desc, 'requestApdus', nextStep.requestApdus);
    return { paymentMedium, nextStep };
};


const writeCardSecurity_and_requestRestartSesion$ = async (paymentMedium, paymentMediumType, responseStep, responseApdus, endUser, profile, authToken) => {

    const specsVersion = paymentMediumType.mappings.filter(m => m.active).sort((m1, m2) => m1.version - m2.version).pop();
    const specs = specsVersion.mapping;
    if (!specs) return buildErrorResponse(paymentMedium, `Mapping activo no encontrado en el tipo de medio de pago ${paymentMediumType.code}`);

    const CARD_SECURITY_STATES = ['PENDING', 'AUTH_PHASE_I_SENT', 'AUTH_PHASE_I_VERIFIED', 'AUTH_PHASE_II_SENT', 'AUTH_PHASE_II_VERIFIED', 'WRITE_SENT', 'WRITE_VERIFIED'];
    let cardSecurityStates = paymentMedium.emissionProcess.steps[7].cardSecurityStates;
    const writtenCardSecurityState = cardSecurityStates ? cardSecurityStates.find(ks => !['PENDING', 'WRITE_VERIFIED'].includes(ks.state)) : undefined;

    /* PREV RESPONSE VALIDATION */
    if (!cardSecurityStates) {
        // Validate UUID from new session
        const response = (responseApdus || [])[0];
        if (!response || !response.isValid) {
            const nextStep = buildErrorResponse(paymentMedium, `No fue posible extraer UUID.  request=${response.requestApdu} response=${response.responseApdu}`);
            return { paymentMedium, nextStep };
        }
        const uuid = response.responseApdu.slice(0, -4).toUpperCase();
        if (paymentMedium.mediumId !== uuid) {
            const nextStep = buildErrorResponse(paymentMedium, `UUID de la tarjeta no coincide con el UUID original.  original=${paymentMedium.mediumId} uuid=${uuid}`);
            return { paymentMedium, nextStep };
        }

        const blockVsAcl = specs.EMISSION_VARS.APPS
            .map(app => specs[app].acls || [])
            .reduce((acc, val) => ({ ...acc, ...val }), {});

        //build variables to set medium security
        const sectors =
            [...new Set(
                specs.EMISSION_VARS.APPS
                    .map(app => Object.values(specs[app].data).map(({ block }) => block))
                    .reduce((acc, val) => acc.concat(val), [])
                    .map(b => parseInt(b / 4))
            )];
        sectors.sort();
        cardSecurityStates = sectors.map(sector => ({
            sector,
            state: 'PENDING',
            acl: {
                block: ((sector * 4) + 3),
                ...blockVsAcl[((sector * 4) + 3)]
            }
        }));
        paymentMedium.emissionProcess.steps[7].cardSecurityStates = cardSecurityStates;
    } else if (writtenCardSecurityState) {
        logStep(paymentMedium, paymentMediumType, responseStep, 'Escribir bits de acceso y llaves', 'responseApdus', responseApdus);

        for (let i in responseApdus) {
            const response = responseApdus[i];
            const writtenDataType = [
                { key: 'ACL', es: 'bits de acceso' },
                { key: 'KEYA', es: 'llave A' },
                { key: 'KEYB', es: 'llave B' }
            ][i];
            if (!response || !response.isValid || !response.responseApdu || !response.responseApdu.startsWith('90')) {
                const errMsg = writtenCardSecurityState.state === 'WRITE_SENT'
                    ? `No fue posible escribir ${writtenDataType.es}`
                    : writtenCardSecurityState.state === 'AUTH_PHASE_I_SENT'
                        ? 'Falló primer paso de autenticación'
                        : writtenCardSecurityState.state === 'AUTH_PHASE_II_SENT'
                            ? 'Falló segundo paso de autenticación'
                            : '???' + writtenCardSecurityState.state + '???';
                return buildErrorResponse(paymentMedium, `${errMsg}.  request=${response.requestApdu} response=${response.responseApdu}`);
            }
            if (writtenCardSecurityState.state === 'WRITE_SENT') {
                const writeResponse = MifareTools.hexToBytes(response.responseApdu.substring(2));
                const { processVars } = MifareTools.verifyDataFromWriteResponse(writeResponse, paymentMedium.emissionProcess.processVars);
                paymentMedium.emissionProcess.processVars = { ...paymentMedium.emissionProcess.processVars, ...processVars };
                writtenCardSecurityState[writtenDataType.key] = { ...writtenCardSecurityState[writtenDataType.key], responseApdus };
            }
        }
        writtenCardSecurityState.state = CARD_SECURITY_STATES[CARD_SECURITY_STATES.indexOf(writtenCardSecurityState.state) + 1];
    }



    /* NEXT REQUEST GENERATION */
    const currentCardSecutiryState = cardSecurityStates.find(ks => ks.state !== 'WRITE_VERIFIED') || {};
    const requestApdus = [];
    let nextStepDesc = '???';
    switch (currentCardSecutiryState.state) {
        case 'PENDING':
            const { apdu: authPhaseIApdu, processVars: authPhaseIProcessVars } = MifareTools.generateFirstAuthPhaseIApdu(currentCardSecutiryState.sector * 4, specs.EMISSION_VARS.KEY_TO_READ_WRITE === 'KEYB');
            paymentMedium.emissionProcess.processVars = { step: 7, block: currentCardSecutiryState.sector * 4, ext: 1, ...authPhaseIProcessVars };
            requestApdus.push(MifareTools.bytesToHex(authPhaseIApdu));

            currentCardSecutiryState.auth = { authPhaseIApdu };

            currentCardSecutiryState.state = 'AUTH_PHASE_I_SENT';
            nextStepDesc = `Escribir bits de acceso y llaves del sector ${currentCardSecutiryState.sector}: Auth I`;
            break;
        case 'AUTH_PHASE_I_VERIFIED':
            const firstAuthPhase1 = MifareTools.hexToBytes(responseApdus[0].responseApdu.substring(2));
            const { apdu: authPhaseIIApdu, processVars: authPhaseIIProcessVars } = MifareTools.generateFirstAuthPhaseIIApdu(firstAuthPhase1, MifareTools.hexToBytes(specs.EMISSION_VARS[specs.EMISSION_VARS.KEY_TO_READ_WRITE]));
            paymentMedium.emissionProcess.processVars = { ...paymentMedium.emissionProcess.processVars, ...authPhaseIIProcessVars };
            requestApdus.push(MifareTools.bytesToHex(authPhaseIIApdu));

            currentCardSecutiryState.auth = { ...currentCardSecutiryState.auth, firstAuthPhase1, authPhaseIIApdu };

            currentCardSecutiryState.state = 'AUTH_PHASE_II_SENT';
            nextStepDesc = `Escribir bits de acceso y llaves del sector ${currentCardSecutiryState.sector}: Auth II`;
            break;
        case 'AUTH_PHASE_II_VERIFIED':
            const firstAuthPhase2 = MifareTools.hexToBytes(responseApdus[0].responseApdu.substring(2));
            const ParametersFromFirstAuth = MifareTools.extractParametersFromFirstAuthResult(firstAuthPhase2, paymentMedium.emissionProcess.processVars);
            paymentMedium.emissionProcess.processVars = { ...paymentMedium.emissionProcess.processVars, ...ParametersFromFirstAuth };

            currentCardSecutiryState.auth = { ...currentCardSecutiryState.auth, firstAuthPhase2, ParametersFromFirstAuth };

            const { sector, acl } = currentCardSecutiryState;

            // WRITE ACL
            const { apdu: writeAclApdu, processVars: processVarsAcl } = MifareTools.generateWriteCmdApdu(
                parseInt(acl.block),
                MifareTools.hexToBytes(acl.ACL),
                paymentMedium.emissionProcess.processVars);
            paymentMedium.emissionProcess.processVars = { ...paymentMedium.emissionProcess.processVars, ...processVarsAcl };
            requestApdus.push(MifareTools.bytesToHex(writeAclApdu));
            currentCardSecutiryState.ACL = { writeApdu: writeAclApdu };

            const { keyA, keyB } = await generateMifareKeys$(paymentMedium, paymentMediumType, acl.KEYA, acl.KEYB);
            //WRITE KEY A
            const { apdu: writeKeyAApdu, processVars: processVarsA } = MifareTools.generateWriteCmdApdu(
                0x4000 + (2 * sector), MifareTools.hexToBytes(keyA), paymentMedium.emissionProcess.processVars);
            paymentMedium.emissionProcess.processVars = { ...paymentMedium.emissionProcess.processVars, ...processVarsA };
            requestApdus.push(MifareTools.bytesToHex(writeKeyAApdu));
            currentCardSecutiryState.KEYA = { writeApdu: writeKeyAApdu, key: keyA };

            //WRITE KEY B
            const { apdu: writeKeyBApdu, processVars: processVarsB } = MifareTools.generateWriteCmdApdu(
                0x4000 + (2 * sector) + 1, MifareTools.hexToBytes(keyB), paymentMedium.emissionProcess.processVars);
            paymentMedium.emissionProcess.processVars = { ...paymentMedium.emissionProcess.processVars, ...processVarsB };
            requestApdus.push(MifareTools.bytesToHex(writeKeyBApdu));
            currentCardSecutiryState.KEYB = { writeApdu: writeKeyBApdu, key: keyB };

            currentCardSecutiryState.state = 'WRITE_SENT';
            nextStepDesc = `Escribir bits de acceso y llaves del sector ${currentCardSecutiryState.sector}: WR`;
            break;
    }

    const areAllSecuritiesWritten = cardSecurityStates.every(ks => ks.state === 'WRITE_VERIFIED');
    const nextStep = {
        step: areAllSecuritiesWritten ? 8 : 7,
        requestApdus: areAllSecuritiesWritten
            ? ['FFCA000000']
            : requestApdus,
        desc: areAllSecuritiesWritten
            ? 'Reiniciando sesión lectora'
            : nextStepDesc,
        error: null,
        resetReaderSession: areAllSecuritiesWritten,
    };

    /* TODO: Terminar el siguiente paso para */
    if (nextStep.step === 8) {
        nextStep.step = null;
        finishEmission(paymentMedium, authToken);
    }

    logStep(paymentMedium, paymentMediumType, nextStep.step, 'Escribir bits de acceso y llaves', 'requestApdus', nextStep.requestApdus);
    return { paymentMedium, nextStep };
};

const validateRestartSesion_and_requestReadSecureData$ = async (paymentMedium, paymentMediumType, responseStep, responseApdus, endUser, profile, authToken) => {
    // logStep(paymentMedium, paymentMediumType, nextStep.step, 'Verificar tarjeta inicializada', 'requestApdus', nextStep.requestApdus);
    // return { paymentMedium, nextStep };
};

const validateReadSecureData$ = async (paymentMedium, paymentMediumType, responseStep, responseApdus, endUser, profile, authToken) => {
    /* PREV RESPONSE VALIDATION */
    logStep(paymentMedium, paymentMediumType, responseStep, 'Verificar tarjeta inicializada', 'responseApdus', responseApdus);

    /* NEXT REQUEST GENERATION */

    const nextStep = { step: null, requestApdus: [], desc: 'Fin', error: null };
    logStep(paymentMedium, paymentMediumType, nextStep.step, nextStep.desc, 'requestApdus', nextStep.requestApdus);
    return { paymentMedium, nextStep };
};

const generateMifareKeys$ = async (paymentMedium, paymentMediumType, productionKeyNameForKeyA, productionKeyNameForKeyB) => {
    const uuidBytes = MifareTools.hexToBytes(paymentMedium.mediumId).slice(0, 8);
    const diversifiedDataBytes = [0x01].concat([...uuidBytes, ...[...uuidBytes].reverse()]);
    const diversifiedData = MifareTools.bytesToHex(diversifiedDataBytes);
    const commonHsmPAth = "/keyRings/" + paymentMedium.organizationId + "/cryptoKeys/";
    const commonHsmBody = { data: diversifiedData };

    let { keyA, keyB } = await forkJoin([
        of(SecurityMediumProductionKeys[productionKeyNameForKeyA]),
        of(SecurityMediumProductionKeys[productionKeyNameForKeyB]),
        // SecurityMediumProductionKeyDA.getSecurityMediumProductionKeyByName$(productionKeyNameForKeyA, paymentMedium.organizationId),
        // SecurityMediumProductionKeyDA.getSecurityMediumProductionKeyByName$(productionKeyNameForKeyB, paymentMedium.organizationId),
    ]).pipe(
        tap(x => console.log('>>>>>>>>>>>>>>', x)),
        tap(([prodKeyA, prodKeyB]) => {
            if (!prodKeyA) throw new CustomError(`PaymentMediumInitializerHelper.generateMifareKeys: ProductionKey for KeyA(${productionKeyNameForKeyA}) not found`);
            if (!prodKeyA.versions.find(v => v.active)) throw new CustomError(`PaymentMediumInitializerHelper.generateMifareKeys: ProductionKey for KeyA(${productionKeyNameForKeyA}) does not have an active version`);
            if (!prodKeyB) throw new CustomError(`PaymentMediumInitializerHelper.generateMifareKeys: ProductionKey for KeyA(${productionKeyNameForKeyB}) not found`);
            if (!prodKeyB.versions.find(v => v.active)) throw new CustomError(`PaymentMediumInitializerHelper.generateMifareKeys: ProductionKey for KeyB(${productionKeyNameForKeyB}) does not have an active version`);
        }),
        mergeMap(([prodKeyA, prodKeyB]) => forkJoin([
            HSM.callHsmRestService$("POST", commonHsmPAth + prodKeyA.id + "/versions/" + prodKeyA.versions.find(v => v.active).id + "/generateDiversifiedKey", 'application/json', commonHsmBody),
            HSM.callHsmRestService$("POST", commonHsmPAth + prodKeyB.id + "/versions/" + prodKeyB.versions.find(v => v.active).id + "/generateDiversifiedKey", 'application/json', commonHsmBody)
        ])),
        map(([hsmResultA, hsmResultB]) => ({ keyA: hsmResultA.diversifiedKey, keyB: hsmResultB.diversifiedKey }))
    ).toPromise();

    console.log('=== TODO: DELETE THIS LOG ==>>>>', { keyA, keyB, diversifiedData, productionKeyNameForKeyA, productionKeyNameForKeyB });
    // keyA = '00000000000000000000000000000000';
    // keyB = '00000000000000000000000000000000';
    return { keyA, keyB, diversifiedData };
};

const finishEmission = (paymentMedium, authToken) => {
    paymentMedium.state = 'EMITTED';
    paymentMedium.stateHistory.push({
        timestamp: Date.now(),
        state: 'EMITTED',
        responsibleUserId: authToken._id,
        responsibleUserFullname: authToken.name
    });
};

const dispatchToStepProcess$ = (paymentMedium, paymentMediumType, step, responseApdus, endUser, profile, authToken, initialBalance) => {
    switch (step) {
        case 0: return requestUuid$(paymentMedium, paymentMediumType, step, responseApdus, endUser, profile, authToken, initialBalance);
        case 1: return verifyUuid_and_requestFirstAuthPhaseI$(paymentMedium, paymentMediumType, step, responseApdus, endUser, profile, authToken, initialBalance);
        case 2: return validateFirstAuthPhaseI_and_requestFirstAuthPhaseII$(paymentMedium, paymentMediumType, step, responseApdus, endUser, profile, authToken, initialBalance);
        case 3: return validateFirstAuthPhaseII_and_requestReadBlankCardData$(paymentMedium, paymentMediumType, step, responseApdus, endUser, profile, authToken, initialBalance);
        case 4: return validateBlankCardData_and_requestWriteCardData$(paymentMedium, paymentMediumType, step, responseApdus, endUser, profile, authToken, initialBalance);
        case 5: return validateWriteResponse_and_requestReadWrittenCardData$(paymentMedium, paymentMediumType, step, responseApdus, endUser, profile, authToken, initialBalance);
        case 6: return validateReadWrittenCardData_and_requestRestartSesion$(paymentMedium, paymentMediumType, step, responseApdus, endUser, profile, authToken, initialBalance);
        case 7: return writeCardSecurity_and_requestRestartSesion$(paymentMedium, paymentMediumType, step, responseApdus, endUser, profile, authToken, initialBalance);
        case 8: return validateRestartSesion_and_requestReadSecureData$(paymentMedium, paymentMediumType, step, responseApdus, endUser, profile, authToken, initialBalance);
        case 9: return validateReadSecureData$(paymentMedium, paymentMediumType, step, responseApdus, endUser, profile, authToken, initialBalance);
        default: throw new CustomError(`PaymentMediumInitializerHelper.dispatchToStepProcess: step ${step} not found`);
    }
};

const simulateClientServerFlow$ = (clientArgs) => {
    if (!clientArgs || clientArgs[2] === null) return of(null);
    const [_, paymentMediumType, currentStep, ___, endUser, profile, authToken, initialBalance] = clientArgs;
    console.log('Reporting to server step #', currentStep, '======================================');
    return from(dispatchToStepProcess$(...clientArgs)).pipe(
        tap(({ nextStep }) => console.log('Server returned nexStep', nextStep)),
        tap(({ nextStep }) => { if (nextStep.error) throw new Error(nextStep.error); }),
        mergeMap(({ paymentMedium, nextStep: { step, requestApdus, desc, error } }) => {
            const readerCommand = { sessionId: __readerSessionId, closeSession: false, requests: requestApdus };
            console.log('Sending CMD to SmartCard ', requestApdus);
            return from(httpRequest(SMARTCARD_APDUS_END_POINT, { method: 'POST', headers: { 'Content-Type': 'application/json' } }, readerCommand)).pipe(
                tap(({ body }) => console.log('SmartCard response', body)),
                map(({ body }) => JSON.parse(body)),
                map(responses => responses.map(({ apdu: requestApdu, response: responseApdu, isValid }) => ({ requestApdu, responseApdu, isValid }))),
                map((response) => [paymentMedium, paymentMediumType, step, response, endUser, profile, authToken, initialBalance])
            );
        }),
    );
};

of([paymentMedium, paymentMediumType, 0, [], endUser, profile, { _id: 'test-user', name: 'test-user' }, 0]).pipe(
    expand(args => simulateClientServerFlow$(args)),
    takeWhile((nextStep) => nextStep && nextStep !== null)
).subscribe(
    //evt => console.log(evt),
    () => { },
    err => console.error(err),
    () => console.log('Completed!!!!')
);