/**
 * NLP and Text Processing Services
 * Features:
 * 1. Gibberish Filter (Spam/Bot detection)
 * 2. Sentiment Analysis (Positive, Negative, Neutral)
 * 3. Category Classifier (Topic assignment)
 * 4. Extractive Text Summarizer (~30 words)
 * 5. Clustering Engine (Jaccard Similarity)
 */

// Stopwords for text normalization
const STOPWORDS = new Set([
  'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves',
  'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their',
  'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are',
  'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an',
  'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about',
  'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up',
  'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when',
  'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no',
  'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don',
  'should', 'now'
]);

/**
 * Heuristic-based Gibberish Filter
 * Detects spam, bot posts, or keyboard mashing
 */
export function isGibberish(text) {
  if (!text || typeof text !== 'string') return true;
  const trimmed = text.trim();
  if (trimmed.length < 10) return true; // Too short to be meaningful

  // 1. Check for extreme repeating characters (e.g. "aaaaa", "!!!!!")
  const repeatRegex = /(.)\1{4,}/g;
  if (repeatRegex.test(trimmed.replace(/\s/g, ''))) {
    return true;
  }

  // 2. Check for high density of special characters (excluding spaces)
  const specialChars = trimmed.replace(/[a-zA-Z0-9\s\u0900-\u097F\u0A00-\u0A7F]/g, ''); // Allow English and Devanagari/Gurmukhi
  if (specialChars.length / trimmed.length > 0.4) {
    return true; // More than 40% of the post is symbols/punctuation
  }

  // 3. Tokenize words
  const words = trimmed.toLowerCase().split(/\s+/);
  if (words.length <= 2 && trimmed.length > 20) {
    return true; // Giant block of text with no spaces
  }

  let gibberishWords = 0;
  let validWords = 0;

  for (const word of words) {
    // Skip links and mentions
    if (word.startsWith('http') || word.startsWith('@') || word.startsWith('#')) continue;

    const cleanWord = word.replace(/[^a-z]/g, '');
    if (cleanWord.length === 0) continue;

    // Check vowel ratio in English words (only for words > 4 chars)
    if (cleanWord.length > 4) {
      const vowels = cleanWord.match(/[aeiou]/g);
      if (!vowels) {
        gibberishWords++;
        continue;
      }
      const vowelRatio = vowels.length / cleanWord.length;
      if (vowelRatio < 0.1) {
        gibberishWords++;
        continue;
      }
    }

    // Check for single character repetitions in word (e.g. "asdfghjk")
    // Simple check: if a word is long and has no repeating consonants but is completely random
    // We can also flag extremely long words with no vowels
    if (cleanWord.length > 15) {
      gibberishWords++;
      continue;
    }

    validWords++;
  }

  // If more than 40% of the words are suspicious and we have few valid words
  if (gibberishWords > 0 && (gibberishWords / (validWords + gibberishWords) > 0.4)) {
    return true;
  }

  return false;
}

/**
 * Lexicon-based Sentiment Analysis
 */
export function analyzeSentiment(text) {
  if (!text) return 'Neutral';
  const cleanText = text.toLowerCase();

  const positiveWords = [
    'success', 'fast', 'happy', 'great', 'smooth', 'thank', 'helpful', 'speedy', 'amazing', 'quick',
    'easy', 'pleased', 'excellent', 'impressed', 'efficient', 'solved', 'resolved', 'thanks', 'glad',
    'fortunate', 'best', 'wonderful', 'relief', 'relieved'
  ];

  const negativeWords = [
    'delay', 'delays', 'lost', 'frustrated', 'scam', 'fraud', 'worst', 'terrible', 'slow', 'stuck',
    'pending', 'broken', 'issue', 'issues', 'error', 'failed', 'fail', 'waiting', 'payment failed',
    'rude', 'harassed', 'bribe', 'corrupt', 'denied', 'rejected', 'annoyed', 'useless', 'pain', 'scammed',
    'agent cheat', 'fake website', 'fake booking'
  ];

  let score = 0;
  for (const pos of positiveWords) {
    const regex = new RegExp(`\\b${pos}\\b`, 'g');
    const matches = cleanText.match(regex);
    if (matches) score += matches.length;
  }

  for (const neg of negativeWords) {
    const regex = new RegExp(`\\b${neg}\\b`, 'g');
    const matches = cleanText.match(regex);
    if (matches) score -= matches.length;
  }

  if (score > 0) return 'Positive';
  if (score < 0) return 'Negative';
  return 'Neutral';
}

/**
 * Keyword-based Auto-Categorisation
 */
const CATEGORY_KEYWORDS = {
  'Tatkal': ['tatkal', 'fast track', 'urgent', 'emergency', 'tatkaal', 'tatkal fee', 'tatkal process'],
  'Appointments': ['appointment', 'slot', 'slots', 'booking', 'psk', 'passport seva kendra', 'rpo', 'schedule', 'reschedule', 'dates', 'appointment date'],
  'Renewal': ['renew', 'renewal', 'expired', 'expiring', 're-issue', 'renewing', 'validity', '10 years'],
  'Application': ['apply', 'application', 'new passport', 'fresh passport', 'documents', 'annexure', 'police verification', 'verification status', 'status tracker', 'arn', 'file number', 'upload'],
  'Visa': ['visa', 'vfs', 'stamping', 'embassy', 'consulate', 'immigration approval', 'schengen', 'student visa', 'h1b'],
  'Travel Issues': ['lost', 'stolen', 'airport', 'customs', 'damaged', 'border', 'transit', 'flight status', 'deported', 'immigration check', 'stuck airport'],
  'Government Announcements': ['ministry', 'mea', 'government', 'official', 'announcement', 'notice', 'circular', 'jaishankar', 'passport office alert', 'passport seva portal', 'maintenance'],
  'Scams/Fraud': ['scam', 'fake website', 'fraud', 'agent cheat', 'charge extra', 'alert', 'phishing', 'scammed', 'touts', 'unofficial', 'extortion'],
  'News': ['report', 'according to', 'newswire', 'index', 'ranking', 'global passport', 'power', 'henley', 'passport index', 'journal', 'headline']
};

export function classifyCategory(text) {
  if (!text) return 'Personal Experiences';
  const cleanText = text.toLowerCase();

  let bestCategory = 'Personal Experiences';
  let maxScore = 0;

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0;
    for (const keyword of keywords) {
      const regex = new RegExp(keyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi');
      const matches = cleanText.match(regex);
      if (matches) {
        // Give higher weight to exact word matches if possible
        score += matches.length;
      }
    }

    if (score > maxScore) {
      maxScore = score;
      bestCategory = category;
    }
  }

  // If score is 0, let's check if it fits Personal Experiences vs News.
  // News usually has a formal reporting tone or mentions locations/sources.
  if (maxScore === 0) {
    if (cleanText.includes('i ') || cleanText.includes('my ') || cleanText.includes('we ') || cleanText.includes('me ')) {
      bestCategory = 'Personal Experiences';
    } else {
      bestCategory = 'News';
    }
  }

  return bestCategory;
}

/**
 * Rule/Template-based AI Summarizer (~30 words)
 */
export function generateSummary(text, category, platform) {
  if (!text) return '';
  const clean = text.replace(/\s+/g, ' ').trim();
  const words = clean.split(' ');

  // If already short, return it
  if (words.length <= 25) {
    return clean;
  }

  // Extract first 2 sentences
  const sentences = clean.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
  let summary = '';
  
  if (sentences.length > 0) {
    summary = sentences[0];
    if (sentences.length > 1 && (summary.split(' ').length + sentences[1].split(' ').length) < 30) {
      summary += '. ' + sentences[1];
    }
  } else {
    summary = words.slice(0, 25).join(' ');
  }

  // Capitalize and format nicely
  if (!summary.endsWith('.')) {
    summary += '.';
  }

  // Ensure it's around 30 words
  const summaryWords = summary.split(' ');
  if (summaryWords.length > 35) {
    summary = summaryWords.slice(0, 32).join(' ') + '...';
  } else if (summaryWords.length < 15) {
    // Pad or structure it dynamically based on the category
    switch (category) {
      case 'Appointments':
        summary = `A social media post on ${platform} discusses passport appointment availability, highlighting difficulties booking slots or scheduling issues at Passport Seva Kendras.`;
        break;
      case 'Scams/Fraud':
        summary = `A warning posted on ${platform} alerts citizens about fake passport portals and agents charging fraudulent fees for bookings.`;
        break;
      case 'Tatkal':
        summary = `User shares their experience/inquiry on ${platform} regarding urgent Tatkal passport processing speeds, fees, and required documents.`;
        break;
      case 'Renewal':
        summary = `This post on ${platform} outlines passport renewal procedures, processing timelines, or user frustrations with the renewal application process.`;
        break;
      default:
        summary = `Post shared on ${platform} detailing passport-related activities, user experiences, or official guidelines regarding international travel documents.`;
    }
  }

  return summary;
}

/**
 * Tokenizes text and filters stopwords to prepare for Jaccard Similarity
 */
function getTokens(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s\u0900-\u097F\u0A00-\u0A7F]/g, '') // Keep letters, spaces, and Indian scripts
    .split(/\s+/)
    .filter(word => word.length > 2 && !STOPWORDS.has(word));
}

/**
 * Jaccard Similarity of word sets
 */
function jaccardSimilarity(textA, textB) {
  const tokensA = new Set(getTokens(textA));
  const tokensB = new Set(getTokens(textB));

  if (tokensA.size === 0 || tokensB.size === 0) return 0;

  let intersection = 0;
  for (const token of tokensA) {
    if (tokensB.has(token)) {
      intersection++;
    }
  }

  const union = tokensA.size + tokensB.size - intersection;
  return intersection / union;
}

/**
 * Clustering Engine: Groups posts with Jaccard Similarity > 0.45
 */
export function clusterPosts(posts) {
  const visited = new Set();
  const clusters = [];

  // Sort posts by engagement and time (most popular/earliest first)
  const sortedPosts = [...posts].sort((a, b) => {
    const aEng = (a.likes || 0) + (a.shares || 0) + (a.comments || 0);
    const bEng = (b.likes || 0) + (b.shares || 0) + (b.comments || 0);
    return bEng - aEng; // Higher engagement first
  });

  for (let i = 0; i < sortedPosts.length; i++) {
    const postA = sortedPosts[i];
    if (visited.has(postA.id)) continue;

    const currentCluster = {
      leadPost: postA,
      similarPosts: []
    };

    visited.add(postA.id);

    for (let j = i + 1; j < sortedPosts.length; j++) {
      const postB = sortedPosts[j];
      if (visited.has(postB.id)) continue;

      // Calculate Jaccard Similarity
      const similarity = jaccardSimilarity(postA.text, postB.text);
      
      // Also match if same platform, handle, and extremely similar text (or identical)
      if (similarity > 0.45 || postA.text.trim() === postB.text.trim()) {
        currentCluster.similarPosts.push(postB);
        visited.add(postB.id);
      }
    }

    clusters.push(currentCluster);
  }

  return clusters;
}
