const jwt   = require('jsonwebtoken');
const Admin = require('../models/Admin');

const protect = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id).select('-password');
    if (!admin || !admin.isActive) {
      return res.status(401).json({ success: false, message: 'Admin not found or deactivated' });
    }
    req.admin = admin;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

// Restrict to specific roles
const restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.admin.role)) {
    return res.status(403).json({ success: false, message: 'You do not have permission to perform this action' });
  }
  next();
};

module.exports = { protect, restrictTo };
