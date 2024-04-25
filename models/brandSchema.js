const mongoose = require('mongoose');

const brandSchema = mongoose.Schema({
    brandName: {
        type: String,
        required: true
    },
    brandImage: {
        type : Array,
        required : true
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now 
    }
})

const Brand = mongoose.model('Brand', brandSchema);

module.exports = Brand