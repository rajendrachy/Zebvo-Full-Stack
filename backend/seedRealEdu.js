import mongoose from 'mongoose';
import Post from './models/Post.js';
import dotenv from 'dotenv';
import { fetchRealFeeds, processPost } from './services/scraper.js';
dotenv.config();

const URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/zebvo';

async function run() {
  await mongoose.connect(URI);
  console.log("Connected to DB");

  const seedSource = await fetchRealFeeds();
  if (seedSource.length > 0) {
    console.log(`Successfully fetched ${seedSource.length} posts from real-time feeds.`);
    const processed = seedSource.map(p => processPost(p));
    
    // We only insert Education posts to ensure they get populated
    const eduPosts = processed.filter(p => ['Class 12', 'Class 10', 'Class 8'].includes(p.category));
    await Post.insertMany(eduPosts);
    console.log(`Seeded ${eduPosts.length} genuine education posts in MongoDB.`);
  }

  process.exit(0);
}

run();
