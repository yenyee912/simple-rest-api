var express = require('express');
var router = express.Router();
var controller = require('../../controllers/seedInventory/alertController');

router.get('/', controller.triggerManualAlert);

module.exports = router;
