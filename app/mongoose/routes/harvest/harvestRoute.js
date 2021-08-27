var express = require('express');
var router = express.Router();

var controller = require('../../controllers/harvest/harvestController');

router.get('/', controller.getCultivarsWithDateType);

router.get('/transplant', controller.getAllTransplantRecords);

router.get('/transplant/:id', controller.getOneTransplantRecordById);

router.get('/calendar', controller.getCalendarHarvestData);

router.post('/transplant', controller.createNewTransplantEntry);

router.put('/transplant/:id', controller.updateOneById);

router.delete('/transplant/:id', controller.deleteOneById);

// router.delete('/transplant', controller.deleteAll);

module.exports = router;