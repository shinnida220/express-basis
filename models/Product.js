const mongoose = require('mongoose');

const Product = mongoose.model("Product", new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  size: { type: String },
  colour: { type: String },
  price: { type: Number, required: true },
  categories: { type: Array },
}, { timestamps: true }));

module.exports = Product;