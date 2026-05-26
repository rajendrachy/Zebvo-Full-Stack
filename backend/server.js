// Zebvo Social Media Scraper Backend Express Server - Ready!!
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import apiRouter from './routes/api.js';
import { seedInitialPosts, startScraperScheduler } from './services/scraper.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// Enable CORS for frontend requests
app.use(cors());

// Parse incoming JSON payloads
app.use(express.json());

// Mount API router
app.use('/api', apiRouter);

// Basic health check route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date() 
  });
});

// Connect to MongoDB Atlas and Start Server
console.log('[Server] Connecting to MongoDB Atlas...');
mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('[Server] Successfully connected to MongoDB Atlas.');
    
    // Seed initial posts if DB is empty
    await seedInitialPosts();
    
    // Start background scraper scheduler (adds posts every 30s)
    startScraperScheduler();

    // Start listening on port
    app.listen(PORT, () => {
      console.log(`==================================================`);
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📂 API endpoints available at http://localhost:${PORT}/api/posts`);
      console.log(`==================================================`);
    });
  })
  .catch(err => {
    console.error('[Server] Critical: MongoDB connection failed!', err);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Server] SIGTERM received. Stopping scheduler and shutting down...');
  mongoose.connection.close(() => {
    console.log('[Server] MongoDB connection closed. Exiting.');
    process.exit(0);
  });
});
