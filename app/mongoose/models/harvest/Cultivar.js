const mongoose = require("mongoose");
var Schema = mongoose.Schema;

const CultivarSchema = new Schema({
    id: {
        type: Number,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    aveWeight: {
        type: Number,
    },
    price: {
        type: Number,
    },
    shortcode: {
        type: String,
        required: true
    },
    category_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'cultivar_categories'
    },
    active: {
        type: Boolean,
    },
    lastEdit:{
        type: String,
        // required: true
    },
    editBy:{
        type: String,
        required: true
    },
});

const Cultivar = mongoose.model("cultivars", CultivarSchema, "cultivars");

module.exports = Cultivar;