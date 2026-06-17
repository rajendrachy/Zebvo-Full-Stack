import mongoose from 'mongoose';
import Post from './models/Post.js';
import dotenv from 'dotenv';
dotenv.config();

const URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/zebvo';

// Replacement working image URLs
const GOOD_IMAGES = {
  'Class 12': 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80',
  'Class 10': 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80',
  'Class 8':  'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
};

// The known-broken photo ID
const BROKEN_PHOTO_ID = 'photo-1523050854058-8df90110c9f1';

async function run() {
  await mongoose.connect(URI);
  console.log('Connected to DB');

  // Fix all posts that have the broken image URL
  const brokenFilter = { postImage: { $regex: BROKEN_PHOTO_ID } };
  const broken = await Post.find(brokenFilter).lean();
  console.log(`Found ${broken.length} posts with broken image URL`);

  for (const post of broken) {
    const goodImage = GOOD_IMAGES[post.category] || GOOD_IMAGES['Class 12'];
    await Post.updateOne({ _id: post._id }, { $set: { postImage: goodImage } });
    console.log(`Fixed post ${post._id} (${post.category})`);
  }

  // Also fix any education posts with empty postImage by assigning the right category image
  for (const [level, imgUrl] of Object.entries(GOOD_IMAGES)) {
    const emptyFilter = { category: level, postImage: '' };
    const emptyCount = await Post.countDocuments(emptyFilter);
    if (emptyCount > 0) {
      await Post.updateMany(emptyFilter, { $set: { postImage: imgUrl } });
      console.log(`Set postImage for ${emptyCount} empty-image ${level} posts`);
    }
  }

  console.log('Done. All education post images fixed.');
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
