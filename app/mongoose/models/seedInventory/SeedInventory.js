const mongoose = require('mongoose')
let Schema = mongoose.Schema

const historySchema = new Schema({
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
        // required: true,
      },
    
})

const uniqueSeedEntrySchema = new Schema(
    {
        seedId:{
            type: String,
            required: true
        },

        cultivarId:{
            type:Number,
            // required: true
        },

        expYear:{
            type:Number,
            // required: true
        },

        currentLocation:{
            type:Number,
            required: true
        },

        currentDestination:{
            type:Number,
            required: true
        },

        status:{
            type:Number,
            required: true
        },

        sticker:{
            type:String,
        },

        history: [historySchema],

        remarks:{
            type:String,
        },
        
        // under rating{}
        germination:{
            type:Number,
        },

        size:{
            type:Number,
        },
  
    }

)

const uniqueEntry = mongoose.model('seedInventory', uniqueSeedEntrySchema, 'seedInventory')
module.exports= uniqueEntry;