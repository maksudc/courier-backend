module.exports = function (sequelize, DataTypes) {
    var manualTransaction = sequelize.define('manualTransaction', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        amount: {type: DataTypes.DECIMAL, allowNull: false, defaultValue: 0},
        branch_type: {type: DataTypes.STRING, allowNull: false},
        branch_id: {DataTypes: Sequelize.INTEGER, allowNull: false},
        status: {type: DataTypes.ENUM("draft", "received", "archived"), allowNull: false, defaultValue: "draft"},
        recieved_by: {type: DataTypes.STRING, allowNull: true, defaultValue: null},
        recieved_at: {type: DataTypes.DATE, allowNull: true, defaultValue: null},
        transaction_type: {type: DataTypes.ENUM("cashin", "cashout"), allowNull: true,},
        payment_method: {type: DataTypes.ENUM("bank", "bkash", "direct"), allowNull: true,},
        payment_reference: {type: DataTypes.STRING, allowNull: true},
        payment_description: {type: DataTypes.STRING, allowNull: true},
        createdAt: {
            allowNull: false,
            type: DataTypes.DATE
        },
        updatedAt: {
            allowNull: false,
            type: DataTypes.DATE
        }
    },
        {

		classMethods: {
			associate: function(models){

			}
		}
	})
    return manualTransaction;
}