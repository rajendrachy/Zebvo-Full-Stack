// Zebvo Social Media Scraper Backend Express Server - Ready!!
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import apiRouter from './routes/api.js';
import { seedInitialPosts, ensureEducationPostsExist, startScraperScheduler } from './services/scraper.js';
import { startFootballSimulation } from './services/football.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// Enable CORS for frontend requests (localhost + Vercel + Render)
app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Parse incoming JSON payloads
app.use(express.json());

// Mount API router
app.use('/api', apiRouter);

// Root route - Show backend is running
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Zebvo Backend</title>
        <style>
            body {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                background-color: #0f172a;
                color: #f8fafc;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
                overflow: hidden;
            }
            .container {
                text-align: center;
                padding: 2.5rem;
                border-radius: 1.5rem;
                background: rgba(30, 41, 59, 0.7);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1);
            }
            .pulse {
                display: inline-block;
                width: 12px;
                height: 12px;
                background-color: #10b981;
                border-radius: 50%;
                margin-right: 10px;
                animation: pulse-animation 2s infinite;
            }
            h1 {
                font-size: 2.5rem;
                font-weight: 700;
                margin: 0 0 0.75rem 0;
                background: linear-gradient(135deg, #38bdf8, #818cf8);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                letter-spacing: -0.025em;
            }
            p {
                color: #94a3b8;
                font-size: 1.15rem;
                margin: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 500;
            }
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            @keyframes pulse-animation {
                0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
                70% { transform: scale(1); box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
                100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Zebvo Backend</h1>
            <p><span class="pulse"></span>Backend is running</p>
        </div>
    </body>
    </html>
  `);
});

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
    
    // Drop old TTL index if it exists to allow dynamic TTL index expiresAt_1
    try {
      await mongoose.model('Post').collection.dropIndex('timestamp_1');
      console.log('[Server] Successfully dropped old TTL index timestamp_1');
    } catch (e) {
      // Index did not exist or already dropped, safe to ignore
    }
    
    // Seed initial posts if DB is empty
    await seedInitialPosts();
    
    // Ensure education posts exist for all class levels
    await ensureEducationPostsExist();
    
    // Start background scraper scheduler (adds posts every 30s)
    startScraperScheduler();
    
    // Start football match updates simulation
    startFootballSimulation();

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
