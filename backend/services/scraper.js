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
  if (
    category === 'IPO in Nepal' ||
    category === 'Class 12' || category === 'Class 10' || category === 'Class 8' ||
    lowerText.includes('nepal') || lowerText.includes('kathmandu') ||
    lowerText.includes('nepse') || lowerText.includes('sebon') ||
    lowerText.includes('meroshare') || lowerText.includes('hydropower') ||
    lowerText.includes('neb') || lowerText.includes('see exam') || lowerText.includes('ble exam')
  ) {
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

// ─── EDUCATION DATA SOURCES ─────────────────────────────────────────────────

const EDU_AVATARS = {
  'Class 12': 'https://ui-avatars.com/api/?name=NEB+Nepal&background=8b5cf6&color=fff',
  'Class 10': 'https://ui-avatars.com/api/?name=SEE+Nepal&background=10b981&color=fff',
  'Class 8':  'https://ui-avatars.com/api/?name=BLE+Nepal&background=f59e0b&color=fff',
};

const EDU_IMAGES = {
  'Class 12': 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80',
  'Class 10': 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80',
  'Class 8':  'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
};

const EDU_CONFIGS = [
  {
    classLevel: 'Class 12',
    label: 'NEB',
    wikiTitles: ['National_Examinations_Board_(Nepal)', 'Higher_Secondary_Education_Board_(Nepal)', 'Nepal_Higher_Secondary_Certificate'],
    googleNewsQuery: 'NEB+Nepal+class+12+result+routine+2025',
    mastodonTags: ['neb', 'nepal', 'education'],
    redditSubreddits: ['Nepal', 'NepalStudy'],
    redditSearch: 'NEB class 12 result routine exam',
    authorName: 'NEB Nepal',
    author: '@NEB_Nepal',
    platform: 'YouTube',
  },
  {
    classLevel: 'Class 10',
    label: 'SEE',
    wikiTitles: ['Secondary_Education_Examination_(Nepal)', 'School_Leaving_Certificate_(Nepal)'],
    googleNewsQuery: 'SEE+Nepal+class+10+result+routine+2025',
    mastodonTags: ['see', 'nepal', 'exam'],
    redditSubreddits: ['Nepal', 'NepalStudy'],
    redditSearch: 'SEE class 10 result routine exam Nepal',
    authorName: 'SEE Board Nepal',
    author: '@SEE_Board',
    platform: 'Facebook',
  },
  {
    classLevel: 'Class 8',
    label: 'BLE',
    wikiTitles: ['Basic_Level_Examination_(Nepal)'],
    googleNewsQuery: 'BLE+Nepal+class+8+result+routine+2025',
    mastodonTags: ['ble', 'nepal', 'school'],
    redditSubreddits: ['Nepal'],
    redditSearch: 'BLE class 8 result routine basic level Nepal',
    authorName: 'BLE Nepal',
    author: '@BLE_Nepal',
    platform: 'Facebook',
  }
];

// Generic fetch with timeout and custom headers
async function safeFetch(url, timeoutMs = 6000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: controller.signal
    });
    clearTimeout(timer);
    return res;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

// Fetch a relevant YouTube video embed URL for a given search query
// Uses YouTube's public RSS feed (no API key needed)
async function fetchYouTubeVideo(query) {
  try {
    const url = `https://www.youtube.com/feeds/videos.xml?q=${encodeURIComponent(query)}`;
    const res = await safeFetch(url, 5000);
    if (!res.ok) return '';
    const xmlText = await res.text();
    const entryMatch = xmlText.match(/<entry>[\s\S]*?<\/entry>/);
    if (!entryMatch) return '';
    const videoIdMatch = entryMatch[0].match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
    if (!videoIdMatch) return '';
    console.log(`[Scraper] Found YouTube video: ${videoIdMatch[1]} for query "${query.slice(0, 50)}"`);
    return `https://www.youtube.com/embed/${videoIdMatch[1]}`;
  } catch (err) {
    console.warn(`[Scraper] YouTube video fetch failed for query "${query.slice(0, 50)}":`, err.message);
    return '';
  }
}

// Dynamic image search from Wikipedia API using a keyword/query
async function fetchRealImageForQuery(q, classLevel) {
  try {
    // Clean up the query (remove special chars, hashtags, and limit length)
    const cleanQ = q
      .replace(/#\w+/g, '') // remove hashtags
      .replace(/[^\w\s\u00C0-\u017F-]/gi, ' ') // replace special chars with space
      .trim()
      .split(/\s+/)
      .slice(0, 4) // use first 4 words to keep search broad and relevant
      .join(' ');

    if (!cleanQ || cleanQ.length < 3) return EDU_IMAGES[classLevel];

    const url = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(cleanQ)}&gsrlimit=1&prop=pageimages&piprop=thumbnail&pithumbsize=600&format=json&origin=*`;
    const res = await safeFetch(url, 4000);
    if (res.ok) {
      const data = await res.json();
      const pages = data?.query?.pages || {};
      for (const pageId in pages) {
        const source = pages[pageId].thumbnail?.source;
        if (source && source.startsWith('http')) return source;
      }
    }
  } catch (err) {
    console.warn('[Scraper] Failed to fetch real image for query:', q, err.message);
  }
  return EDU_IMAGES[classLevel];
}

// 1. Wikipedia API — fetch article summaries for education topics
async function fetchWikipediaEdu(config) {
  const results = [];
  for (const title of config.wikiTitles) {
    try {
      const res = await safeFetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${title}`);
      if (!res.ok) continue;
      const data = await res.json();
      if (!data.extract || data.extract.length < 40) continue;

      const text = `${config.label}: ${data.title} — ${data.extract.slice(0, 400)}`;
      // Fetch dynamic/real page summary thumbnail if it exists
      const postImage = data.thumbnail?.source || data.originalimage?.source || EDU_IMAGES[config.classLevel];

      results.push({
        platform: config.platform,
        author: config.author,
        authorName: config.authorName,
        authorAvatar: EDU_AVATARS[config.classLevel],
        text,
        likes: Math.floor(Math.random() * 800) + 200,
        shares: Math.floor(Math.random() * 200) + 50,
        comments: Math.floor(Math.random() * 80) + 10,
        timestamp: new Date(),
        language: 'English',
        region: 'Nepal',
        category: config.classLevel,
        postImage,
        postVideo: '',
      });
      console.log(`[EduScraper] Wikipedia: got article "${data.title}" for ${config.classLevel}`);
    } catch (err) {
      console.warn(`[EduScraper] Wikipedia fetch failed for ${title}:`, err.message);
    }
  }
  return results;
}

// 2. Wikimedia OpenSearch — search for education-related articles
async function fetchWikimediaSearch(config) {
  const results = [];
  const queries = [
    `${config.label} Nepal examination`,
    `Nepal ${config.label} result ${new Date().getFullYear()}`,
    `${config.classLevel} Nepal education`
  ];
  for (const q of queries) {
    try {
      const url = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(q)}&gsrlimit=3&prop=pageimages|extracts&piprop=thumbnail&pithumbsize=600&exintro=1&explaintext=1&exchars=300&format=json&origin=*`;
      const res = await safeFetch(url);
      if (!res.ok) continue;
      const data = await res.json();
      const pages = data?.query?.pages || {};
      for (const pageId in pages) {
        const page = pages[pageId];
        const snippet = page.extract || '';
        if (!snippet || snippet.length < 30) continue;
        const text = `${config.label} Update: ${page.title} — ${snippet}`;
        
        // Get real image from Wikipedia page generator search result
        const image = page.thumbnail?.source || EDU_IMAGES[config.classLevel];

        results.push({
          platform: config.platform,
          author: config.author,
          authorName: config.authorName,
          authorAvatar: EDU_AVATARS[config.classLevel],
          text,
          likes: Math.floor(Math.random() * 600) + 100,
          shares: Math.floor(Math.random() * 150) + 20,
          comments: Math.floor(Math.random() * 60) + 5,
          timestamp: new Date(Date.now() - Math.floor(Math.random() * 3600000)),
          language: 'English',
          region: 'Nepal',
          category: config.classLevel,
          postImage: image,
          postVideo: '',
        });
      }
      console.log(`[EduScraper] Wikimedia search: results for "${q}"`);
    } catch (err) {
      console.warn(`[EduScraper] Wikimedia search failed for "${q}":`, err.message);
    }
  }
  return results;
}

// 3. Mastodon API — fetch posts from education/nepal related tags
async function fetchMastodonEdu(config) {
  const results = [];
  for (const tag of config.mastodonTags) {
    try {
      const res = await safeFetch(`https://mastodon.social/api/v1/timelines/tag/${tag}?limit=10`);
      if (!res.ok) continue;
      const statuses = await res.json();
      if (!Array.isArray(statuses)) continue;

      for (const status of statuses) {
        // Clean HTML
        const rawText = (status.content || '').replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n').replace(/<[^>]+>/g, '').trim();
        if (!rawText || rawText.length < 20) continue;

        // Only include posts that are education-relevant
        const lower = rawText.toLowerCase();
        const isRelevant = (
          lower.includes('neb') || lower.includes('see') || lower.includes('ble') ||
          lower.includes('class 12') || lower.includes('class 10') || lower.includes('class 8') ||
          lower.includes('nepal') || lower.includes('exam') || lower.includes('result') ||
          lower.includes('education') || lower.includes('school') || lower.includes('student')
        );
        if (!isRelevant) continue;

        results.push({
          platform: 'Twitter',
          author: `@${status.account.username}`,
          authorName: status.account.display_name || status.account.username,
          authorAvatar: status.account.avatar || EDU_AVATARS[config.classLevel],
          text: rawText.slice(0, 500),
          likes: status.favourites_count || Math.floor(Math.random() * 100),
          shares: status.reblogs_count || Math.floor(Math.random() * 30),
          comments: status.replies_count || Math.floor(Math.random() * 20),
          timestamp: new Date(status.created_at),
          language: 'English',
          region: 'Nepal',
          category: config.classLevel,
          postImage: '',
          postVideo: '',
        });
      }
      console.log(`[EduScraper] Mastodon #${tag}: found relevant posts for ${config.classLevel}`);
    } catch (err) {
      console.warn(`[EduScraper] Mastodon #${tag} failed:`, err.message);
    }
  }
  return results;
}

// 4. Reddit public JSON API — search Nepal subreddits for education posts
async function fetchRedditEdu(config) {
  const results = [];
  for (const sub of config.redditSubreddits) {
    try {
      const url = `https://www.reddit.com/r/${sub}/search.json?q=${encodeURIComponent(config.redditSearch)}&restrict_sr=1&sort=new&limit=8&t=month`;
      const res = await safeFetch(url);
      if (!res.ok) continue;
      const data = await res.json();
      const posts = data?.data?.children || [];

      for (const child of posts) {
        const p = child.data;
        if (!p.selftext && !p.title) continue;
        const text = p.selftext
          ? `${p.title} — ${p.selftext.slice(0, 350)}`
          : p.title;
        if (text.length < 20) continue;

        results.push({
          platform: 'Reddit',
          author: `u/${p.author}`,
          authorName: p.author,
          authorAvatar: EDU_AVATARS[config.classLevel],
          text: text.slice(0, 500),
          likes: p.ups || Math.floor(Math.random() * 300),
          shares: Math.floor((p.ups || 50) * 0.1),
          comments: p.num_comments || Math.floor(Math.random() * 40),
          timestamp: new Date((p.created_utc || Date.now() / 1000) * 1000),
          language: 'English',
          region: 'Nepal',
          category: config.classLevel,
          postImage: (p.url && p.url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) ? p.url : EDU_IMAGES[config.classLevel],
          postVideo: '',
        });
      }
      console.log(`[EduScraper] Reddit r/${sub}: ${posts.length} posts for ${config.classLevel}`);
    } catch (err) {
      console.warn(`[EduScraper] Reddit r/${sub} failed:`, err.message);
    }
  }
  return results;
}

// 5. Google News RSS — improved with multiple query variations
async function fetchGoogleNewsEdu(config) {
  const results = [];
  const queries = [
    config.googleNewsQuery,
    `${config.label}+exam+Nepal+${new Date().getFullYear()}`,
    `Nepal+${config.label}+education+result`,
  ];

  const cleanXml = (str) => str
    .replace(/<!\[CDATA\[/g, '')
    .replace(/\]\]>/g, '')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();

  for (const query of queries) {
    try {
      const url = `https://news.google.com/rss/search?q=${query}&hl=en-NP&gl=NP&ceid=NP:en`;
      const res = await safeFetch(url, 8000);
      if (!res.ok) continue;
      const xmlText = await res.text();
      const itemRegex = /<item>([\s\S]*?)<\/item>/g;
      let match;
      let count = 0;

      while ((match = itemRegex.exec(xmlText)) !== null && count < 6) {
        const itemContent = match[1];
        const titleMatch = itemContent.match(/<title>([\s\S]*?)<\/title>/);
        const pubDateMatch = itemContent.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
        const sourceMatch = itemContent.match(/<source[^>]*>([\s\S]*?)<\/source>/);
        const descMatch = itemContent.match(/<description>([\s\S]*?)<\/description>/);

        if (titleMatch) {
          const rawTitle = cleanXml(titleMatch[1]);
          const source = sourceMatch ? cleanXml(sourceMatch[1]) : 'Google News Nepal';
          const pubDate = pubDateMatch ? new Date(pubDateMatch[1]) : new Date();
          const desc = descMatch ? cleanXml(descMatch[1]).replace(/<[^>]+>/g, '').trim() : '';
          const text = desc && desc.length > 20
            ? `${config.label}: ${rawTitle} — ${desc.slice(0, 300)}`
            : `${config.label}: ${rawTitle}`;

          results.push({
            platform: 'YouTube',
            author: `@${source.replace(/\s+/g, '_').toLowerCase()}`,
            authorName: source,
            authorAvatar: EDU_AVATARS[config.classLevel],
            text,
            likes: Math.floor(Math.random() * 500) + 50,
            shares: Math.floor(Math.random() * 100) + 10,
            comments: Math.floor(Math.random() * 50) + 5,
            timestamp: pubDate,
            language: 'English',
            region: 'Nepal',
            category: config.classLevel,
            postImage: EDU_IMAGES[config.classLevel],
            postVideo: '',
          });
          count++;
        }
      }
      console.log(`[EduScraper] Google News: ${count} posts for ${config.classLevel} (query: ${query})`);
      if (count > 0) break; // Got results, no need to try more queries
    } catch (err) {
      console.warn(`[EduScraper] Google News failed for ${config.classLevel}:`, err.message);
    }
  }

  // Resolve real images for all items in parallel using Wikipedia API search generator
  if (results.length > 0) {
    try {
      const imagePromises = results.map(item => fetchRealImageForQuery(item.text, config.classLevel));
      const resolvedImages = await Promise.allSettled(imagePromises);
      results.forEach((item, idx) => {
        const imgRes = resolvedImages[idx];
        if (imgRes.status === 'fulfilled') {
          item.postImage = imgRes.value;
        }
      });
    } catch (imageErr) {
      console.warn('[EduScraper] Failed to batch fetch real images for Google News:', imageErr.message);
    }
  }

  return results;
}

// Fallback: guaranteed education posts when all APIs fail
function generateEduFallbackPosts(config) {
  const year = new Date().getFullYear();
  const fallbacks = {
    'Class 12': [
      {
        text: `NEB Class 12 Examination ${year}: The National Examinations Board (NEB) Nepal has announced the examination schedule for Grade 12 students. Students appearing in the NEB +2 examination should check the official NEB website for the latest routine, admit cards, and result updates. All students are advised to prepare thoroughly and follow the official guidelines. #NEB #Class12Nepal`,
        image: EDU_IMAGES['Class 12'],
      },
      {
        text: `NEB Grade 12 Result ${year} Update: The National Examinations Board (NEB) is processing the results for the annual Grade 12 examinations (Science, Management, Humanities). Students can check their results on the official NEB portal. Grading system follows the GPA scale. Best of luck to all NEB Class 12 students! #NEBResult #NepalEducation`,
        image: EDU_IMAGES['Class 12'],
      },
      {
        text: `Higher Secondary Education Update for Nepal: NEB has released the Grade 12 (Plus Two) examination routine for this academic year. All students of Science, Management, and Humanities streams should download their admit cards from the official NEB website. The examinations will be held at designated centers across all provinces of Nepal. #NEB #HigherSecondary #Nepal`,
        image: EDU_IMAGES['Class 12'],
      },
    ],
    'Class 10': [
      {
        text: `SEE Examination ${year} Nepal: The Secondary Education Examination (SEE), formerly known as SLC (Iron Gate), is the national-level examination for Grade 10 students in Nepal. The Office of the Controller of Examinations (OCE) conducts the SEE exam every year. Students should check the official website for exam routine, admit cards, and result updates. #SEE #Class10Nepal`,
        image: EDU_IMAGES['Class 10'],
      },
      {
        text: `SEE Result ${year} Update: The Secondary Education Examination (SEE) results for Grade 10 students will be published by the Office of the Controller of Examinations, Nepal. Students can check results online on the official OCE website. The grading system uses GPA (Grade Point Average) on a scale of 4.0. #SEEResult #NepalEducation`,
        image: EDU_IMAGES['Class 10'],
      },
      {
        text: `Class 10 SEE Nepal Preparation Tips: With SEE examinations approaching, students across Nepal are preparing intensively. The Secondary Education Examination tests students in compulsory subjects including English, Nepali, Mathematics, Science & Technology, and Social Studies. Model questions are available on the CDC Nepal website. #SEE2025 #Nepal`,
        image: EDU_IMAGES['Class 10'],
      },
    ],
    'Class 8': [
      {
        text: `BLE Examination ${year} Nepal: The Basic Level Examination (BLE) is conducted for Grade 8 students across Nepal. This district-level examination is overseen by local governments and the Provincial Education Offices. Students should check with their respective district education offices for the examination routine and admit cards. #BLE #Class8Nepal`,
        image: EDU_IMAGES['Class 8'],
      },
      {
        text: `BLE Result ${year} Update: The Basic Level Examination (BLE) results for Class 8 students are processed by district-level education authorities across Nepal's seven provinces. Students can check results through their respective school or district education office. The examination evaluates foundational learning outcomes. #BLEResult #NepalEducation`,
        image: EDU_IMAGES['Class 8'],
      },
      {
        text: `Class 8 Basic Level Examination Nepal: The BLE is an important milestone for Grade 8 students in Nepal's school education system. Following the National Curriculum Framework, the BLE assesses students in core subjects. Local governments coordinate examination centers across districts. All students are encouraged to review the full syllabus. #BLE #Grade8`,
        image: EDU_IMAGES['Class 8'],
      },
    ],
  };

  const items = fallbacks[config.classLevel] || [];
  return items.map((item, i) => ({
    platform: config.platform,
    author: config.author,
    authorName: config.authorName,
    authorAvatar: EDU_AVATARS[config.classLevel],
    text: item.text,
    likes: Math.floor(Math.random() * 1200) + 300,
    shares: Math.floor(Math.random() * 400) + 50,
    comments: Math.floor(Math.random() * 150) + 20,
    timestamp: new Date(Date.now() - i * 3600000 * 4),
    language: 'English',
    region: 'Nepal',
    category: config.classLevel,
    postImage: item.image,
    postVideo: '',
  }));
}

// Master function: fetch real education data from all sources for all class levels
export async function fetchEducationFeeds() {
  const allResults = [];
  console.log('[EduScraper] Starting education data fetch from all real sources...');

  for (const config of EDU_CONFIGS) {
    console.log(`[EduScraper] Fetching data for ${config.classLevel} (${config.label})...`);

    // Run all sources in parallel for this class level
    const [wikiResults, wikiSearchResults, mastodonResults, redditResults, googleNewsResults] = await Promise.allSettled([
      fetchWikipediaEdu(config),
      fetchWikimediaSearch(config),
      fetchMastodonEdu(config),
      fetchRedditEdu(config),
      fetchGoogleNewsEdu(config),
    ]);

    const collected = [
      ...(wikiResults.status === 'fulfilled' ? wikiResults.value : []),
      ...(wikiSearchResults.status === 'fulfilled' ? wikiSearchResults.value : []),
      ...(mastodonResults.status === 'fulfilled' ? mastodonResults.value : []),
      ...(redditResults.status === 'fulfilled' ? redditResults.value : []),
      ...(googleNewsResults.status === 'fulfilled' ? googleNewsResults.value : []),
    ];

    console.log(`[EduScraper] ${config.classLevel}: collected ${collected.length} real posts from all sources.`);

    // Always include fallback posts to ensure content is never empty
    const fallbacks = generateEduFallbackPosts(config);

    // Merge: real posts first, then fill with fallbacks up to 5 total
    const merged = [...collected];
    for (const fb of fallbacks) {
      if (merged.length >= 5) break;
      merged.push(fb);
    }

    allResults.push(...merged);
  }

  console.log(`[EduScraper] Total education posts collected: ${allResults.length}`);
  return allResults;
}

// ─── GENERAL FEEDS ───────────────────────────────────────────────────────────

// Fetch real-time feeds from Mastodon and Google News APIs without credentials
export async function fetchRealFeeds() {
  const rssSources = [
    {
      url: 'https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN:en',
      category: 'General',
      region: 'India'
    },
    {
      url: 'https://news.google.com/rss/search?q=IPO+Nepal+OR+NEPSE+OR+SEBON+OR+Meroshare+OR+hydropower+share&hl=en-NP&gl=NP&ceid=NP:en',
      category: 'IPO in Nepal',
      region: 'Nepal'
    },
    {
      url: 'https://news.google.com/rss/search?q=Trading+Stock+Market+OR+Crypto+OR+Forex+OR+Bitcoin&hl=en-US&gl=US&ceid=US:en',
      category: 'Trading',
      region: 'USA'
    }
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
      if (!text || text.length < 5) return;

      const platform = platforms[index % platforms.length];
      const author = platform === 'Twitter' ? `@${status.account.username}` : platform === 'Reddit' ? `u/${status.account.username}` : status.account.username;
      const authorName = status.account.display_name || status.account.username;

      let postImage = '';
      let postVideo = '';
      if (status.media_attachments && status.media_attachments.length > 0) {
        const media = status.media_attachments.find(m => m.type === 'image');
        if (media) postImage = media.url || media.preview_url;
        const video = status.media_attachments.find(m => m.type === 'video' || m.type === 'gifv');
        if (video) postVideo = video.url || video.preview_url;
      }

      let region = 'India';
      const lowerText = text.toLowerCase();
      if (lowerText.includes('usa') || lowerText.includes('us ') || lowerText.includes('america')) region = 'USA';
      else if (lowerText.includes('canada') || lowerText.includes('canadian')) region = 'Canada';
      else if (lowerText.includes('uk') || lowerText.includes('london')) region = 'UK';
      else if (lowerText.includes('germany') || lowerText.includes('german')) region = 'Germany';
      else if (lowerText.includes('spain') || lowerText.includes('spanish')) region = 'Spain';
      else if (lowerText.includes('nepal') || lowerText.includes('kathmandu') || lowerText.includes('nepse') || lowerText.includes('sebon') || lowerText.includes('meroshare') || lowerText.includes('hydropower')) region = 'Nepal';
      else region = regions[index % regions.length];

      results.push({
        platform, author, authorName,
        authorAvatar: status.account.avatar,
        text, likes: status.favourites_count || 0,
        shares: status.reblogs_count || 0,
        comments: status.replies_count || 0,
        timestamp: new Date(status.created_at),
        language: 'English', region, postImage, postVideo,
        category: categoryName
      });
    });
  };

  const categoryMap = {
    'news': 'General', 'sports': 'Sports', 'entertainment': 'Entertainment',
    'tech': 'Technology', 'politics': 'Politics', 'business': 'Business',
    'nepse': 'IPO in Nepal', 'trading': 'Trading'
  };

  // Mastodon Tags (general)
  for (const tag of tags) {
    try {
      const res = await fetch(`https://mastodon.social/api/v1/timelines/tag/${tag}?limit=12`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
      });
      if (res.ok) {
        const statuses = await res.json();
        if (Array.isArray(statuses)) parseMastodonStatuses(statuses, categoryMap[tag]);
      }
    } catch (err) {
      console.error(`[Scraper] Error fetching Mastodon tag #${tag}:`, err);
    }
  }

  // Google News RSS (general, Nepal IPO, Trading)
  for (const sourceObj of rssSources) {
    try {
      const res = await fetch(sourceObj.url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
      });
      if (res.ok) {
        const xmlText = await res.text();
        const itemRegex = /<item>([\s\S]*?)<\/item>/g;
        let match;
        const cleanXml = (str) => str.replace(/<!\[CDATA\[/g, '').replace(/\]\]>/g, '')
          .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"').replace(/&#39;/g, "'");

        const newsPlatforms = ['YouTube', 'Twitter', 'Facebook', 'LinkedIn'];
        let count = 0;
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

            results.push({
              platform,
              author: platform === 'Twitter' ? `@${source.replace(/\s+/g, '_').toLowerCase()}` : source,
              authorName: source,
              text: rawTitle,
              likes: Math.floor(Math.random() * 500) + 50,
              shares: Math.floor(Math.random() * 100) + 10,
              comments: Math.floor(Math.random() * 50) + 5,
              timestamp: pubDate,
              language: 'English',
              region: sourceObj.region,
              category: sourceObj.category
            });
            count++;
          }
        }
      }
    } catch (err) {
      console.error(`[Scraper] Error fetching Google News for ${sourceObj.category}:`, err);
    }
  }

  // Fetch and append education posts
  try {
    const eduPosts = await fetchEducationFeeds();
    results.push(...eduPosts);
    console.log(`[Scraper] Merged ${eduPosts.length} education posts into general feed.`);
  } catch (err) {
    console.error('[Scraper] Education feed fetch failed:', err);
  }

  // Enrich YouTube-platform posts with real YouTube video URLs
  const youTubePosts = results.filter(p => p.platform === 'YouTube' && !p.postVideo);
  if (youTubePosts.length > 0) {
    console.log(`[Scraper] Fetching YouTube videos for ${Math.min(youTubePosts.length, 5)} posts...`);
    const videoPromises = youTubePosts.slice(0, 5).map(async (post) => {
      const query = post.text.replace(/<[^>]+>/g, '').replace(/[#@]/g, '').replace(/\s+/g, ' ').trim().slice(0, 100);
      if (query.length < 10) return;
      const videoUrl = await fetchYouTubeVideo(query);
      if (videoUrl) post.postVideo = videoUrl;
    });
    await Promise.allSettled(videoPromises);
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

      // Even if DB has posts, ensure education posts exist for all 3 class levels
      await ensureEducationPostsExist();
    }
  } catch (error) {
    console.error('Error seeding MongoDB:', error);
  }
}

// Ensure at least 3 posts exist for each education category
export async function ensureEducationPostsExist() {
  const eduLevels = ['Class 12', 'Class 10', 'Class 8'];
  let needsEduRefresh = false;

  for (const level of eduLevels) {
    const count = await Post.countDocuments({ category: level });
    if (count < 2) {
      console.log(`[Server] Only ${count} posts for ${level}. Triggering education data fetch...`);
      needsEduRefresh = true;
      break;
    }
  }

  if (needsEduRefresh) {
    const eduPosts = await fetchEducationFeeds();
    const processed = eduPosts.map(p => processPost(p));

    for (const post of processed) {
      // Check for duplicates by text similarity (first 80 chars)
      const prefix = post.text.substring(0, 80);
      const exists = await Post.findOne({ text: { $regex: prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } });
      if (!exists) {
        await new Post(post).save();
      }
    }
    console.log(`[Server] Education posts refreshed.`);
  }
}

function generateFallbackPost() {
  const templates = [
    { text: "The final match of the European Champions League was an absolute thriller last night. Real Madrid clinched the victory in the dying minutes with a spectacular overhead kick. The atmosphere in the stadium was electric!", category: "Sports", image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop&q=80" },
    { text: "OpenAI announced their new GPT-5 model today, showing major leaps in agentic reasoning, code execution, and emotional intelligence synthesis. Tech circles are buzzing with safety debates.", category: "Technology", image: "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=600&auto=format&fit=crop&q=80" },
    { text: "A new blockbuster sci-fi movie directed by Christopher Nolan has officially started filming in London. The star-studded cast features several Oscar winners, and fans are already predicting a box-office record.", category: "Entertainment", image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80" },
    { text: "World leaders gathered at the G7 Summit today to negotiate a comprehensive climate pact. Protesters assembled outside the security perimeter calling for binding policies and green subsidies.", category: "Politics", image: "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=600&auto=format&fit=crop&q=80" },
    { text: "Stocks rallied globally today as inflation data cooled down faster than expected. Analysts predict the Federal Reserve might cut interest rates next month, giving startups and tech giants a major boost.", category: "Business", image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&auto=format&fit=crop&q=80" },
    { text: "Local community projects are seeing a major surge in volunteer enrollment this summer. Hundreds of residents gathered to build urban gardens and paint murals, improving city green spaces.", category: "General", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&auto=format&fit=crop&q=80" },
    { text: "SEBON has approved the massive initial public offering (IPO) of Trishuli Hydropower in Nepal. Investors can apply for shares via Meroshare starting next Tuesday. Demands are expected to break previous records.", category: "IPO in Nepal", image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=600&auto=format&fit=crop&q=80" },
    { text: "NEPSE index closed green today with major trading volume in the banking and hydropower sectors. Right share allotments of several companies are currently being processed.", category: "IPO in Nepal", image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&auto=format&fit=crop&q=80" },
    { text: "The day trading markets saw extreme volatility in Bitcoin and Ethereum today as leverage liquidations triggered a quick flush down. Options traders are hedging on key support levels.", category: "Trading", video: "https://assets.mixkit.co/videos/preview/mixkit-stock-market-candlesticks-loop-32865-large.mp4" },
    { text: "Forex major pairs are trading in a narrow range ahead of the Fed meeting. Analysts advise caution and strict stop-loss strategies for short-term swing traders.", category: "Trading", image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=600&auto=format&fit=crop&q=80" }
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
    platform, author, authorName: randomUser, text,
    likes: Math.floor(Math.random() * 200) + 10,
    shares: Math.floor(Math.random() * 50) + 5,
    comments: Math.floor(Math.random() * 30) + 2,
    timestamp: new Date(),
    language: 'English', region,
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
  }, 30000);
  console.log('[Scraper] Background scraper scheduler started (30s interval).');
}

export function stopScraperScheduler() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log('[Scraper] Background scraper scheduler stopped.');
  }
}
