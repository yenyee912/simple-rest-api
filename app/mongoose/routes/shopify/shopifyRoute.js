var router = require("express").Router();

const controller = require("../../controllers/shopify/shopifyController.js");

router.get('/create/DO/:orderNumber', controller.createDeliveryNote);

module.exports = router;