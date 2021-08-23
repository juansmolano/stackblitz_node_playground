'use strict';

const MifareTools = require('./MifareTools.js');

////////////////////////////////////////////////////////////////
//////////////// SAMPLE INPUT DATA  ////////////////////////////
////////////////////////////////////////////////////////////////

//SESSION KEY VARS
const key = [0x8d, 0xdf, 0xf1, 0x51, 0xa6, 0xef, 0x6a, 0x7f, 0xe6, 0xd0, 0x33, 0x3a, 0x42, 0xbe, 0x21, 0xee];
const rndA = [0xcf, 0xc1, 0x0c, 0x4f, 0x63, 0x05, 0x3e, 0x15, 0x08, 0x25, 0xc8, 0xc7, 0xe8, 0x05, 0xf3, 0x02];
const rndB = [0xb0, 0xe4, 0x0c, 0x79, 0x7c, 0x50, 0xe1, 0xe4, 0x8e, 0x88, 0xbe, 0xd0, 0x4c, 0x9f, 0x95, 0x79];
const keyEncPreCalculated = [0xD1, 0x3C, 0xDB, 0x09, 0xCC, 0xD2, 0xE4, 0x2C, 0xE0, 0x5E, 0xD7, 0xB8, 0xB6, 0xEB, 0xC6, 0x87];
const keyMacPreCalculated = [0x72, 0xA8, 0x2A, 0xEF, 0x1A, 0x1E, 0xA4, 0xB8, 0x69, 0x5C, 0x26, 0x08, 0x22, 0xA2, 0xA8, 0xE5];
//CMAC VARS
const ti = [0xAA, 0xBB, 0xCC, 0x24]; //Transaction ID from CARD
const data = [0x32, 0x14, 0xA5, 0xF4, 0xDE, 0x18, 0xAE, 0xC8, 0xDA, 0x6F, 0x50, 0x33, 0x32, 0xB7, 0x10, 0xD7]; //DATA to write
const cmacPreCalculated = [0xBC, 0x43, 0x05, 0xFE, 0x72, 0x9F, 0xBD, 0x03];

////////////////////////////////////////////////////////////////
//////////////// SESSION KEYS //////////////////////////////////
////////////////////////////////////////////////////////////////

const { keyEnc, keyMac } = MifareTools.calcSessionKeyEv0(rndA, rndB, key);
const equals = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);
console.log({
    keyEnc, keyEncPreCalculated,
    keyMac, keyMacPreCalculated,
    keyEncEquals: equals(keyEnc, keyEncPreCalculated), keyMacEquals: equals(keyMac, keyMacPreCalculated)
});

////////////////////////////////////////////////////////////////
//////////////// CMAC //////////////////////////////////////////
////////////////////////////////////////////////////////////////
// const readCount = 0;
// const writeCount = 0;
// const encryptedData = MifareTools.encryptRequestData(readCount, writeCount, keyEnc, ti, data);
// const payload = [0xA1, 0x00, 0x00, ...ti, 0x09, 0x00, ...encryptedData];
// const cmac = MifareTools.calcMac(keyMac, payload);
// console.log({
//     encryptedData, payload, cmac,
//     cmacEquals: equals(cmac, cmacPreCalculated)
// });

