const mongoose = require("mongoose");
var Schema = mongoose.Schema;

const itemSchema = new Schema({
  id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'cultivars'
  },
  name: {
    type: String,
  },
  quantity: {
    type: Number,
  },
});

const binBookingSchema = new Schema({
  orderDate: {
    type: String,
  },   
  deliveryDate: {
    type: String,
  }, 
  PO: {
    type: String,
  },
  isFulfilled: {
    type: Boolean,
  },
  farmLocation: {
    type: String,
  },
  email: {
    type: String,
  },
  remarks: {
    type: String,
  },
  binCount: {
    type: Number,
  },
  content: [itemSchema],
  totalPaid: {
    type: Number,
  }
});

const BinBooking = mongoose.model("bin_booking", binBookingSchema, "bin_booking");

module.exports = BinBooking;