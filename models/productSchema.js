const mongoose = require("mongoose");

const { Schema } = mongoose;

const productSchema = new Schema({
    id: {
        type: String,
        required: true,
    },
    productName: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    brand: {
        type: String,
        required: true,
    },
    category: {
        type: Schema.Types.ObjectId, 
        ref: 'Category', 
        required: true,
    },
    regularPrice: {
        type: Number,
        required: true,
    },
    salePrice: {       
        type: Number,
        required: true,
    },
    productOffer: {
        type: Number,
        default: 0,
    },
    quantity: {
        type: Number,
        required: true,
    },
    color: {
        type: String,
        required: true,
    },
    productImage: {
        type: Array,
        required: true,
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
    status: {
        type: String,
        required: false,
    },
    createdOn: {
        type: String,
        required: true,
    }, 
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
