'use strict';

const crypto = require('crypto');
const CRYPTO_ALGORITHM = 'aes-128-cbc';


class MifareTools {

    static calcSessionKeyEv0(rndA, rndB, key) {
        const A = MifareTools.extractBytes(rndA, 4, 0);
        const B = MifareTools.extractBytes(rndB, 4, 0);
        const C = MifareTools.extractBytes(rndA, 11, 7);
        const D = MifareTools.extractBytes(rndB, 11, 7);
        const E = new Array(D.length).fill().map((_, i) => D[i] ^ C[i]);

        const keySessionBaseENC = [...A, ...B, ...E, 0x11];
        const iv = new Array(16).fill(0);
        const keyEnc = MifareTools.encrypt(keySessionBaseENC, key, iv);

        const H = MifareTools.extractBytes(rndA, 15, 11);
        const F = MifareTools.extractBytes(rndA, 8, 4);
        const I = MifareTools.extractBytes(rndB, 15, 11);
        const G = MifareTools.extractBytes(rndB, 8, 4);
        const J = new Array(H.length).fill().map((_, i) => H[i] ^ I[i]);
        const keySessionBaseMAC = [...F, ...G, ...J, 0x22];
        const keyMac = MifareTools.encrypt(keySessionBaseMAC, key, iv);

        return { keyEnc, keyMac };
    }

    static extractBytes(data, i, j) {
        return data.slice(15 - i, 15 + 1 - j);
    }

    static encrypt(inputBytes, key, iv) {
        let cipher = crypto.createCipheriv(
            CRYPTO_ALGORITHM,
            Buffer.from(key),
            Buffer.from(iv)
        );
        cipher.setAutoPadding(0);
        let encrypted = cipher.update(Buffer.from(inputBytes));
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return [...encrypted];
    }
}

module.exports = MifareTools;