'use strict';

const _ = require('lodash');

const { PaymentMediumDesfireInterpreter } = require("./smartcard");
const PaymentMediumType = require("./entities/PaymentMediumType_Desfire");
const CardData = require("./entities/CardData");



const interpreter = new PaymentMediumDesfireInterpreter(PaymentMediumType.mappings.pop());


/////CARD_DATA TO BINARY
console.log('===== ORIGINAL CARD_DATA =====\n', JSON.stringify({...CardData},null,2),'\n===== ORIGINAL CARD_DATA END =====\n');

/////FOLD_UP and SPREAD CARD_DATA
const folded = interpreter.foldUpCardDataArrays({...CardData});
console.log('===== FOLDED CARD_DATA =====\n', JSON.stringify(folded,null,2),'\n===== FOLDED CARD_DATA END =====\n');

const spread = interpreter.spreadCardDataArrays(folded);
console.log('===== SPREAD CARD_DATA =====\n', JSON.stringify(spread,null,2),'\n===== SPREAD CARD_DATA END =====\n');

if(!_.isEqual({...CardData},spread)){
  console.error('ERROR: SPREAD CARD_DATA IS NOT EQUAL TO ORIGINAL CARD_DATA');
  process.exit(1);
}


const binary  = interpreter.cardDataMapToBinary({...CardData});
console.log('===== BINARY =====\n', JSON.stringify(binary,null,2),'\n===== END BINARY =====\n');

const binaryToCardData = interpreter.binaryToCardDataMap(binary,false);
console.log('===== INTERPRETED CARD_DATA =====\n', JSON.stringify(binaryToCardData,null,2),'\n===== END INTERPRETED CARD_DATA =====\n');

// const binaryToCardData = interpreter.binaryToCardDataMap({
//     "1": {
//       "2": "04000001ed000000",
//       "3": "00200000003dbaf76a",
//       "5": "00000000",
//       "6": [
//         "0000000000000000000000000000000000000000000000000000000000000000",
//         "0000000000000000000000000000000000000000000000000000000000000000"
//       ],
//       "7": [
//         "005992610a0000005a010000d80a00001a000000000000000000000000000000",
//         "015992610a0000005a010000d80a00001b000000000000000000000000000000",
//         "515992610900000017010000030b00001c000000000000000000000000000000",
//         "ee5992610900000017010000240b00001d000000000000000000000000000000",
//         "f95d92610700000043010000fd0a00001e000000000000000000000000000000",
//         "5a6192610b0000007a010000a00a00001f000000000000000000000000000000"
//       ],
//       "mv": "1"
//     }
//   });
// console.log('===== INTERPRETED CARD_DATA =====\n', JSON.stringify(binaryToCardData,null,2),'\n===== END INTERPRETED CARD_DATA =====\n');



