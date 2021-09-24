"use strict";

const {
  Observable,
  defer,
  BehaviorSubject,
  of ,
  interval
} = require("rxjs");
const {
  retry,
  mergeMap,
  switchMap,
  exhaustMap,
  catchError,
  map,
  tap,
  filter
} = require('rxjs/operators');
const KeycloakAdminClient = require('@nebulae/keycloak-admin-client');
const {
  ConsoleLogger
} = require('@nebulae/backend-node-tools').log;

let instance = null;

class Keycloak {

  /**
   * initialize and configure keycloak admin client
   * @param { { url, dbName } } ops
   */
  constructor({
    realmName,
    baseUrl,
    username,
    password,
    grant_type,
    client_id
  }) {
    this.settings = {
      realmName,
      baseUrl,
      username,
      password,
      grant_type,
      client_id
    };
    this.keycloakAdmin = new KeycloakAdminClient(this.settings);
    this.tokenTimeSubject$ = new BehaviorSubject(null);
    this.checkKeycloakToken$().subscribe(
      (result) => { },
        (err) => {
          ConsoleLogger.e("Error on checkKeycloakToken", err);
          process.exit(1);
        },
        () => {
          ConsoleLogger.i("checkKeycloakToken completed");
          process.exit(0);
         }
    );
  }

  start$() {
    return Observable.create((observer) => {
      this.tokenTimeSubject$.next(1000);
      observer.complete();
    });
  }

  /**
   * Authenticates with Keycloak and evaluate the expiration time of the token to refresh it
   */
  checkKeycloakToken$() {
    return this.tokenTimeSubject$
      .pipe(
        filter(time => time),
        //Create an interval according to the expiration time of the token, the 
        //first time the interval will be executed each seconds
        switchMap(time => {
          return interval(time);
        }),
        exhaustMap(time => {
          return of(time)
            .pipe(
              mergeMap(data => {
                if (this.keycloakToken == null || (this.keycloakToken != null && this.keycloakToken.refresh_expires_in <= 20)) {
                  return this.getToken$();
                } else {
                  return this.refreshToken$();
                }
              }),
              //If an error ocurred getting or refreshing the token, we try to get a new token. 
              catchError(error => {
                ConsoleLogger.e('Error refreshing token => ', error);
                return this.getToken$()
                  .pipe(
                    retry(2)
                  )
              }),
              tap(([client, token]) => {

                ConsoleLogger.i(`Token refreshed; refresh token expires in:  ${token.refresh_expires_in}, token expires in: ${token.expires_in}`);
                //takes the lowest expiration time
                const expirationTimeToken = token.expires_in < token.refresh_expires_in ? token.expires_in : token.refresh_expires_in;

                this.keycloakClient = client;
                this.keycloakToken = token;
                let expirationTimeMillis = expirationTimeToken > 20 ? (expirationTimeToken - 20) * 1000 : 1000;

                //set the new time
                this.tokenTimeSubject$.next(expirationTimeMillis);
              })
            )
        })
      );
  }

  /**
   * Starts Keycloak connections
   * @returns {Observable} Observable that resolve to the Keycloak client
   */
  getToken$() {
    return this.keycloakAdmin.getToken$();
  }

  /**
   * Refresh Keycloak connections
   * @returns {Observable} Observable that resolve to the Keycloak client
   */
  refreshToken$() {
    return this.keycloakAdmin.refreshToken$();
  }


  // /**
  //  * Check token validity
  //  */
  // checkTokenValidity$(){
  //   return defer(() =>
  //     this.getUserInfo(
  //       process.env.KEYCLOAK_BACKEND_REALM_NAME
  //     )
  //   );
  // }

  checkTokenValidity$() {
    return defer(() =>
      this.keycloakClient.users.checkTokenValidity(
        process.env.KEYCLOAK_BACKEND_REALM_NAME
      )
    );
  }

  /**
   * Stops DB connections
   * Returns an Obserable that resolve to a string log
   */
  stop$() {
    return Observable.create(observer => {
      //this.client.close();
      this.tokenTimeSubject$.next(null);
      observer.next("Keycloak admin client stopped");
      observer.complete();
    });
  }

}

/**
 * @returns {Keycloak}
 */
module.exports = {
  singleton() {
    if (!instance) {
      instance = new Keycloak({
        realmName: process.env.KEYCLOAK_BACKEND_REALM_NAME ,
        baseUrl: process.env.KEYCLOAK_BACKEND_BASE_URL,
        username: process.env.KEYCLOAK_BACKEND_USER,
        password: process.env.KEYCLOAK_BACKEND_PASSWORD,
        grant_type: 'password',
        client_id: process.env.KEYCLOAK_BACKEND_CLIENT_ID,
      });
      ConsoleLogger.i(`Keycloak instance created.`);
    }
    return instance;
  }
};
