const Harvest = require("../../models/harvest/Harvest.js");
var _ = require("lodash");
var moment = require("moment");
var dataStore = require("../../dataStore.js")
moment().format();

var allLocation = []
async function getData() {
  allLocation = await dataStore.allLocation()
}
getData()

let dateList = {
  0: "germinationDate",
  1: "transplantDate",
  2: "harvestDate",
};

exports.createNewTransplantEntry = async (req, res) => {

  let transplantRecord = new Harvest({
    lastEdit: req.body.lastEdit,
    editBy: req.body.editBy,
    name: req.body.name,
    location: req.body.location,
    harvest: req.body.harvest,
    rackNo: req.body.rackNo,
    tier: req.body.tier,
    experiment: req.body.experiment,
    germinationDate: req.body.germinationDate,
    transplantDate: req.body.transplantDate,
    harvestDate: req.body.harvestDate,
    cultivar: req.body.cultivar,
  });

  const x = await transplantRecord.save()

  try {
    if (x)
      res.status(201).send({ msg: `Successfully create transplant record.`, data: x });

    else
      res.status(200).send({ msg: `Unable to create transplant record. Please try again.` })
  }

  catch (err) {
    res.status(500).send({ msg: `Error while creating transplant record: ${err.message}` });
  }
};

exports.getAllTransplantRecords = async (req, res) => {
  let returningFields = ''
  if (req.query.fields) {
    let regex = /,/g
    returningFields = req.query.fields.replace(regex, ' ')
  }

  let queries = req.query
  delete queries.fields

  let farmLoc = ''
  if (req.query.location != null && req.query.location != "") {
    farmLoc = allLocation.filter(obj => { return obj.id == req.query.location })[0]
    if(farmLoc)
      queries["location"] = {$regex: farmLoc.location}
    else
      queries["location"] = -1


  }

  const x = await Harvest.find(queries, returningFields).sort({ _id: -1 })
  try {
    if (x.length > 0) {
      res.status(200).send({ data: x })
    }

    else {
      res.status(200).send({ msg: `No data.` });
    }
  }

  catch (err) {
    res.status(500).send({ msg: `Error while retrieving transplant records(s): ${err.message}` });
  }
};

exports.getCalendarHarvestData = async (req, res) => {
  let date = moment(req.query.date, "YYYY-MM-DD"); //harvest only

  let queries = {}
  let farmLoc = {}

  if (req.query.location != null && req.query.location != "") {
    farmLoc = allLocation.filter(obj => { return obj.id == req.query.location })[0]
    if (farmLoc)
      queries["location"] = { $regex: farmLoc.location }
    else
      queries["location"] = -1
  }

  if (date != null && date != "") {
    queries["harvestDate"] = {
      $eq: date.format("MM-DD-YYYY"),
    };
  }

  const x = await Harvest.find(queries)
  try {
    if (x.length > 0) {
      let summed = _(x)
        .flatMap("cultivar")
        .groupBy("name")
        .map((objs, key) => {
          return {
            title: _.sumBy(objs, "quantity") + " x " + key,
            start: date.format("YYYY-MM-DD"),
          };
        })
        .value();

      res.status(200).send(summed)
    }

    else {
      res.status(200).send({ msg: `No data.` })
    }
  }

  catch (err) {
    res.status(500).send({ msg: `Error while retrieving data: ${err.message}.`, });
  }
};

exports.getCultivarsWithDateType = async (req, res) => {
  let queries= {}
  const typeOfDate = req.query.typeOfDate;

  const startDate = moment(req.query.startDate, "YYYY-MM-DD");
  const endDate = moment(req.query.endDate, "YYYY-MM-DD");

  // change the date format to MM-DD-YYYY
  var startOfWeek = moment(startDate, "MM-DD-YYYY");
  var endOfWeek = moment(endDate, "MM-DD-YYYY");
  var days = [];
  var day = startOfWeek;

  while (day <= endOfWeek) {
    days.push(day.format("MM-DD-YYYY"));
    day = day.clone().add(1, "d");
  }

  if (req.query.location != null && req.query.location != "") {
    let farmLoc = allLocation.filter(obj => { return obj.id == req.query.location })[0]
    farmLoc = allLocation.filter(obj => { return obj.id == req.query.location })[0]
    if (farmLoc)
      queries["location"] = { $regex: farmLoc.location }
    else
      queries["location"] = -1
  }

  if (startDate != null && startDate != "") {
    queries[dateList[typeOfDate]] = { //queries.dateList[typeOfDate]
      $in: days,
    };
  }

  const x = await Harvest.find(queries).sort({ id: -1 })
  try {
    if (x.length>0) {
      var summed = _(x)
        .flatMap("cultivar")
        .groupBy("name")
        .map((objs, key) => {
          return {
            name: key,
            quantity: _.sumBy(objs, "quantity"),
          };
        })
        .value();
      summed = _.reject(summed, {
        quantity: 0
      });
      
      res.status(200).send({ data: summed });
    }

    else{
      res.status(200).send({ msg: `No data.` });
    }
  }
  catch (err) {
    res.status(500).send({ msg: `Error while retrieving data: ${err.message}` });

  };
};

exports.getOneTransplantRecordById = async (req, res) => {
  const id = req.params.id;

  const x = await Harvest.findById(id)

  try {
    if (x) {
      res.status(200).send({ data: x });
    }

    else {
      res.status(200).send({ msg: `No data.` });
    }
  }

  catch (err) {
    res.status(500).send({ msg: `Error while retrieving transplant record with id= ${id}: ${err.message}.`, });
  }
};

exports.updateOneById = async (req, res) => {

  const id = req.params.id;
  const x = await Harvest.findByIdAndUpdate(id, req.body, {
    upsert: false,
    useFindAndModify: false,
    returnOriginal: false
  })

  try {
    if (x) {
      res.status(201).send({
        msg: `Successfully update transplant record with id= ${id}.`,
        data: x
      })
    }

    else {
      res.status(200).send({
        msg: `Unable to update transplant record with id= ${id}. Please try again.`,
      });
    }
  }
  catch (err) {
    res.status(500).send({ msg: `Error while updating transplant record with id= ${id}: ${err.message}.` });

  }
};

//done
exports.deleteOneById = async (req, res) => {
  const id = req.params.id;

  const x = await Harvest.findByIdAndRemove(id)
  try {
    if (!x) {
      res.status(200).send({
        msg: `Successfully deleted transplant record with id= ${id}.`,
      });
    }
    else {
      res.status(200).send({ msg: `Unable to delete transplant record with id= ${id}. Please try again.` })
    }
  }
  catch (err) {
    res.status(500).send({ msg: `Error while deleting transplant record with id= ${id}: ${err.message}.` });
  }
};

//done
exports.deleteAll = async (req, res) => {
  const x = await Harvest.deleteMany({})
  try {
    if (x.n > 0)
      res.status(200).send({ msg: `Successfully deleted ${x.n} transplant record(s).` })

    else
      res.status(200).send({ msg: `Unable to delete transplant record(s). Please try again.` })
  }
  catch (err) {
    res.status(500).send({ msg: `Error while deleting transplant record(s): ${err.message}.` });

  }
};