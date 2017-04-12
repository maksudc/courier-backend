var DB = require("../models");
var sequelize = DB.sequelize;
var Sequelize = DB.Sequelize;

var subBranch = sequelize.models.subBranch;
var regionalBranch = sequelize.models.regionalBranch;

var HttpStatus = require("http-status-codes");

var Promise = require("bluebird");
var orderModel = DB.sequelize.models.order;
var adminModel = DB.sequelize.models.admin;
var branchUtils = require("../utils/branch");

var standardizeBranchType = function(branchType){

  if(branchType){
    return branchType.split("-")[0];
  }

  return null;
};

var getBranchModel = function(branchType){

    branchModel = null;

    stdBranchType = standardizeBranchType(branchType);
    if(stdBranchType !== null){
       branchModel = (stdBranchType == "sub") ? subBranch : regionalBranch;
    }
    return branchModel;
};

var updateBranch = function(branchType , branchId , postData , next){

  branchModel = getBranchModel(branchType);

  branchModel
  .update(postData , { where: { id: branchId } , individualHooks:true })
  .then(function(result){
    next({ status: "success" , statusCode: HttpStatus.OK , data:result , message:null });
  })
  .catch(function(err){
    if(err){
      console.error(err.stack);
    }
    next({ status: "error" , statusCode: HttpStatus.INTERNAL_SERVER_ERROR , data:null , message:err });
  });

};

var getBranch = function(branchType , branchId , next){

  branchModel = getBranchModel(branchType);
  branchModel
  .findOne({ where:{ id: branchId } })
  .then(function(branchItem){
    next({ status: "success" , statusCode: HttpStatus.OK , data:branchItem , message:null });
  })
  .catch(function(err){
    if(err) console.error(err.stack);
    next({ status: "error" , statusCode: HttpStatus.INTERNAL_SERVER_ERROR , data:null , message:err });
  });
};

var getBranches = function(branchType , params , next){

  branchModel = getBranchModel(branchType);
  branchModel
  .findAll()
  .then(function(branchItems){
    next({ status: "success" , statusCode: HttpStatus.OK , data:branchItems , message:null });
  })
  .catch(function(err){
    if(err){
      console.error(err.stack);
    }
    next({ status: "error" , statusCode: HttpStatus.INTERNAL_SERVER_ERROR , data:null , message:err });
  });
};

var deleteBranch = function(branchType , branchId , next){

  branchModel = getBranchModel(branchType);
  branchModel
  .destroy({ where:{ id: branchId } , individualHooks:true })
  .then(function(result){
    next({ status:"success" , statusCode:HttpStatus.OK , data:result , message:null });
  })
  .catch(function(err){
    if(err){
      console.error(err.stack);
    }
    next({ status: "error" , statusCode: HttpStatus.INTERNAL_SERVER_ERROR , data:null , message:err });
  });
};

var adjustMissingPaymentBranch = function(next){

  return orderModel
  .findAll({
    where:{
      "$or":[
        { payment_branch_migrate_affected: true },
        {
          "$and":[
            { payment_status: "paid" },
            {
              payment_operator:{
                "$ne": null
              },
            },
            {
              payment_tag:{
                '$eq': null
              }
            },
            {
              payment_hub_type:{
                "$eq": null
              }
            },
            {
              payment_hub:{
                "$eq": null
              }
            }
          ]
        }
      ]
    }
  })
  .map(function(orderInstance){
    console.log(orderInstance.uuid);
    operator_email = orderInstance.payment_operator;
    return Promise.all([
      orderInstance,
      adminModel.findOne({
        where: {
          "email": operator_email
        }
      })
    ]);
  })
  .map(function(bundle){
    console.log(bundle.length);
    orderInstance = bundle[0];
    adminInstance = bundle[1];

    payment_hub_type = null;
    payment_hub = null;
    payment_tag = null;

    if(adminInstance){

      if(adminInstance.sub_branch_id){
        payment_hub_type = "sub";
        payment_hub = adminInstance.sub_branch_id;
      }else if(adminInstance.regional_branch_id){
        payment_hub_type = "regional";
        payment_hub = adminInstance.regional_branch_id;
      }

      if(payment_hub_type == branchUtils.sanitizeBranchType(orderInstance.exit_branch_type) && payment_hub == orderInstance.exit_branch){
        payment_tag = "delivery";
      }else if(payment_hub_type == branchUtils.sanitizeBranchType(orderInstance.entry_branch_type) && payment_hub == orderInstance.entry_branch){
        payment_tag = "booking";
      }

      if(payment_hub_type){
        orderInstance.payment_hub_type = payment_hub_type;
      }
      if(payment_hub){
        orderInstance.payment_hub = payment_hub;
      }
      if(payment_tag){
        orderInstance.payment_tag = payment_tag;
      }
    }
    orderInstance.payment_branch_migrate_affected = true;

    return Promise.all([orderInstance.save() , Promise.resolve(adminInstance)]);
  })
  .then(function(results){
    console.log(results.length);
    if(next){
      next({ statusCode: HttpStatus.OK , status:"success", message:"Successfully Adjusted" , count: results.length });
    }
    return Promise.resolve(true);
  })
  .catch(function(err){
    if(err){
      console.error(err.stack);
    }
    if(next){
      next({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR , status:"error" , error:"Could not adjust" , stack:err.message });
    }
    return Promise.resolve(false);
  });
};

var revertMissingPaymentBranch = function(next){
  return orderModel
  .findAll({
    where:{
      payment_branch_migrate_affected: true
    }
  })
  .map(function(orderInstance){

    orderInstance.payment_hub = null;
    orderInstance.payment_hub_type = null;
    orderInstance.payment_tag = null;
    orderInstance.payment_branch_migrate_affected = false;

    return orderInstance.save();
  })
  .then(function(results){
    if(next){
      next({ statusCode: 200 , status:"success", message:"Successfully Adjusted" , count: results.length });
    }
    return true;
  })
  .catch(function(err){
    if(err){
      console.error(err.stack);
    }
    if(next){
      next({ statusCode: 500 , status:"error" , error:"Could not adjust" , stack:err.message });
    }
    return false;
  });
};

exports.updateBranch = updateBranch;
exports.getBranchModel = getBranchModel;
exports.getBranches = getBranches;
exports.getBranch = getBranch;
exports.deleteBranch = deleteBranch;
exports.standardizeBranchType = standardizeBranchType;
exports.adjustMissingPaymentBranch = adjustMissingPaymentBranch;
exports.revertMissingPaymentBranch = revertMissingPaymentBranch;
