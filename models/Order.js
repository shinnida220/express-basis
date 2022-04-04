const mongoose = require('mongoose');

const Order = mongoose.model("Order", new mongoose.Schema({
  userId: { type: String, required: true },
  products: [{
    productId: { type: String },
    quantiity: { type: Number, default: 1 }
  }],
  amount: { type: Number, required: true },
  address: { type: Object, required: true },
  status: { type: String, default: 'pending' }
}, { timestamps: true }));

module.exports = Order;