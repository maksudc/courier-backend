var express = require('express');
var router = express.Router();
var passport = require("passport");
var authMiddleware  = require("./../../middleware/auth");
var DB = require("./../../models/index");
var sequelize = DB.sequelize;
var corporationModel = sequelize.models.corporation;
var clientModel = sequelize.models.client;
var HttpStatusCodes = require("http-status-codes");
var multer = require("multer");
var upload = multer();
var bodyParser = require('body-parser');

router.use(authMiddleware.hasGenericAccess);
router.get("/:corporationId" , function(req, res){

  var result = {};

  corporationModel.findOne({
    where: { id: req.params.corporationId },
    attributes: [ "id", "username", "name", "email", "mobile", "address", "status", "has_portal_access", "createdAt" ]
  })
  .then(function(corporation){

    return Promise.all([
      corporation,
      corporation.getClients({
        attributes: [ "mobile", "full_name", "address", "status", "createdAt", "has_portal_access", "corporationId" ],
        order: "full_name ASC"
      })
    ]);
  })
  .then(function(complexResult){
    corporation = complexResult[0];
    clients = complexResult[1];

    result = corporation.dataValues;
    result["clients"] = clients;

    res.status(HttpStatusCodes.OK);
    res.send(result);
  })
  .catch(function(err){
    if(err){
      console.error(err);
    }
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR);
    res.send(err);
  });
});

router.put("/:corporationId", upload.array(), function(req, res){

  console.log(req.body);

  corporationParams = req.body.corporation;

  finalClientNumbers = req.body.clients;
  finalClientSet= new Set(finalClientNumbers);

  sequelize.transaction(function(t){

    corporationQuery = {
      where: {
        id: req.params.corporationId
      },
      transaction: t
    };

    return corporationModel
    .update(corporationParams, corporationQuery)
    .then(function(result){

      return clientModel.findAll({
        where: {
          corporationId: req.params.corporationId
        },
        attributes: [ "mobile", "full_name" ],
        transaction: t
      });
    })
    .then(function(corporateEmployees){

      // removableEmployees = [];
      // for(I=0; I < corporateEmployees.length; I++){
      //   employee = corporateEmployees[I];
      //   if(!finalClientSet.has(employee.dataValues["mobile"])){
      //     removableEmployees.push(employee.dataValues["mobile"]);
      //   }
      // }
      //
      // existingClientSet = new Set();
      // for(I=0; I < corporateEmployees.length; I++){
      //   employee = corporateEmployees[I];
      //   existingClientSet.add(employee.dataValues["mobile"]);
      // }
      //
      // addableEmployees = [];
      // for(I =0 ; I < finalClientNumbers.length; I++){
      //   if(!existingClientSet.has(finalClientNumbers[I])){
      //     addableEmployees.push(finalClientNumbers[I]);
      //   }
      // }
      //
      // return  Promise.all([
      //   addableEmployees.length > 0 ? clientModel.update({corporationId: req.params.corporationId} , { where: { mobile:{ "$in": addableEmployees } }, transaction: t  }): [],
      //   removableEmployees.length > 0 ? clientModel.update({corporationId: null } , { where: { mobile:{ "$in": removableEmployees } }, transaction: t  }): []
      // ]);
    });
  })
  .then(function(result){

    res.status(HttpStatusCodes.OK);
    res.send({
      message: "Updated successfully",
      id: req.params.corporationId,
      type: "corporation"
    });
  })
  .catch(function(err){
    console.error(err);

    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR);
    res.send(err);
  });

});

router.delete("/:corporationId", upload.array(), function(req, res){

});
module.exports = router;
