var express = require('express');
var router = express.Router();

var controller = require('../../controllers/booking/binBookingController');
var imgCtrl = require('../../controllers/booking/imageController');
const binConfigCtrl = require("../../controllers/agri/sortingController.js");

var imageAPI = require('./imageRoute');

// router.param('id', function (req, res, next, id) {
//     req.id_from_param = id;
//     next();
// });

router.get("/inventory/bin", binConfigCtrl.getB2BBinInventory);

router.get('/', controller.getAllOrders);

router.get('/:id', controller.getOrderById);

router.put('/:id', controller.updateOrderById);

router.post('/', controller.createNewOrder);

// router.delete('/:id', controller.deleteOneById);
// // create printable
// router.get('/DO/:id', controller.createDO);

// router.get('/invoice/:id', controller.createInvoice);

module.exports = router;