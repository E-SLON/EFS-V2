const { app, connectDB } = require('../backend/server');

let dbReady = false;
let dbPromise = null;

const ensureDb = async () => {
  if (dbReady) return;
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not configured. Set this in Vercel environment variables.');
  }

  if (!dbPromise) {
    dbPromise = connectDB()
      .then(() => {
        dbReady = true;
      })
      .catch((err) => {
        dbPromise = null;
        throw err;
      });
  }
  await dbPromise;
};

const isApiRequest = (url) => url && url.startsWith('/api');

module.exports = async (req, res) => {
  try {
    if (isApiRequest(req.url || req.originalUrl)) {
      await ensureDb();
    }
    return app(req, res);
  } catch (err) {
    console.error('❌ Vercel API init failed:', err);
    res.status(500).json({
      success: false,
      message: 'Server initialization error',
      error: process.env.NODE_ENV !== 'production' ? err.message : undefined
    });
  }
};
