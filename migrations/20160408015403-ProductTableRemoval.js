'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    queryInterface.dropTable("products");
  },

  down: function (queryInterface, Sequelize) {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
      queryInterface.createTable("products" , {
    		uuid: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV1},
    		product_name: {type: Sequelize.STRING, allowNull: false}, //In 2nd release, unique: true
    		unit: {type: Sequelize.STRING, allowNull: false},
    		price: {type: Sequelize.FLOAT, allowNull: false},
    		threshold_unit: {type: Sequelize.STRING},
    		threshold_price: {type: Sequelize.FLOAT}
    	} , {

  		classMethods: {
  			associate: function(models){

  				products.hasOne(models.item , { foreignKey: 'productUuid' });
  			}
  		}
  	});
  }
};
