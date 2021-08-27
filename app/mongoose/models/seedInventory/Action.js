const mongoose = require("mongoose");
let Schema = mongoose.Schema;

const ActionSchema = new Schema ({
        id: {
            type: Number,
            required: true
        },

        action: {
            type: String,
            required: true
        },
        
        
      });

//mongoose.model(collectionSingularName, schema, collectionEXACTname)    
const Action = mongoose.model("action", ActionSchema, "action");

module.exports = Action;