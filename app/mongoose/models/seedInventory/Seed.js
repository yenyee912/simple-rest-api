const mongoose = require("mongoose");
let Schema = mongoose.Schema;

const SeedSchema = new Schema ({
        seedId: {
            type: String,
        },
        
        scientificName: {
            type: String,
        },
        
        brand: {
            type: String,
        },
        
        cultivarId: {
            type: Number,
        },  

        quantity: {
            type: Number,
        },
        
        imagePath: {
            type: String, 
        },  

        imageName: {
            type: String,
        }, 
 
        width: {
            type: Number,
        }, 

        height: {
            type: Number,
        }, 
        
        description: {
            type: String,

        },

        url: {
            type: String,
        },

        verify:{
            type: Boolean
        },

        editBy: {
            type: String,
        },
        
        lastEdit: {
            type: String,
        },
        
        //---not in use---
        prices: {
            type: Number,
        },
        visualRating: {
            type: Number
        },

        germinationRating: {
            type: Number
        },
      });

//mongoose.model(collectionSingularName, schema, collectionEXACTname)    
const Seed = mongoose.model("seeds", SeedSchema, "seeds");

module.exports = Seed;