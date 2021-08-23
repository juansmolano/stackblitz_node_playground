'use strict';

const crypto = require('crypto');
const { aesCmac } = require('node-aes-cmac');
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

    static calcCmac(key, data) {
        const bufferKey = Buffer.from(key);
        const bufferMessage = Buffer.from(data);
        const options = { returnAsBuffer: true };
        const cmac = aesCmac(bufferKey, bufferMessage, options)
            .filter((byte, i) => i % 2 !== 0);
        return [...cmac];
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

    static encryptRequestData(readCounter, writeCounter, key, ti, data) {
        const rCountB1 = (readCounter >> 8) & 0xFF;
        const rCountB2 = readCounter & 0xFF;
        const wCountB1 = (writeCounter >> 8) & 0xFF;
        const wCountB2 = writeCounter & 0xFF;
        const ivEnc = [
            ...ti,
            rCountB2, rCountB1, wCountB2, wCountB1,
            rCountB2, rCountB1, wCountB2, wCountB1,
            rCountB2, rCountB1, wCountB2, wCountB1,
        ];
        const fillLen = 16 - (data.length % 16);
        data = fillLen === 16 ? data : [...data, 0x80, ...new Array(fillLen - 1).fill(0x00)];
        return this.encrypt(data, key, ivEnc);
    }

    static calcKeyBNr(blockNumber, useKeyB = false) {
        const sectorNumber = parseInt(blockNumber / 4);
        return 0x4000 + (sectorNumber * 2) + useKeyB;
    }


}

module.exports = MifareTools;