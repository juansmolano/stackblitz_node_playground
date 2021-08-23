const rndA = [
    0xcf,
    0xc1,
    0x0c,
    0x4f,
    0x63,
    0x05,
    0x3e,
    0x15,
    0x08,
    0x25,
    0xc8,
    0xc7,
    0xe8,
    0x05,
    0xf3,
    0x02
];

const rndB = [
    0xb0,
    0xe4,
    0x0c,
    0x79,
    0x7c,
    0x50,
    0xe1,
    0xe4,
    0x8e,
    0x88,
    0xbe,
    0xd0,
    0x4c,
    0x9f,
    0x95,
    0x79
];

const key = [
    0x8d,
    0xdf,
    0xf1,
    0x51,
    0xa6,
    0xef,
    0x6a,
    0x7f,
    0xe6,
    0xd0,
    0x33,
    0x3a,
    0x42,
    0xbe,
    0x21,
    0xee
];


const MifareTools = require('./MifareTools.js');

const { keyEnc, keyMac } = MifareTools.calcSessionKeyEv0(rndA, rndB, key);
console.log({ keyEnc, keyMac });


// const crypto = require('crypto');
// const CRYPTO_ALGORITHM = 'aes-128-cbc';

// function extractBytes(data, i, j) {
//     return data.slice(15 - i, 15 + 1 - j);
// }

// function encrypt(inputBytes, key, iv) {
//     let cipher = crypto.createCipheriv(
//         CRYPTO_ALGORITHM,
//         Buffer.from(key),
//         Buffer.from(iv)
//     );
//     cipher.setAutoPadding(0);
//     let encrypted = cipher.update(Buffer.from(inputBytes));
//     encrypted = Buffer.concat([encrypted, cipher.final()]);
//     return [...encrypted];
// }

// function decrypt(inputBytes, key, iv) {
//     let encryptedText = Buffer.from(inputBytes.encryptedData, 'hex');
//     let decipher = crypto.createDecipheriv(
//         CRYPTO_ALGORITHM,
//         Buffer.from(key),
//         iv
//     );
//     let decrypted = decipher.update(encryptedText);
//     decrypted = Buffer.concat([decrypted, decipher.final()]);
//     return decrypted.toString();
// }

// const A = extractBytes(rndA, 4, 0);
// const B = extractBytes(rndB, 4, 0);
// const C = extractBytes(rndA, 11, 7);
// const D = extractBytes(rndB, 11, 7);
// const E = new Array(D.length).fill().map((_, i) => D[i] ^ C[i]);

// const keySessionBaseENC = [...A, ...B, ...E, 0x11];
// const iv = new Array(16).fill(0);
// const keyEnc = encrypt(keySessionBaseENC, key, iv);

// const H = extractBytes(rndA, 15, 11);
// const F = extractBytes(rndA, 8, 4);
// const I = extractBytes(rndB, 15, 11);
// const G = extractBytes(rndB, 8, 4);
// const J = new Array(H.length).fill().map((_, i) => H[i] ^ I[i]);
// const keySessionBaseMAC = [...F, ...G, ...J, 0x22];
// const keyMac = encrypt(keySessionBaseMAC, key, iv);

// console.log({
//     A, B, C, D, E, keySessionBaseENC,
//     keyEnc: keyEnc.map(n => n.toString(16)),
//     H, F, I, G, J, keySessionBaseMAC,
//     keyMac: keyMac.map(n => n.toString(16)),
// });
