import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './config/db.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start HTTP server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[TeamLedger Server] Running on http://localhost:${PORT}`);
    console.log(`[TeamLedger Server] Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

startServer().catch((err) => {
  console.error('[Startup Error]', err);
  process.exit(1);
});
