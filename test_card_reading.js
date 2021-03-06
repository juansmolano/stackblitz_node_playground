'use strict';

/* IMPORTED LIBS */
const _ = require('lodash');
const { generate, of, from } = require("rxjs");
const { expand, tap, map, takeUntil, takeWhile, pluck, mergeMap } = require("rxjs/operators");
const httpRequest = require("./HttpRequest"); // NEEDS ENV ==> NODE_TLS_REJECT_UNAUTHORIZED=0
const MifareTools = require("./MifareTools");

/* CLIENT (FRONTEND) SIMULATION VARS */
const PCSC_DAEMON_END_POINT = 'https://pcsc-daemon:1215/pcsc-daemon';
//const READER_END_POINT = PCSC_DAEMON_END_POINT + '/readers/5C5C3F5C535744235363446576696365456E756D23315F4143535F414352313235325F31535F434C5F5265616465725F504943435F30237B64656562653661642D396530312D343765322D613362322D6136366161326330333663397D';
const READER_END_POINT = PCSC_DAEMON_END_POINT + '/readers/5C5C3F5C535744235363446576696365456E756D23315F4143535F414352313235325F31535F434C5F5265616465725F504943435F30237B64656562653661642D396530312D343765322D613362322D6136366161326330333663397D';
const SMARTCARD_APDUS_END_POINT = READER_END_POINT + '/smartcard/sendApdus';
let __readerSessionId = Math.random() + '';

/* ENV VARS */

const ZERO_BITS = '00000000000000000000000000000000';
const ONE_BITS = 'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF';


const USED_KEY = ONE_BITS;
const USING_KEY_B = true;

//const FILL_BITS = ONE_BITS;
const MIFARE_DEFAULT_KEY_A = process.env.MIFARE_DEFAULT_KEY_A || USED_KEY;
const MIFARE_DEFAULT_KEY_B = process.env.MIFARE_DEFAULT_KEY_B || USED_KEY;
//const UUID = '042D0321780000';
//const UUID = '0443403AAE4F80';
const UUID = '04291B3AAE4F80';


/* DB ENTITY SIMULATION */
const endUser = require('./entities/EndUser.json');
const profile = require('./entities/Profile.json');
const PaymentMediumMifareTools = require('./PaymentMediumMifareTools');
const buildMifarePaymentMedium = require('./PaymentMediumBuilder');
const paymentMediumType = require('./entities/PaymentMediumType.json');
const paymentMediumAcquisition = require('./entities/PaymentMediumAcquisition.json');
const paymentMedium = buildMifarePaymentMedium(UUID, 123, paymentMediumType, endUser, paymentMediumAcquisition, { _id: '123123', name: 'jhon doe' });
paymentMedium.emissionProcess = { step: 0, processVars: {} };

// httpRequest(READER_END_POINT, { method: 'GET' }).then((result, error) => {
//     console.log({ result: JSON.parse(result.body), error });
// });

const serverLogicByStep = {

    /* --------IN : START + VERIFY UUID ------------- */
    /* --------OUT: FirstAuth phase I  ------------- */
    0: (paymentMedium, specification, currentStep, responseApdus) => {
        console.log('=====', { step: currentStep, responseApdus, processVars: paymentMedium.emissionProcess.processVars });
        const nextStep = { nextStep: null, nextStepApdus: [] };

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

        /* generating next step nextStepApdus */
        const getMinMaxBlock = (data) => Object.values(data)
            .map(({ block }) => block)
            .reduce((minMax, block) => {
                if (block < minMax.min) minMax.min = block;
                if (block > minMax.max) minMax.max = block;
                return minMax;
            }, { min: 9999, max: 0 });
        const mins = [];
        const maxs = [];
        specification.specification.EMISSION_VARS.APPS
            .map(app => getMinMaxBlock(specification.specification[app].data))
            .forEach(({ min, max }) => { mins.push(min); maxs.push(max); });
        const block = Math.min(...mins);
        let ext = (Math.max(...maxs) - block);
        ext = ext - parseInt((ext) / 4) + 1;
        const { apdu, processVars } = MifareTools.generateFirstAuthPhaseIApdu(block, USING_KEY_B);
        nextStep.nextStepApdus.push(MifareTools.bytesToHex(apdu));
        paymentMedium.emissionProcess.processVars = { step: 0, block, ext, initTs: Date.now(), ...processVars };

        nextStep.nextStep = 1;
        return nextStep;
    },


    1: (paymentMedium, specification, currentStep, responseApdus) => {
        console.log('=====', { step: currentStep, responseApdus, processVars: paymentMedium.emissionProcess.processVars });
        const nextStep = { nextStep: null, nextStepApdus: [] };
        /* Validate Response:  FirstAuthPhase I Response */
        const responseApdu = (responseApdus || [])[0];
        if (!responseApdu || !responseApdu.isValid || !responseApdu.response || !responseApdu.response.startsWith('90')) {
            nextStep.error = { msg: `No fue posible obtener respuesta de la primera fase de FirstAuth.  request=${responseApdu.apdu} response=${responseApdu.response}` };
            return nextStep;
        }
        const firstAuthPhase1 = MifareTools.hexToBytes(responseApdu.response.substring(2));

        /* generating next step nextStepApdus */
        const { apdu, processVars } = MifareTools.generateFirstAuthPhaseIIApdu(firstAuthPhase1, MifareTools.hexToBytes(USED_KEY));
        paymentMedium.emissionProcess.processVars = { ...paymentMedium.emissionProcess.processVars, ...processVars };
        nextStep.nextStepApdus.push(MifareTools.bytesToHex(apdu));
        nextStep.nextStep = 2;

        return nextStep;
    },
    2: (paymentMedium, specification, currentStep, responseApdus) => {
        console.log('=====', { step: currentStep, responseApdus, processVars: paymentMedium.emissionProcess.processVars });
        const nextStep = { nextStep: null, nextStepApdus: [] };

        /* Validate Response:  FirstAuthPhase II Response */
        const responseApdu = (responseApdus || [])[0];
        if (!responseApdu || !responseApdu.isValid || !responseApdu.response || !responseApdu.response.startsWith('90')) {
            nextStep.error = { msg: `No fue posible obtener respuesta de la segunda fase de FirstAuth.  request=${responseApdu.apdu} response=${responseApdu.response}` };
            return nextStep;
        }
        const firstAuthPhase2 = MifareTools.hexToBytes(responseApdu.response.substring(2));
        const ParametersFromFirstAuth = MifareTools.extractParametersFromFirstAuthResult(firstAuthPhase2, paymentMedium.emissionProcess.processVars);
        paymentMedium.emissionProcess.processVars = { ...paymentMedium.emissionProcess.processVars, ...ParametersFromFirstAuth };

        //console.log('=====', paymentMedium.emissionProcess.processVars);

        // /* generating next step nextStepApdus */
        const { apdu, processVars } = MifareTools.generateReadCmdApdu(paymentMedium.emissionProcess.processVars);
        paymentMedium.emissionProcess.processVars = { ...paymentMedium.emissionProcess.processVars, ...processVars };
        nextStep.nextStepApdus.push(MifareTools.bytesToHex(apdu));
        nextStep.nextStep = 3;

        return nextStep;
    },
    3: (paymentMedium, specification, currentStep, responseApdus) => {
        console.log('=====', { step: currentStep, responseApdus, processVars: paymentMedium.emissionProcess.processVars });
        const nextStep = { nextStep: null, nextStepApdus: [] };

        /* Validate Response:  READ Block */
        const responseApdu = (responseApdus || [])[0];
        if (!responseApdu || !responseApdu.isValid || !responseApdu.response || !responseApdu.response.startsWith('90')) {
            nextStep.error = { msg: `No fue posible obtener respuesta lectura de bloques.  request=${responseApdu.apdu} response=${responseApdu.response}` };
            return nextStep;
        }
        const readResponse = MifareTools.hexToBytes(responseApdu.response.substring(2));
        const { blocks, processVars } = MifareTools.extractDataFromReadResponse(readResponse, paymentMedium.emissionProcess.processVars);
        paymentMedium.emissionProcess.processVars = { ...paymentMedium.emissionProcess.processVars, ...processVars };
        const rawDataPrev = {
            mv: specification.version, ...Object.keys(blocks).reduce((acc, key) => {
                acc[key] = MifareTools.bytesToHex(blocks[key]);
                return acc;
            }, {})
        };
        paymentMedium.emissionProcess[currentStep] = { rawDataPrev };
        console.log('===== rawDataPrev', rawDataPrev);



        /* generating next step nextStepApdus */
        const interpreter = new PaymentMediumMifareTools(specification);


        const x = interpreter.binaryToCardDataMap(rawDataPrev);
        console.log('>>>>>>>>>>>> rawDataPrev >>>>',JSON.stringify(x,null,),'<<<<<<<<<<<<');
        paymentMedium.ST$ =  parseInt(x.ST$)+5000;
        paymentMedium.STB$ =  parseInt(x.STB$)+5000;

        const dataCardMap = interpreter.paymentMediumToCardDataMap(paymentMedium, endUser, profile);
        const encodedBinaryData = interpreter.cardDataMapToBinary(dataCardMap);

        Object.entries(encodedBinaryData).forEach(([block, hex], writeSeq) => {
            const { apdu } = MifareTools.generateWriteCmdApdu(parseInt(block), MifareTools.hexToBytes(hex), { ...paymentMedium.emissionProcess.processVars, writeCounter: paymentMedium.emissionProcess.processVars.writeCounter + writeSeq });
            nextStep.nextStepApdus.push(MifareTools.bytesToHex(apdu));
        });
        paymentMedium.emissionProcess.processVars = { ...paymentMedium.emissionProcess.processVars, encodedBinaryData };

        nextStep.nextStep = 4;
        return nextStep;
    },
    4: (paymentMedium, specification, currentStep, responseApdus) => {
        console.log('=====', { step: currentStep, responseApdus, processVars: paymentMedium.emissionProcess.processVars });
        const nextStep = { nextStep: null, nextStepApdus: [] };

        /* Validate Response:  READ Block */
        responseApdus.forEach(responseApdu => {
            if (!responseApdu || !responseApdu.isValid || !responseApdu.response || !responseApdu.response.startsWith('90')) {
                nextStep.error = { msg: `No fue posible obtener respuesta escritura de bloques.  request=${responseApdu.apdu} response=${responseApdu.response}` };
                return nextStep;
            }
            const writeResponse = MifareTools.hexToBytes(responseApdu.response.substring(2));
            const { processVars } = MifareTools.verifyDataFromWriteResponse(writeResponse, paymentMedium.emissionProcess.processVars);
            paymentMedium.emissionProcess.processVars = { ...paymentMedium.emissionProcess.processVars, ...processVars };
        });


        // /* generating next step nextStepApdus */
        const { apdu, processVars } = MifareTools.generateReadCmdApdu(paymentMedium.emissionProcess.processVars);
        paymentMedium.emissionProcess.processVars = { ...paymentMedium.emissionProcess.processVars, ...processVars };
        nextStep.nextStepApdus.push(MifareTools.bytesToHex(apdu));
        nextStep.nextStep = 5;

        return nextStep;
    },
    5: (paymentMedium, specification, currentStep, responseApdus) => {
        console.log('=====', { step: currentStep, responseApdus, processVars: paymentMedium.emissionProcess.processVars });
        const nextStep = { nextStep: null, nextStepApdus: [] };

        /* Validate Response:  READ Block */
        const responseApdu = (responseApdus || [])[0];
        if (!responseApdu || !responseApdu.isValid || !responseApdu.response || !responseApdu.response.startsWith('90')) {
            nextStep.error = { msg: `No fue posible obtener respuesta lectura de bloques.  request=${responseApdu.apdu} response=${responseApdu.response}` };
            return nextStep;
        }
        const readResponse = MifareTools.hexToBytes(responseApdu.response.substring(2));
        const { blocks, processVars } = MifareTools.extractDataFromReadResponse(readResponse, paymentMedium.emissionProcess.processVars);
        paymentMedium.emissionProcess.processVars = { ...paymentMedium.emissionProcess.processVars, ...processVars };
        const rawDataAfter = {
            mv: specification.version, ...Object.keys(blocks).reduce((acc, key) => {
                acc[key] = MifareTools.bytesToHex(blocks[key]);
                return acc;
            }, {})
        };

        Object.entries(paymentMedium.emissionProcess.processVars.encodedBinaryData).forEach(([block, value]) => {
            if (value !== rawDataAfter[block]) {
                throw new Error(`Write/Read validation failed. block=${block}, writen=${value}, read=${rawDataAfter[block]}`);
            }
        });

        const interpreter = new PaymentMediumMifareTools(specification);
        const decodedCardData = interpreter.binaryToCardDataMap(rawDataAfter);
        console.log('===== decodedCardData', decodedCardData);
        console.log('===== TOTAL TS', Date.now() - paymentMedium.emissionProcess.processVars.initTs);
        return nextStep;
    },
};

const processServerRequest$ = (currentStep, nextStepApdus) => {
    const stepServerFn = serverLogicByStep[currentStep];
    const readerCommand = { sessionId: __readerSessionId, closeSession: false, requests: nextStepApdus }
    return from(httpRequest(SMARTCARD_APDUS_END_POINT, { method: 'POST', headers: { 'Content-Type': 'application/json' } }, readerCommand)).pipe(
        map(({ body }) => JSON.parse(body)),
        map((results) => stepServerFn(paymentMedium, paymentMediumType.specifications[0], currentStep, results)),
        tap(evt => console.log(evt)),
    );
};



// generate(steps[emissionProcess.step], step => step, step => steps[emissionProcess.step++]).pipe(
//     tap(fn => console.log(fn()))
// )
of({ nextStep: '0', nextStepApdus: ['FFCA000000'] }).pipe(
    expand(({ nextStep, nextStepApdus }) => processServerRequest$(nextStep, nextStepApdus)),
    takeWhile(({ nextStep, nextStepApdus }) => nextStep !== null)
).subscribe(
    evt => console.log(evt),
    //() => { },
    err => console.error(err),
    () => console.log('Completed!!!!')
);



