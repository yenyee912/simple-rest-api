//define the routes for each CRUD 
var router = require("express").Router({ mergeParams: true });

const controller = require("../../controllers/seedInventory/seedStatusController.js");
  
// Retrieve all status
router.get("/", controller.getAllSeedStatus);

// Retrieve a single status with id
router.get("/:statusId", controller.getOneByStatusId);

// Create a new status
router.post("/",controller.createNewStatus);
  
// Update a status with id
router.put("/:statusId", controller.updateOneByStatusId);

// Delete a status with id
router.delete("/:statusId", controller.deleteOneByStatusId);

// router.delete("/deleteAll", controller.deleteAll);  

module.exports = router;