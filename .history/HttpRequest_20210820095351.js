
'use strict';

const https = require("https");
const http = require("http");


const request = (url, ops, data, callBack) => {
  console.log("REQUEST OPS ===> ", ops);
  const req = (url.startsWith('https') ? https : http).request(url, ops, (res) => {
    const dataFragments = [];
    res.on('data', (data) => {
      dataFragments.push(data);
    });
    res.on('end', () => {
      callBack({ error: undefined, headers: res.headers, statusCode: parseInt((res || {}).statusCode || 0), body: Buffer.concat(dataFragments).toString() })
    });
  });
  req.on('error', (e) => callBack({ error: e, headers: undefined, statusCode: parseInt((e || {}).statusCode || 0), body: undefined }));
  if (data) {
    req.write(data);
  }
  req.end();
};

module.exports = request;