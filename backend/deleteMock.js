import mongoose from 'mongoose';
import Post from './models/Post.js';
import dotenv from 'dotenv';
dotenv.config();

const URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/zebvo';

async function run() {
  await mongoose.connect(URI);
  console.log("Connected to DB");

  const result = await Post.deleteMany({ authorName: { $in: ['NEB Official', 'SEE Board Nepal', 'BLE Nepal'] } });
  console.log(`Deleted ${result.deletedCount} mock education posts.`);
  
  process.exit(0);
}

run();
