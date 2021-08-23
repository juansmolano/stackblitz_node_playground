'use strict';

const crypto = require('crypto');

class MifareTools {

    static calcSessionKeyEv0(rndA, rndB, key) {
        const A = MifareTools.extractBytes(rndA, 4, 0);
        const B = MifareTools.extractBytes(rndB, 4, 0);
        const C = MifareTools.extractBytes(rndA, 11, 7);
        const D = MifareTools.extractBytes(rndB, 11, 7);
        const E = new Array(D.length).fill().map((_, i) => D[i] ^ C[i]);

        const keySessionBaseENC = [...A, ...B, ...E, 0x11];

        const iv = new Array(16).fill(0);

    }

    static extractBytes(data, i, j) {
        return data.slice(15 - i, 15 + 1 - j);
    }

}

module.exports = MifareTools;