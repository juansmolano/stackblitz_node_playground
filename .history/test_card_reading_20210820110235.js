'use strict';

const { generate } = require("rxjs");
const { expand, tap } = require("rxjs/operators");
// NEEDS ENV ==> NODE_TLS_REJECT_UNAUTHORIZED=0

const httpRequest = require("./HttpRequest");

const PCSC_DAEMON_END_POINT = 'https://pcsc-daemon:1215/pcsc-daemon';
const READER_END_POINT = PCSC_DAEMON_END_POINT + '/readers/5C5C3F5C535744235363446576696365456E756D23315F4143535F414352313235325F31535F434C5F5265616465725F504943435F30237B64656562653661642D396530312D343765322D613362322D6136366161326330333663397D';

const emissionSteps = {};

// httpRequest(READER_END_POINT, { method: 'GET' }).then((result, error) => {
//     console.log({ result: JSON.parse(result.body), error });
// });

const steps = {
    'init': (uuid, endUserId, step, responseApdus, emissionSteps) => {

        return { nextStep: 0 };
    },
    0: (uuid, endUserId, step, responseApdus, emissionSteps) => {
        return { nextStep: 1 };
    },
    1: (uuid, endUserId, step, responseApdus, emissionSteps) => {
        return { nextStep: null };
    },
};

generate(steps.init, step => step, step => steps[step.nextStep]).pipe(
    tap(console.log)
).subscribe(
    evt => console.log(evt),
    err => console.error(err),
    () => console.log('Completed!!!!')
);



