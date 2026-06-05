const express  = require('express');
const router   = express.Router();
const Order    = require('../models/Order');
const nodemailer = require('nodemailer');
const { protect } = require('../middleware/auth');

// ── EMAIL ─────────────────────────────────────────────────────────
async function sendOrderEmail(order) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });
    const itemRows = order.items.map(i =>
      `<tr><td style="padding:8px;border-bottom:1px solid #222">${i.name} (${i.brand}) ×${i.qty}</td>
       <td style="padding:8px;border-bottom:1px solid #222;color:#C9A84C">R ${(i.price*i.qty).toLocaleString()}</td></tr>`
    ).join('');
    await transporter.sendMail({
      from: `"EFS Store" <${process.env.EMAIL_USER}>`,
      to: process.env.OWNER_EMAIL,
      subject: `🛍️ New Order ${order.orderId} — R ${order.total.toLocaleString()}`,
      html: `
        <div style="font-family:Arial;background:#0A0A0A;color:#F5F0E8;padding:32px;border-radius:8px">
          <h2 style="color:#C9A84C">New Order: ${order.orderId}</h2>
          <p style="color:#888">${new Date(order.createdAt).toLocaleString('en-ZA')}</p>
          <div style="background:#1A1A1A;padding:20px;border-radius:6px;margin:16px 0;border:1px solid rgba(201,168,76,0.2)">
            <p><strong>${order.customer.name}</strong></p>
            <p style="color:#aaa">📞 ${order.customer.phone}</p>
            <p style="color:#aaa">📍 ${order.customer.address}</p>
          </div>
          <table style="width:100%;border-collapse:collapse">${itemRows}</table>
          <p style="font-size:22px;color:#C9A84C;margin-top:16px"><strong>Total: R ${order.total.toLocaleString()}</strong></p>
          ${order.notes ? `<p style="color:#888">Notes: ${order.notes}</p>` : ''}
        </div>`
    });
  } catch (err) { console.error('Email failed:', err.message); }
}

// POST /api/orders
router.post('/', async (req, res) => {
  try {
    const { customer, items, total, notes } = req.body;
    if (!customer?.name || !customer?.phone || !customer?.address) {
      return res.status(400).json({ success: false, message: 'Name, phone, and address are required' });
    }
    if (!items?.length) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }
    const order = await Order.create({ customer, items, total, notes });
    sendOrderEmail(order);
    res.status(201).json({ success: true, orderId: order.orderId, order });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to place order' });
  }
});

// GET /api/orders — admin
router.get('/', protect, async (req, res) => {
  try {
    const { status, page = 1, limit = 100 } = req.query;
    const filter = status ? { status } : {};
    const orders = await Order.find(filter).sort({ createdAt: -1 })
      .limit(Number(limit)).skip((Number(page)-1)*Number(limit));
    const total = await Order.countDocuments(filter);
    res.json({ success: true, orders, total });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
});

// GET /api/orders/stats — admin dashboard stats
router.get('/stats', protect, async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const agg = await Order.aggregate([
      { $group: { _id: null, revenue: { $sum: '$total' }, items: { $sum: { $sum: '$items.qty' } } } }
    ]);
    const newOrders = await Order.countDocuments({ status: 'new' });
    // Monthly revenue (last 6 months)
    const sixMonthsAgo = new Date(); sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthly = await Order.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { $month: '$createdAt' }, total: { $sum: '$total' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    res.json({
      success: true,
      stats: {
        totalOrders,
        revenue: agg[0]?.revenue || 0,
        itemsSold: agg[0]?.items || 0,
        newOrders,
        monthly
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
});

// PATCH /api/orders/:id/status
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update' });
  }
});

// DELETE /api/orders/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Order deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete' });
  }
});

module.exports = router;
