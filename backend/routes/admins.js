const express = require('express');
const router  = express.Router();
const Admin   = require('../models/Admin');
const { protect, restrictTo } = require('../middleware/auth');

// All routes below require login + superadmin role (except setup)
// GET /api/admins — list all admins (superadmin only)
router.get('/', protect, restrictTo('superadmin'), async (req, res) => {
  try {
    const admins = await Admin.find().sort({ createdAt: -1 });
    res.json({ success: true, admins });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch admins' });
  }
});

// POST /api/admins — create a new admin (superadmin only)
router.post('/', protect, restrictTo('superadmin'), async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }
    const existing = await Admin.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'An admin with this email already exists' });
    }
    const admin = await Admin.create({
      name, email, password,
      role: role || 'admin',
      createdBy: req.admin._id
    });
    res.status(201).json({ success: true, message: 'Admin created successfully', admin });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/admins/:id — update admin (superadmin only)
router.patch('/:id', protect, restrictTo('superadmin'), async (req, res) => {
  try {
    const { name, role, isActive } = req.body;
    // Don't allow updating own role/status
    if (req.params.id === req.admin._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot modify your own account here' });
    }
    const admin = await Admin.findByIdAndUpdate(
      req.params.id,
      { name, role, isActive },
      { new: true, runValidators: true }
    );
    if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' });
    res.json({ success: true, message: 'Admin updated', admin });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/admins/:id — delete admin (superadmin only)
router.delete('/:id', protect, restrictTo('superadmin'), async (req, res) => {
  try {
    if (req.params.id === req.admin._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account' });
    }
    await Admin.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Admin deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete admin' });
  }
});

// POST /api/admins/reset-password/:id — superadmin resets another admin's password
router.post('/reset-password/:id', protect, restrictTo('superadmin'), async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }
    const admin = await Admin.findById(req.params.id).select('+password');
    if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' });
    admin.password = newPassword;
    await admin.save();
    res.json({ success: true, message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to reset password' });
  }
});

// POST /api/admins/setup — one-time setup to create the first superadmin
// Only works if no admins exist
router.post('/setup', async (req, res) => {
  try {
    const count = await Admin.countDocuments();
    if (count > 0) {
      return res.status(403).json({ success: false, message: 'Setup already complete. Use login instead.' });
    }
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }
    const admin = await Admin.create({ name, email, password, role: 'superadmin' });
    res.status(201).json({ success: true, message: 'Superadmin created! You can now log in.', admin });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
