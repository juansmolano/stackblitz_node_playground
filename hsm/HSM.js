"use strict";
const http = require('http');
const https = require('https');
const keycloak = require("../keycloak/Keycloak").singleton();
const { mergeMap } = require("rxjs/operators");
const { of, bindCallback } = require("rxjs");
const { CustomError } = require("@nebulae/backend-node-tools").error;
const {
  ConsoleLogger
} = require('@nebulae/backend-node-tools').log;
let instance = null;

class HSM {
  constructor({
    keycloakBaseUrl,
    keycloakUsername,
    keycloakPassword,
    keycloakClientId,
    keycloakRealmName,
    hsmHttpUrl
  }) {
    this.settings = {
      keycloakBaseUrl,
      keycloakUsername,
      keycloakPassword,
      keycloakClientId,
      keycloakRealmName,
      hsmHttpUrl
    };
  }

  callHsmRestService$(methodType, path, contentType, requestBody, jwt, expectedStatusCodes = [200]) {
    if (!jwt || jwt === null || jwt === "") {
      return keycloak.getToken$().pipe(
        mergeMap(keycloakUser => {
          const createRequestOps = {
            method: methodType,
            headers: {
              'Authorization': 'Bearer ' + keycloakUser[1].access_token
            }
          };
          if (contentType) {
            createRequestOps.headers["Content-Type"] = contentType;
          }
          if (requestBody) {
            requestBody = JSON.stringify(requestBody);
          }
          return bindCallback(instance.request)((process.env.HSM_HTTP_URL || 'http://dev1.nebulae.com.co:8088/nebulaengineering/HSM/1.0') + path, createRequestOps, requestBody).pipe(
          //return bindCallback(instance.request)((process.env.HSM_HTTP_URL || 'http://192.168.188.135:8080/nebulaengineering/HSM/1.0') + path, createRequestOps, requestBody).pipe(
            mergeMap(({ error, statusCode, body }) => {
              if (error) console.log("ERROR PURO ===> ", typeof error);
              if (expectedStatusCodes.includes(statusCode)) {
                return (statusCode === 200 && body && body !== "") ? of(JSON.parse(body)) : of("");
              }
              console.log('>>>>', 'http://192.168.188.135:8080/nebulaengineering/HSM/1.0' + path, requestBody);
              throw new CustomError('HsmHttpError', 'HsmHttpError', 19026, 'HSM error ' + statusCode + ': ' + (error || body));
            })
          );
        })
      );
    } else {
      const createRequestOps = {
        method: methodType,
        headers: {
          'Authorization': 'Bearer ' + jwt
        }
      };
      if (contentType) {
        createRequestOps.headers["Content-Type"] = contentType;
      }
      if (requestBody) {
        requestBody = JSON.stringify(requestBody);
      }
      //return bindCallback(instance.request)((process.env.HSM_HTTP_URL || 'http://dev1.nebulae.com.co:8088/nebulaengineering/HSM/1.0') + path, createRequestOps, requestBody).pipe(
      return bindCallback(instance.request)((process.env.HSM_HTTP_URL || 'http://192.168.188.135:8080/nebulaengineering/HSM/1.0') + path, createRequestOps, requestBody).pipe(
        mergeMap(({ error, statusCode, body }) => {
          console.log("LLEGA RESP ===> ", { statusCode, body, error });
          if (expectedStatusCodes.includes(statusCode)) {
            return (statusCode === 200 && body && body !== "") ? of(JSON.parse(body)) : of("");
          }
          throw new CustomError('HsmHttpError', 'HsmHttpError', 19026, 'HSM error ' + statusCode + ': ' + error);
        })
      );
    }
  }

  request(url, ops, data, callBack) {
    //console.log("REQUEST OPS ===> ", {...ops, url});
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
  }
}

/**
 * @returns {HSM}
 */
module.exports = {
  singleton() {
    if (!instance) {
      instance = new HSM({
        keycloakBaseUrl: process.env.KEYCLOAK_BACKEND_BASE_URL,
        keycloakUsername: process.env.KEYCLOAK_BACKEND_USER,
        keycloakPassword: process.env.KEYCLOAK_BACKEND_PASSWORD,
        keycloakClientId: process.env.KEYCLOAK_BACKEND_CLIENT_ID,
        keycloakRealmName: process.env.KEYCLOAK_BACKEND_REALM_NAME,
        hsmHttpUrl: process.env.KEYCLOAK_BACKEND_REALM_NAME
      });
      ConsoleLogger.i(`HSM instance created.`);
    }
    return instance;
  }
};
