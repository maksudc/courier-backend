'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {

    return queryInterface.addColumn("clients", "corporationId" ,{
			type: Sequelize.INTEGER,
      allowNull: true
		})
    .then(function(){

      return queryInterface.sequelize.query("ALTER TABLE clients ADD CONSTRAINT fk_clients_corporation FOREIGN KEY (corporationId) REFERENCES corporations(id) ON UPDATE CASCADE ON DELETE NO ACTION;");
    });
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.sequelize.query("ALTER TABLE clients DROP CONSTRAINT fk_clients_corporation")
            .then(function(){
                return queryInterface.removeColumn("clients", "corporationId");
            });
  }
};
