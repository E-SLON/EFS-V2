const { app, connectDB } = require('../backend/server');

let dbReady = false;
let dbPromise = null;

const ensureDb = async () => {
  if (dbReady) return;
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

module.exports = async (req, res) => {
  try {
    await ensureDb();
    return app(req, res);
  } catch (err) {
    console.error('❌ Vercel API init failed:', err);
    res.status(500).json({ success: false, message: 'Server initialization error' });
  }
};
