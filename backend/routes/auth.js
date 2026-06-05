const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const Admin   = require('../models/Admin');
const { protect } = require('../middleware/auth');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, {
  expiresIn: process.env.JWT_EXPIRES_IN || '8h'
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    const admin = await Admin.findOne({ email: email.toLowerCase() }).select('+password');
    if (!admin || !admin.isActive) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    // Update login stats
    admin.lastLogin  = new Date();
    admin.loginCount += 1;
    await admin.save({ validateBeforeSave: false });

    const token = signToken(admin._id);
    res.json({
      success: true,
      token,
      expiresIn: '8h',
      admin: admin.toJSON()
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

// GET /api/auth/me — get current admin profile
router.get('/me', protect, (req, res) => {
  res.json({ success: true, admin: req.admin });
});

// PATCH /api/auth/change-password
router.patch('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Both passwords required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }
    const admin = await Admin.findById(req.admin._id).select('+password');
    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }
    admin.password = newPassword;
    await admin.save();
    const token = signToken(admin._id);
    res.json({ success: true, message: 'Password changed successfully', token });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to change password' });
  }
});

module.exports = router;
