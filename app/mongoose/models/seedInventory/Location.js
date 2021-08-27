const mongoose = require("mongoose");
let Schema = mongoose.Schema;

const LocationSchema = new Schema ({
        id: {
            type: Number,
            required: true
        },

        location: {
            type: String,
            required: true
        },

        alert: {
            type: Number,
            required: true
        },

        isSubscribe: {
            type: Boolean,
            required: true
        },

        subscriptionMail: {
            type: String,
            required: true
        }
        
        
      });

//mongoose.model(collectionSingularName, schema, collectionEXACTname)    
const Location = mongoose.model("location", LocationSchema, "location");

module.exports = Location;