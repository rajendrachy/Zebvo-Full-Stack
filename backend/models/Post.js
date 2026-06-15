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
  isGibberish: { type: Boolean, default: false },
  authorAvatar: { type: String, default: '' },
  postImage: { type: String, default: '' },
  postVideo: { type: String, default: '' },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  commentsList: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    authorName: { type: String, required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }],
  expiresAt: { type: Date }
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

// TTL index: Automatically delete posts when they reach the expiresAt time
PostSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Post = mongoose.model('Post', PostSchema);
export default Post;
