//Inventory
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const totalSchema = new Schema({
    id: {
        type: Number,
        // required: true
    },
    name: {
        type: String,
        // required: true
    },
    total: {
        type: Number,
        // required: true
    },
    sold: {
        type: Number,
        // required: true
    },
    unsold: {
        type: Number,
        // required: true
    }
})

const inventorySchema = new Schema({
    location: {
        type: String
    },
    date: {
        type: String
    },
    lastUpdatedOn: {
        type: String
    },
    cultivar: [totalSchema]
});

// Export the model
module.exports = mongoose.model('inventory', inventorySchema, 'inventory');