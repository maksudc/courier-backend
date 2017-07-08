
var getAdminBranchType = function(adminObj){
    if(!adminObj){
      return null;
    }
    return adminObj.sub_branch_id ? "sub" : "regional";
};

var getAdminBranchId = function(adminObj){
    if(!adminObj){
      return null;
    }
    return adminObj.sub_branch_id ? adminObj.sub_branch_id : adminObj.regional_branch_id;
};

var isPrivileged = function(role){
  return ["super_admin","system_operator"].indexOf(role) > -1;
};

var isPivilegedForProfileBranchUpdate = function(role){
   return ["super_admin","system_operator" , "accountant" , "monitor_operator"].indexOf(role) > -1;
};

exports.getAdminBranchType = getAdminBranchType;
exports.getAdminBranchId = getAdminBranchId;
exports.isPrivileged = isPrivileged;
exports.isPivilegedForProfileBranchUpdate = isPivilegedForProfileBranchUpdate;
