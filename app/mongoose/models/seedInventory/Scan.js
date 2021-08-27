const mongoose = require("mongoose");
let Schema = mongoose.Schema;

const scanItemSchema = new Schema({
  seedId: {
    type: String,
    required: true,
  },

  cultivarId: {
    type: Number,
    required: true,
  },

  quantity: {
    type: Number,
    required: true,
  },

  expYear:{
    type:Number,
    // required: true
  },

  //optional: when status==7, can let user fill in (eg: lost, deffective etc)
  remarks:{
    type:String,
  }
})

const scanRecordSchema = new Schema({
  staffEmail: {
    type: String,
    required: true,
  },

  staffName: {
    type: String,
    required: true,
  },

  timestamp: {
    type: String,
    required: true,
  },

  //0-none, 1-scan in, 2-scan out, 3-farm in, 4-discard, 5-transfer
  action:{
    type: Number,
    required:true,
  },

  //0-none, 1-hq, 2-melawati, 3-langkawi, 4-sgbuloh
  scanLocation: {
    type: Number,
    required: true,
  },

  scanDestination: {
    type: Number,
    required: true,
  },

  scanStatus: {
    type: String,
    required: true,
  },

  feedbackMessage:{
  
    uniqueFeedbackMsg: {
      type: Array,
      required: true,
    },
  
    successRecord: {
      type: Array,
      // required: true,
    },
  },
  scanList: [scanItemSchema],

  //optional:
});

const scanRecord = mongoose.model("scanList", scanRecordSchema, "scanList");
module.exports = scanRecord;