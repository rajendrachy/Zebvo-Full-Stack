import express from 'express';
import { readPosts, writePosts, scrapeNewPost, processPost } from '../services/scraper.js';
import { clusterPosts } from '../services/nlp.js';
import { translateText } from '../services/translation.js';

const router = express.Router();

// Helper to filter and sort posts
function getFilteredAndSortedPosts(req) {
  let posts = readPosts();

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

  // 1. Filter out spam by default
  const showSpam = includeSpam === 'true';
  posts = posts.filter(post => post.isGibberish === showSpam);

  // 2. Platform filter
  if (platform) {
    posts = posts.filter(post => post.platform.toLowerCase() === platform.toLowerCase());
  }

  // 3. Region filter
  if (region) {
    posts = posts.filter(post => post.region.toLowerCase() === region.toLowerCase());
  }

  // 4. Category filter
  if (category) {
    posts = posts.filter(post => post.category.toLowerCase() === category.toLowerCase());
  }

  // 5. Sentiment filter
  if (sentiment) {
    posts = posts.filter(post => post.sentiment.toLowerCase() === sentiment.toLowerCase());
  }

  // 6. Language filter
  if (language) {
    posts = posts.filter(post => post.language.toLowerCase() === language.toLowerCase());
  }

  // 7. Search filter (cross-searching original text, summary, handle, and authorName)
  if (search) {
    const query = search.toLowerCase().trim();
    posts = posts.filter(post => 
      post.text.toLowerCase().includes(query) ||
      (post.summary && post.summary.toLowerCase().includes(query)) ||
      post.author.toLowerCase().includes(query) ||
      post.authorName.toLowerCase().includes(query) ||
      post.region.toLowerCase().includes(query)
    );
  }

  // 8. Sorting
  posts.sort((a, b) => {
    let valA, valB;

    if (sortBy === 'engagement') {
      valA = (a.likes || 0) + (a.shares || 0) + (a.comments || 0);
      valB = (b.likes || 0) + (b.shares || 0) + (b.comments || 0);
    } else if (sortBy === 'likes') {
      valA = a.likes || 0;
      valB = b.likes || 0;
    } else {
      // Default: sortBy === 'time'
      valA = new Date(a.timestamp).getTime();
      valB = new Date(b.timestamp).getTime();
    }

    if (sortOrder === 'asc') {
      return valA > valB ? 1 : -1;
    } else {
      return valA < valB ? 1 : -1;
    }
  });

  return posts;
}

// 1. GET /api/posts - Get standard list of posts (filters & sorting applied)
router.get('/posts', (req, res) => {
  try {
    const posts = getFilteredAndSortedPosts(req);
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
router.get('/posts/clustered', (req, res) => {
  try {
    // 1. Get filtered list of non-spam posts
    const filteredPosts = getFilteredAndSortedPosts(req);
    
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
router.get('/stats', (req, res) => {
  try {
    const allPosts = readPosts();
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
router.post('/scrape/trigger', (req, res) => {
  try {
    const newPost = scrapeNewPost();
    res.json({
      success: true,
      message: 'Scraper triggered successfully.',
      post: newPost
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 6. POST /api/reset - Resets the store back to the seed posts
router.post('/reset', (req, res) => {
  try {
    // Delete store file
    const dbPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '../db/store.json');
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
    }
    // Re-read triggers seeding
    const posts = readPosts();
    res.json({
      success: true,
      message: 'Database reset successfully to seed records.',
      count: posts.length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
