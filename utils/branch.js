var sanitizeBranchType = function(branchType){

  if(branchType){
    return branchType.split("-")[0];
  }
  return null;
};

var desanitizeBranchType = function(branchType){

  if(branchType){
    stabilizedType = sanitizeBranchType(branchType);
    if(stabilizedType=="sub"){
      return "sub-branch";
    }else if(stabilizedType == "regional"){
      return "regional-branch";
    }
  }

  return null;
};

exports.sanitizeBranchType = sanitizeBranchType;
exports.desanitizeBranchType = desanitizeBranchType;
