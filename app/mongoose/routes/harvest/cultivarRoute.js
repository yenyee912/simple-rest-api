var express = require('express');
var router = express.Router();

var controller = require('../../controllers/harvest/cultivarController');

router.param('id', function (req, res, next, id) {
    req.id_from_param = id;
    next();
});

router.get('/', controller.getCultivar);

router.get("/borrow", controller.filterBorrow);

router.post("/borrow", controller.createNewBorrow);

router.put('/borrow/:id', controller.updateBorrowById);

router.delete("/borrow", controller.deleteAllBorrow);

// :id= ObjectID
router.get('/:id', controller.getOneCultivarById);

router.put('/:id', controller.updateOneById);

router.post('/', controller.createNewCultivar);

router.delete('/:id', controller.deleteOneById);



module.exports = router;