'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    return [
    queryInterface.bulkInsert('expenditureTypes', [
      { name: "Office Entertainment", createdBy :"admin@omexcourier.com", updatedBy:null, createdAt: "2019-07-06 23:50:45", updatedAt: "2019-07-06 23:50:45" },
      { name: "Mobile Bill", createdBy :"admin@omexcourier.com", updatedBy:null, createdAt: "2019-07-06 23:50:45", updatedAt: "2019-07-06 23:50:45" },
      { name: "Internet", createdBy :"admin@omexcourier.com", updatedBy:null, createdAt: "2019-07-06 23:50:45", updatedAt: "2019-07-06 23:50:45" },
      { name: "Conveyance", createdBy :"admin@omexcourier.com", updatedBy:null, createdAt: "2019-07-06 23:50:45", updatedAt: "2019-07-06 23:50:45" },
      { name: "Stationery", createdBy :"admin@omexcourier.com", updatedBy:null, createdAt: "2019-07-06 23:50:45", updatedAt: "2019-07-06 23:50:45" },
      { name: "Off. Maint.", createdBy :"admin@omexcourier.com", updatedBy:null, createdAt: "2019-07-06 23:50:45", updatedAt: "2019-07-06 23:50:45" },
      { name: "Labour", createdBy :"admin@omexcourier.com", updatedBy:null, createdAt: "2019-07-06 23:50:45", updatedAt: "2019-07-06 23:50:45" },
      { name: "Home Delivery Charge ", createdBy :"admin@omexcourier.com", updatedBy:null, createdAt: "2019-07-06 23:50:45", updatedAt: "2019-07-06 23:50:45" },
      { name: "VAT& Vat exp", createdBy :"admin@omexcourier.com", updatedBy:null, createdAt: "2019-07-06 23:50:45", updatedAt: "2019-07-06 23:50:45" },
      { name: "Sales Comission", createdBy :"admin@omexcourier.com", updatedBy:null, createdAt: "2019-07-06 23:50:45", updatedAt: "2019-07-06 23:50:45" },
      { name: "Misc. (TI & Ser)", createdBy :"admin@omexcourier.com", updatedBy:null, createdAt: "2019-07-06 23:50:45", updatedAt: "2019-07-06 23:50:45" },
      { name: "Damarage", createdBy :"admin@omexcourier.com", updatedBy:null, createdAt: "2019-07-06 23:50:45", updatedAt: "2019-07-06 23:50:45" },
      { name: "Veh. Rep. Maint.", createdBy :"admin@omexcourier.com", updatedBy:null, createdAt: "2019-07-06 23:50:45", updatedAt: "2019-07-06 23:50:45" },
      { name: "Case withdrow", createdBy :"admin@omexcourier.com", updatedBy:null, createdAt: "2019-07-06 23:50:45", updatedAt: "2019-07-06 23:50:45" },
      { name: "Fuel", createdBy :"admin@omexcourier.com", updatedBy:null, createdAt: "2019-07-06 23:50:45", updatedAt: "2019-07-06 23:50:45" },
      { name: "Food Allowance", createdBy :"admin@omexcourier.com", updatedBy:null, createdAt: "2019-07-06 23:50:45", updatedAt: "2019-07-06 23:50:45" },
      { name: "Water", createdBy :"admin@omexcourier.com", updatedBy:null, createdAt: "2019-07-06 23:50:45", updatedAt: "2019-07-06 23:50:45" },
      { name: "Gas", createdBy :"admin@omexcourier.com", updatedBy:null, createdAt: "2019-07-06 23:50:45", updatedAt: "2019-07-06 23:50:45" },
      { name: "Electricity", createdBy :"admin@omexcourier.com", updatedBy:null, createdAt: "2019-07-06 23:50:45", updatedAt: "2019-07-06 23:50:45" },
      { name: "Pouro./city-cor.", createdBy :"admin@omexcourier.com", updatedBy:null, createdAt: "2019-07-06 23:50:45", updatedAt: "2019-07-06 23:50:45" },
      { name: "Other's", createdBy :"admin@omexcourier.com", updatedBy:null, createdAt: "2019-07-06 23:50:45", updatedAt: "2019-07-06 23:50:45" },
      { name: "Bank Loan (MIS+DSP)", createdBy :"admin@omexcourier.com", updatedBy:null, createdAt: "2019-07-06 23:50:45", updatedAt: "2019-07-06 23:50:45" },
      { name: "Off. Rent", createdBy :"admin@omexcourier.com", updatedBy:null, createdAt: "2019-07-06 23:50:45", updatedAt: "2019-07-06 23:50:45" },
      { name: "House Rent", createdBy :"admin@omexcourier.com", updatedBy:null, createdAt: "2019-07-06 23:50:45", updatedAt: "2019-07-06 23:50:45" },
      { name: "Salary", createdBy :"admin@omexcourier.com", updatedBy:null, createdAt: "2019-07-06 23:50:45", updatedAt: "2019-07-06 23:50:45" },
      { name: "Driver cash", createdBy :"admin@omexcourier.com", updatedBy:null, createdAt: "2019-07-06 23:50:45", updatedAt: "2019-07-06 23:50:45" },
      { name: "Bank Deposit Parcel", createdBy :"admin@omexcourier.com", updatedBy:null, createdAt: "2019-07-06 23:50:45", updatedAt: "2019-07-06 23:50:45" },
      { name: "Bank Deposit VD", createdBy :"admin@omexcourier.com", updatedBy:null, createdAt: "2019-07-06 23:50:45", updatedAt: "2019-07-06 23:50:45" },
      { name: "VD Payment", createdBy :"admin@omexcourier.com", updatedBy:null, createdAt: "2019-07-06 23:50:45", updatedAt: "2019-07-06 23:50:45" },
      { name: "Cash paid to HQ", createdBy :"admin@omexcourier.com", updatedBy:null, createdAt: "2019-07-06 23:50:45", updatedAt: "2019-07-06 23:50:45" },

    ])
  ];

  },

  down: (queryInterface, Sequelize) => {

      return queryInterface.sequelize.query('TRUNCATE TABLE expenditureTypes');
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
  }
};
