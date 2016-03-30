var DB = require("../models/index");
var sequelize = DB.sequelize;
var Sequelize = DB.Sequelize;
var genericTracker = sequelize.models.genericTracker;
var _= require('lodash');

var getTracker = function(trackerId , next){

  genericTracker
  .findOne({ where: { uuid: trackerId } })
  .then(function(result){
    next({ status: "success" , data:result , message:null });
  })
  .catch(function(err){
    next({ status:"error" , data:null , message: err });
  });
};

var getTrackerForTrackable = function(params , next){

  whereClause = {};

  if(params.trackableType){
    whereClause.trackableType = params.trackableType;
  }
  if(params.trackableId){
    whereClause.trackableId = params.trackableId;
  }
  if(params.parentTrackerId){
    whereClause.parentTrackerId = params.parentTrackerId;
  }
  queryParam = {};
  //_.assignIn(queryParam , paginationClause);
  _.assignIn(queryParam , { where:whereClause });
  
  genericTracker
  .findOne(queryParam)
  .then(function(result){
    next({ status:"success" , data:result , message:null });
  })
  .catch(function(err){
    next({ status:"error" , data:null , message: err });
  });

};

var getTrackers = function(params , next){

  paginationClause = {
    limit: 10,
    offset:0
  };

  console.log(params);

  if(params.limit){
    paginationClause.limit = parseInt(params.limit);
  }
  if(params.page){
    paginationClause.offset = (parseInt(params.page)-1) * paginationClause.limit;
  }

  whereClause = {};
  if(params.status){
    whereClause.status = params.status;
  }
  if(params.trackableType){
    whereClause.trackableType = params.trackableType;
  }
  if(params.trackableId){
    whereClause.trackableId = params.trackableId;
  }
  if(params.currentBranchType){
    whereClause.currentBranchType = params.currentBranchType;
  }
  if(params.currentBranchId){
    whereClause.currentBranchId = params.currentBranchId;
  }
  if(params.parentTrackerId){
    whereClause.parentTrackerId = params.parentTrackerId;
  }

  queryParam = {};
  _.assignIn(queryParam , paginationClause);
  _.assignIn(queryParam , { where:whereClause });

  console.log(queryParam);

  genericTracker
  .findAll(queryParam)
  .then(function(results){
    next({ status:"success" , data:results , message:null });
  })
  .catch(function(err){
    next({ status:"error" , data:null , message: err });
  });
};

var getTrackerCurrentBranch = function(trackerId , next){

  genericTracker
  .findOne({ where: { uuid: trackerId } })
  .then(function(result){
    //next({ status: "success" , data:result , message:null });
    if(result.currentBranchType == "sub"){

      result
      .getSubBranch()
      .then(function(subBranch){
        next({ status:"success" , data: subBranch , message:null });
      })
      .catch(function(err){
        next({ status:"error" , data:null , message:err });
      });

    }else if(result.currentBranchType == "regional"){

      result
      .getRegionalBranch()
      .then(function(regionalBranch){
        next({ status:"success" , data: regionalBranch , message:null });
      })
      .catch(function(err){
        next({ status:"error" , data:null , message:err });
      });
    }
  })
  .catch(function(err){
    next({ status:"error" , data:null , message: err });
  });
};

var updateCurrentLocation = function(trackerId , branchType , branchId , next){

  genericTracker
  .update(
    { currentBranchType:branchType , currentBranchId:branchId } ,
    { where:{ uuid:trackerId } }
  )
  .then(function(numRowsAffected){
    next({ status:"success" , data:numRowsAffected , message:null });
  })
  .catch(function(err){
    next({ status:"error" , data:null , message:err });
  });
};

var createTracker = function(postData , next){

  genericTracker
  .create(postData)
  .then(function(result){
    next({ status:"success" , data:result , message:null });
  })
  .catch(function(err){
    next({ status:"error" , data:null , message:err });
  });
};

/**
  @todo:  Create new tracker api
  @todo:  Disable a tracker
  @// TODO: Update a tracker object ( Disable a tracker or update the reference )
  @todo:  parent trackerId set
  @todo:  parent trackerId get
**/

exports.getTracker = getTracker;
exports.getTrackers = getTrackers;
exports.getTrackerCurrentBranch = getTrackerCurrentBranch;
exports.updateCurrentLocation = updateCurrentLocation;
exports.createTracker = createTracker;
exports.getTrackerForTrackable = getTrackerForTrackable;
