import express from 'express';
import { scrapeNewPost, seedInitialPosts, processPost } from '../services/scraper.js';
import { clusterPosts } from '../services/nlp.js';
import { translateText } from '../services/translation.js';
import Post from '../models/Post.js';

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

export default router;
