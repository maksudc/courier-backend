'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        queryInterface.sequelize.query(
            " ALTER TABLE `manualTransactions` ADD CONSTRAINT `receiverFkconstraint` FOREIGN KEY (`recieved_by`) REFERENCES `admins` ( `email` ) ON DELETE SET NULL ON UPDATE CASCADE; "
        )
    },

    down: (queryInterface, Sequelize) => {

        return queryInterface.sequelize.query("ALTER TABLE `manualTransactions`  DROP CONSTRAINT `receiverFkconstraint`")
    }
};