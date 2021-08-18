'use strict';

const PaymentMediumMifareTools = require('./PaymentMediumMifareTools');
const buildMifarePaymentMedium = require('./PaymentMediumBuilder');

/** DATA ACCESS SIMULATOR **/
const endUser = require('./entities/EndUser.json');
const profile = require('./entities/Profile.json');
const paymentMediumType = require('./entities/PaymentMediumType.json');
const paymentMediumAcquisition = require('./entities/PaymentMediumAcquisition.json');
const sampleCardData = require('./entities/CardData');
const sampleBinaryCardData = require('./entities/BinaryCardData');

const specificationVersion = paymentMediumType.specifications.sort((v1, v2) => v2.version - v1.version).find(v => v.active);
if (!specificationVersion) {
    throw new Error(`Non active specification found for ${paymentMediumType} payment medium type`);
}
const interpreter = new PaymentMediumMifareTools(specificationVersion);


const paymentMedium = buildMifarePaymentMedium('ABCD1234',123,paymentMediumType,endUser,paymentMediumAcquisition,{_id:'123123',name:'jhon doe'});
//const dataCardMap = interpreter.paymentMediumToCardDataMap(paymentMedium,endUser,profile);
const dataCardMap = sampleCardData;
const encodedBinaryData = interpreter.cardDataMapToBinary(dataCardMap);
encodedBinaryData.mv=1;

const decodedCardData = interpreter.binaryToCardDataMap(encodedBinaryData);

console.log('encodedBinaryData',encodedBinaryData);
console.log('decodedCardData',decodedCardData);
console.log('==DIFF==', Object.keys(dataCardMap)
    .map(field => ({ field, orig: dataCardMap[field], deco: decodedCardData[field], type: specificationVersion.specification.APP_AFC.data[field] ? specificationVersion.specification.APP_AFC.data[field].type:'UNK='+field }))
    .filter(({ orig, deco }) => orig !== deco)
);
