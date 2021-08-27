var express = require('express');
var router = express.Router();

var controller = require('../../controllers/seedInventory/seedInventoryController');
var scanApi = require("../../routes/seedInventory/scanRoute")
var statusApi = require("../..//routes/seedInventory/seedStatusRoute")
var actionApi = require("../..//routes/seedInventory/actionRoute")
var alertApi = require("../..//routes/seedInventory/alertRoute")

// get a complete list of seed inventory in different location
router.get('/', controller.getSeedInventory);

router.get('/records', controller.getAllRecord);

router.get('/records/:id', controller.getOneByObjectId);

//can delete more than one seed with same seedId
router.delete('/records/:id', controller.deleteOneByObjectId);

// router.delete('/records(s)', controller.deleteAll);

// for internal use only
// router.get('/testing', controller.test);

router.use("/scans", scanApi)

router.use("/status", statusApi)

router.use("/actions", actionApi)

router.use("/alerts", alertApi)

module.exports = router;