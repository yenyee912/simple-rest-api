const mongoose = require("mongoose");
let Schema = mongoose.Schema;

const SeedStatusSchema = new Schema ({
        id: {
            type: Number,
            required: true
        },

        status: {
            type: String,
            required: true
        },
        
        
      });

//mongoose.model(collectionSingularName, schema, collectionEXACTname)    
const SeedStatus = mongoose.model("seedStatus", SeedStatusSchema, "seedStatus");

module.exports = SeedStatus;