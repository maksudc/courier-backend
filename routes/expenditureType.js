var express = require("express");
var router = express.Router();
var multer = require("multer");
var upload = multer();
var DB = require("../models/index");
var sequelize = DB.sequelize;
var passport = require('passport');
var bodyParser = require('body-parser');
var expenditureType = sequelize.models.expenditureTypes;
var _ = require("underscore");

router.use(bodyParser.json()); // for parsing application/json
router.use(bodyParser.urlencoded({extended: true})); // for parsing application/x-www-form-urlencoded

router.use(passport.authenticate('basic', {session: false}));

router.get('/',function(req,res)
{
   return expenditureType.findAll().then(function(result)
   {

       res.send({status:"success",data:result,message:"found"});
   }).catch(function(err)
   {
       res.sendStatus(500).send(err.stack)
   })
})


router.post("/", upload.array(), function (req, res) {

    postData = {};
    postData['name'] = req.body.name;
    postData['created_by'] = req.body.created_by;


    sequelize.transaction(function (t) {
        return expenditureType.create(postData, {transaction: t})
    }).then(function (result) {
        res.status(201);
        res.send({status: "success", data: result, message: postData});
    }).catch(function (err) {
        if (err) {
            console.error(err.stack);
        }
        res.status(500);
        res.send({status: "error", data: null, message: err});
    });
});

router.put("/:id", function (req, res) {
    return expenditureType.update(req.body,
        {
            where: {
                id: req.params.id,
            },
            individualHooks: true
        }
    ).then(function (result) {
        res.send({status: "success", data: result});

    }).catch(function (err) {
        res.status(500);
        res.send({status: "error", data: null, message: err});
    });
});


router.delete("/:id", function (req, res) {

    expenditureType.destroy({
        where: {
            id: req.params.id,

        }
    })
        .then(function (result) {

            if (result > 0) {
                res.status(200).send({
                    message: "Successful"
                });
            } else {
                res.status(404).send({
                    message: "Not found"
                });
            }
        })
        .catch(function (err) {

            message = "";
            if (err) {
                message = err.message;
                console.error(err.stack);
            }
            res.status(500);
            res.send(message);
        });
});

module.exports = router;
