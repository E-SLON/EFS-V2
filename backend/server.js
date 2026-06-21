require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const helmet   = require('helmet');
const morgan   = require('morgan');
const rateLimit = require('express-rate-limit');
const path     = require('path');

const app = express();

// ── SECURITY ──────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { success: false, message: 'Too many requests. Try again later.' }
});
app.use('/api/', limiter);

// ── CORS ──────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  'http://localhost:3000',
  'http://localhost:5000',
  'http://127.0.0.1:5500',
  'http://127.0.0.1:5000'
].filter(Boolean);
app.use(cors({
  origin: (origin, cb) => (!origin || allowedOrigins.includes(origin)) ? cb(null, true) : cb(new Error('Not allowed by CORS')),
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── STATIC FRONTEND ───────────────────────────────────────────────
app.use(express.static(path.join(__dirname, '../frontend')));

// ── API ROUTES ────────────────────────────────────────────────────
app.use('/api/orders',   require('./routes/orders'));
app.use('/api/products', require('./routes/products'));
app.use('/api/admins',   require('./routes/admins'));
app.use('/api/auth',     require('./routes/auth'));

// ── HEALTH ────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'EFS API is running ✅', timestamp: new Date(), version: '2.0.0' });
});

// ── CATCH-ALL SPA ─────────────────────────────────────────────────
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ── ERROR HANDLER ─────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal server error' });
});

// ── DB + START ────────────────────────────────────────────────────
const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');
};

if (require.main === module) {
  connectDB()
    .then(() => {
      const PORT = process.env.PORT || 5000;
      app.listen(PORT, () => {
        console.log(`🚀 EFS Server running on port ${PORT}`);
        console.log(`🌍 Mode: ${process.env.NODE_ENV || 'development'}`);
      });
    })
    .catch(err => { console.error('❌ MongoDB failed:', err.message); process.exit(1); });
}

module.exports = { app, connectDB };
