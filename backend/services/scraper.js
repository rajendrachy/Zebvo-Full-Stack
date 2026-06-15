import { isGibberish, analyzeSentiment, classifyCategory, generateSummary } from './nlp.js';
import Post from '../models/Post.js';



// Helper to generate a unique post ID reference
function generateId() {
  return 'post_' + Math.random().toString(36).substr(2, 9);
}

// Process raw post with NLP pipeline
export function processPost(rawPost) {
  const text = rawPost.text;
  const isSpam = isGibberish(text);
  const sentiment = analyzeSentiment(text);
  const category = (rawPost.category && rawPost.category !== 'General') ? rawPost.category : classifyCategory(text);
  const summary = generateSummary(text, category, rawPost.platform);

  // Derive a consistent profile picture using Pravatar keyed to the author handle
  const authorHandleClean = (rawPost.author || 'anonymous').replace(/^[@u/]+/, '');
  const authorAvatar = rawPost.authorAvatar || `https://i.pravatar.cc/150?u=${encodeURIComponent(authorHandleClean)}`;

  let region = rawPost.region || 'India';
  const lowerText = text.toLowerCase();
  if (category === 'IPO in Nepal' || lowerText.includes('nepal') || lowerText.includes('kathmandu') || lowerText.includes('nepse') || lowerText.includes('sebon') || lowerText.includes('meroshare') || lowerText.includes('hydropower')) {
    region = 'Nepal';
  }

  const timestamp = rawPost.timestamp || new Date();
  const isEdu = category && (category.includes('Class 12') || category.includes('Class 10') || category.includes('Class 8'));
  const duration = isEdu ? 60 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
  const expiresAt = new Date(new Date(timestamp).getTime() + duration);

  return {
    platform: rawPost.platform,
    author: rawPost.author,
    authorName: rawPost.authorName,
    text: text,
    region: region,
    likes: rawPost.likes !== undefined ? rawPost.likes : 0,
    shares: rawPost.shares !== undefined ? rawPost.shares : 0,
    comments: rawPost.comments !== undefined ? rawPost.comments : 0,
    timestamp: timestamp,
    expiresAt: expiresAt,
    language: rawPost.language || 'English',
    sentiment: sentiment,
    category: category,
    summary: summary,
    isGibberish: isSpam,
    authorAvatar: authorAvatar,
    postImage: rawPost.postImage || '',
    postVideo: rawPost.postVideo || ''
  };
}

// Fetch real-time feeds from Mastodon and Google News APIs without credentials
export async function fetchRealFeeds() {
  const newsUrls = [
    'https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN:en',
    'https://news.google.com/rss/search?q=class+12+nepal+result&hl=en-IN&gl=IN&ceid=IN:en',
    'https://news.google.com/rss/search?q=class+10+SEE+nepal&hl=en-IN&gl=IN&ceid=IN:en',
    'https://news.google.com/rss/search?q=class+8+BLE+nepal&hl=en-IN&gl=IN&ceid=IN:en'
  ];
  const results = [];

  const cleanHtml = (html) => {
    if (!html) return '';
    return html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
  };

  const platforms = ['Twitter', 'Reddit', 'Facebook', 'LinkedIn', 'Instagram', 'TikTok'];
  const regions = ['India', 'USA', 'UK', 'Canada', 'Germany', 'Spain', 'Russia', 'UAE', 'Nepal'];
  const tags = ['news', 'sports', 'entertainment', 'tech', 'politics', 'business', 'nepse', 'trading'];

  // Helper to parse Mastodon statuses
  const parseMastodonStatuses = (statuses, categoryName) => {
    statuses.forEach((status, index) => {
      const text = cleanHtml(status.content);
      if (!text || text.length < 5) return; // Skip extremely short or empty posts

      const platform = platforms[index % platforms.length];
      const author = platform === 'Twitter' ? `@${status.account.username}` : platform === 'Reddit' ? `u/${status.account.username}` : status.account.username;
      const authorName = status.account.display_name || status.account.username;

      let postImage = '';
      let postVideo = '';
      if (status.media_attachments && status.media_attachments.length > 0) {
        const media = status.media_attachments.find(m => m.type === 'image');
        if (media) {
          postImage = media.url || media.preview_url;
        }
        const video = status.media_attachments.find(m => m.type === 'video' || m.type === 'gifv');
        if (video) {
          postVideo = video.url || video.preview_url;
        }
      }

      let region = 'India';
      const lowerText = text.toLowerCase();
      if (lowerText.includes('usa') || lowerText.includes('us ') || lowerText.includes('america')) region = 'USA';
      else if (lowerText.includes('canada') || lowerText.includes('canadian')) region = 'Canada';
      else if (lowerText.includes('uk') || lowerText.includes('london')) region = 'UK';
      else if (lowerText.includes('germany') || lowerText.includes('german')) region = 'Germany';
      else if (lowerText.includes('spain') || lowerText.includes('spanish')) region = 'Spain';
      else if (lowerText.includes('nepal') || lowerText.includes('kathmandu') || lowerText.includes('nepse') || lowerText.includes('sebon') || lowerText.includes('meroshare') || lowerText.includes('hydropower')) region = 'Nepal';
      else {
        region = regions[index % regions.length];
      }

      results.push({
        platform,
        author,
        authorName,
        authorAvatar: status.account.avatar,
        text,
        likes: status.favourites_count || 0,
        shares: status.reblogs_count || 0,
        comments: status.replies_count || 0,
        timestamp: new Date(status.created_at),
        language: 'English',
        region,
        postImage,
        postVideo,
        category: categoryName
      });
    });
  };

  // 1. Fetch Mastodon Tags
  const categoryMap = {
    'news': 'General',
    'sports': 'Sports',
    'entertainment': 'Entertainment',
    'tech': 'Technology',
    'politics': 'Politics',
    'business': 'Business',
    'nepse': 'IPO in Nepal',
    'trading': 'Trading'
  };

  for (const tag of tags) {
    try {
      const res = await fetch(`https://mastodon.social/api/v1/timelines/tag/${tag}?limit=12`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      if (res.ok) {
        const statuses = await res.json();
        if (Array.isArray(statuses)) {
          parseMastodonStatuses(statuses, categoryMap[tag]);
        }
      }
    } catch (err) {
      console.error(`[Scraper] Error fetching Mastodon tag #${tag}:`, err);
    }
  }

  // 2. Fetch Google News RSS
  for (const url of newsUrls) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      if (res.ok) {
        const xmlText = await res.text();
        const itemRegex = /<item>([\s\S]*?)<\/item>/g;
        let match;
        const cleanXml = (str) => str
          .replace(/<!\[CDATA\[/g, '')
          .replace(/\]\]>/g, '')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'");

        const newsPlatforms = ['YouTube', 'Twitter', 'Facebook', 'LinkedIn'];
        let count = 0;
        let urlCategory = 'General';
        if (url.includes('class+12')) urlCategory = 'Class 12';
        else if (url.includes('class+10')) urlCategory = 'Class 10';
        else if (url.includes('class+8')) urlCategory = 'Class 8';

        while ((match = itemRegex.exec(xmlText)) !== null && count < 10) {
          const itemContent = match[1];
          const titleMatch = itemContent.match(/<title>([\s\S]*?)<\/title>/);
          const pubDateMatch = itemContent.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
          const sourceMatch = itemContent.match(/<source[^>]*>([\s\S]*?)<\/source>/);

          if (titleMatch) {
            const rawTitle = cleanXml(titleMatch[1]);
            const source = sourceMatch ? cleanXml(sourceMatch[1]) : 'Google News';
            const pubDate = pubDateMatch ? new Date(pubDateMatch[1]) : new Date();
            const platform = newsPlatforms[count % newsPlatforms.length];

            // If it's an education query, append an explicit marker to the text so the frontend can route it properly
            let textWithMarker = rawTitle;
            if (urlCategory !== 'General' && !textWithMarker.includes(urlCategory)) {
              textWithMarker = `${urlCategory}: ${rawTitle}`;
            }

            results.push({
              platform,
              author: platform === 'Twitter' ? `@${source.replace(/\s+/g, '_').toLowerCase()}` : source,
              authorName: source,
              text: textWithMarker,
              likes: Math.floor(Math.random() * 500) + 50,
              shares: Math.floor(Math.random() * 100) + 10,
              comments: Math.floor(Math.random() * 50) + 5,
              timestamp: pubDate,
              language: 'English',
              region: urlCategory !== 'General' ? 'Nepal' : 'India',
              category: urlCategory
            });
            count++;
          }
        }
      }
    } catch (err) {
      console.error('[Scraper] Error fetching Google News real feeds:', err);
    }
  }

  return results;
}

// Seeding Initial Data into MongoDB using ONLY real-time feeds
export async function seedInitialPosts() {
  try {
    const count = await Post.countDocuments();
    if (count === 0) {
      console.log('[Server] MongoDB is empty. Fetching real-time feed for seed data...');
      const seedSource = await fetchRealFeeds();

      if (seedSource.length > 0) {
        console.log(`[Server] Successfully aggregated ${seedSource.length} real-time posts. Seeding database...`);
        const processed = seedSource.map(p => processPost(p));
        await Post.insertMany(processed);
        console.log(`[Server] Seeded ${processed.length} real posts in MongoDB.`);
      } else {
        console.log('[Server] Real-time feed returned 0 items. Seeding skipped.');
      }
    } else {
      console.log(`[Server] Database contains ${count} posts. Seeding skipped.`);
    }
  } catch (error) {
    console.error('Error seeding MongoDB:', error);
  }
}

function generateFallbackPost() {
  const templates = [
    {
      text: "The final match of the European Champions League was an absolute thriller last night. Real Madrid clinched the victory in the dying minutes with a spectacular overhead kick. The atmosphere in the stadium was electric!",
      category: "Sports",
      image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop&q=80"
    },
    {
      text: "OpenAI announced their new GPT-5 model today, showing major leaps in agentic reasoning, code execution, and emotional intelligence synthesis. Tech circles are buzzing with safety debates.",
      category: "Technology",
      image: "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=600&auto=format&fit=crop&q=80"
    },
    {
      text: "A new blockbuster sci-fi movie directed by Christopher Nolan has officially started filming in London. The star-studded cast features several Oscar winners, and fans are already predicting a box-office record.",
      category: "Entertainment",
      image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80"
    },
    {
      text: "World leaders gathered at the G7 Summit today to negotiate a comprehensive climate pact. Protesters assembled outside the security perimeter calling for binding policies and green subsidies.",
      category: "Politics",
      image: "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=600&auto=format&fit=crop&q=80"
    },
    {
      text: "Stocks rallied globally today as inflation data cooled down faster than expected. Analysts predict the Federal Reserve might cut interest rates next month, giving startups and tech giants a major boost.",
      category: "Business",
      image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&auto=format&fit=crop&q=80"
    },
    {
      text: "Local community projects are seeing a major surge in volunteer enrollment this summer. Hundreds of residents gathered to build urban gardens and paint murals, improving city green spaces.",
      category: "General",
      image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&auto=format&fit=crop&q=80"
    },
    {
      text: "SEBON has approved the massive initial public offering (IPO) of Trishuli Hydropower in Nepal. Investors can apply for shares via Meroshare starting next Tuesday. Demands are expected to break previous records.",
      category: "IPO in Nepal",
      image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=600&auto=format&fit=crop&q=80"
    },
    {
      text: "NEPSE index closed green today with major trading volume in the banking and hydropower sectors. Right share allotments of several companies are currently being processed.",
      category: "IPO in Nepal",
      image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&auto=format&fit=crop&q=80"
    },
    {
      text: "The day trading markets saw extreme volatility in Bitcoin and Ethereum today as leverage liquidations triggered a quick flush down. Options traders are hedging on key support levels.",
      category: "Trading",
      video: "https://assets.mixkit.co/videos/preview/mixkit-stock-market-candlesticks-loop-32865-large.mp4"
    },
    {
      text: "Forex major pairs are trading in a narrow range ahead of the Fed meeting. Analysts advise caution and strict stop-loss strategies for short-term swing traders.",
      category: "Trading",
      image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=600&auto=format&fit=crop&q=80"
    }
  ];

  const platforms = ['Twitter', 'Reddit', 'Facebook', 'LinkedIn', 'Instagram', 'TikTok'];
  const regions = ['India', 'USA', 'UK', 'Canada', 'Germany', 'Spain', 'Russia', 'UAE', 'Nepal'];

  const platform = platforms[Math.floor(Math.random() * platforms.length)];
  const region = regions[Math.floor(Math.random() * regions.length)];

  const randomUser = 'user_' + Math.random().toString(36).substr(2, 5);
  const author = platform === 'Twitter' ? `@${randomUser}` : platform === 'Reddit' ? `u/${randomUser}` : randomUser;

  const item = templates[Math.floor(Math.random() * templates.length)];
  const uniqueSuffix = ` [Ref ID: ${Math.floor(Math.random() * 90000) + 10000}]`;
  const text = item.text + uniqueSuffix;

  return {
    platform,
    author,
    authorName: randomUser,
    text,
    likes: Math.floor(Math.random() * 200) + 10,
    shares: Math.floor(Math.random() * 50) + 5,
    comments: Math.floor(Math.random() * 30) + 2,
    timestamp: new Date(),
    language: 'English',
    region,
    postImage: item.image || '',
    postVideo: item.video || '',
    category: item.category
  };
}

// Aggregates real-time posts, checks for duplicates, and appends to DB
export async function scrapeNewPost() {
  try {
    const realFeeds = await fetchRealFeeds();

    // Find a real post that is not already in the database
    let chosenPost = null;
    if (realFeeds && realFeeds.length > 0) {
      for (const p of realFeeds) {
        const exists = await Post.findOne({ text: p.text });
        if (!exists) {
          chosenPost = p;
          break;
        }
      }
    }

    let isFallback = false;
    if (!chosenPost) {
      console.log('[Scraper] No new unique real-time posts found in feed. Generating a simulated real-time fallback post...');
      chosenPost = generateFallbackPost();
      isFallback = true;
    }

    const processed = processPost(chosenPost);
    const newPostDoc = new Post(processed);
    await newPostDoc.save();

    console.log(`[Scraper] Aggregated new post (${isFallback ? 'fallback' : 'real-time'}) from ${processed.platform} under category: ${processed.category} in MongoDB.`);
    return newPostDoc;
  } catch (err) {
    console.error('Error in scrapeNewPost:', err);
    throw err;
  }
}

// Set up periodic simulation (every 30 seconds)
let intervalId = null;
export function startScraperScheduler() {
  if (intervalId) return;
  intervalId = setInterval(async () => {
    try {
      await scrapeNewPost();
    } catch (err) {
      console.error('[Scraper] Background scheduler error:', err);
    }
  }, 30000); // 30 seconds
  console.log('[Scraper] Background scraper scheduler started (30s interval).');
}

export function stopScraperScheduler() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log('[Scraper] Background scraper scheduler stopped.');
  }
}
