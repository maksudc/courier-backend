var express = require('express');
var router = express.Router();
var passport = require("passport");
var authMiddleware  = require("./../../middleware/auth");
var DB = require("./../../models/index");
var sequelize = DB.sequelize;
var corporationModel = sequelize.models.corporation;
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

  params = req.body;
  
});

router.delete("/:corporationId", upload.array(), function(req, res){

});
module.exports = router;
