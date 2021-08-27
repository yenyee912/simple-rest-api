var express = require('express');
var router = express.Router();

var controller = require('../../controllers/booking/bookingController');
var inventoryCtrl = require('../../controllers/booking/inventoryController');

var imageAPI = require('../../routes/booking/imageRoute');

router.param('id', function (req, res, next, id) {
  console.log('hshhshshs')
  req.id_from_param = id;
  next();
});

router.get('/inventory/weight', inventoryCtrl.getWeight);

router.get('/', controller.getAllOrders);

router.get('/:id', controller.getOrderById);

router.put('/:id', controller.updateOrderById);

router.post('/', controller.createNewOrder);

router.delete('/:id', controller.deleteOneById);

// create printable
router.get('/DO/:id', controller.createDO);

router.get('/invoice/:id', controller.createInvoice);

router.use('/:DOnumber/images', function (req, res, next) {
  req.DOnumber = req.params.DOnumber;
  next()
}, imageAPI)



module.exports = router;