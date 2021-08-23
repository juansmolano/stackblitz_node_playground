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

    }

    static extractBytes(data, i, j) {
        return data.slice(15 - i, 15 + 1 - j);
    }


    static encrypt(text, key, iv) {
        let cipher = crypto.createCipheriv(CRYPTO_ALGORITHM, Buffer.from(key), iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
    }

    static decrypt(text, key, iv) {
        let encryptedText = Buffer.from(text.encryptedData, 'hex');
        let decipher = crypto.createDecipheriv(CRYPTO_ALGORITHM, Buffer.from(key), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    }

}

module.exports = MifareTools;