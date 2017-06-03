'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    return queryInterface.sequelize.query("ALTER TABLE `bundle_destination_subBranches` ADD CONSTRAINT `bundle_destination_subBranches_subBranchId_bundleId_unique` UNIQUE(`bundleId` , `subBranchId`);");
    // queryInterface.addConstraint('bundle_destination_subBranches' , ["bundleId" , "subBranchId"] , {
    //   type: "unique",
    //   name: "bundle_sub_des_mapper_ibfk",
    // });
  },

  down: function (queryInterface, Sequelize) {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
    //return queryInterface.sequelize.query("ALTER TABLE `bundle_destination_subBranches` DROP CONSTRAINT bundle_destination_subBranches_subBranchId_bundleId_unique");
    // queryInterface.removeConstraint("bundle_destination_subBranches" , "bundle_sub_des_mapper_uk");
  }
};
