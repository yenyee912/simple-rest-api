const Seed = require("../../models/seedInventory/Seed.js");
const path = require('path');
const fs = require('fs');

async function checkUnique(id) {
  const x = await Seed.findOne({ seedId: id })
  try {
    if (x)
      return false

    else
      return true
  }

  catch (err) {
    console.log(err.message)
  }
}

exports.getAllSeed = async (req, res) => {
  const x = await Seed.find({})

  try {
    if (x.length > 0)
      res.status(200).send({ data: x });

    else
      res.status(200).send({ msg: `No data.` });
  }

  catch (err) {
    res.status(500).send({ msg: `Error while retrieving seeds: ${err.message}.`});
  }
};

exports.getOneSeedBySeedId = async (req, res) => {
  let seedId = req.params.seedId

  const x = await Seed.findOne({ seedId: seedId })
  try {
    if (x)
      res.status(200).send({ data: x });

    else
      res.status(200).send({ msg: `No data.` });
  }

  catch (err) {
    res.status(500).send({ msg: `Error while retrieving seed with id= ${seedId}: ${err.message}.` });
  }
};

exports.createNewSeed = async (req, res) => {
  let brandCode = req.body.brand.toString().toLowerCase().replace(/\s/g, '').substring(0, 8)
  
  let seed = new Seed(
    {
      seedId: `${brandCode}-${req.body.cultivarId}-${req.body.quantity}`,
      scientificName: req.body.scientificName,
      brand: req.body.brand,
      cultivarId: req.body.cultivarId,
      height: req.body.height,
      width: req.body.width,
      description: req.body.description,
      quantity: req.body.quantity,
      url: req.body.url,
      verify: false,
      editBy: req.body.editBy,
      lastEdit: req.body.lastEdit

      //visualRating: req.body.visualRating,
      //germinationRating: req.body.germinationRating,
      //prices: req.body.prices,
    }
  )

  if (req.file == undefined) {
    seed.image = req.body.image
    seed.imageName = req.body.imageName

  }

  else {
    let tempPath = req.file.path
    let extension = path.extname(req.file.originalname)
    let targetPath = path.resolve('./images/seeds/' + seed.seedId + extension)
    let newPath = fs.rename(tempPath, targetPath, function (err) {
      console.log(newPath)
    })
    seed.imageName = `${seed.seedId}${extension}`;
    seed.imagePath = `/seeds/${seed.seedId}${extension}`;
  }

  const isUnique = await checkUnique(seed.seedId)

  if (!isUnique) {
    res.status(200).send({ msg: `Sorry, seed exists. Please check the seed list.` })
  }

  else {
    const x = await seed.save()
    try {
      if(x)
        res.status(201).send({ msg: `Successfully create seed.`, data: x });
      
      else
        res.status(200).send({ msg: `Unable to create seed. Please try again.` })
    }
    catch (err) {
      res.status(500).send({ msg: `Error while creating seed: ${err.message}.`, });
    }
  }
};

exports.updateOneBySeedId = async (req, res) => {
  const seedId = req.params.seedId;

  let brandCode = req.body.brand.toString().toLowerCase().replace(/\s/g, '').substring(0, 8)
  let seed = {
    seedId: `${brandCode}-${req.body.cultivarId}-${req.body.quantity}`,
    scientificName: req.body.scientificName,
    brand: req.body.brand,
    cultivarId: req.body.cultivarId,
    height: req.body.height,
    width: req.body.width,
    description: req.body.description,
    quantity: req.body.quantity,
    url: req.body.url,
    verify: req.body.verify
  }

  if (req.file != undefined) {
    let tempPath = req.file.path
    let extension = path.extname(req.file.originalname)
    let targetPath = path.resolve('./images/seeds/' + seed.seedId + extension)

    let newPath = fs.rename(tempPath, targetPath, function (err) {
      console.log(newPath)
    })
    // console.log(targetPath + " ")
    seed.imageName = `${seed.seedId}${extension}`;
    seed.imagePath = `/images/seeds/${seed.seedId}${extension}`;
  }

  const x = await Seed.findOneAndUpdate({ seedId: seedId }, seed, {
    upsert: false,
    useFindAndModify: false,
    returnOriginal: false
  })
  try {
    if(x){
      res.status(201).send({
        msg: `Successfully update seed with id= ${seedId}.`,
        data: x
      });
    }

    else{
      res.status(200).send({ msg: `Unable to update seed with id= ${seedId}. Please try again.` })

    }
  }
  catch (err) {
    res.status(500).send({ msg: `Error while updating seed with id= ${seedId}: ${err.message}.` });
  }

};


exports.deleteOneBySeedId = async (req, res) => {
  const seedId = req.params.seedId;

  const x = await Seed.findOneAndDelete({ seedId: seedId })
  try {
    if (x)
      res.status(200).send({ msg: `Successfully deleted seed with id= ${seedId}.` })

    else
      res.status(200).send({ msg: `Unable to delete seed with id= ${seedId}. Please try again.` })
  }
  catch (err) {
    res.status(500).send({ msg: `Error while deleting seed with id= ${seedId}: ${err.message}.` });
  }
};

exports.deleteAll = async (req, res) => {
  const x = await Seed.deleteMany({})
  try {
    if (x.n > 0)
      res.status(200).send({ msg: `Successfully deleted ${x.n} seed(s).` })

    else
      res.status(200).send({ msg: `Unable to delete seed(s). Please try again.` })  }

  catch (err) {
    res.status(500).send({ msg: `Error while deleting seed(s): ${err.message}.` });
  };
};