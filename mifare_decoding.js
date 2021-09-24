'use strict';

const PaymentMediumMifareTools = require('./PaymentMediumMifareTools');

/** DATA ACCESS SIMULATOR **/
const paymentMediumType = require('./entities/PaymentMediumType.json');
const sampleBinaryCardData = require('./entities/BinaryCardData2');

const specificationVersion = paymentMediumType.specifications.sort((v1, v2) => v2.version - v1.version).find(v => v.active);
if (!specificationVersion) {
    throw new Error(`Non active specification found for ${paymentMediumType} payment medium type`);
}

const interpreter = new PaymentMediumMifareTools(specificationVersion);
const decodedCardData = interpreter.binaryToCardDataMap(sampleBinaryCardData);

console.log(sampleBinaryCardData);
console.log(decodedCardData);
