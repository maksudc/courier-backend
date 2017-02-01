
var getAdminBranchType = function(adminObj){
    if(!adminObj){
      return null;
    }
    return adminObj.sub_branch_id ? "sub" : "regional";
}

var getAdminBranchId = function(adminObj){
    if(!adminObj){
      return null;
    }
    return adminObj.sub_branch_id ? adminObj.sub_branch_id : adminObj.regional_branch_id;
}

exports.getAdminBranchType = getAdminBranchType;
exports.getAdminBranchId = getAdminBranchId;
