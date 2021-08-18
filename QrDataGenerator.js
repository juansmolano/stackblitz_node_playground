'use strict';

const _ = require('lodash');

////////////////////////////////////////////////////////////////
//////////////// SAMPLE DATA   /////////////////////////////////
////////////////////////////////////////////////////////////////

const __mapping = {
    "t": "AQPM",
    "v": {
        "exp": "$first.fa",
        "fid": "$second.sa.sb",
        "pid": "$third.ta.tb.tc"
    },
    "a": ["$second.sa.sb", 2, { a: "$second.sa.sc" }]
};

const __sources = {
    first: { fa: 'FA!' },
    second: {
        sa: { sb: "SB!!", sc: "SC==" },
    },
    third: {
        ta: { tb: { tc: 'TC!!!' } }
    },
};

////////////////////////////////////////////////////////////////
/////////////////// ALGORITH   /////////////////////////////////
////////////////////////////////////////////////////////////////

const transformObjectValues = function (obj, transformFn, sources) {    
    for (let key in obj) {
        if (obj[key] !== null && typeof (obj[key]) == "object") {
            transformObjectValues(obj[key], transformFn, sources);
        } else {
            transformFn.apply(this, [key, obj,sources]);
        }
    }
};


const valueTransformer = (key, obj, sources) => {
    if ((typeof obj[key] === 'string') && obj[key].startsWith("$")) {
        const [sourceName, ...path] = obj[key].replace('$', '').split('.');
        obj[key] = path.reduce(function (root, prop) { return root[prop]; }, sources[sourceName]);
    }
};


const generateQrData = (mapping, sources) => {
    const data = _.cloneDeep(mapping);
    transformObjectValues(data, valueTransformer, sources);
    return data;
};


////////////////////////////////////////////////////////////////
////////////////////// USAGE   /////////////////////////////////
////////////////////////////////////////////////////////////////


const qrData = generateQrData(__mapping, __sources);
console.log(JSON.stringify(qrData, null, 2));

