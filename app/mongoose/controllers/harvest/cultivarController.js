var Cultivar = require("../../models/harvest/Cultivar");
const Borrow = require("../../models/harvest/Borrow.js");
const moment = require("moment");

exports.createNewCultivar = async (req, res) =>{
    var cultivar = new Cultivar({
        id: req.body.id,
        name: req.body.name,
        aveWeight: req.body.aveWeight,
        price: req.body.price,
        shortcode: req.body.shortcode,
        lastEdit: req.body.lastEdit,
        editBy: req.body.editBy
    });
        
    const x = await cultivar.save(cultivar)

    try {
        if(x){
            res.status(201).send({
                msg: `Successfully create cultivar.`,
                data: x});
        }

        else{
            res.status(200).send({msg: `Unable to create cultivar. Please try again.`})
        }
    } 
    
    catch (err) {
        res.status(500).send({msg: `Error while creating cultivar: ${err.message}`});
    }
};

exports.getOneCultivarById= async(req, res) =>{
    const cultivarId= req.params.id

    const x = await Cultivar.findOne({ _id: cultivarId})

    try {
        if (x) {
            return res.status(200).send({ data: x });
        }

        else
            return res.status(200).send({ msg: `No data.` });
    }

    catch (err) {
        return res.status(500).send({ msg: `Error while retrieving cultivar with id= ${cultivarId}: ${err.message}.`,});
    }
}

exports.getCultivar = async (req, res) => {
    let returningFields= ""
    if (req.query.fields){
            let regex = /,/g
            returningFields = req.query.fields.replace(regex, " ")
    }

    let queries = req.query
    delete queries.fields
    
    try {
    // sort by id (not Object ID)
      const x = await Cultivar.find(queries, returningFields)
      // .populate("category_id")
      .sort({id: 1})

        if (x.length > 0) {
            res.status(200).send({data: x});
        }

        else
            res.status(200).send({ msg: `No data.` });
    }

    catch (err) {
        res.status(500).send({msg: `Error while retrieving cultivars: ${err.message}.`,});
    }
};

exports.updateOneById = async (req, res) => {

    const cultivarId = req.params.id;
    const x = await Cultivar.findByIdAndUpdate(cultivarId, req.body, {
        upsert: false,
        useFindAndModify: false,
        returnOriginal: false
    })
    try {

        if (!x) {
            res.status(200).send({
                msg: `Unable to update cultivar with id= ${cultivarId}. Please try again.`,
            });
        } else {
            res.status(201).send({
                msg: `Successfully update cultivar with id= ${cultivarId}.`,
                data: x
            });
        }
    } catch (err) {
        res.status(500).send({msg: `Error while updating cultivar with id= ${id}: ${err.message}.`});
    }
};

exports.deleteOneById = async (req, res) => {
    const id = req.params.id;
    try {
        const data = await Cultivar.findByIdAndRemove(id)
        if (!data) {
            res.status(200).send({
                msg: `Unable to delete cultivar with id= ${id}. Please try again. `,
            });
        } else {
            res.status(200).send({
                msg:`Successfully deleted cultivar with id= ${id}.`,
            });
        }
    } catch (err) {
        res.status(500).send({
            msg: `Error while deleting cultivar with id= ${id}: ${err.message}.`,
        });
    }
};



exports.deleteAllBorrow = async (req, res) => {
    const x = await Borrow.deleteMany({})

    try {
        if (x.n > 0)
            res.status(200).send({ msg: `Successfully deleted ${x.n} borrow record(s).` })

        else
            res.status(200).send({ msg: `Unable to delete borrow record(s). Please try again.` })

    }

    catch (err) {
        res.status(404).send({ msg: `${err.message}` })
    }
}

exports.createNewBorrow = async (req, res) => {
    let newBorrow = new Borrow({
        createdAt: moment().format("YYYY-MM-DD"),
        cultivarId: req.body.cultivarId,
        name: req.body.name,
        quantity: req.body.quantity,
        farmLocation: req.body.farmLocation,
        orderNumber: req.body.orderNumber,
        originalDate: req.body.originalDate,
        modifiedDate: req.body.modifiedDate,
        borrowedBy: req.body.borrowedBy,
        consentTo: req.body.consentTo,
        rackNo: req.body.rackNo,
        tierNo: req.body.tierNo,
    })

    const x = await newBorrow.save()

    try {
        if (x)
            res.status(201).send({
                msg: `Successfully create borrow record.`,
                data: x
            });

        else
            res.status(200).send({ msg: `Unable to create borrow record. Please try again.` })

    }

    catch (err) {
        res.status(500).send({ msg: `Error while creating borrow record: ${err.message}` });
    }
}

exports.filterBorrow = async (req, res) => {
    let queries = req.query

    const x = await Borrow.find(queries)

    try {
        if (x.length > 0)
            res.status(200).send({ data: x });

        else
            res.status(200).send({ msg: `No dataasasa.` });

    }

    catch (err) {
        res.status(500).send({ msg: `Error while retrieving borrow record(s): ${err.message}.`, });
    }
}

exports.updateBorrowById = async (req, res) => {

    const id = req.params.id;

    const x = await Borrow.findByIdAndUpdate(id, req.body, {
        upsert: false,
        useFindAndModify: false,
        returnOriginal: false
    })
    try {

        if (!x) {
            res.status(200).send({
                msg: `Unable to update borrow record with id= ${id}. Please try again.`,
            });
        } else {
            res.status(201).send({
                msg: `Successfully update borrow record with id= ${id}.`,
                data: x
            });
        }
    } catch (err) {
        res.status(500).send({ msg: `Error while updating borrow record with id= ${id}: ${err.message}.` });
    }
};
