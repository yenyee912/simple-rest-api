const mongoose = require("mongoose");
const User = require('./User');
var Schema = mongoose.Schema;

const CustomerSchema = new Schema({
    mobile: {
        type: String,
    },
    organization: {
        type: String,
    },
    designation: {
        type: String,
    },
    address1: {
        type: String,
        // required: true,
    },
    address2: {
        type: String,
        // required: true,
    },
    address3: {
        type: String,
        // required: true,
    },
    postcode: {
        type: String,
        // required: true,
    },
    city: {
        type: String,
        // required: true,
    },
    state: {
        type: String,
        // required: true,
    },
});

const Customer = User.discriminator("customer", CustomerSchema, "customer");

module.exports = Customer;