"use strict";

const MifareTools = require("./MifareTools");
const DesfireTools = require("./DesfireTools");
const PaymentMediumMifareInterpreter = require("./PaymentMediumMifareInterpreter");
const PaymentMediumDesfireInterpreter = require("./PaymentMediumDesfireInterpreter");

module.exports = {
  /**
   * @returns {MifareTools}
   */
  MifareTools,
  /**
   * @returns {DesfireTools}
   */
   DesfireTools,
  /**
   * @returns {PaymentMediumMifareInterpreter}
   */
   PaymentMediumMifareInterpreter,
  /**
   * @returns {PaymentMediumDesfireInterpreter}
   */
   PaymentMediumDesfireInterpreter,
};
