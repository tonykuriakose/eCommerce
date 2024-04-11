const mongoose = require("mongoose");
const { Schema } = mongoose;
const { v4: uuidv4 } = require('uuid');

const orderSchema = new Schema({
    orderId: {
        type: String,
        default: uuidv4 // Set default value to generate random unique order ID
    },
    product: {
        type: Array,
        required: true
    },
    totalPrice: {
        type: Number,
        required: true
    },
    address: {
        type: Array,
        required: true
    },
    payment: {
        type: String,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        required: true
    },
    createdOn: {
        type: Date,
        required: true
    },
    date: {
        type: String
    }
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
