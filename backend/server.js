// Zebvo Social Media Scraper Backend Express Server - Ready
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes/api.js';
import { readPosts, startScraperScheduler } from './services/scraper.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend requests
app.use(cors());

// Parse incoming JSON payloads
app.use(express.json());

// Mount API router
app.use('/api', apiRouter);

// Pre-load and seed initial posts on startup
console.log('[Server] Checking and seeding initial posts DB...');
const initialPosts = readPosts();
console.log(`[Server] Loaded ${initialPosts.length} posts in store.`);

// Start simulated background scraper scheduler (adds posts every 30s)
startScraperScheduler();

// Basic health check route
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// Start Server
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📂 API endpoints available at http://localhost:${PORT}/api/posts`);
  console.log(`==================================================`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Server] SIGTERM received. Stopping scheduler and shutting down...');
  process.exit(0);
});
