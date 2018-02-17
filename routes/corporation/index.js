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
var corporationClientsLogic = require("./../../logics/corporation/clients");
var Promise = require("bluebird");

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

router.post("/", upload.array(), function(req, res){

  corporationParams = req.body;

  sequelize.transaction(function(t){
      return corporationModel.create(corporationParams, { transaction: t });
  })
  .then(function(corporation){

    res.status(HttpStatusCodes.CREATED);
    res.send({
      "id": corporation.dataValues["id"],
      "name": corporation.dataValues["name"],
      "has_portal_access": corporation.dataValues["has_portal_access"]
    });
  })
  .catch(function(err){
    console.error(err);

    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR);
    res.send(err);
  });
});

router.put("/:corporationId", upload.array(), function(req, res){

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
    .update(corporationParams, corporationQuery);
    // .then(function(result){
    //
    //   return clientModel.findAll({
    //     where: {
    //       corporationId: req.params.corporationId
    //     },
    //     attributes: [ "mobile", "full_name" ],
    //     transaction: t
    //   });
    // })
    // .then(function(corporateEmployees){
    //
    //   removableEmployees = [];
    //   for(I=0; I < corporateEmployees.length; I++){
    //     employee = corporateEmployees[I];
    //     if(!finalClientSet.has(employee.dataValues["mobile"])){
    //       removableEmployees.push(employee.dataValues["mobile"]);
    //     }
    //   }
    //
    //   existingClientSet = new Set();
    //   for(I=0; I < corporateEmployees.length; I++){
    //     employee = corporateEmployees[I];
    //     existingClientSet.add(employee.dataValues["mobile"]);
    //   }
    //
    //   addableEmployees = [];
    //   for(I =0 ; I < finalClientNumbers.length; I++){
    //     if(!existingClientSet.has(finalClientNumbers[I])){
    //       addableEmployees.push(finalClientNumbers[I]);
    //     }
    //   }
    //
    //   return  Promise.all([
    //     addableEmployees.length > 0 ? clientModel.update({corporationId: req.params.corporationId} , { where: { mobile:{ "$in": addableEmployees } }, transaction: t  }): [],
    //     removableEmployees.length > 0 ? clientModel.update({corporationId: null } , { where: { mobile:{ "$in": removableEmployees } }, transaction: t  }): []
    //   ]);
    // });

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

router.patch("/:corporationId", upload.array(), function(req, res){

    $changeOps = req.body || [];
    console.log($changeOps);

    sequelize.transaction(function(t){

      return Promise.all($changeOps)
      .map(function($change){

        if($change["path"] == "/clients"){
          if($change["op"] == "add"){

            return corporationClientsLogic.addClientToCorporation(req.params.corporationId, $change["value"], { transaction: t }, null);
          }else if($change["op"] == "remove"){

            return corporationClientsLogic.removeClientFromCorporation(req.params.corporationId, $change["value"], { transaction: t }, null);
          }
        }
      });
    })
    .then(function(result){

      res.status(HttpStatusCodes.OK);
      res.send(result);
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
