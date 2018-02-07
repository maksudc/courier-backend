var DB = require("./../../models/index");
var sequelize = DB.sequelize;
var Sequelize = DB.Sequelize;
var corporationModel = sequelize.models.corporation;

var checkLogin = function(username, password, next){
    corporationModel.findOne({
        where: {username: username, password: password, has_portal_access: true}}
    )
    .then(function(corporation){
        if(corporation){
            next(null, corporation.dataValues);
        }
        else{
            next(null, false);
        }
    })
    .catch(function(err){
        if(err){
        	console.error(err);
            next("Error while reading corporation");
        }
    });
};
exports.checkLogin = checkLogin;

var findCorporation = function(id, next){

    corporationModel.findOne({
      where: {
        id: id
      }
    })
    .then(function(corporation){
        if(corporation){
            next(null, corporation.dataValues);
        }
        else{
            next("No corporation found");
        }
    })
    .catch(function(err){
        if(err){
        	console.error(err);
          next("Error while reading corporation");
        }
    });

};
exports.findCorporation = findCorporation;
