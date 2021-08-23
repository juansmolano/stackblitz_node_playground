'use strict';

/* IMPORTED LIBS */
const { generate, of, from } = require("rxjs");
const { expand, tap, map, takeUntil, takeWhile, pluck, mergeMap } = require("rxjs/operators");
const httpRequest = require("./HttpRequest"); // NEEDS ENV ==> NODE_TLS_REJECT_UNAUTHORIZED=0
const MifareTools = require("./MifareTools");

/* CLIENT (FRONTEND) SIMULATION VARS */
const PCSC_DAEMON_END_POINT = 'https://pcsc-daemon:1215/pcsc-daemon';
const READER_END_POINT = PCSC_DAEMON_END_POINT + '/readers/5C5C3F5C535744235363446576696365456E756D23315F4143535F414352313235325F31535F434C5F5265616465725F504943435F30237B64656562653661642D396530312D343765322D613362322D6136366161326330333663397D';
const SMARTCARD_APDUS_END_POINT = READER_END_POINT + '/smartcard/sendApdus';
let __readerSessionId = Math.random() + '';

/* ENV VARS */
const MIFARE_DEFAULT_KEY_A = process.env.MIFARE_DEFAULT_KEY_A || '00000000000000000000000000000000';
const MIFARE_DEFAULT_KEY_B = process.env.MIFARE_DEFAULT_KEY_B || 'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF';


/* DB ENTITY SIMULATION */
const paymentMediumType = require('./entities/PaymentMediumType.json');
const paymentMedium = {
    _id: 'xyz',
    mediumId: '042D0321780000',
    emissionSteps: {
        step: 0,
        processVars: {

        }
    }
};

const BLOCK = 1;
const BLOCK_EXT = 30;



// httpRequest(READER_END_POINT, { method: 'GET' }).then((result, error) => {
//     console.log({ result: JSON.parse(result.body), error });
// });

const serverLogicByStep = {

    /* --------IN : START + VERIFY UUID ------------- */
    /* --------OUT: FirstAuth phase I  ------------- */
    0: (paymentMedium, specification, currentStep, responseApdus) => {
        console.log('=====', { step: currentStep, responseApdus });
        const nextStep = { nextStep: null, apdus: [] };

        /* Validate Response:  UUID */
        const responseApdu = (responseApdus || [])[0];
        if (!responseApdu || !responseApdu.isValid) {
            nextStep.error = { msg: `No fue posible extraer UUID.  request=${responseApdu.apdu} response=${responseApdu.response}` };
            return nextStep;
        }
        const uuid = responseApdu.response.slice(0, -4).toUpperCase();
        if (paymentMedium.mediumId !== uuid) {
            nextStep.error = { msg: `UUID de la tarjeta no coincide con el UUID original.  original=${paymentMedium.mediumId} uuid=${uuid}` };
            return nextStep;
        }

        /* generating next step apdus */
        const { min: afcMinBlock, max: afcMaxBlock } = Object.values(specification.APP_AFC.data)
            .map(({ block }) => block)
            .reduce((minMax, block) => {
                if (block < minMax.min) minMax.min = block;
                if (block > minMax.max) minMax.max = block;
                return minMax;
            }, { min: 9999, max: 0 });
        console.log('*********',{afcMinBlock,afcMaxBlock});
        const { apdu, processVars } = MifareTools.generateFirstAuthPhaseIApdu(BLOCK, true);
        nextStep.apdus.push(MifareTools.bytesToHex(apdu));
        paymentMedium.emissionSteps.processVars = { step: 0, processVars: {} };
        paymentMedium.emissionSteps.processVars = { ...paymentMedium.emissionSteps.processVars, ...processVars };

        nextStep.nextStep = 1;
        return nextStep;
    },


    1: (paymentMedium, specification, currentStep, responseApdus) => {
        console.log('=====', { step: currentStep, responseApdus });
        const nextStep = { nextStep: null, apdus: [] };
        /* Validate Response:  FirstAuthPhase I Response */
        const responseApdu = (responseApdus || [])[0];
        if (!responseApdu || !responseApdu.isValid || !responseApdu.response || !responseApdu.response.startsWith('90')) {
            nextStep.error = { msg: `No fue posible obtener respuesta de la primera fase de FirstAuth.  request=${responseApdu.apdu} response=${responseApdu.response}` };
            return nextStep;
        }
        const firstAuthPhase1 = MifareTools.hexToBytes(responseApdu.response.substring(2));

        /* generating next step apdus */
        const { apdu, processVars } = MifareTools.generateFirstAuthPhaseIIApdu(firstAuthPhase1, MifareTools.hexToBytes(MIFARE_DEFAULT_KEY_B));
        paymentMedium.emissionSteps.processVars = { ...paymentMedium.emissionSteps.processVars, ...processVars };
        nextStep.apdus.push(MifareTools.bytesToHex(apdu));
        nextStep.nextStep = 2;

        return nextStep;
    },
    2: (paymentMedium, specification, currentStep, responseApdus) => {
        console.log('=====', { step: currentStep, responseApdus });
        const nextStep = { nextStep: null, apdus: [] };

        /* Validate Response:  FirstAuthPhase II Response */
        const responseApdu = (responseApdus || [])[0];
        if (!responseApdu || !responseApdu.isValid || !responseApdu.response || !responseApdu.response.startsWith('90')) {
            nextStep.error = { msg: `No fue posible obtener respuesta de la segunda fase de FirstAuth.  request=${responseApdu.apdu} response=${responseApdu.response}` };
            return nextStep;
        }
        const firstAuthPhase2 = MifareTools.hexToBytes(responseApdu.response.substring(2));
        const ParametersFromFirstAuth = MifareTools.extractParametersFromFirstAuthResult(firstAuthPhase2, paymentMedium.emissionSteps.processVars);
        paymentMedium.emissionSteps.processVars = { ...paymentMedium.emissionSteps.processVars, ...ParametersFromFirstAuth };

        //console.log('=====', paymentMedium.emissionSteps.processVars);

        // /* generating next step apdus */
        const { apdu, processVars } = MifareTools.generateReadCmdApdu(BLOCK_EXT, paymentMedium.emissionSteps.processVars);
        paymentMedium.emissionSteps.processVars = { ...paymentMedium.emissionSteps.processVars, ...processVars };
        nextStep.apdus.push(MifareTools.bytesToHex(apdu));
        nextStep.nextStep = 3;

        return nextStep;
    },
    3: (paymentMedium, specification, currentStep, responseApdus) => {
        console.log('=====', { step: currentStep, responseApdus, processVars: paymentMedium.emissionSteps.processVars });
        const nextStep = { nextStep: null, apdus: [] };

        /* Validate Response:  READ Block */
        const responseApdu = (responseApdus || [])[0];
        if (!responseApdu || !responseApdu.isValid || !responseApdu.response || !responseApdu.response.startsWith('90')) {
            nextStep.error = { msg: `No fue posible obtener respuesta lectura de bloques.  request=${responseApdu.apdu} response=${responseApdu.response}` };
            return nextStep;
        }
        const readResponse = MifareTools.hexToBytes(responseApdu.response.substring(2));
        const data = MifareTools.extractDataFromReadResponse(readResponse, paymentMedium.emissionSteps.processVars);
        // paymentMedium.emissionSteps.processVars = { ...paymentMedium.emissionSteps.processVars, ...ParametersFromFirstAuth };

        console.log('===== data', data);

        // // /* generating next step apdus */
        // const apdu = MifareTools.generateReadCmdApdu(BLOCK,BLOCK_EXT,paymentMedium.emissionSteps.processVars);
        // nextStep.apdus.push(MifareTools.bytesToHex(apdu));
        // nextStep.nextStep = 3;

        return nextStep;
    },
};

const processServerRequest$ = (currentStep, apdus) => {
    const stepServerFn = serverLogicByStep[currentStep];
    const readerCommand = { sessionId: __readerSessionId, closeSession: false, requests: apdus }
    return from(httpRequest(SMARTCARD_APDUS_END_POINT, { method: 'POST', headers: { 'Content-Type': 'application/json' } }, readerCommand)).pipe(
        map(({ body }) => JSON.parse(body)),
        map((results) => stepServerFn(paymentMedium, paymentMediumType.specifications[0].specification, currentStep, results)),
        tap(evt => console.log(evt)),
    );
};



// generate(steps[emissionSteps.step], step => step, step => steps[emissionSteps.step++]).pipe(
//     tap(fn => console.log(fn()))
// )
of({ nextStep: '0', apdus: ['FFCA000000'] }).pipe(
    expand(({ nextStep, apdus }) => processServerRequest$(nextStep, apdus)),
    takeWhile(({ nextStep, apdus }) => nextStep !== null)
).subscribe(
    //evt => console.log(evt),
    () => { },
    err => console.error(err),
    () => console.log('Completed!!!!')
);



