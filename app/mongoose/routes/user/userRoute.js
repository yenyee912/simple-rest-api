//define the routes for each CRUD 
var router = require("express").Router();
const controller = require("../../controllers/user/userController.js");

router.get("/", controller.getAllUser);

module.exports = router;
