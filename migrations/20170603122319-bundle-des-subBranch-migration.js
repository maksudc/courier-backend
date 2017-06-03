'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    queryInterface.createTable("bundle_destination_subBranches" , {
      createdAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      isActive:{
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      bundleId: {
        type: Sequelize.INTEGER,
        references:{
          model: "bundles",
          key: "id"
        }
      },
      subBranchId: {
        type: Sequelize.INTEGER,
        references:{
          model: "subBranches",
          key: "id"
        }
      }
    } ,
    {
      name: {
        singular: "bundle_destination_subBranches",
        plural: "bundle_destination_subBranches"
      }
    });
  },

  down: function (queryInterface, Sequelize) {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
    queryInterface.dropTable('bundle_destination_subBranches');
  }
};
