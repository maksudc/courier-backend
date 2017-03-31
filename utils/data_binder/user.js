var User = function(role , subBranchId , regionalBranchId){
	this.role = role;
	this.subBranchId = subBranchId;
	this.regionalBranchId = regionalBranchId;
};

User.prototype.getRole = function(){
	return this.role;
};

User.prototype.getSubBranchId = function(){
	return this.subBranchId;
};

User.prototype.getRegionalBranchId = function(){
	return this.regionalBranchId;
};

module.exports = User;
