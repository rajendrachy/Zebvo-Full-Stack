import express from 'express';
import crypto from 'crypto';
import mongoose from 'mongoose';
import { scrapeNewPost, seedInitialPosts, processPost, fetchEducationFeeds } from '../services/scraper.js';
import { getLiveMatches } from '../services/football.js';
import { clusterPosts } from '../services/nlp.js';
import { translateText } from '../services/translation.js';
import Post from '../models/Post.js';
import User from '../models/User.js';

const router = express.Router();

// Helper to filter and sort posts using MongoDB queries
async function getFilteredAndSortedPosts(req) {
  const {
    platform,
    region,
    category,
    sentiment,
    language,
    search,
    includeSpam,
    sortBy = 'time',
    sortOrder = 'desc'
  } = req.query;

  // Build filter object
  const filterQuery = {};

  // 1. Filter out spam by default
  const showSpam = includeSpam === 'true';
  filterQuery.isGibberish = showSpam;

  // 2. Platform filter
  if (platform && platform !== 'all') {
    filterQuery.platform = new RegExp(`^${platform}$`, 'i');
  }

  // 3. Region filter
  if (region && region !== 'all') {
    filterQuery.region = new RegExp(`^${region}$`, 'i');
  }

  // 4. Category filter
  if (category && category !== 'all') {
    filterQuery.category = new RegExp(`^${category}$`, 'i');
  }

  // 5. Sentiment filter
  if (sentiment && sentiment !== 'all') {
    filterQuery.sentiment = new RegExp(`^${sentiment}$`, 'i');
  }

  // 6. Language filter
  if (language && language !== 'all') {
    filterQuery.language = new RegExp(`^${language}$`, 'i');
  }

  // 7. Search filter (cross-searching original text, summary, handle, authorName, and region)
  if (search) {
    const query = search.trim();
    filterQuery.$or = [
      { text: { $regex: query, $options: 'i' } },
      { summary: { $regex: query, $options: 'i' } },
      { author: { $regex: query, $options: 'i' } },
      { authorName: { $regex: query, $options: 'i' } },
      { region: { $regex: query, $options: 'i' } }
    ];
  }

  // Find posts in DB
  let dbQuery = Post.find(filterQuery);

  // Sorting
  const sortDirection = sortOrder === 'asc' ? 1 : -1;
  if (sortBy === 'likes') {
    dbQuery = dbQuery.sort({ likes: sortDirection });
  } else if (sortBy === 'time') {
    dbQuery = dbQuery.sort({ timestamp: sortDirection });
  } else {
    // Default time sorting for queries
    dbQuery = dbQuery.sort({ timestamp: sortDirection });
  }

  // Fetch as plain JavaScript objects
  const posts = await dbQuery.lean();

  // Special Engagement sorting in memory (likes + shares + comments)
  if (sortBy === 'engagement') {
    posts.sort((a, b) => {
      const valA = (a.likes || 0) + (a.shares || 0) + (a.comments || 0);
      const valB = (b.likes || 0) + (b.shares || 0) + (b.comments || 0);
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });
  }

  // Format schema fields to match frontend expectation (mapping _id to id)
  return posts.map(post => ({
    ...post,
    id: post._id.toString()
  }));
}

// 1. GET /api/posts - Get standard list of posts (filters & sorting applied)
router.get('/posts', async (req, res) => {
  try {
    const posts = await getFilteredAndSortedPosts(req);
    res.json({
      success: true,
      count: posts.length,
      posts
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. GET /api/posts/clustered - Get clustered duplicate posts (threaded view)
router.get('/posts/clustered', async (req, res) => {
  try {
    // 1. Get filtered list of non-spam posts
    const filteredPosts = await getFilteredAndSortedPosts(req);
    
    // 2. Cluster them
    const clusters = clusterPosts(filteredPosts);

    res.json({
      success: true,
      count: clusters.length,
      clusters
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. GET /api/stats - Dashboard analytics endpoints
router.get('/stats', async (req, res) => {
  try {
    const allPosts = await Post.find().lean();
    const cleanPosts = allPosts.filter(p => !p.isGibberish);
    const spamPosts = allPosts.filter(p => p.isGibberish);

    // Platform Distribution
    const platforms = {};
    // Category Distribution
    const categories = {};
    // Region Distribution
    const regions = {};
    // Sentiment Breakdown
    let positive = 0, negative = 0, neutral = 0;

    cleanPosts.forEach(post => {
      // Platform
      platforms[post.platform] = (platforms[post.platform] || 0) + 1;
      // Category
      categories[post.category] = (categories[post.category] || 0) + 1;
      // Region
      regions[post.region] = (regions[post.region] || 0) + 1;
      // Sentiment
      if (post.sentiment === 'Positive') positive++;
      else if (post.sentiment === 'Negative') negative++;
      else neutral++;
    });

    const totalClean = cleanPosts.length || 1;

    // Timeline volume (last 24 hours, grouped into 4-hour intervals)
    const intervals = Array.from({ length: 6 }).map((_, idx) => {
      const start = new Date(Date.now() - (idx + 1) * 4 * 3600000);
      const end = new Date(Date.now() - idx * 4 * 3600000);
      const label = `${start.getHours()}:00 - ${end.getHours()}:00`;
      
      const count = cleanPosts.filter(p => {
        const time = new Date(p.timestamp);
        return time >= start && time < end;
      }).length;

      return { interval: label, posts: count };
    }).reverse();

    res.json({
      success: true,
      summary: {
        totalProcessed: allPosts.length,
        activePosts: cleanPosts.length,
        spamBlocked: spamPosts.length,
        sentimentRatio: {
          positive: Math.round((positive / totalClean) * 100),
          negative: Math.round((negative / totalClean) * 100),
          neutral: Math.round((neutral / totalClean) * 100)
        }
      },
      platforms: Object.entries(platforms).map(([name, count]) => ({ name, count })),
      categories: Object.entries(categories).map(([name, count]) => ({ name, count })),
      regions: Object.entries(regions).map(([name, count]) => ({ name, count })),
      timeline: intervals
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. POST /api/translate - Translate specific post on-demand
router.post('/translate', async (req, res) => {
  const { text, targetLang } = req.body;

  if (!text || !targetLang) {
    return res.status(400).json({ success: false, error: 'Text and targetLang are required.' });
  }

  try {
    const translatedText = await translateText(text, targetLang);
    res.json({
      success: true,
      originalText: text,
      translatedText,
      targetLang
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. POST /api/scrape/trigger - Trigger immediate scrape of 1 new simulated post
router.post('/scrape/trigger', async (req, res) => {
  try {
    const newPost = await scrapeNewPost();
    if (!newPost) {
      return res.json({
        success: false,
        message: 'No new unique posts found at this time.'
      });
    }
    res.json({
      success: true,
      message: 'Scraper triggered successfully.',
      post: {
        ...newPost.toObject(),
        id: newPost._id.toString()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 6. POST /api/reset - Resets the database back to seed records
router.post('/reset', async (req, res) => {
  try {
    // Delete all MongoDB posts
    await Post.deleteMany({});
    
    // Seed new database
    await seedInitialPosts();

    res.json({
      success: true,
      message: 'Database reset successfully to seed records.'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 7. GET /api/posts/education - Get education posts filtered by class level
// Query: ?classLevel=Class 12 | Class 10 | Class 8
router.get('/posts/education', async (req, res) => {
  try {
    const { classLevel } = req.query;
    const validLevels = ['Class 12', 'Class 10', 'Class 8'];

    // Build query — if classLevel is specified, filter; otherwise return all education posts
    const levelFilter = (classLevel && validLevels.includes(classLevel))
      ? classLevel
      : { $in: validLevels };

    let posts = await Post.find({ category: levelFilter, isGibberish: false })
      .sort({ timestamp: -1 })
      .lean();

    // If we have fewer than 2 posts for this level, trigger an on-demand fetch
    if (posts.length < 2) {
      console.log(`[API] Insufficient education posts for ${classLevel}. Triggering on-demand edu fetch...`);
      try {
        const freshEduPosts = await fetchEducationFeeds();
        const targetPosts = classLevel
          ? freshEduPosts.filter(p => p.category === classLevel)
          : freshEduPosts;

        for (const rawPost of targetPosts) {
          const prefix = rawPost.text.substring(0, 80).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const exists = await Post.findOne({ text: { $regex: prefix, $options: 'i' } });
          if (!exists) {
            const { processPost: pp } = await import('../services/scraper.js');
            const processed = pp(rawPost);
            await new Post(processed).save();
          }
        }

        // Re-fetch after insert
        posts = await Post.find({ category: levelFilter, isGibberish: false })
          .sort({ timestamp: -1 })
          .lean();
      } catch (fetchErr) {
        console.error('[API] On-demand education fetch error:', fetchErr.message);
      }
    }

    const formattedPosts = posts.map(p => ({ ...p, id: p._id.toString() }));
    res.json({
      success: true,
      count: formattedPosts.length,
      classLevel: classLevel || 'all',
      posts: formattedPosts
    });
  } catch (error) {
    console.error('[API] Education posts error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 8. GET /api/football/live - Get live football match scores
router.get('/football/live', (req, res) => {
  try {
    const liveMatches = getLiveMatches();
    res.json({
      success: true,
      matches: liveMatches
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PASSWORD HASHING HELPER
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// AUTHENTICATION MIDDLEWARE
async function authenticateUser(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const userId = authHeader.split(' ')[1];
    if (mongoose.Types.ObjectId.isValid(userId)) {
      try {
        const user = await User.findById(userId);
        if (user) {
          req.user = user;
        }
      } catch (err) {
        console.error('Auth error:', err);
      }
    }
  }
  next();
}

// 8. POST /api/auth/register - Register new user
router.post('/auth/register', async (req, res) => {
  const { username, password, avatar } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'Username and password are required.' });
  }
  try {
    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(400).json({ success: false, error: 'Username already exists.' });
    }
    const hashedPassword = hashPassword(password);
    const user = new User({
      username,
      password: hashedPassword,
      avatar: avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=8b5cf6&color=fff`
    });
    await user.save();
    res.json({
      success: true,
      user: { id: user._id, username: user.username, avatar: user.avatar },
      token: user._id.toString()
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9. POST /api/auth/login - User login
router.post('/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'Username and password are required.' });
  }
  try {
    const user = await User.findOne({ username });
    if (!user || user.password !== hashPassword(password)) {
      return res.status(400).json({ success: false, error: 'Invalid username or password.' });
    }
    res.json({
      success: true,
      user: { id: user._id, username: user.username, avatar: user.avatar },
      token: user._id.toString()
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 10. GET /api/auth/me - Get current user profile
router.get('/auth/me', authenticateUser, (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Not authorized.' });
  }
  res.json({
    success: true,
    user: { id: req.user._id, username: req.user.username, avatar: req.user.avatar }
  });
});

// 11. POST /api/posts - Create custom post (auth required)
router.post('/posts', authenticateUser, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Must be logged in to create a post.' });
  }
  const { text, category, region, postImage, postVideo } = req.body;
  if (!text || !category || !region) {
    return res.status(400).json({ success: false, error: 'Text, category, and region are required.' });
  }
  try {
    const rawPost = {
      platform: 'Zebvo',
      author: `@${req.user.username}`,
      authorName: req.user.username,
      authorAvatar: req.user.avatar,
      text,
      region,
      postImage,
      postVideo,
      category,
      likes: 0,
      shares: 0,
      comments: 0
    };
    const processed = processPost(rawPost);
    const post = new Post(processed);
    await post.save();
    res.json({ success: true, post: { ...post.toObject(), id: post._id.toString() } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 12. POST /api/posts/:id/like - Toggle like on a post (auth required)
router.post('/posts/:id/like', authenticateUser, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Must be logged in to like a post.' });
  }
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found.' });
    }

    if (!post.likedBy) {
      post.likedBy = [];
    }

    const likedIndex = post.likedBy.indexOf(req.user._id);
    let liked = false;
    if (likedIndex > -1) {
      post.likedBy.splice(likedIndex, 1);
      post.likes = Math.max(0, post.likes - 1);
      liked = false;
    } else {
      post.likedBy.push(req.user._id);
      post.likes = (post.likes || 0) + 1;
      liked = true;
    }

    await post.save();
    res.json({ success: true, likes: post.likes, liked });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 13. POST /api/posts/:id/comment - Comment on a post (auth required)
router.post('/posts/:id/comment', authenticateUser, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Must be logged in to comment.' });
  }
  const { text } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ success: false, error: 'Comment text is required.' });
  }
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found.' });
    }

    const newComment = {
      userId: req.user._id,
      authorName: req.user.username,
      text: text.trim(),
      timestamp: new Date()
    };

    if (!post.commentsList) {
      post.commentsList = [];
    }

    post.commentsList.push(newComment);
    post.comments = post.commentsList.length;

    await post.save();
    res.json({ success: true, comment: newComment, commentsCount: post.comments });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 14. DELETE /api/posts/:id - Delete a post from MongoDB (used when post expires)
router.delete('/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: 'Invalid post ID.' });
    }
    const result = await Post.findByIdAndDelete(id);
    if (!result) {
      return res.status(404).json({ success: false, error: 'Post not found or already deleted.' });
    }
    console.log(`[API] Post ${id} deleted from MongoDB.`);
    res.json({ success: true, message: 'Post deleted from database.' });
  } catch (error) {
    console.error('[API] Delete error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
