'use strict';

/* IMPORTED LIBS */
const _ = require('lodash');
const { of, forkJoin, from, iif, throwError, merge, EMPTY, defer, timer } = require("rxjs");
const { mergeMap, catchError, map, toArray, tap, filter, first, expand, takeWhile, pluck, mergeMapTo, mapTo } = require('rxjs/operators');
const { error: { CustomError }, log: { ConsoleLogger } } = require("@nebulae/backend-node-tools");

const { DesfireTools: { DesfireTools, EV_MODES, KEY_TYPES, APP_TARGETS, ACCESS_RIGHTS, COMM_MODES }, MifareTools } = require('./smartcard');
const HSM = require("./hsm/HSM").singleton();
const SecurityMediumProductionKeys = require('./entities/SecurityMediumProductionKeys');

const httpRequest = require("./HttpRequest"); // NEEDS ENV ==> NODE_TLS_REJECT_UNAUTHORIZED=0


/* CLIENT (FRONTEND) SIMULATION VARS */
const PCSC_DAEMON_END_POINT = 'https://pcsc-daemon:1215/pcsc-daemon';
const READER_END_POINT = PCSC_DAEMON_END_POINT + '/readers/5C5C3F5C535744235363446576696365456E756D23315F4143535F414352313238315F31535F4475616C5F5265616465725F504943435F30237B64656562653661642D396530312D343765322D613362322D6136366161326330333663397D';
const SMARTCARD_END_POINT = READER_END_POINT + '/smartcard';
const SMARTCARD_APDUS_END_POINT = READER_END_POINT + '/smartcard/sendApdus';
let __readerSessionId = Math.random() + '';

const publicDebito = ACCESS_RIGHTS.KeyID_0x01;
const keyDebito = ACCESS_RIGHTS.KeyID_0x02;
const keyCredito = ACCESS_RIGHTS.KeyID_0x03;
const keyOperation = ACCESS_RIGHTS.KeyID_0x04;

const sendApdus$ = (requestApdus) => {
    const readerCommand = { sessionId: __readerSessionId, closeSession: false, requests: requestApdus };
    return from(httpRequest(SMARTCARD_APDUS_END_POINT, { method: 'POST', headers: { 'Content-Type': 'application/json' } }, readerCommand)).pipe(
        tap(({ body }) => console.log('SmartCard response', body)),
        map(({ body }) => JSON.parse(body)),
        map(responses => responses.map(({ apdu: requestApdu, response: responseApdu, isValid }) => ({ requestApdu, responseApdu, isValid }))),
        tap(responses => responses.find(r => { if (!r.isValid) throw new CustomError(`Invalid reader response: ${JSON.stringify(responses)}`); })),
    );
};
const sendApdu$ = (requestApdu) => {
    return sendApdus$([requestApdu]).pipe(
        map(responses => responses[0])
    );
};

const detectCard$ = () => from(httpRequest(SMARTCARD_END_POINT, { method: 'GET', headers: { 'Content-Type': 'application/json' } })).pipe(
    map(({ body }) => JSON.parse(body)),
    tap(({ statusCode }) => console.log({ statusCode })),
    filter(({ statusCode }) => [1, 2].includes(statusCode)),
    pluck('atr'),
    tap(atr => console.log('detectedCard with ATR = ', atr)),
    mergeMap(atr => sendApdu$(DesfireTools.generateGetUudiNoAuthApdu()).pipe(
        map((response) => ({ atr: atr.raw, fakeUuid: response.responseApdu.slice(0, -4) })),
    ))
);


const selectPicc$ = (runtime) => sendApdu$(DesfireTools.gerenteSelectPiccApdu()).pipe(
    map(() => ({ ...runtime, selectedApp: 'PICC' })),
);

const selectApp$ = (runtime) => sendApdu$(DesfireTools.generateSelectApplicationApdu('010000')).pipe(
    map(() => ({ ...runtime, selectedApp: '000001' })),
);


const authenticate$ = (key) => (runtime) => {
    const keyVersion = "00";
    //const keyDefault = "3ED6B7C6823D442D7783F8B3A0B1C9C659E7D8BDDF7FCD6A" + keyVersion;
    const keyDefault = "b20281f368d82ea6fac5d5a9daa553ef" + keyVersion;

    const { apdu: authIApdu, processVars: authIProcessVars } = DesfireTools.generateAuthenticateEV2FirstApdu(APP_TARGETS.PRIMARY_APP, key);

    return sendApdu$(authIApdu).pipe(
        map(({ responseApdu }) => ({ ...runtime, processVars: { ...authIProcessVars, AuthenticateEV2FirstResponse: responseApdu } })),
        mergeMap((runtime) => {
            const { apdu: authIIApdu, processVars: authIIProcessVars } = DesfireTools.generateAuthenticateEV2FirstPart2Apdu(keyDefault.slice(0, 32), runtime.processVars.AuthenticateEV2FirstResponse);
            return sendApdu$(authIIApdu).pipe(
                map(({ responseApdu }) => ({
                    ...runtime, processVars: {
                        ...runtime.processVars,
                        ...authIIProcessVars,
                        AuthenticateEV2FirstPart2Response: responseApdu,
                    }
                })),
                map(runtime => ({ ...runtime, processVars: { ...runtime.processVars, ...DesfireTools.processAuthenticateEV2FirstPart2Response(runtime.processVars.AuthenticateEV2FirstPart2Response, runtime.processVars).processVars } })),
            );
        })
    );
};

const writeDataOnStdDataFile$ = (runtime) => {
    const fileNo = 1;
    const offset = 0;
    const data = `TimeStamp:${Date.now()}, ascci:${Array(97).fill().map((_, i) => String.fromCharCode((i + 32) < 127 ? (i + 32) : (i + 64 - 126))).join('')}`;

    const { apdu } = DesfireTools.generateWriteDataApdu(fileNo, APP_TARGETS.PRIMARY_APP, offset, data, COMM_MODES.MAC, runtime.processVars);
    return sendApdu$(apdu).pipe(
        map(({ responseApdu }) => ({ ...runtime, processVars: { ...runtime.processVars, ...DesfireTools.processWriteDataResponse(responseApdu, runtime.processVars).processVars } })),
    );
};

const writeDataOnStdBackupFile$ = (runtime) => {
    const fileNo = 2;
    const offset = 0;
    const data = `TimeStamp:${Date.now()}, ascci:${Array(31).fill().map((_, i) => String.fromCharCode((i + 32) < 127 ? (i + 32) : (i + 64 - 126))).join('')}`;

    const { apdu } = DesfireTools.generateWriteDataApdu(fileNo, APP_TARGETS.PRIMARY_APP, offset, data, COMM_MODES.FULL, runtime.processVars);
    return sendApdu$(apdu).pipe(
        map(({ responseApdu }) => ({ ...runtime, processVars: { ...runtime.processVars, ...DesfireTools.processWriteDataResponse(responseApdu, runtime.processVars).processVars } })),
    );
};

const writeDataOnCyclicRecorFile$ = (runtime) => {
    const fileNo = 5;
    const offset = 0;
    const data = `TimeStamp:${Date.now()}, ascci:${Array(31).fill().map((_, i) => String.fromCharCode(i + 49)).join('')}`;

    const { apdu } = DesfireTools.generateWriteRecordApdu(fileNo, APP_TARGETS.PRIMARY_APP, offset, data, COMM_MODES.FULL, runtime.processVars);
    return sendApdu$(apdu).pipe(
        map(({ responseApdu }) => ({ ...runtime, processVars: { ...runtime.processVars, ...DesfireTools.processWriteRecordResponse(responseApdu, runtime.processVars).processVars } })),
    );
};

const debitValue$ = (runtime) => {
    const fileNo = 4;
    const value = 1000;

    const { apdu } = DesfireTools.generateDebitApdu(fileNo, APP_TARGETS.PRIMARY_APP, value, COMM_MODES.FULL, runtime.processVars);
    return sendApdu$(apdu).pipe(
        map(({ responseApdu }) => ({ ...runtime, processVars: { ...runtime.processVars, ...DesfireTools.processDebitResponse(responseApdu, runtime.processVars).processVars } })),
    );
};

const commitTransaction$ = (runtime) => {
    const { apdu } = DesfireTools.generateCommitTransactionApdu(true, runtime.processVars);
    return sendApdu$(apdu).pipe(
        map(({ responseApdu }) => ({ ...runtime, processVars: { ...runtime.processVars, ...DesfireTools.processCommitTransactionResponse(responseApdu, runtime.processVars).processVars } })),
    );
};

const readDataOnStdDataFile$ = (runtime) => {
    const fileNo = 1;
    const offset = 0;
    const lengthToRead = 0;

    const { apdu } = DesfireTools.generateReadDataApdu(fileNo, APP_TARGETS.PRIMARY_APP, offset, lengthToRead, COMM_MODES.MAC, runtime.processVars);
    return sendApdu$(apdu).pipe(
        map(({ responseApdu }) => {
            const { processVars, responseData, areMoreFramesAvailable } = DesfireTools.processReadDataResponse(responseApdu, COMM_MODES.MAC, runtime.processVars);
            console.log('readDataOnStdDataFile$', { fileNo, offset, lengthToRead, responseData, areMoreFramesAvailable, decoded: Buffer.from(responseData, 'hex').toString('utf-8') });
            return { ...runtime, processVars: { ...runtime.processVars, ...processVars } };
        }),
    );
};

const readDataOnCyclicRecorFile$ = (runtime) => {
    const fileNo = 5;
    const offset = 0;
    const lengthToRead = 0;

    const { apdu } = DesfireTools.generateReadRecordApdu(fileNo, APP_TARGETS.PRIMARY_APP, offset, lengthToRead, COMM_MODES.FULL, runtime.processVars);
    return sendApdu$(apdu).pipe(
        map(({ responseApdu }) => {
            const { processVars, responseData, areMoreFramesAvailable } = DesfireTools.processReadRecordResponse(responseApdu, COMM_MODES.FULL, runtime.processVars);
            console.log('readDataOnCyclicRecorFile$', { fileNo, offset, lengthToRead, responseData, areMoreFramesAvailable, decoded: Buffer.from(responseData, 'hex').toString('utf-8') });
            return { ...runtime, processVars: { ...runtime.processVars, ...processVars } };
        }),
    );
};


const readValue$ = (runtime) => {
    const fileNo = 4;

    const { apdu } = DesfireTools.generateReadValueApdu(fileNo, APP_TARGETS.PRIMARY_APP, COMM_MODES.FULL, runtime.processVars);
    return sendApdu$(apdu).pipe(
        map(({ responseApdu }) => {
            const { processVars, responseData, areMoreFramesAvailable, value } = DesfireTools.processReadValueResponse(responseApdu, COMM_MODES.FULL, runtime.processVars);
            console.log('readValue$', { fileNo, responseData, areMoreFramesAvailable, value });
            return { ...runtime, processVars: { ...runtime.processVars, ...processVars } };
        }),
    );
};

timer(0, 1000).pipe(
    mergeMap(detectCard$),
    first(),
    mergeMap(selectPicc$),
    mergeMap(selectApp$),
    mergeMap(authenticate$(keyOperation)),
    mergeMap(writeDataOnStdDataFile$),
    mergeMap(writeDataOnStdBackupFile$),
    mergeMap(authenticate$(keyDebito)),
    mergeMap(writeDataOnCyclicRecorFile$),
    mergeMap(debitValue$),
    mergeMap(commitTransaction$),
    mergeMap(readDataOnStdDataFile$),
    mergeMap(readDataOnCyclicRecorFile$),
    mergeMap(readValue$),
).subscribe(
    runtime => {
        console.log("runtime", runtime);
    },
    err => {
        console.error(err);
    },
    () => {
        console.log('COMPLETED!');
    },
);