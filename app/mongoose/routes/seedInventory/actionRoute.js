//define the routes for each CRUD 
var router = require("express").Router({mergeParams: true});

const controller = require("../../controllers/seedInventory/actionController.js");
  
// Create a new action
router.post("/",controller.createNewAction);
  
// Retrieve all action
router.get("/", controller.getAllAction);

// Retrieve a single action with id
router.get("/:actionId", controller.getOneActionById);
  
// Update a action with id
router.put("/:actionId", controller.updateOneByActionId);

// Delete a action with id
router.delete("/:actionId", controller.deleteOneByActionId);

// router.delete("/", controller.deleteAll);  

module.exports = router;