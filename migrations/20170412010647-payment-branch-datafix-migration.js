'use strict';

var branchLogic = require("../logics/branchLogic");

module.exports = {
  up: function (queryInterface, Sequelize) {

    return branchLogic.adjustMissingPaymentBranch(null);
  },

  down: function (queryInterface, Sequelize) {

    return branchLogic.revertMissingPaymentBranch(null);
  }
};
