'use strict';

const { generate, of, from } = require("rxjs");
const { expand, tap, map, takeUntil, takeWhile, pluck, mergeMap } = require("rxjs/operators");
// NEEDS ENV ==> NODE_TLS_REJECT_UNAUTHORIZED=0

const httpRequest = require("./HttpRequest");

const PCSC_DAEMON_END_POINT = 'https://pcsc-daemon:1215/pcsc-daemon';
const READER_END_POINT = PCSC_DAEMON_END_POINT + '/readers/5C5C3F5C535744235363446576696365456E756D23315F4143535F414352313235325F31535F434C5F5265616465725F504943435F30237B64656562653661642D396530312D343765322D613362322D6136366161326330333663397D';
const SMARTCARD_APDUS_END_POINT = READER_END_POINT + '/smartcard/sendApdus';

const paymentMedium = {
    _id: 'xyz',
    mediumId: 'AA16AE4C',
    emissionSteps: {
        step: 0,
    }
};

let __readerSessionId = Math.random() + '';


// httpRequest(READER_END_POINT, { method: 'GET' }).then((result, error) => {
//     console.log({ result: JSON.parse(result.body), error });
// });

const serverLogicByStep = {
    0: (paymentMedium, currentStep, responseApdus) => {
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

        return { nextStep: 1, apdus: ['FFCA000000', 'FFCA000000'] };
    },
    1: (paymentMedium, step, responseApdus) => {
        console.log('=====', { step, responseApdus });
        return { nextStep: null, apdus: ['FFCA000000'] };
    },
    // ...new Array(100).fill((paymentMedium, step, responseApdus) => {
    //     console.log('=====', { step, responseApdus });
    //     return { nextStep: step === 99 ? null : step + 1, apdus: new Array(step).fill('FFCA000000') };
    // })
};

const processServerRequest$ = (currentStep, apdus) => {
    const stepServerFn = serverLogicByStep[currentStep];
    const readerCommand = { sessionId: __readerSessionId, closeSession: false, requests: apdus }
    return from(httpRequest(SMARTCARD_APDUS_END_POINT, { method: 'POST', headers: { 'Content-Type': 'application/json' } }, readerCommand)).pipe(
        map(({ body }) => JSON.parse(body)),
        map((results) => stepServerFn(paymentMedium, currentStep, results)),
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



