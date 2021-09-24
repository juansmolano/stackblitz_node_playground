"use strict";

const { concat } = require("rxjs");
const Keycloak = require("./Keycloak").singleton();

module.exports = {
  /**
   * start workflow
   * @returns {Observable}
   */
  start$:Keycloak.start$(),
  /**
   * start for syncing workflow
   * @returns {Observable}
   */
  startForSyncing$: Keycloak.start$(),
  /**
   * Stop workflow
   * @returns {Observable}
   */
  stop$: Keycloak.stop$(),
  /**
   * @returns {mongoDB}
   */
  Keycloak,
};
