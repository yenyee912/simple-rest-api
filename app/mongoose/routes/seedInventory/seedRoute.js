//define the routes for each CRUD 
var router = require("express").Router();

const controller = require("../../controllers/seedInventory/seedController.js");

// import multer
const uploadFile = require("../../middleware/upload.js");

router.get("/", controller.getAllSeed);

router.get("/:seedId", controller.getOneSeedBySeedId);  

router.post("/",uploadFile.single("image"), controller.createNewSeed);
  
router.put("/:seedId",uploadFile.single("image"), controller.updateOneBySeedId);

router.delete("/:seedId", controller.deleteOneBySeedId); 

// router.delete("/", controller.deleteAll);  

module.exports = router;