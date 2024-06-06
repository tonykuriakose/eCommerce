const mongoose = require("mongoose");
const { Schema } = mongoose;

const returnSchema = new Schema({
  orderId: {
    type: Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Processed'],
    default: 'Pending'
  },
  createdOn: {
    type: Date,
    default: Date.now
  }
});

const Return = mongoose.model('Return', returnSchema);
module.exports = Return;
