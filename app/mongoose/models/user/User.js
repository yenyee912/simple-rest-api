const mongoose = require("mongoose");
var Schema = mongoose.Schema;

const baseOptions = {
  discriminatorKey: '__type',
  collection: 'os.users'
};

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  verify: {
    type: Boolean,
    required: true,
  },
  verifyHash: {
    type: String,
  },
  // resetPasswordToken: {
  //   type: { type: String,} 
  // },
  resetPasswordToken: {
    type: String, 
  },
  resetPasswordExpires: {
    type: Date,
  },
  lastLogin: {
    type: Date
  },
}, baseOptions);

const User = mongoose.model("os.users", UserSchema, "os.users");

module.exports = User;