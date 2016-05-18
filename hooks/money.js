var DB = require("../models/index");
var sequelize = DB.sequelize;
var Sequelize = DB.Sequelize;

var money = sequelize.models.money;

var subBranch = sequelize.models.subBranch;
var regionalBranch = sequelize.models.regionalBranch;

var handlebars = require("handlebars");
var fs = require("fs");
var messageUtils = require("../utils/message");
var Promise = require("bluebird");

var _ = require("lodash");
var moment = require("moment");

var branchUtils = require("../utils/branch");
//
money.hook('afterCreate' , function(instance , options , next){

  var snapshotInstance = instance._previousDataValues;
  var updatedInstance = instance.dataValues;

  if(updatedInstance.type == "general"){
    if(updatedInstance.status == "draft"){

      // Send the sender verification code  to sender for receiving the money order
      content = fs.readFileSync("./views/message/money.placement.handlebars");
      contentTemplate = handlebars.compile(content.toString());
      messsageBody = contentTemplate({ parcelInstance: updatedInstance });

      messageUtils.sendMessage(updatedInstance.sender_mobile , messsageBody , function(data){
        console.log(data);
      });
    }
  }

  return next();
});
money.hook("afterUpdate" , function(instance , options , next){

  var snapshotInstance = instance._previousDataValues;
  var updatedInstance = instance.dataValues;

  if(updatedInstance.type == "general"){
    //Send the general message to the sender
    if(updatedInstance.status == "deliverable"){

      // Get the destination branch
      var destinationBranchInstance = null;

      var destinationBranchType = null;
      var destinationBranchId = null;

      if(updatedInstance.sub_branch_id){

        destinationBranchType = "sub";
        destinationBranchId = updatedInstance.sub_branch_id;
      }else if(updatedInstance.regional_branch_id){

        destinationBranchType = "regional";
        destinationBranchId = updatedInstance.regional_branch_id;
      }

      branchUtils
      .getInclusiveBranchInstance(destinationBranchType , destinationBranchId , null)
      .then(function(finalBranchInstance){

        destinationBranchInstance = finalBranchInstance;
        // Send message to the receiver about stocking of his/her order
        content = fs.readFileSync("./views/message/money.deliverable.handlebars");
        contentTemplate = handlebars.compile(content.toString());
        messsageBody = contentTemplate({ parcelInstance: updatedInstance , branchInstance: destinationBranchInstance });

        messageUtils.sendMessage(updatedInstance.receiver_mobile , messsageBody , function(data){
          console.log(data);
        });
      });

      return next();
    }
    else if(updatedInstance.status == "delivered"){

      // Send message to sender informing final delivery
      // Send message to the receiver about stocking of his/her order
      content = fs.readFileSync("./views/message/money.delivered.handlebars");
      contentTemplate = handlebars.compile(content.toString());
      messsageBody = contentTemplate({ parcelInstance: updatedInstance  });

      messageUtils.sendMessage(updatedInstance.sender_mobile , messsageBody , function(data){
        console.log(data);
      });

      return next();
    }
  }

  return next();
});
