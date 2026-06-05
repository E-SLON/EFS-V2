const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productId:    { type: Number, required: true, unique: true },
  name:         { type: String, required: true, trim: true },
  brand:        { type: String, required: true, trim: true },
  price:        { type: Number, required: true },
  originalPrice:{ type: Number },
  size:         { type: String, default: '50ml' },
  tag:          { type: String, enum: ['oud','floral','fresh','oriental','gourmand','woody','unisex'], required: true },
  tagLabel:     { type: String, required: true },
  description:  { type: String, required: true },
  topNotes:     { type: String },
  heartNotes:   { type: String },
  baseNotes:    { type: String },
  occasion:     { type: String },
  gender:       { type: String, enum: ['men','women','unisex'], default: 'unisex' },
  icon:         { type: String, default: '🧴' },
  imageFile:    { type: String, default: '' },
  inStock:      { type: Boolean, default: true },
  featured:     { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
