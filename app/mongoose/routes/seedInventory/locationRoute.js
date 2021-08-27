//define the routes for each CRUD 
var router = require("express").Router();

const controller = require("../../controllers/seedInventory/locationController.js");

// Retrieve all location
router.get("/", controller.getAllLocation);

// Retrieve a single location with id
router.get("/:locationId", controller.getOneByLocationId);
  
// Create a new location
router.post("/",controller.createNewLocation);
  
// Update a location with id
router.put("/:locationId", controller.updateOneByLocationId);

// Delete a location with id
router.delete("/:locationId", controller.deleteOneByLocationId);

// router.delete("/deleteAll", controller.deleteAll);  

module.exports = router;