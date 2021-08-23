
'use strict';


const https = require("https");


static request(url, ops, body, callBack) {
    if (body) {
      ops.headers = {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body, 'utf8')
      };
    }
    const req = https.request(url, ops, (res) => {
      const dataFragments = [];
      res.on('data', (data) => {
        dataFragments.push(data);
      });
      res.on('end', () => {
        callBack({ error: undefined, headers: res.headers, statusCode: res.statusCode, body: Buffer.concat(dataFragments).toString() });
      });
    });
    req.on('error', (e) => callBack({ error: e, headers: undefined, statusCode: undefined, body: undefined }));
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  }