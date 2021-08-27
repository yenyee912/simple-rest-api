var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const cultivarSchema = new Schema({
    id: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    nonSaleable: {
        type: Number,
    },
})

const harvestSchema = new Schema({
    lastEdit: {
        type: String,
        required: true
    },
    editBy: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    harvest: {
        type: Number,
        required: true
    },
    rackNo: {
        type: Number,
        required: true
    },
    tier: {
        type: Number,
        required: true
    },
    experiment: {
        type: Number,
        required: true
    },
    germinationDate: {
        type: String,
        required: true
    },
    transplantDate: {
        type: String,
        required: true
    },
    harvestDate: {
        type: String,
        required: true
    },
    cultivar: [cultivarSchema]
});

// Export the model
module.exports = mongoose.model('harvest', harvestSchema, 'harvest');