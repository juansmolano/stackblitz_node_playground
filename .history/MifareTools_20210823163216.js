'use strict';

const crypto = require('crypto');
const { aesCmac } = require('node-aes-cmac');
const { randomBytes } = require('crypto');
const CRYPTO_ALGORITHM = 'aes-128-cbc';


class MifareTools {

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

    static decrypt(inputBytes, key, iv) {
        let decipher = crypto.createDecipheriv(
            CRYPTO_ALGORITHM,
            Buffer.from(key),
            Buffer.from(iv)
        );
        decipher.setAutoPadding(0);
        let decrypted = decipher.update(Buffer.from(inputBytes));
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return [...decrypted];
    }

    static encryptRequestData(readCounter, writeCounter, key, ti, data) {
        const [rCountB1, rCountB2] = this.decomposeNumberInTwoBytes(readCounter);
        const [wCountB1, wCountB2] = this.decomposeNumberInTwoBytes(writeCounter);
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

    static generateFirstAuthPhaseIApdu(bNr, useKeyB = false) {
        const keyBNr = this.calcKeyBNr(bNr, useKeyB);
        const [keyB1, keyB2] = this.decomposeNumberInTwoBytes(keyBNr);
        return { apdu: [0x70, keyB2, keyB1, 0x00], processVars: { bNr } };
    }

    static generateFirstAuthPhaseIIApdu(rndBc, key) {
        const iv = new Array(16).fill(0);
        const rndB = this.decrypt(rndBc, key, iv);
        const rndBr = [...rndB.slice(1, 16), rndB[0]];
        const rndA = [...randomBytes(16)];
        const rndD = [...rndA, ...rndBr];
        const rndDc = this.encrypt(rndD, key, iv);
        const apdu = [0x72, ...rndDc];
        return { apdu, processVars: { rndBc, key, iv, rndB, rndBr, rndA, rndD, rndDc } };
    }

    static extractParametersFromFirstAuthResult(firstAuthResultEnc, processVars) {
        const { key, iv, rndB, rndA } = processVars;
        const firstAuthResultPlain = this.decrypt(firstAuthResultEnc, key, iv);
        const isEV0 = (firstAuthResultPlain.slice(-1) & 0x01) === 0x00;
        const { keyEnc, keyMac } = isEV0
            ? this.extractKeyEV0SessionVars(rndA, rndB, key)
            : this.extractKeyEV1SessionVars(rndA, rndB, key);
        const ti = firstAuthResultPlain.slice(0, 4);
        const writeCounter = 0;
        const readCounter = 0;
        return { keyEnc, keyMac, ti, readCounter, writeCounter, isEV0 };
    }

    static extractKeyEV0SessionVars(rndA, rndB, key) {
        const A = this.extractBytes(rndA, 4, 0);
        const B = this.extractBytes(rndB, 4, 0);
        const C = this.extractBytes(rndA, 11, 7);
        const D = this.extractBytes(rndB, 11, 7);
        const E = new Array(D.length).fill().map((_, i) => D[i] ^ C[i]);

        const keySessionBaseENC = [...A, ...B, ...E, 0x11];
        const iv = new Array(16).fill(0);
        const keyEnc = this.encrypt(keySessionBaseENC, key, iv);

        const H = this.extractBytes(rndA, 15, 11);
        const F = this.extractBytes(rndA, 8, 4);
        const I = this.extractBytes(rndB, 15, 11);
        const G = this.extractBytes(rndB, 8, 4);
        const J = new Array(H.length).fill().map((_, i) => H[i] ^ I[i]);
        const keySessionBaseMAC = [...F, ...G, ...J, 0x22];
        const keyMac = this.encrypt(keySessionBaseMAC, key, iv);

        return { keyEnc, keyMac };
    }

    static extractKeyEV1SessionVars(rndA, rndB, key) {
        const A = this.extractBytes(rndA, 15, 14);
        const B = this.extractBytes(rndA, 13, 8);
        const C = this.extractBytes(rndB, 15, 10);
        const D = new Array(B.length).fill().map((_, i) => B[i] ^ C[i]);
        const E = this.extractBytes(rndB, 9, 0);
        const F = this.extractBytes(rndA, 7, 0);

        const keySessionBaseENC = [...F, ...E, ...D, ...A, ...[0x80, 0x00, 0x01, 0x00, 0x5A, 0xA5]];

        //TODO: 
        /* Go CODE
        keySessionBaseENC := make([]byte, 0)

            A := funcExtract(rndA, 15, 14)
            B := funcExtract(rndA, 13, 8)
            C := funcExtract(rndB, 15, 10)	
            D := make([]byte, len(B))
            E := funcExtract(rndB, 9, 0)
            F := funcExtract(rndA, 7, 0)

            
            for i := range D {
                D[i] = B[i] ^ C[i]
            }

            keySessionBaseENC = append(keySessionBaseENC, F...)
            keySessionBaseENC = append(keySessionBaseENC, E...)
            keySessionBaseENC = append(keySessionBaseENC, D...)
            keySessionBaseENC = append(keySessionBaseENC, A...)
            keySessionBaseENC = append(keySessionBaseENC, []byte{0x80, 0x00, 0x01, 0x00, 0x5A, 0xA5}...)

            blockEnc, err := aes.NewCipher(key)
            if err != nil {
                return nil, nil, err
            }

            keyEnc, err := cmac.Sum(keySessionBaseENC, blockEnc, 16)
            if err != nil {
                return nil, nil, err
            }

            keySessionBaseMAC := make([]byte, 0)

            keySessionBaseMAC = append(keySessionBaseMAC, F...)
            keySessionBaseMAC = append(keySessionBaseMAC, E...)
            keySessionBaseMAC = append(keySessionBaseMAC, D...)
            keySessionBaseMAC = append(keySessionBaseMAC, A...)
            keySessionBaseMAC = append(keySessionBaseMAC, []byte{0x80, 0x00, 0x01, 0x00, 0xA5, 0x5A}...)

            blockMac, err := aes.NewCipher(key)
            if err != nil {
                return nil, nil, err
            }

            keyMac, err := cmac.Sum(keySessionBaseMAC, blockMac, 16)
            if err != nil {
                return nil, nil, err
            }

            return keyEnc, keyMac, nil
        */
        //return { keyEnc, keyMac };
        return {};
    }

    static generateReadCmdApdu({ ext, readCounter, ti, keyMac, bNr }) {
        //Read encrypted, MAC on response, MAC on command
        const cmd = 0x31;
        const [bNB1, bNB2] = this.decomposeNumberInTwoBytes(bNr);
        const [rCountB1, rCountB2] = this.decomposeNumberInTwoBytes(readCounter);
        const readCmdCmac = this.calcCmac(keyMac, [cmd, rCountB2, rCountB1, ...ti, bNB2, bNB1, ext]);
        return { apdu: [cmd, bNB2, bNB1, ext, ...readCmdCmac], processVars: { ext } };
    }

    static extractDataFromReadResponse(readResponse, { bNr, readCounter, writeCounter, ti, ext, key, iv, keyMac, keyEnc }) {
        console.log('-------', readResponse);
        const encriptedData = readResponse.slice(0, -8);
        const respCmac = readResponse.slice(-8);
        const [bNB1, bNB2] = this.decomposeNumberInTwoBytes(bNr);
        const [rCountB1, rCountB2] = this.decomposeNumberInTwoBytes(readCounter + 1);
        const [wCountB1, wCountB2] = this.decomposeNumberInTwoBytes(writeCounter);
        const calCmac = this.calcCmac(keyMac, [0x90, rCountB2, rCountB1, ...ti, bNB2, bNB1, ext, ...encriptedData]);
        if (respCmac.toString() !== calCmac.toString()) {
            throw new Error(`Error procesando respuesta de lectura de bloque: cmac no coincide.  ${JSON.stringify({ readResponse, calCmac, respCmac })}`);
        }
        const ivDec = [
            rCountB2, rCountB1, wCountB2, wCountB1,
            rCountB2, rCountB1, wCountB2, wCountB1,
            rCountB2, rCountB1, wCountB2, wCountB1,
            ...ti
        ];
        const fillLen = 16 - (encriptedData.length % 16);
        const encriptedDataToDecrypt = fillLen === 16 ? encriptedData : [...encriptedData, 0x80, ...new Array(fillLen - 1).fill(0x00)];
        const data = this.decrypt(encriptedDataToDecrypt, keyEnc, ivDec);


        const blocks = new Array(ext).fill(0).reduce((blocks, _, index) => {
            blocks[index + bNr] = data.slice(index * 16, (index * 16) + 16);
            return blocks;
        }, {});


        return { blocks, processVars: { readCounter: readCounter + 1 } };
    }



    static bytesToHex(bytes = []) {
        return bytes.map(b => ('0' + b.toString(16)).slice(-2)).join('');
    }

    static hexToBytes(hex) {
        return [...Buffer.from(hex, 'hex')];
    }

    static decomposeNumberInTwoBytes(num) {
        return [(num >> 8) & 0xFF, num & 0xFF];
    }


}

module.exports = MifareTools;