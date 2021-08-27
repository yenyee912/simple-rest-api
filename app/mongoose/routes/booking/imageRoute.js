var express = require('express');
var router = express.Router({mergeParams: true});

var imageController = require('../../controllers/booking/imageController');
const upload = require("../../middleware/upload");

router.get('/', imageController.getImageByDO)

router.get('/:fileName', imageController.getOneImageByDO)

router.post('/', upload.array("image", 5), imageController.uploadBookingImages)

router.delete('/', imageController.deleteImageByDO)

module.exports = router;