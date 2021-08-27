const mongoose = require("mongoose");
var Schema = mongoose.Schema;

const itemSchema = new Schema({
  id: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    // required: true,
  },
  bookingWeight: {
    type: Number,
    required: true,
  },
  actualWeight: {
    type: Number,
  },
  receivedWeight: {
    type: Number,
  },
  price: {
    type: Number,
  },
});

const dailyBookingSchema = new Schema({
  deliveryDate: {
    type: String,
    required: true,
  },
  itemOrdered: [itemSchema],
});

const bookingSchema = new Schema({
  DO: {
    type: String,
    required: true,
  },
  fulfilled: {
    type: Boolean,
    required: true,
  },
  farmLocation: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  orderDate: {
    type: String,
    required: true,
  },
  remarks: {
    type: String,
  },
  booking: [dailyBookingSchema],
});

const Booking = mongoose.model("booking", bookingSchema, "booking");

module.exports = Booking;