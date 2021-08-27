const seedStatus = require("../../models/seedInventory/SeedStatus");

exports.getAllSeedStatus = async (req, res) => {
    const x = await seedStatus.find({}).sort({ id: 1 })
    try {
        if (x.length > 0)
            res.status(200).send({ data: x });

        else
            res.status(200).send({ msg: `No data.` });

    }

    catch (err) {
        res.status(500).send({ msg: `Error while retrieving seed status: ${err.message}.` });
    }
};

exports.getOneByStatusId = async (req, res) => {
    let statusId = req.params.statusId    
    const x = await seedStatus.findOne({ id: statusId })

    try {
        if (x) {
            res.status(200).send({ data: x });
        }

        else
            res.status(200).send({ msg: `No data.` });

    }

    catch (err) {
        res.status(500).send({
            msg: `Error while retrieving seed status with id= ${statusId}: ${err.message}.`,
        })
    }
};

exports.createNewStatus = async function (req, res) {
    let newSeedStatus = new seedStatus({
        id: '',
        status: req.body.status,
    })

    let existSeedStatus = await seedStatus.find()
    try {
        if (existSeedStatus.length > 0) {
            newSeedStatus.id = existSeedStatus.length
        }

        else {
            newSeedStatus.id = 1
        }

        const x = await newSeedStatus.save()
        try {
            res.status(200).send({ msg: `Successfully create seed status.`, data: x });

        }
        catch (err) {
            res.status(500).send({ msg: `Error while creating seed status: ${err.message}.` });
        }

    }

    catch (err) {
        res.status(500).send({ msg: `Error while creating seed status: ${err.message}.` });
    }
};


exports.updateOneByStatusId = async (req, res) => {
    let statusId = req.params.statusId;

    // only allow to edit seed status
    let updatedSeedStatus = {
        id: statusId,
        status: req.body.status
    }
    const x = await seedStatus.findOneAndUpdate({ id: statusId }, updatedSeedStatus, {
        upsert: false,
        useFindAndModify: false,
        returnOriginal: false
    })
    try {

        if (x) {
            res.status(201).send({
                msg: `Successfully update seed statusId with id= ${statusId}.`,
                data: x
            });
        }

        else {
            res.status(200).send({ msg: `Unable to update seed status with id= ${statusId}. Please try again.` })
        }
    }

    catch (err) {
        res.status(500).send({ msg: `Error while updating seed status with id= ${statusId}: ${err.message}.` });
    }
};

exports.deleteOneByStatusId = async (req, res) => {
    let statusId = req.params.statusId;

    const x = await seedStatus.findOneAndDelete({ id: statusId })

    try {
        if (x)
            res.send({ msg: `Successfully deleted seed status with id= ${statusId}.` })


        else
            res.status(200).send({ msg: `Unable to update seed status with id= ${statusId}. Please try again.` })
    }

    catch (err) {
        res.status(500).send({ msg: `Error while deleting seed with id= ${statusId}: ${err.message}.` });
    }
};

exports.deleteAll = async (req, res) => {
    const x = await seedStatus.deleteMany({})
    try {
        if (x.n > 0)
            res.status(200).send({ msg: `Successfully deleted ${x.n} seed status.` })

        else
            res.status(304).send({ msg: `Unable to delete seed status. Please try again.` })
    }

    catch (err) {
        res.status(500).send({ msg: `Error while deleting seed status: ${err.message}.`, });
    }
};
