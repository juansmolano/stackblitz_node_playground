'use strict';

const { generate, of, from } = require("rxjs");
const { expand, tap, map, takeUntil, takeWhile } = require("rxjs/operators");
// NEEDS ENV ==> NODE_TLS_REJECT_UNAUTHORIZED=0

const httpRequest = require("./HttpRequest");

const PCSC_DAEMON_END_POINT = 'https://pcsc-daemon:1215/pcsc-daemon';
const READER_END_POINT = PCSC_DAEMON_END_POINT + '/readers/5C5C3F5C535744235363446576696365456E756D23315F4143535F414352313235325F31535F434C5F5265616465725F504943435F30237B64656562653661642D396530312D343765322D613362322D6136366161326330333663397D';
const SMARTCARD_APDUS_END_POINT = READER_END_POINT + '/smartcard/sendApdus';

const paymentMedium = {
    mediumId: undefined,
    emissionSteps: {
        step: 0,
    }
}


// httpRequest(READER_END_POINT, { method: 'GET' }).then((result, error) => {
//     console.log({ result: JSON.parse(result.body), error });
// });

const serverLogicByStep = {
    'init': (paymentMedium, step, responseApdus, emissionSteps) => {
        return { nextStep: 0, apdus: ['FFCA000000'] };
    },
    0: (paymentMedium, step, responseApdus, emissionSteps) => {
        return { nextStep: 1, apdus: ['FFCA000000'] };
    },
    1: (paymentMedium, step, responseApdus, emissionSteps) => {
        return { nextStep: null, apdus: ['FFCA000000'] };
    },
};

const processServerRequest$ = (nextStep, apdus) => {
    const stepServerFn = serverLogicByStep[nextStep];
    const readerCommand = { sessionId: 'ABC123', closeSession: false, requests: apdus }
    return from(httpRequest(SMARTCARD_APDUS_END_POINT, { method: 'POST' }, readerCommand)).pipe(
        tap(x => console.log(x)),
        map(x => stepServerFn())
    );
};



// generate(steps[emissionSteps.step], step => step, step => steps[emissionSteps.step++]).pipe(
//     tap(fn => console.log(fn()))
// )
of({ nextStep: 'init', apdus: ['FFCA000000'] }).pipe(
    expand(({ nextStep, apdus }) => processServerRequest$(nextStep, apdus)),
    takeWhile(({ nextStep, apdus }) => nextStep === null)
).subscribe(
    evt => console.log(evt),
    err => console.error(err),
    () => console.log('Completed!!!!')
);



