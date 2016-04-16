'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    queryInterface.changeColumn("genericTrackers" , "sourceBranchType" , { type: Sequelize.ENUM('regional' , 'sub') , allowNull:true , defaultValue: null  });
    queryInterface.changeColumn("genericTrackers" , "sourceBranchId" , { type: Sequelize.INTEGER });

    queryInterface.changeColumn("genericTrackers" , "destinationBranchType" , { type: Sequelize.ENUM('regional' , 'sub') , allowNull:true , defaultValue: null });
    queryInterface.changeColumn("genericTrackers" , "destinationBranchId" , { type: Sequelize.INTEGER });

    queryInterface.changeColumn("genericTrackers" , "currentBranchType" , { type: Sequelize.ENUM('regional' , 'sub' ) , allowNull:true , defaultValue: null });
    queryInterface.changeColumn("genericTrackers" , "currentBranchId" , { type: Sequelize.INTEGER });

    queryInterface.changeColumn("genericTrackers" , "previousBranchType" , { type: Sequelize.ENUM('regional' , 'sub' ) , allowNull:true , defaultValue: null });
    queryInterface.changeColumn("genericTrackers" , "previousBranchId" , { type: Sequelize.INTEGER });

    queryInterface.changeColumn("genericTrackers" , "nextBranchType" , { type: Sequelize.ENUM('regional' , 'sub' ) , allowNull:true , defaultValue: null });
    queryInterface.changeColumn("genericTrackers" , "nextBranchId" , { type: Sequelize.INTEGER });

  },

  down: function (queryInterface, Sequelize) {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
    queryInterface.changeColumn("genericTrackers" , "sourceBranchType" , { type: Sequelize.ENUM('regional' , 'sub') , defaultValue:'regional'  });
    queryInterface.changeColumn("genericTrackers" , "sourceBranchId" , { type: Sequelize.INTEGER} );

    queryInterface.changeColumn("genericTrackers" , "destinationBranchType" , { type: Sequelize.ENUM('regional' , 'sub') , defaultValue:'regional' });
    queryInterface.changeColumn("genericTrackers" , "destinationBranchId" , { type: Sequelize.INTEGER });

    queryInterface.changeColumn("genericTrackers" , "currentBranchType" , { type: Sequelize.ENUM('regional' , 'sub' ) , defaultValue:'regional' });
    queryInterface.changeColumn("genericTrackers" , "currentBranchId" , { type: Sequelize.INTEGER });

    queryInterface.changeColumn("genericTrackers" , "previousBranchType" , { type: Sequelize.ENUM('regional' , 'sub' )  });
    queryInterface.changeColumn("genericTrackers" , "previousBranchId" , { type: Sequelize.INTEGER });

    queryInterface.changeColumn("genericTrackers" , "nextBranchType" , { type: Sequelize.ENUM('regional' , 'sub' )  });
    queryInterface.changeColumn("genericTrackers" , "nextBranchId" , { type: Sequelize.INTEGER });

  }
};
