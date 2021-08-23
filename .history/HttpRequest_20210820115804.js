
'use strict';

const https = require("https");
const http = require("http");


const request = (url, ops, data) => {
  return new Promise((resolve, reject) => {
    console.log("REQUEST OPS ===> ", ops);
    const req = (url.startsWith('https') ? https : http).request(url, ops, (res) => {
      const dataFragments = [];
      res.on('data', (data) => {
        dataFragments.push(data);
      });
      res.on('end', () => {
        resolve({ error: undefined, headers: res.headers, statusCode: parseInt((res || {}).statusCode || 0), body: Buffer.concat(dataFragments).toString() });
      });
    });
    req.on('error', reject);
    if (data) {
      console.log("RESPONSE data ===> ", data);
      req.write(typeof data === 'object' ? JSON.stringify(data) : data);
    }
    req.end();
  });

};

module.exports = request;