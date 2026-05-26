import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema({
  platform: { type: String, required: true },
  author: { type: String, required: true },
  authorName: { type: String, required: true },
  text: { type: String, required: true },
  region: { type: String, required: true },
  likes: { type: Number, default: 0 },
  shares: { type: Number, default: 0 },
  comments: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now },
  language: { type: String, default: 'English' },
  sentiment: { type: String, required: true },
  category: { type: String, required: true },
  summary: { type: String, default: '' },
  isGibberish: { type: Boolean, default: false }
}, {
  timestamps: true
});

// Create search index on text, summary, author, and region
PostSchema.index({
  text: 'text',
  summary: 'text',
  author: 'text',
  region: 'text'
}, {
  language_override: 'dummyLangField' // Ignore our 'language' field for MongoDB text stemming
});

const Post = mongoose.model('Post', PostSchema);
export default Post;
