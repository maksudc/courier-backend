'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        queryInterface.sequelize.query(
            " ALTER TABLE `manualTransactions` ADD CONSTRAINT `updaterFkconstraint` FOREIGN KEY (`updated_by`) REFERENCES `admins` ( `email` ) ON DELETE SET NULL ON UPDATE CASCADE; "
        )
    },

    down: (queryInterface, Sequelize) => {

        return queryInterface.sequelize.query("ALTER TABLE `manualTransactions`  DROP CONSTRAINT `updaterFkconstraint`")
    }
};