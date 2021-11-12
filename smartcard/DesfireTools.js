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

const COMM_MODES = {
    PLAIN: 0,
    MAC: 1,
    FULL: 3
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
        this.validateDesfireStatusCode(authenticateEV2FirstResponse.slice(0, 2), 'generateAuthenticateEV2FirstPart2Apdu');
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
        this.validateDesfireStatusCode(responseApdu.slice(0, 2), 'processAuthenticateEV2FirstPart2Response');
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
        const ksesAuthEnc = this.calcCmac(key, sv1, false);
        const ksesAuthMac = this.calcCmac(key, sv2, false);
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

    static generateWriteApdu(cmd, fileNo, targetSecondaryApp, offset, dataToWrite, commMode, processVars) {
        const { evMode, ksesAuthEnc: ksesAuthEncHexStr, ksesAuthMac: ksesAuthMacHexStr, ti: tiHexStr, cmdCtr } = processVars;
        const ti = this.hexToBytes(tiHexStr);
        const ksesAuthEnc = this.hexToBytes(ksesAuthEncHexStr);
        const ksesAuthMac = this.hexToBytes(ksesAuthMacHexStr);

        const hasOffset = offset !== null;
        if (hasOffset && offset > 0xFFFFFF) {
            throw new CustomError(`DesfireTools.generateWriteApdu: invalid offset; ${{ offset }}`);
        }
        if (dataToWrite.length > 0xFFFFFF) {
            throw new CustomError(`DesfireTools.generateWriteApdu: invalid dataRecord length; ${{ dataRecord: dataToWrite }}`);
        }

        const apduCommandHeaderBuff = Buffer.alloc(hasOffset ? 7 : 1);
        apduCommandHeaderBuff[0] = fileNo | (targetSecondaryApp << 7); // CMD header: fileNo
        if (hasOffset) {
            apduCommandHeaderBuff.writeUIntLE(offset, 1, 3); // CMD header: offset
            apduCommandHeaderBuff.writeUIntLE(dataToWrite.length, 4, 3); // CMD header: offset
        }

        let apdu;
        while (dataToWrite.length > 0) {
            const dataRecordPart = dataToWrite.slice(0, 0xFF);
            dataToWrite = dataToWrite.slice(0xFF);
            let iv, cryptograma, cmacT;
            switch (evMode) {
                case EV_MODES.EV2:
                    switch (commMode) {
                        case COMM_MODES.FULL:
                            iv = this.calcCommandIVOnFullModeEV2(ksesAuthEnc, ti, cmdCtr);
                            cryptograma = this.calcCryptogramEV2(ksesAuthEnc, dataRecordPart, iv);
                            cmacT = this.calcMacOnCommandEV2(ksesAuthMac, ti, cmd, cmdCtr, [...apduCommandHeaderBuff], cryptograma);
                            apdu = [cmd, ...apduCommandHeaderBuff, ...cryptograma, ...cmacT];
                            break;
                        case COMM_MODES.MAC:
                            cmacT = this.calcMacOnCommandEV2(ksesAuthMac, ti, cmd, cmdCtr, [...apduCommandHeaderBuff], dataRecordPart);
                            apdu = [cmd, ...apduCommandHeaderBuff, ...dataRecordPart, ...cmacT];
                            break;
                        case COMM_MODES.PLAIN:
                            apdu = [cmd, ...apduCommandHeaderBuff, ...dataRecordPart];
                            break;
                        default:
                            throw new CustomError(`DesfireTools.generateWriteApdu: COMM_MODE not supported yet: ${{ commMode }}`);
                    }
                    break;
                default:
                    throw new CustomError(`DesfireTools.generateWriteApdu: EV_MODE not supported yet: ${{ evMode }}`);
            }
        }
        return { apdu: this.bytesToHex(apdu), processVars: {} };
    }

    static processWriteResponse(cmd, responseApdu, processVars) {
        this.validateDesfireStatusCode(responseApdu.slice(0, 2), 'processWriteResponse');
        return { processVars: { cmdCtr: processVars.cmdCtr + 1 } };
    }

    static generateReadApdu(cmd, fileNo, targetSecondaryApp, offset, lengthToRead, commMode, processVars) {
        const { evMode, ksesAuthEnc: ksesAuthEncHexStr, ksesAuthMac: ksesAuthMacHexStr, ti: tiHexStr, cmdCtr } = processVars;
        const ti = this.hexToBytes(tiHexStr);
        const ksesAuthEnc = this.hexToBytes(ksesAuthEncHexStr);
        const ksesAuthMac = this.hexToBytes(ksesAuthMacHexStr);

        const hasOffset = offset !== null;
        const hasLengthToRead = lengthToRead !== null;
        if (hasOffset && offset > 0xFFFFFF) {
            throw new CustomError(`DesfireTools.generateReadApdu: invalid offset; ${{ offset }}`);
        }
        if (hasLengthToRead && lengthToRead.length > 0xFFFFFF) {
            throw new CustomError(`DesfireTools.generateReadApdu: invalid dataRecord length; ${{ dataRecord: lengthToRead }}`);
        }

        const apduCommandHeaderSize = (1) + (hasOffset ? 3 : 0) + (hasLengthToRead ? 3 : 0);
        const apduCommandHeaderBuff = Buffer.alloc(apduCommandHeaderSize);
        apduCommandHeaderBuff[0] = fileNo | (targetSecondaryApp << 7); // CMD header: fileNo
        if (hasOffset) apduCommandHeaderBuff.writeUIntLE(offset, 1, 3); // CMD header: offset            
        if (hasLengthToRead) apduCommandHeaderBuff.writeUIntLE(lengthToRead, hasOffset ? 4 : 1, 3); // CMD header: lengthToRead            

        let apdu, iv, cryptograma, cmacT;
        switch (evMode) {
            case EV_MODES.EV2:
                switch (commMode) {
                    case COMM_MODES.FULL:
                    case COMM_MODES.MAC:
                        cmacT = this.calcMacOnCommandEV2(ksesAuthMac, ti, cmd, cmdCtr, [...apduCommandHeaderBuff]);
                        apdu = [cmd, ...apduCommandHeaderBuff, ...cmacT];
                        break;
                    case COMM_MODES.PLAIN:
                        apdu = [cmd, ...apduCommandHeaderBuff];
                        break;
                    default:
                        throw new CustomError(`DesfireTools.generateReadApdu: COMM_MODE not supported yet: ${{ commMode }}`);
                }
                break;
            default:
                throw new CustomError(`DesfireTools.generateReadApdu: EV_MODE not supported yet: ${{ evMode }}`);
        }
        return { apdu: this.bytesToHex(apdu), processVars: {} };
    }

    static processReadResponse(cmd, responseApduHexStr, commMode, processVars) {
        this.validateDesfireStatusCode(responseApduHexStr.slice(0, 2), 'processReadResponse');
        const areMoreFramesAvailable = DESFIRE_STATUS_NAME_VS_CODE.ADDITIONAL_FRAME === responseApduHexStr.slice(0, 2).toUpperCase();

        const { evMode, ksesAuthEnc: ksesAuthEncHexStr, ti: tiHexStr, cmdCtr } = processVars;
        const responseApdu = this.hexToBytes(responseApduHexStr);
        const ti = this.hexToBytes(tiHexStr);
        const ksesAuthEnc = this.hexToBytes(ksesAuthEncHexStr);

        let responseData;
        let iv, cryptograma, cmacT;
        switch (evMode) {
            case EV_MODES.EV2:
                switch (commMode) {
                    case COMM_MODES.FULL:
                        iv = this.calcResponseIVOnFullModeEV2(ksesAuthEnc, ti, cmdCtr + 1);
                        responseData = this.getDataOnFullModeResponseEV2(ksesAuthEnc, iv, responseApdu.slice(1, responseApdu.length - 8));
                        break;
                    case COMM_MODES.MAC:
                        responseData = responseApdu.slice(1, responseApdu.length - 8);
                        break;
                    case COMM_MODES.PLAIN:
                        responseData = responseApdu.slice(1);
                        break;
                    default:
                        throw new CustomError(`DesfireTools.processReadResponse: COMM_MODE not supported yet: ${{ commMode }}`);
                }
                break;
            default:
                throw new CustomError(`DesfireTools.processReadResponse: EV_MODE not supported yet: ${{ evMode }}`);
        }
        return {
            responseData: this.bytesToHex(responseData),
            processVars: { cmdCtr: areMoreFramesAvailable ? processVars.cmdCtr : processVars.cmdCtr + 1 },
            areMoreFramesAvailable
        };
    }

    static generateWriteRecordApdu(fileNo, targetSecondaryApp, offset, dataRecord, commMode, processVars) {
        dataRecord = Buffer.from(dataRecord, 'utf-8');
        return this.generateWriteApdu(0x8B, fileNo, targetSecondaryApp, offset, dataRecord, commMode, processVars);
    }

    static processWriteRecordResponse(responseApdu, processVars) {
        return this.processWriteResponse(0x8B, responseApdu, processVars);
    }

    static generateWriteDataApdu(fileNo, targetSecondaryApp, offset, data, commMode, processVars) {
        data = Buffer.from(data, 'utf-8');
        return this.generateWriteApdu(0x8D, fileNo, targetSecondaryApp, offset, data, commMode, processVars);
    }

    static processWriteDataResponse(responseApdu, processVars) {
        return this.processWriteResponse(0x8D, responseApdu, processVars);
    }

    static generateDebitApdu(fileNo, targetSecondaryApp, value, commMode, processVars) {
        const valueBuff = Buffer.alloc(4);
        valueBuff.writeUInt32LE(value, 0);
        return this.generateWriteApdu(0xDC, fileNo, targetSecondaryApp, null, [...valueBuff], commMode, processVars);
    }

    static processDebitResponse(responseApdu, processVars) {
        return this.processWriteResponse(0xDC, responseApdu, processVars);
    }

    static generateReadDataApdu(fileNo, targetSecondaryApp, offset, lengthToRead, commMode, processVars) {
        return this.generateReadApdu(0xAD, fileNo, targetSecondaryApp, offset, lengthToRead, commMode, processVars);
    }

    static processReadDataResponse(responseApdu, commMode, processVars) {
        return this.processReadResponse(0xAD, responseApdu, commMode, processVars);
    }

    static generateReadRecordApdu(fileNo, targetSecondaryApp, offset, lengthToRead, commMode, processVars) {
        return this.generateReadApdu(0xAB, fileNo, targetSecondaryApp, offset, lengthToRead, commMode, processVars);
    }

    static processReadRecordResponse(responseApdu, commMode, processVars) {
        return this.processReadResponse(0xAB, responseApdu, commMode, processVars);
    }

    static generateReadValueApdu(fileNo, targetSecondaryApp, commMode, processVars) {
        return this.generateReadApdu(0x6C, fileNo, targetSecondaryApp, null, null, commMode, processVars);
    }

    static processReadValueResponse(responseApdu, commMode, processVars) {
        const { processVars: processVarsOutput, responseData, areMoreFramesAvailable } = this.processReadResponse(0x6C, responseApdu, commMode, processVars);
        return {
            processVars: processVarsOutput, areMoreFramesAvailable,
            responseData,
            value: Buffer.from(responseData,'hex').readUInt32LE(),
        };
    }

    static generateCommitTransactionApdu(returnTmcAndTmv, processVars) {
        const { evMode, ksesAuthMac: ksesAuthMacHexStr, ti: tiHexStr, cmdCtr } = processVars;
        const ti = this.hexToBytes(tiHexStr);
        const ksesAuthMac = this.hexToBytes(ksesAuthMacHexStr);

        const cmd = 0xC7;
        const cmdHeader = returnTmcAndTmv ? [0x01] : [];
        let cmacT, apdu;
        switch (evMode) {
            case EV_MODES.EV2:
                cmacT = this.calcMacOnCommandEV2(ksesAuthMac, ti, cmd, cmdCtr, cmdHeader);
                apdu = [cmd, ...cmdHeader, ...cmacT];
                break;
            default:
                throw new CustomError(`DesfireTools.generateCommitTransactionApdu: EV_MODE not supported yet: ${{ evMode }}`);
        }
        return { apdu: this.bytesToHex(apdu), processVars: {} };
    }

    static processCommitTransactionResponse(responseApdu, processVars) {
        this.validateDesfireStatusCode(responseApdu.slice(0, 2), 'processCommitTransactionResponse');
        return { processVars: { cmdCtr: processVars.cmdCtr + 1 } };
    }

    //#region TOOLS

    static bytesToHex(bytes = []) {
        return bytes.map(b => ('0' + b.toString(16).toUpperCase()).slice(-2)).join('');
    }

    static hexToBytes(hex) {
        return [...Buffer.from(hex, 'hex')];
    }

    static calcCmac(key, data, returnEvenArrayPositions = true) {
        const bufferKey = Buffer.from(key);
        const bufferMessage = Buffer.from(data);
        const options = { returnAsBuffer: true };
        const cmac = aesCmac(bufferKey, bufferMessage, options);
        return returnEvenArrayPositions ? [...cmac].filter((byte, i) => i % 2 !== 0) : [...cmac];
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

    static calcCommandIVOnFullModeEV2(ksesAuthEnc, ti, cmdCtr) {
        const ctrBuff = Buffer.alloc(2);
        ctrBuff.writeUIntLE(cmdCtr, 0, 2);
        const data = [0xA5, 0x5A, ...ti, ...ctrBuff, ...Array(ksesAuthEnc.length - (2 + ti.length + ctrBuff.length)).fill(0)];
        return this.encrypt(
            data,
            ksesAuthEnc,
            Array(ksesAuthEnc.length).fill(0)
        );
    }

    static calcCryptogramEV2(ksesAuthEnc, plaindata, iv) {
        const moduleResult = plaindata.length % ksesAuthEnc.length;
        const buildComplement = (offset) => Array(ksesAuthEnc.length - ((plaindata.length + offset) % ksesAuthEnc.length)).fill(0);

        plaindata = moduleResult === 0
            ? [...plaindata, 0x80, ...buildComplement(1)]
            : moduleResult === ksesAuthEnc.length - 1
                ? [...plaindata, 0x80, 0x00, ...buildComplement(2)]
                : [...plaindata, 0x80, ...buildComplement(1)];
        return this.encrypt(plaindata, ksesAuthEnc, iv);
    }

    static calcMacOnCommandEV2(ksesAuthMac, ti, cmd, cmdCtr, cmdHeader, data = []) {
        const ctrBuff = Buffer.alloc(2);
        ctrBuff.writeUIntLE(cmdCtr, 0, 2);
        return this.calcCmac(
            ksesAuthMac,
            [cmd, ...ctrBuff, ...ti, ...cmdHeader, ...data],
        );
    }

    static calcResponseIVOnFullModeEV2(ksesAuthEnc, ti, cmdCtr) {
        const ctrBuff = Buffer.alloc(2);
        ctrBuff.writeUIntLE(cmdCtr, 0, 2);
        const data = [0x5A, 0xA5, ...ti, ...ctrBuff, ...Array(ksesAuthEnc.length - (2 + ti.length + ctrBuff.length)).fill(0)];
        return this.encrypt(
            data,
            ksesAuthEnc,
            Array(ksesAuthEnc.length).fill(0)
        );
    }

    static getDataOnFullModeResponseEV2(ksesAuthEnc, iv, responseApdu) {
        const decrypted = this.decrypt(responseApdu, ksesAuthEnc, iv);

        //REMOVING PADDING:
        const last80 = decrypted.lastIndexOf(0x80);
        if (last80 === -1) return decrypted;
        const zerosAfter80 = decrypted.slice(last80 + 1);
        if (zerosAfter80.length === 0) return decrypted;
        return (zerosAfter80.every(n => n === 0))
            ? decrypted.slice(0, last80)
            : decrypted;
    }

    //#endregion

}

module.exports = { DesfireTools, EV_MODES, KEY_TYPES, APP_TARGETS, ACCESS_RIGHTS, COMM_MODES };