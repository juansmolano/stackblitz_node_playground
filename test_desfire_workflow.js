'use strict';

/* IMPORTED LIBS */
const _ = require('lodash');
const { of, forkJoin, from, iif, throwError, merge, EMPTY, defer, timer } = require("rxjs");
const { mergeMap, catchError, map, toArray, tap, filter, first, expand, takeWhile, pluck, mergeMapTo, mapTo } = require('rxjs/operators');
const { error: { CustomError }, log: { ConsoleLogger } } = require("@nebulae/backend-node-tools");

const { DesfireTools: { DesfireTools, EV_MODES, KEY_TYPES, APP_TARGETS, ACCESS_RIGHTS }, MifareTools } = require('./smartcard');
const HSM = require("./hsm/HSM").singleton();
const SecurityMediumProductionKeys = require('./entities/SecurityMediumProductionKeys');

const httpRequest = require("./HttpRequest"); // NEEDS ENV ==> NODE_TLS_REJECT_UNAUTHORIZED=0


/* CLIENT (FRONTEND) SIMULATION VARS */
const PCSC_DAEMON_END_POINT = 'https://pcsc-daemon:1215/pcsc-daemon';
const READER_END_POINT = PCSC_DAEMON_END_POINT + '/readers/5C5C3F5C535744235363446576696365456E756D23315F4143535F414352313238315F31535F4475616C5F5265616465725F504943435F30237B64656562653661642D396530312D343765322D613362322D6136366161326330333663397D';
const SMARTCARD_END_POINT = READER_END_POINT + '/smartcard';
const SMARTCARD_APDUS_END_POINT = READER_END_POINT + '/smartcard/sendApdus';
let __readerSessionId = Math.random() + '';

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

const selectApp$ = (runtime) => sendApdu$(DesfireTools.generateSelectApplicationApdu('000001')).pipe(
    map(() => ({ ...runtime, selectedApp: '000001' })),
);


const authenticate$ = (runtime) => {

    const keyVersion = "00";
    const keyDefault = "3ED6B7C6823D442D7783F8B3A0B1C9C659E7D8BDDF7FCD6A" + keyVersion;
    const publicDebito = ACCESS_RIGHTS.KeyID_0x01;
    const keyDebito = ACCESS_RIGHTS.KeyID_0x02;
    const keyCredito = ACCESS_RIGHTS.KeyID_0x03;
    const keyOperation = ACCESS_RIGHTS.KeyID_0x04;

    const { apdu: authIApdu, processVars: authIProcessVars } = DesfireTools.generateAuthenticateEV2FirstApdu(APP_TARGETS.PRIMARY_APP, keyOperation);

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
                map(runtime => ({ ...runtime, processVars: { ...runtime.processVars, ...DesfireTools.processAuthenticateEV2FirstPart2Response(runtime.processVars.AuthenticateEV2FirstPart2Response, runtime.processVars) } })),
            );
        })
    );
};

timer(0, 1000).pipe(
    mergeMap(detectCard$),
    first(),
    mergeMap(selectPicc$),
    mergeMap(selectApp$),
    mergeMap(authenticate$),


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