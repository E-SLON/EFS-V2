const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  productId:  { type: Number, required: true },
  name:       { type: String, required: true },
  brand:      { type: String, required: true },
  price:      { type: Number, required: true },
  qty:        { type: Number, required: true, min: 1 },
  size:       { type: String, default: '50ml' }
});

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String, unique: true,
    default: () => 'EFS-' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 100)
  },
  customer: {
    name:    { type: String, required: true, trim: true },
    phone:   { type: String, required: true, trim: true },
    email:   { type: String, trim: true, lowercase: true },
    address: { type: String, required: true, trim: true }
  },
  items:  { type: [itemSchema], required: true },
  total:  { type: Number, required: true },
  notes:  { type: String, trim: true },
  status: {
    type: String,
    enum: ['new', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'new'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  }
}, { timestamps: true });

orderSchema.index({ createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ 'customer.phone': 1 });

module.exports = mongoose.model('Order', orderSchema);
