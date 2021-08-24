'use strict';

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
class PaymentMediumMifareTools {
    constructor(specificationVersion) {
        this.specificationVersion = specificationVersion;
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
            VL: mappingVersion, // VersionLayout (Mapping)
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
        const historicalFields = Object.keys(this.specificationVersion.specification.APP_AFC.data).filter(k => k.startsWith('HIST'));
        for (let i in historicalFields) {
            cardData[historicalFields[i]] = 0;
        }
        return cardData;
    }

    /**
     * @returns {{block:Buffer}}
     */
    cardDataMapToBinary(cardDataMap) {
        const binaryData =
            [
                this.specificationVersion.specification.APP_AFC.data,
                this.specificationVersion.specification.APP_PUB.data,
            ].reduce((acc, data) => {
                const binData = Object.entries(data).reduce(
                    (binaryData, [fieldName, fieldDetail]) => {
                        const { block, start, type } = fieldDetail;
                        if (cardDataMap[fieldName] || cardDataMap[fieldName] === 0) {
                            this.setFieldOnBinaryData(
                                cardDataMap[fieldName],
                                block,
                                start,
                                type,
                                binaryData
                            );
                        }
                        return binaryData;
                    }, {});
                return { ...acc, ...binData };
            }, {});

        return Object.entries(binaryData).reduce((acc, [key, value]) => {
            acc[key] =
                typeof value === 'object' && value.constructor.name === 'Buffer'
                    ? value.toString('hex')
                    : value;
            return acc;
        }, {});
    }

    /**
     * @returns {{block:hexString}}
     */
    binaryToCardDataMap(binaryData) {
        const binaryBufferCache = {};
        const getBufferFromBinaryDataBlock = (block, type) => {
            if (binaryBufferCache[block]) return binaryBufferCache[block];
            binaryBufferCache[block] =
                type === 'VALUE'
                    ? binaryData[block]
                    : Buffer.from(binaryData[block], 'hex');
            return binaryBufferCache[block];
        };

        return [
            this.specificationVersion.specification.APP_AFC.data,
            this.specificationVersion.specification.APP_PUB.data
        ].reduce((cardData, dataMap) => {
            const data = Object.entries(dataMap).reduce(
                (cardData, [fieldName, fieldDetail]) => {
                    const { block, start, type } = fieldDetail;
                    if (binaryData[block] || binaryData[block] === 0) {
                        cardData[fieldName] = this.getDataField(
                            start,
                            block,
                            type,
                            getBufferFromBinaryDataBlock
                        );
                    }
                    return cardData;
                },
                {}
            );
            return {...cardData,...data};
        }, {});
    }

    setFieldOnBinaryData(value, block, offset, type, binaryData) {
        let buffer;
        //console.log('MifareInterpreter.setBinaryField:', { type, value, offset });
        switch (type) {
            case 'STRING16':
            case 'STRING32':
                const strLen = parseInt(type.replace('STRING', ''));
                buffer = Buffer.alloc(strLen);
                buffer.write(value, 0, strLen, 'ascii');
                this.writeBufferToBinaryData(buffer, binaryData, block, offset);
                break;
            case 'BYTE':
                buffer = Buffer.alloc(1);
                buffer.writeUInt8(value, 0);
                this.writeBufferToBinaryData(buffer, binaryData, block, offset);
                break;
            case 'INT8':
            case 'INT16':
            case 'INT24':
            case 'INT32':
            case 'INT40':
            case 'INT48':
            case 'INT64':
                const intLen = parseInt(type.replace('INT', '')) / 8;
                buffer = Buffer.alloc(intLen);
                buffer.writeIntLE(value, 0, intLen);
                this.writeBufferToBinaryData(buffer, binaryData, block, offset);
                break;
            case 'UINT8':
            case 'UINT16':
            case 'UINT24':
            case 'UINT32':
            case 'UINT40':
            case 'UINT48':
            case 'UINT64':
                const uIntLen = parseInt(type.replace('UINT', '')) / 8;
                buffer = Buffer.alloc(uIntLen);
                buffer.writeUIntLE(value, 0, uIntLen);
                this.writeBufferToBinaryData(buffer, binaryData, block, offset);
                break;
            case 'VALUE':
                binaryData[block] = this.formatAsValueBlock(value);
                break;
            default:
                console.log('MifareInterpreter.setBinaryField: Invalid type:', {
                    value,
                    block,
                    offset,
                    type
                });
        }
    }

    getDataField(offset, block, type, getBufferFromBinaryDataBlock) {
        //console.log('MifareInterpreter.setBinaryField:', { offset, type, blockBinaryValue });
        switch (type) {
            case 'STRING16':
            case 'STRING32':
                const strLen = parseInt(type.replace('STRING', ''));
                return this.readFieldValueAsBuffer(
                    block,
                    offset,
                    strLen,
                    getBufferFromBinaryDataBlock
                )
                    .toString('ascii', 0, strLen)
                    .split('\x00')
                    .join('');
            case 'BYTE':
                return getBufferFromBinaryDataBlock(block, type).readUInt8(offset);
            case 'INT8':
            case 'INT16':
            case 'INT24':
            case 'INT32':
            case 'INT40':
            case 'INT48':
            case 'INT64':
                const intLen = parseInt(type.replace('INT', '')) / 8;
                return this.readFieldValueAsBuffer(
                    block,
                    offset,
                    intLen,
                    getBufferFromBinaryDataBlock
                ).readIntLE(0, intLen);
            case 'UINT8':
            case 'UINT16':
            case 'UINT24':
            case 'UINT32':
            case 'UINT40':
            case 'UINT48':
            case 'UINT64':
                const uIntLen = parseInt(type.replace('UINT', '')) / 8;
                return this.readFieldValueAsBuffer(
                    block,
                    offset,
                    uIntLen,
                    getBufferFromBinaryDataBlock
                ).readUIntLE(0, uIntLen);
            //return getBufferFromBinaryDataBlock(block, type).readUIntLE(offset, uIntLen);
            case 'VALUE':
                const blockData = getBufferFromBinaryDataBlock(block, type);
                if (typeof blockData === 'string') {
                    const isValueBlock = this.isValueBlock(blockData);
                    return isValueBlock
                        ? Buffer.from(blockData.substring(0, 8), 'hex').readIntLE(0, 4)
                        : parseInt(blockData);
                }
                return blockData;
            default:
                console.log('MifareInterpreter.setBinaryField: Invalid type:', {
                    offset,
                    type
                });
        }
    }

    writeBufferToBinaryData(buffer, binaryData, block, offset) {
        const getBinaryBuffer = block => {
            if (binaryData[block]) return binaryData[block];
            binaryData[block] = Buffer.alloc(this.blockSize);
            return binaryData[block];
        };
        const blocksCount = Math.ceil((offset + buffer.length) / this.blockSize);
        let writtenBytes = 0;
        for (let b = block; b < block + blocksCount; b++) {
            const os = b === block ? offset : 0;
            const availableBytes = this.blockSize - os;
            const neededBytes = buffer.length - writtenBytes;
            const bytesToWrite = Math.min(neededBytes, availableBytes);
            buffer.copy(
                getBinaryBuffer(b),
                os,
                writtenBytes,
                writtenBytes + bytesToWrite
            );
            writtenBytes += bytesToWrite;
        }
    }

    readFieldValueAsBuffer(block, offset, len, getBufferFromBinaryDataBlock) {
        const buffer = Buffer.alloc(len);
        const blocksCount = Math.ceil((offset + len) / this.blockSize);
        let readBytes = 0;
        for (let b = block; b < block + blocksCount; b++) {
            const os = b === block ? offset : 0;
            const availableBytes = this.blockSize - os;
            const neededBytes = buffer.length - readBytes;
            const bytesToRead = Math.min(neededBytes, availableBytes);
            getBufferFromBinaryDataBlock(b).copy(
                buffer,
                readBytes,
                os,
                os + bytesToRead
            );
            readBytes += bytesToRead;
        }
        return buffer;
    }

    isValueBlock(blockData) {
        const [v0, v1, v2, v3, i0, i1, i2, i3, vb0, vb1, vb2, vb3, c0, c1, c2, c3] = blockData
            .toUpperCase()
            .split('')
            .reduce(
                (acc, val, i, arr) => {
                    if (i % 2 !== 0) {
                        acc.push(arr[i - 1] + arr[i]);
                    } return acc;
                }, []);
        return blockData.length === 32
            && c0 === c2 && c1 === c3
            && c0 === (~parseInt(c1) & 0xFF).toString(16).toUpperCase()
            && [[v0, i0], [v1, i1], [v2, i2], [v3, i3]].every(([v, i]) => (~parseInt(v, 16) & 0xFF).toString(16).toUpperCase() === i.startsWith('0') ? i.substring(1) : i)
            && [[v0, vb0], [v1, vb1], [v2, vb2], [v3, vb3]].every(([v, vb]) => v === vb);
    }

    formatAsValueBlock(value) {
        const buffer = Buffer.alloc(16);
        buffer.writeIntLE(value, 0, 4);
        // [0, 1, 2, 3].forEach(i =>
        //     console.log(buffer[i].toString(16), (~buffer[i] & 0xff).toString(16))
        // );
        [0, 1, 2, 3].forEach(i =>
            buffer.write((~buffer[i] & 0xff).toString(16), 4 + i, 'hex')
        );
        buffer.writeIntLE(value, 8, 4);
        buffer.write('FF00FF00', 12, 'hex');
        return buffer.toString('hex');
    }
}

/**
 * @type {PaymentMediumMifareTools}
 */
module.exports = PaymentMediumMifareTools;
