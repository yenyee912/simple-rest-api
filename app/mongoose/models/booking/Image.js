const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    DO: {
        required: true,
        type: Number,
    },

    remarks: {
        // required: true,
        type: String,
    },

    // for multiple uploads
    fileName: [{
        required: true,
        type: String,
    }],
    filePath: [{
        required: true,
        type: String,
    }],
    
    createdAt: {
        default: Date.now(),
        type: Date,
    },
});

module.exports = mongoose.model('image', ImageSchema, 'images');