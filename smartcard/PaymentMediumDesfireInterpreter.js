'use strict';

const { ConsoleLogger } = require('@nebulae/backend-node-tools/lib/log');
const { Buffer } = require('buffer');

const documentTypeOrder = [
    '',
    'PASSPORT_NUMBER', //1
    'IDENTITY_CARD', //2
    'CITIZENSHIP_CARD', //3
    'FOREIGNER_IDENTITY', //4
    'NIP', //5
    'NIUP' //6
];
class PaymentMediumDesfireInterpreter {

    constructor(mappingVersion) {
        this.mappingVersion = mappingVersion;
        this.blockSize = 16;
    }

    paymentMediumToCardDataMap(paymentMedium, endUser, profile) {
        const {
            _id,
            expirationTimestamp,
            metadata: { mappingVersion, blocked, transactionSeq },
            pockets: {
                REGULAR: { balance, balanceBk, timestamp: balanceTimestamp }
            }
        } = paymentMedium;
        const { firstName, lastName, prm, document, documentType } = endUser;
        const [paymentMediumTypeCode, paymentMediumSeq] = _id.split('-');
        const cardData = {
            NT: parseInt(paymentMediumSeq), // Numero (seq) tarjeta
            NT_BACKUP: parseInt(paymentMediumSeq), // Numero (seq) tarjeta
            VL: mappingVersion, // VersionLayout (Mapping)
            VL_BACKUP: mappingVersion, // VersionLayout (Mapping)
            B: blocked ? 1 : 0, // Bloqueo temporal (TimeStamp sec)
            FV: parseInt(expirationTimestamp / 1000), // Fecha de validez del medio de pago
            CT$: transactionSeq, // Consecutivo Transaccion Medio de Pago
            ST$: balance, // Saldo Tarjeta
            STB$: balanceBk, // Saldo Tarjeta Backup
            NU: `${firstName} ${lastName}`, // Nombre Usuario
            TD: documentTypeOrder.indexOf(documentType), // Tipo de documento
            DI: document, // ID de identidad del usuario
            P: profile.paymentMediumCode, // Perfil
            PMR: prm ? 1 : 0, // PMR
            AC: 0 // Numero de acompañantes
        };
        // ZERO default values
        const historicalFields = Object.keys(this.mappingVersion.mapping.APP_AFC.data).filter(k => k.startsWith('HIST'));
        for (let i in historicalFields) {
            cardData[historicalFields[i]] = [];
        }
        return cardData;
    }

    /**
     * @returns {{appId:{fileId: hexStr | [hexStr] }}}
     */
    cardDataMapToBinary(cardDataMap, areCardDataArraysFoldedUp = false) {
        if (!areCardDataArraysFoldedUp) cardDataMap = this.foldUpCardDataArrays({ ...cardDataMap });
        const binaryDesfire = {};
        const apps = Object.entries(this.mappingVersion.mapping).filter(([appName, app]) => appName.startsWith('APP_'));
        for (let [appName, app] of apps) {
            const appId = app.appId;
            binaryDesfire[appId] = {};
            let binaryApp = binaryDesfire[appId];
            const files = Object.entries(app.filesMetada);
            for (let [fileId, { fileType, fileComm, fileSize, recordLines }] of files) {
                switch (fileType) {
                    case 'StdFile':
                    case 'BackupFile':
                        binaryApp[fileId] = Array(fileSize * 2).fill(0).join('');
                        break;
                    case 'ValueFile':
                        binaryApp[fileId] = 0;
                        break;
                    case 'CyclicRecod':
                    case 'CyclicRecord':
                        binaryApp[fileId] = Array(recordLines).fill(Array(fileSize * 2).fill(0).join(''));
                        break;
                }
                const dataSpecifications =
                    Object.entries(this.mappingVersion.mapping[appName].data)
                        .filter(([fieldName, dataSpec]) => parseInt(dataSpec.fileID) === parseInt(fileId));
                for (let [fieldName, { fileID, offset, type }] of dataSpecifications) {
                    const isArray = Array.isArray(binaryApp[fileID]);
                    const isCompositeArray = isArray && fieldName.includes('_');
                    if (isCompositeArray) {
                        const [compositeKey, compositeSubKey] = fieldName.split('_');
                        for (let recordIndex = 0; recordIndex < binaryApp[fileID].length; recordIndex++) {
                            if ((cardDataMap[compositeKey][recordIndex] || {})[compositeSubKey] === undefined) continue;
                            binaryApp[fileID][recordIndex] = this.writeFieldOnBinaryHexString(cardDataMap[compositeKey][recordIndex][compositeSubKey], binaryApp[fileID][recordIndex], { offset, type });
                        }
                    } else {
                        if (cardDataMap[fieldName] === undefined) continue;
                        binaryApp[fileID] = isArray
                            ? this.writeFieldOnBinaryHexStringArray(cardDataMap[fieldName], binaryApp[fileID], { offset, type })
                            : this.writeFieldOnBinaryHexString(cardDataMap[fieldName], binaryApp[fileID], { offset, type });
                    }
                }
            }
        }
        return binaryDesfire;
    }

    /**
     * @returns {{fieldName:fieldValue}}
     */
    binaryToCardDataMap(binaryDesfire, spreadCardDataArrays = true) {
        const cardDataMap = {};
        const apps = Object.entries(this.mappingVersion.mapping).filter(([appName, app]) => appName.startsWith('APP_'));
        for (let [appName, app] of apps) {
            const appId = app.appId;
            let binaryApp = binaryDesfire[appId];
            const files = Object.entries(app.filesMetada);
            for (let [fileId, { fileType, fileComm, fileSize, recordLines }] of files) {
                const dataSpecifications =
                    Object.entries(this.mappingVersion.mapping[appName].data)
                        .filter(([fieldName, dataSpec]) => parseInt(dataSpec.fileID) === parseInt(fileId));
                for (let [fieldName, { fileID, offset, type }] of dataSpecifications) {
                    if (binaryApp[fileID] === undefined) continue;
                    const isArray = Array.isArray(binaryApp[fileID]);
                    const isCompositeArray = isArray && fieldName.includes('_');
                    if (isCompositeArray) {
                        const [compositeKey, compositeSubKey] = fieldName.split('_');
                        if (!cardDataMap[compositeKey]) cardDataMap[compositeKey] = Array(binaryApp[fileID].length).fill().map(() => ({}));
                        const compositeSubValues = this.readValueFromHexStringArray(binaryApp[fileID], { offset, type });
                        let i = 0;
                        for (let compositeSubValue of compositeSubValues) {
                            cardDataMap[compositeKey][i++][compositeSubKey] = compositeSubValue;
                        }
                    } else {
                        cardDataMap[fieldName] = isArray
                            ? this.readValueFromHexStringArray(binaryApp[fileID], { offset, type })
                            : this.readValueFromHexString(binaryApp[fileID], { offset, type });
                    }
                }
            }
        }
        return spreadCardDataArrays ? this.spreadCardDataArrays({ ...cardDataMap }) : cardDataMap;
    }

    writeFieldOnBinaryHexStringArray(dataToSetArray, binaryHexStringArray, { offset, type }) {
        return binaryHexStringArray.map((hexStr, i) => this.writeFieldOnBinaryHexString(dataToSetArray[i], hexStr, { offset, type }));
    }

    writeFieldOnBinaryHexString(dataToSet, binaryHexString, { offset, type }) {
        let buffer;
        //console.log('DesfireInterpreter.setBinaryField:', { type, value, offset });
        switch (type) {
            case 'STRING16':
            case 'STRING32':
                const strLen = parseInt(type.replace('STRING', ''));
                buffer = Buffer.alloc(strLen);
                buffer.write(dataToSet, 0, strLen, 'ascii');
                return this.writeBufferToBinaryHexData(buffer, binaryHexString, offset);
            case 'BYTE':
                buffer = Buffer.alloc(1);
                buffer.writeUInt8(dataToSet, 0);
                return this.writeBufferToBinaryHexData(buffer, binaryHexString, offset);
            case 'INT8':
            case 'INT16':
            case 'INT24':
            case 'INT32':
            case 'INT40':
            case 'INT48':
            case 'INT64':
                const intLen = parseInt(type.replace('INT', '')) / 8;
                buffer = Buffer.alloc(intLen);
                buffer.writeIntLE(dataToSet, 0, intLen);
                return this.writeBufferToBinaryHexData(buffer, binaryHexString, offset);
            case 'UINT8':
            case 'UINT16':
            case 'UINT24':
            case 'UINT32':
            case 'UINT40':
            case 'UINT48':
            case 'UINT64':
                const uIntLen = parseInt(type.replace('UINT', '')) / 8;
                buffer = Buffer.alloc(uIntLen);
                buffer.writeUIntLE(dataToSet, 0, uIntLen);
                return this.writeBufferToBinaryHexData(buffer, binaryHexString, offset);
            case 'VALUE':
                return this.formatAsValueBlock(dataToSet);
            default:
                ConsoleLogger.w('DesfireInterpreter.setBinaryField: Invalid type:', {
                    dataToSet, binaryHexString, offset, type
                });
        }
    }

    writeBufferToBinaryHexData(dataBuffer, binaryHexData, offset) {
        const binaryHexDataBuff = Buffer.from(binaryHexData, 'hex');
        dataBuffer.copy(
            binaryHexDataBuff,
            offset
        );
        return binaryHexDataBuff.toString('hex');
    }

    readValueFromHexStringArray(binaryHexStringArray, { offset, type }) {
        return binaryHexStringArray.map(hexStr => this.readValueFromHexString(hexStr, { offset, type }));
    }

    readValueFromHexString(binaryHexString, { offset, type }) {
        switch (type) {
            case 'STRING16':
            case 'STRING32':
                const strLen = parseInt(type.replace('STRING', ''));
                return Buffer.from(binaryHexString, 'hex').toString('utf-8', offset, offset + strLen);
            case 'BYTE':
                return Buffer.from(binaryHexString, 'hex').readUInt8(offset);
            case 'INT8':
            case 'INT16':
            case 'INT24':
            case 'INT32':
            case 'INT40':
            case 'INT48':
            case 'INT64':
                const intLen = parseInt(type.replace('INT', '')) / 8;
                return Buffer.from(binaryHexString, 'hex').readIntLE(offset, intLen);
            case 'UINT8':
            case 'UINT16':
            case 'UINT24':
            case 'UINT32':
            case 'UINT40':
            case 'UINT48':
            case 'UINT64':
                const uIntLen = parseInt(type.replace('UINT', '')) / 8;
                return Buffer.from(binaryHexString, 'hex').readUIntLE(offset, uIntLen);
            case 'VALUE':
                return Buffer.from(binaryHexString.substring(0, 8), 'hex').readIntLE(0, 4);
            default:
                ConsoleLogger.w('DesfireInterpreter.setBinaryField: Invalid type:', {
                    offset,
                    type
                });
        }
    }

    formatAsValueBlock(value) {
        const buffer = Buffer.alloc(4);
        buffer.writeIntLE(value, 0, 4);
        // [0, 1, 2, 3].forEach(i =>
        //     buffer.write((~buffer[i] & 0xff).toString(16), 4 + i, 'hex')
        // );
        // buffer.writeIntLE(value, 8, 4);
        // buffer.write('FF00FF00', 12, 'hex');
        return buffer.toString('hex');
    }

    spreadCardDataArrays(cardData) {
        const entries = Object.entries(cardData);
        for (let [key, values] of entries) {
            if (Array.isArray(values)) {
                delete cardData[key];
                const isCompositeArray = typeof values.find(u => u) === 'object';
                if (isCompositeArray) {
                    for (let valueIndex in values) {
                        for (let [compositeSubKey, compositeSubValue] of Object.entries(values[valueIndex])) {
                            cardData[`${key}_${compositeSubKey}_${parseInt(valueIndex) + 1}`] = values[valueIndex][compositeSubKey];
                        }
                    }
                } else {
                    for (let valueIndex in values) {
                        cardData[`${key}_${parseInt(valueIndex) + 1}`] = values[valueIndex];
                    }
                }
            }
        }
        return cardData;
    }

    foldUpCardDataArrays(cardData) {
        const firstEntries = Object.entries(cardData).filter(([key, value]) => key.endsWith('_1'));
        for (let [firstKey, firstValue] of firstEntries) {
            const fieldName = firstKey.replace('_1', '');
            const fieldSize = Object.keys(cardData).filter(k => k.startsWith(fieldName)).length;
            const isCompositeArray = fieldName.includes('_');

            if (isCompositeArray) {
                const [compositeKey, compositeSubKey] = fieldName.split('_');
                if (!cardData[compositeKey]) cardData[compositeKey] = Array(fieldSize).fill().map(() => ({}));// cardDate.HISTU = [ {}, {}, {}]
                for (let i = 0; i < fieldSize; i++) {
                    cardData[compositeKey][i][compositeSubKey] = cardData[`${fieldName}_${i + 1}`];
                }
            } else {
                const keyValueArray = Array(fieldSize).fill(0).map((_, i) => ({ spreadKey: `${fieldName}_${i + 1}`, value: cardData[`${fieldName}_${i + 1}`] })).filter(d => d.value !== undefined);
                cardData[fieldName] = keyValueArray.map(({ value }) => value);
            }
            for (let i = 0; i < fieldSize; i++) {
                delete cardData[`${fieldName}_${i + 1}`];
            }
        }
        return cardData;
    }
}

/**
 * @type {PaymentMediumDesfireInterpreter}
 */
module.exports = PaymentMediumDesfireInterpreter;
