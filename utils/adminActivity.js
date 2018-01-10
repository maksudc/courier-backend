module.exports.extractParams = function(user){

  params = {};

  if(user.sub_branch_id){
    params["branch_type"] = "sub";
    params["branch_id"] = user.sub_branch_id;
  }else{
    params["branch_type"] = "regional";
    params["branch_id"] = user.regional_branch_id;
  }

  return params;
}
