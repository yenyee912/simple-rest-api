const mongoose = require("mongoose");
const User = require('./User');
var Schema = mongoose.Schema;

const StaffSchema = new Schema({
    designation: {
        type: String,
    },
});

const Staff = User.discriminator("staff", StaffSchema, "staff");

module.exports = Staff;