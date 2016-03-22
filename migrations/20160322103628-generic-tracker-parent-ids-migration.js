'use strict';
var Promise = require('bluebird');

module.exports = {
  up: function (queryInterface, Sequelize) {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */

    //var GenericTrackerModel = require('../models/genericTracker');
    return
    queryInterface.addColumn("genericTracker" , "currentGeoLocation" , {
      currentGeoLocation: { type: Sequelize.GEOMETRY , allowNull:true }
    })
    .then(function(){

      queryInterface.addColumn("genericTracker" , "hasChild" , {
        hasChild: { type: Sequelize.BOOLEAN , defaultValue: false }
      });
    })
    .then(function(){

      queryInterface.addColumn("genericTracker" , "parentTrackerId" , {
        parentTrackerId: { type: Sequelize.UUID , defaultValue: null, allowNull: true }
      });
    });
  },

  down: function (queryInterface, Sequelize) {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
    var p1 = queryInterface.removeColumn("genericTracker" , "currentGeoLocation");
    var p2 = queryInterface.removeColumn("genericTracker" , "hasChild");
    var p3 = queryInterface.removeColumn("genericTracker" , "parentTrackerId");

    return Promise.all([p1 ,p2 , p3]);

  }
};
