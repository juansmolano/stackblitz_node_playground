'use strict';

const { PaymentMediumDesfireInterpreter } = require("./smartcard");
const PaymentMediumType = require("./entities/PaymentMediumType_Desfire");
const CardData = require("./entities/CardData");



const interpreter = new PaymentMediumDesfireInterpreter(PaymentMediumType.mappings.pop());

// FOLD_UP and SPREAD CARD_DATA
// const folded = interpreter.foldUpCardDataArrays(CardData);
// console.log({folded});

// const spread = interpreter.spreadCardDataArrays(folded);
// console.log({spread});


// CARD_DATA TO BINARY

console.log('===== ORIGINAL CARD_DATA =====\n', JSON.stringify(CardData,null,2),'\n===== ORIGINAL END CARD_DATA =====\n');

const binary  = interpreter.cardDataMapToBinary(CardData);
console.log('===== BINARY =====\n', JSON.stringify(binary,null,2),'\n===== END BINARY =====\n');

const binaryToCardData = interpreter.binaryToCardDataMap(binary);
console.log('===== INTERPRETED CARD_DATA =====\n', JSON.stringify(binaryToCardData,null,2),'\n===== END INTERPRETED CARD_DATA =====\n');



