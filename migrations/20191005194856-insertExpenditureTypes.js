'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        /*
          Add altering commands here.
          Return a promise to correctly handle asynchronicity.

          Example:
          return queryInterface.createTable('users', { id: Sequelize.INTEGER });
        */

        return queryInterface.bulkInsert('expenditureTypes', [
            {name: "Office Entertainment", createdBy: null, updatedBy: null, createdAt: null, updatedAt: null},
            {name: "Mobile Bill", createdBy: null, updatedBy: null, createdAt: null, updatedAt: null},
            {name: "Internet", createdBy: null, updatedBy: null, createdAt: null, updatedAt: null},
            {name: "Conveyance", createdBy: null, updatedBy: null, createdAt: null, updatedAt: null},
            {name: "Stationery", createdBy: null, updatedBy: null, createdAt: null, updatedAt: null},
            {name: "Off. Maint.", createdBy: null, updatedBy: null, createdAt: null, updatedAt: null},
            {name: "Labour", createdBy: null, updatedBy: null, createdAt: null, updatedAt: null},
            {name: "Home Delivery Charge ", createdBy: null, updatedBy: null, createdAt: null, updatedAt: null},
            {name: "VAT& Vat exp", createdBy: null, updatedBy: null, createdAt: null, updatedAt: null},
            {name: "Sales Comission", createdBy: null, updatedBy: null, createdAt: null, updatedAt: null},
            {name: "Misc. (TI & Ser)", createdBy: null, updatedBy: null, createdAt: null, updatedAt: null},
            {name: "Damarage", createdBy: null, updatedBy: null, createdAt: null, updatedAt: null},
            {name: "Veh. Rep. Maint.", createdBy: null, updatedBy: null, createdAt: null, updatedAt: null},
            {name: "Case withdrow", createdBy: null, updatedBy: null, createdAt: null, updatedAt: null},
            {name: "Fuel", createdBy: null, updatedBy: null, createdAt: null, updatedAt: null},
            {name: "Food Allowance", createdBy: null, updatedBy: null, createdAt: null, updatedAt: null},
            {name: "Water", createdBy: null, updatedBy: null, createdAt: null, updatedAt: null},
            {name: "Gas", createdBy: null, updatedBy: null, createdAt: null, updatedAt: null},
            {name: "Electricity", createdBy: null, updatedBy: null, createdAt: null, updatedAt: null},
            {name: "Pouro./city-cor.", createdBy: null, updatedBy: null, createdAt: null, updatedAt: null},
            {name: "Other's", createdBy: null, updatedBy: null, createdAt: null, updatedAt: null},
            {name: "Bank Loan (MIS+DSP)", createdBy: null, updatedBy: null, createdAt: null, updatedAt: null},
            {name: "Off. Rent", createdBy: null, updatedBy: null, createdAt: null, updatedAt: null},
            {name: "House Rent", createdBy: null, updatedBy: null, createdAt: null, updatedAt: null},
            {name: "Salary", createdBy: null, updatedBy: null, createdAt: null, updatedAt: null},
            {name: "Driver cash", createdBy: null, updatedBy: null, createdAt: null, updatedAt: null},
            {name: "Bank Deposit Parcel", createdBy: null, updatedBy: null, createdAt: null, updatedAt: null},
            {name: "Bank Deposit VD", createdBy: null, updatedBy: null, createdAt: null, updatedAt: null},
            {name: "VD Payment", createdBy: null, updatedBy: null, createdAt: null, updatedAt: null},
            {name: "Cash paid to HQ", createdBy: null, updatedBy: null, createdAt: null, updatedAt: null},

        ])


    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.sequelize.query(' SET FOREIGN_KEY_CHECKS = 0').then(function()
        {
             queryInterface.sequelize.query(' TRUNCATE TABLE expenditureTypes ')
        })

        /*
          Add reverting commands here.
          Return a promise to correctly handle asynchronicity.

          Example:
          return queryInterface.dropTable('users');
        */
    }
};
