'use strict';

const { error: { CustomError }, log: { ConsoleLogger } } = require("@nebulae/backend-node-tools");
const crypto = require('crypto');
const { aesCmac } = require('node-aes-cmac');
const { randomBytes } = require('crypto');
const CRYPTO_ALGORITHM = 'aes-128-cbc';

const EV_MODES = {
    D40: 0,
    EV1: 1,
    EV2: 2,
};

const KEY_TYPES = {
    TDEA2: 0,
    TDEA3: 1,
    AES: 2
};

const APP_TARGETS = {
    PRIMARY_APP: 0,
    SECONDARY_APP: 1
};

const ACCESS_RIGHTS = {
    KeyID_0x00: 0,
    KeyID_0x01: 1,
    KeyID_0x02: 2,
    KeyID_0x03: 3,
    KeyID_0x04: 4,
    KeyID_0x05: 5,
    KeyID_0x06: 6,
    KeyID_0x07: 7,
    KeyID_0x08: 8,
    KeyID_0x09: 9,
    KeyID_0x0A: 10,
    KeyID_0x0B: 11,
    KeyID_0x0C: 12,
    KeyID_0x0D: 13,
    FREE: 14,
    NO_ACCESS: 15
};

const DESFIRE_STATUS_NAME_VS_CODE = {
    OPERATION_OK: '00',
    NO_CHANGES: '0C',
    OUT_OF_EEPROM_ERROR: '0E',
    ILLEGAL_COMMAND_CODE: '1C',
    INTEGRITY_ERROR: '1E',
    NO_SUCH_KEY: '40',
    LENGTH_ERROR: '7E',
    PERMISSION_DENIED: '9D',
    PARAMETER_ERROR: '9E',
    APPLICATION_NOT_FOUND: 'A0',
    APPL_INTEGRITY_ERROR: 'A1',
    AUTHENTICATION_ERROR: 'AE',
    ADDITIONAL_FRAME: 'AF',
    BOUNDARY_ERROR: 'BE',
    PICC_INTEGRITY_ERROR: 'C1',
    PICC_DISABLED_ERROR: 'CD',
    COUNT_ERROR: 'CE',
    DUPLICATE_ERROR: 'DE',
    EEPROM_ERROR: 'EE',
    FILE_NOT_FOUND: 'F0',
    FILE_INTEGRITY_ERROR: 'F1',
};

const DESFIRE_STATUS_CODE_VS_NAME = Object.entries(DESFIRE_STATUS_NAME_VS_CODE)
    .reduce((acc, [key, value]) => { acc[value] = key; return acc; }, {});

class DesfireTools {

    static bytesToHex(bytes = []) {
        return bytes.map(b => ('0' + b.toString(16).toUpperCase()).slice(-2)).join('');
    }

    static hexToBytes(hex) {
        return [...Buffer.from(hex, 'hex')];
    }

    static calcCmac(key, data) {
        const bufferKey = Buffer.from(key);
        const bufferMessage = Buffer.from(data);
        const options = { returnAsBuffer: true };
        const cmac = aesCmac(bufferKey, bufferMessage, options)
            .filter((byte, i) => i % 2 !== 0);
        return [...cmac];
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

    static validateDesfireStatusCode(desfireResponseStatusCode, sourceMethod = 'validateDesfireStatusCode') {
        const validStatuses = [
            DESFIRE_STATUS_NAME_VS_CODE.OPERATION_OK,
            DESFIRE_STATUS_NAME_VS_CODE.NO_CHANGES,
            DESFIRE_STATUS_NAME_VS_CODE.ADDITIONAL_FRAME
        ];
        if (!validStatuses.includes(desfireResponseStatusCode.toUpperCase())) {
            throw new CustomError(`DesfireTools.${sourceMethod}: Desfire card responded with error status: ${DESFIRE_STATUS_CODE_VS_NAME[desfireResponseStatusCode.toUpperCase()]}`);
        }
    }

    static gerenteSelectPiccApdu() {
        const aid = Array(3).fill(0x00);
        return this.generateSelectApplicationApdu(aid);
    }

    static generateSelectApplicationApdu(aid1, aid2) {
        aid1 = this.hexToBytes(aid1);
        aid2 = aid2 ? this.hexToBytes(aid2) : aid2;
        if (!aid1 || aid1.length !== 3) {
            throw new CustomError(`DesfireTools.generateSelectApplicationApdu: invalid aid1; ${{ aid1, aid2 }}`);
        }
        if (aid2 && aid2.length !== 3) {
            throw new CustomError(`DesfireTools.generateSelectApplicationApdu: invalid aid2 length; ${{ aid1, aid2 }}`);
        }
        const aid = aid1.concat(aid2 || []);
        const cmd = 0x5A;
        return this.bytesToHex([cmd, ...aid]);
    }

    static generateGetUudiNoAuthApdu() {
        return 'FFCA000000';
    }

    static generateAuthenticateEV2FirstApdu(secondAppIndicator, keyNumber, pcdCap2 = "") {
        pcdCap2 = this.hexToBytes(pcdCap2);

        const cmd = 0x71;
        const keyNo = keyNumber | secondAppIndicator << 7;
        return {
            apdu: this.bytesToHex([cmd, keyNo, pcdCap2.length, ...pcdCap2]),
            processVars: { lastKey: keyNumber, pcdCap2: this.bytesToHex(pcdCap2) }
        };
    }

    static generateAuthenticateEV2FirstPart2Apdu(key, authenticateEV2FirstResponse) {
        this.validateDesfireStatusCode(authenticateEV2FirstResponse.slice(0, 2),'generateAuthenticateEV2FirstPart2Apdu');
        key = this.hexToBytes(key);
        authenticateEV2FirstResponse = this.hexToBytes(authenticateEV2FirstResponse);

        const iv = Array(key.length).fill(0);
        const rndBc = authenticateEV2FirstResponse.slice(1);
        const rndB = this.decrypt(rndBc, key, iv);
        const rndBr = [...rndB, rndB[0]].slice(1);
        const rndA = [...randomBytes(rndB.length)];
        const rndD = [...rndA, ...rndBr];
        const rndDc = this.encrypt(rndD, key, iv);

        const cmd = 0xAF;
        const apdu = this.bytesToHex([cmd, ...rndDc]);
        return {
            apdu, processVars: {
                key: this.bytesToHex(key),
                iv: this.bytesToHex(iv),
                rndBc: this.bytesToHex(rndBc),
                rndB: this.bytesToHex(rndB),
                rndBr: this.bytesToHex(rndBr),
                rndA: this.bytesToHex(rndA),
                rndD: this.bytesToHex(rndD),
                rndDc: this.bytesToHex(rndDc)
            }
        };
    }

    static processAuthenticateEV2FirstPart2Response(responseApdu, processVars) {
        this.validateDesfireStatusCode(responseApdu.slice(0, 2),'processAuthenticateEV2FirstPart2Response');
        responseApdu = this.hexToBytes(responseApdu);

        let { key, iv, rndB, rndA } = processVars;
        key = this.hexToBytes(key);
        iv = this.hexToBytes(iv);
        rndB = this.hexToBytes(rndB);
        rndA = this.hexToBytes(rndA);

        const lastResp = this.decrypt(responseApdu.slice(1), key, iv);
        const ti = lastResp.slice(0, 4);
        const pdCap2 = lastResp.slice(lastResp.length - 6);
        const evMode = EV_MODES.EV2;
        //const xor = rndA.slice(2, 8);
        const trailing = [
            ...rndA.slice(0, 2),
            //...rndB.slice(0, 6).map((x, i) => xor[i] ^ x),
            ...rndB.slice(0, 6).map((x, i) => rndA[i + 2] ^ x),
            ...rndB.slice(6),
            ...rndA.slice(8),
        ];
        const sv1 = [0xA5, 0x5A, 0x00, 0x01, 0x00, 0x80, ...trailing];
        const sv2 = [0x5A, 0xA5, 0x00, 0x01, 0x00, 0x80, ...trailing];
        const ksesAuthEnc = this.calcCmac(key, sv1);
        const ksesAuthMac = this.calcCmac(key, sv2);
        const cmdCtr = 0;

        return {
            processVars: {
                ti: this.bytesToHex(ti),
                pdCap2: this.bytesToHex(pdCap2),
                evMode,
                sv1: this.bytesToHex(sv1),
                sv2: this.bytesToHex(sv2),
                ksesAuthEnc: this.bytesToHex(ksesAuthEnc),
                ksesAuthMac: this.bytesToHex(ksesAuthMac),
                cmdCtr,
            }
        };
    }

}

module.exports = { DesfireTools, EV_MODES, KEY_TYPES, APP_TARGETS, ACCESS_RIGHTS };