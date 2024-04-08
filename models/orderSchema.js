const mongoose = require("mongoose");

const { Schema } = mongoose;

const orderSchema = new Schema({
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
