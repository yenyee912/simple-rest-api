var express = require('express');
var router = express.Router({mergeParams: true});

var controller = require('../../controllers/seedInventory/scanController');
var controller2 = require('../../controllers/seedInventory/createScan');

router.get('/', controller.getAllScanRecord);

router.get('/:id', controller.getOneScanRecordByObjectId);

router.post('/', controller2.createScan);

router.delete('/:id', controller.deleteOneByObjectId);

// router.delete('/', controller.deleteAll);

module.exports = router;