var fs        = require('fs');
var path      = require('path');
var basename  = path.basename(module.filename);
var hooks = {};

fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(function(file) {
    //var model = sequelize['import'](path.join(__dirname, file));
    //db[model.name] = model;

    var hookObject = require(path.join(__dirname , file));
    modelName = file.substring(0 , file.length-3);
    hooks[modelName] = hookObject;
  });

module.exports = hooks;
