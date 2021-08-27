const mongoose = require("mongoose");
let Schema = mongoose.Schema;

const BorrowHarvestSchema = new Schema({
    createdAt: {
        type: String,
        required: true
    },

    cultivarId: {
        type: Number,
        required: true
    },

    name: {
        type: String,
        required: true
    },

    quantity: {
        type: Number,
        required: true
    },

    farmLocation: {
        type: String,
        required: true
    },

    orderNumber: {
        type: String,
        required: true
    },

    // mm-dd-yyyy
    originalDate: {
        type: String,
        required: true
    },

    modifiedDate: {
        type: String,
        required: true
    },

    borrowedBy: {
        type: String,
        required: true
    },

    consentTo: {
        type: String,
        // required: true
    },

    rackNo: {
        type: Number,
        // required: true
    },

    tierNo: {
        type: Number,
        // required: true
    },


});

const borrowHarvest = mongoose.model("borrowHarvest", BorrowHarvestSchema, "borrowHarvest");

module.exports = borrowHarvest;
