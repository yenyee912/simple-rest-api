
const _ = require("lodash");
const moment = require("moment");
const Farm = require("./models/agri/Farm.js");
const Cultivar = require("./models/harvest/Cultivar.js");
const Location = require("./models/seedInventory/Location.js");
const Action = require("./models/seedInventory/Location.js");
const User = require("./models/user/User")

var cultivarList = []
var locationList = []
var actionList = []
var userList = []

getAllData()

async function getAllData() {
  // await Promise.all([
  //   getCultivar(), getLocation(), getAction(), getUser()
  // ])

  await getCultivar()
  await getLocation()
  await getAction()
  await getUser()
}

async function getLocation() {
  try {
    const x = await Location.find({}).sort({ id: 1 })

    locationList = x
    return x
  }

  catch (err) {
    console.log(err.message)
  }

}

async function getAction() {
  try {
    const x = await Action.find({}).sort({ id: 1 })
    actionList = x
    return x
  }

  catch (err) {
    console.log(err.message)
  }

}

async function getCultivar() {
  try {
    const x = await Cultivar.find({}).sort({ id: 1 })

    cultivarList = x
    return x

  }

  catch (err) {
    console.log(err.message)
  }

}

async function getUser() {
  try {
    const x = await User.find({})

    userList = x
    return x

  }

  catch (err) {
    console.log(err.message)
  }

}

async function getSeed() {
  try {
    const x = await Seed.find({})

    seedList = x
    return x
  }

  catch (err) {
    console.log(err.message)
  }

}

exports.bindLocationInfo = async (id) => {
  return locationList.filter(obj => {
    return obj.id == id
  })[0]
}

exports.bindActionInfo = async (id) => {
  return actionList.filter(obj => {
    return obj.id == id
  })[0]
}

exports.bindCultivarInfo = async (id) => {
  return cultivarList.filter(obj => {
    return obj.id == id
  })[0]
}

exports.allLocation = async () => {
  return await getLocation()
}

exports.allAction = async () => {
  return await getAction()
}

exports.allCultivar = async () => {
  return await getCultivar()
}

exports.bindUserInfoByEmail = async (email) => {
  return userList.filter(obj => {
    return obj.email == email
  })[0]
}




