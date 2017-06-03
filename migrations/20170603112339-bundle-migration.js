'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */

    return queryInterface.createTable('bundles' , {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      uuid: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV1
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdAtBranchType: {
        type: Sequelize.ENUM('regional' , 'sub'),
        allowNull: false
      },
      createdAtBranchId: {
        type: Sequelize.STRING,
        allowNull: false
      },
      createdBy:{
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.ENUM('draft','confirmed','ready','running','received','reached','forwarded','stocked','delivered','expired'),
        defaultValue: 'draft',
        allowNull: false
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
    queryInterface.dropTable('bundles');
  }
};
