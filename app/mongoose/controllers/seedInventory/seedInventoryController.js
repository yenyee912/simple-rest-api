const seedInv = require("../../models/seedInventory/SeedInventory")
const _ = require("lodash")

exports.getSeedInventory = async (req, res) => {
  //status: 0 - inactive, 1 - expired, 2 - discard, 3 - in-transit,
  //4- active, 5 -in-farm, 6 - in-use, 7-other

  let queries = {}
  let groupItem = {}


  if (req.query.destination) {
    queries['currentDestination'] = { $eq: parseInt(req.query.destination) }
  }

  if (req.query.location) {
    queries['currentLocation'] = { $eq: parseInt(req.query.location) }
  }

  if (req.query.status) {
    queries['status'] = { $eq: parseInt(req.query.status) }
  }

  // console.log(queries)

  groupItem = {
    seedId: "$seedId",
    cultivarId: "$cultivarId",
    status: "$status",
    currentLocation: "$currentLocation",
    currentDestination: "$currentDestination",
  }

  const x = await seedInv.aggregate([
    {
      $match: queries
    },
    {
      $group: {
        _id: groupItem,
        quantity: { $sum: 1 }
      }
    },
  ])

  try{

  if (x.length > 0) {
    let formattedList = _(x).sortBy(['quantity'])
      .map(item => {
        return {
          seedId: item._id.seedId,
          cultivarId: item._id.cultivarId,
          status: item._id.status,
          currentLocation: item._id.currentLocation,
          currentDestination: item._id.currentDestination,
          quantity: item.quantity
        }
      })

    res.status(200).send({ data: formattedList })
  }

  else {
    res.status(200).send({ msg: `No data.` });
  }
}
catch(err){
    res.status(500).send({ msg: `Error while retrieving seed inventory: ${err.message}.` });
}

};

exports.getOneSeedInventory = async (req, res) => {
  //status: 0 - inactive, 1 - expired, 2 - discard, 3 - in-transit,
  //4- active, 5 -in-farm, 6 - in-use, 7-other
  let seedId= req.params.seedId
  let queries = {}
  let groupItem = {}


  if (req.query.destination) {
    queries['currentDestination'] = { $eq: parseInt(req.query.destination) }
  }

  if (req.query.location) {
    queries['currentLocation'] = { $eq: parseInt(req.query.location) }
  }

  if (req.query.status) {
    queries['status'] = { $eq: parseInt(req.query.status) }
  }

  // console.log(queries)

  groupItem = {
    seedId: "$seedId",
    cultivarId: "$cultivarId",
    status: "$status",
    currentLocation: "$currentLocation",
    currentDestination: "$currentDestination",
  }

  const x = await seedInv.aggregate([
    {
      $match: queries
    },
    {
      $group: {
        _id: groupItem,
        quantity: { $sum: 1 }
      }
    },
  ])

  try {

    if (x.length > 0) {
      let formattedList = _(x).sortBy(['quantity'])
        .map(item => {
          return {
            seedId: item._id.seedId,
            cultivarId: item._id.cultivarId,
            status: item._id.status,
            currentLocation: item._id.currentLocation,
            currentDestination: item._id.currentDestination,
            quantity: item.quantity
          }
        })

      res.status(200).send({ data: formattedList })
    }

    else {
      res.status(200).send({ msg: `No data.` });
    }
  }
  catch (err) {
    res.status(500).send({ msg: `Error while retrieving seed inventory: ${err.message}.` });
  }

};

exports.getAllRecord = async (req, res) => {
  const x = await seedInv.find({})
  try {
    if (x.length > 0)
      res.status(200).send({ data: x });

    else
      res.status(200).send({ msg: `No data.` });

  }
  catch (err) {
    res.status(500).send({ msg: `Error while retrieving seed inventory records(s): ${err.message}.`, });
  }
};

exports.getOneByObjectId = async (req, res) => {
  let recordId = req.params.id

  const x = await seedInv.findById(recordId)
  try {
    if (x)
      res.status(200).send({ data: x });

    else
      res.status(200).send({ msg: `No data.` });
  }

  catch (err) {
    res.status(500).send({ msg: `Error while updating seed inventory records(s) with id= ${recordId}: ${err.message}.` });
  }
};

exports.deleteAll = async (req, res) => {
  const x = await seedInv.deleteMany({})
  try {
    if (x.n > 0)
      res.status(200).send({ msg: `Successfully deleted ${x.n} seed inventory record(s).` })

    else
      res.status(304).send({ msg: `Unable to delete seed inventory record(s). Please try again.` })
  }

  catch (err) {
    res.status(500).send({ msg: `Error while deleting seed inventory record(s): ${err.message}.` });
  };
};

exports.deleteOneByObjectId = async (req, res) => {
  let id = req.params.id;

  const x = await seedInv.findByIdAndDelete(id)
  try {
    if (x)
      res.status(200).send({ msg: `Successfully deleted seed inventory record with id= ${id}.` })

    else
      res.status(200).send({ msg: `Unable to delete seed inventory record with id= ${id}. Please try again.` })
  }
  catch (err) {
    res.status(500).send({ msg: `Error while deleting seed inventory record with id= ${id}: ${err.message}.` });
  }
};


