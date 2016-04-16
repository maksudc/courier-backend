'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    queryInterface.changeColumn("shipments" , "sourceBranchType" , { type: Sequelize.ENUM('regional' , 'sub') , allowNull: false });
    queryInterface.changeColumn("shipments" , "sourceBranchId" , { type: Sequelize.INTEGER , allowNull:false });

    queryInterface.changeColumn("shipments" , "destinationBranchType" , { type: Sequelize.ENUM('regional' , 'sub') , allowNull: false });
    queryInterface.changeColumn("shipments" , "destinationBranchId" , { type: Sequelize.INTEGER , allowNull:false });

    queryInterface.changeColumn("shipments" , "currentBranchType" , { type: Sequelize.ENUM('regional' , 'sub' ) , allowNull:true , defaultValue: null });
    queryInterface.changeColumn("shipments" , "currentBranchId" , { type: Sequelize.INTEGER });

    queryInterface.changeColumn("shipments" , "previousBranchType" , { type: Sequelize.ENUM('regional' , 'sub' ) , allowNull:true , defaultValue: null });
    queryInterface.changeColumn("shipments" , "previousBranchId" , { type: Sequelize.INTEGER });

    queryInterface.changeColumn("shipments" , "nextBranchType" , { type: Sequelize.ENUM('regional' , 'sub' ) , allowNull:true , defaultValue: null });
    queryInterface.changeColumn("shipments" , "nextBranchId" , { type: Sequelize.INTEGER });

  },

  down: function (queryInterface, Sequelize) {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */

    /**
    sourceBranchType: { type: DataTypes.ENUM('regional' , 'sub') },
    sourceBranchId:{ type: DataTypes.INTEGER },

    destinationBranchType:{ type: DataTypes.ENUM('regional', 'sub') },
    destinationBranchId: { type: DataTypes.INTEGER },

    currentBranchType: { type: DataTypes.ENUM('regional' , 'sub' ) },
    currentBranchId: { type: DataTypes.INTEGER },

    previousBranchType: { type: DataTypes.ENUM('regional' , 'sub' ) },
    previousBranchId: { type: DataTypes.INTEGER },

    nextBranchType: { type: DataTypes.ENUM('regional' , 'sub' ) },
    nextBranchId: { type: DataTypes.INTEGER },
    **/
    queryInterface.changeColumn("shipments" , "sourceBranchType" , { type: Sequelize.ENUM('regional' , 'sub')  });
    queryInterface.changeColumn("shipments" , "sourceBranchId" , { type: Sequelize.INTEGER} );

    queryInterface.changeColumn("shipments" , "destinationBranchType" , { type: Sequelize.ENUM('regional' , 'sub')});
    queryInterface.changeColumn("shipments" , "destinationBranchId" , { type: Sequelize.INTEGER });

    queryInterface.changeColumn("shipments" , "currentBranchType" , { type: Sequelize.ENUM('regional' , 'sub' ) });
    queryInterface.changeColumn("shipments" , "currentBranchId" , { type: Sequelize.INTEGER });

    queryInterface.changeColumn("shipments" , "previousBranchType" , { type: Sequelize.ENUM('regional' , 'sub' )  });
    queryInterface.changeColumn("shipments" , "previousBranchId" , { type: Sequelize.INTEGER });

    queryInterface.changeColumn("shipments" , "nextBranchType" , { type: Sequelize.ENUM('regional' , 'sub' )  });
    queryInterface.changeColumn("shipments" , "nextBranchId" , { type: Sequelize.INTEGER });
  }
};
