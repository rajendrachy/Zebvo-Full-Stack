import { isGibberish, analyzeSentiment, classifyCategory, generateSummary } from './nlp.js';
import Post from '../models/Post.js';

// Initial Mock Data Seed
const SEED_POSTS = [
  // Appointments Issues
  {
    platform: 'Twitter',
    author: '@aditya_sharma',
    authorName: 'Aditya Sharma',
    text: 'Trying to book a passport appointment at Jalandhar PSK for 2 weeks, but no slots are available. This booking system is completely clogged. Anyone else facing this?',
    region: 'India',
    likes: 45,
    shares: 12,
    comments: 8,
    timestamp: new Date(Date.now() - 3 * 3600000), // 3 hrs ago
    language: 'English'
  },
  {
    platform: 'Twitter',
    author: '@harpreet_singh',
    authorName: 'Harpreet Singh',
    text: 'Trying to book a passport appointment at Jalandhar PSK for 2 weeks, but no slots are available. This booking system is completely clogged. Anyone else facing this?',
    region: 'India',
    likes: 12,
    shares: 2,
    comments: 1,
    timestamp: new Date(Date.now() - 2.5 * 3600000), // Duplicate for clustering
    language: 'English'
  },
  {
    platform: 'Reddit',
    author: 'u/jalandhar_native',
    authorName: 'Jalandhar Native',
    text: 'Is there a trick to getting passport appointment slots at Jalandhar office? I log in at 5 PM daily but the website crashes or shows no slots. Need to renew before my student visa expires.',
    region: 'India',
    likes: 28,
    shares: 0,
    comments: 19,
    timestamp: new Date(Date.now() - 6 * 3600000), // 6 hrs ago
    language: 'English'
  },

  // Scams / Fraud Alerts
  {
    platform: 'Facebook',
    author: 'Jalandhar Cyber Cell',
    authorName: 'Jalandhar Cyber Cell Alerts',
    text: 'ALERT: Citizens are warned about a fake website "passportindia-online.org" charging Rs 5000 for booking appointments. The official website is only passportindia.gov.in. Please do not pay agents!',
    region: 'India',
    likes: 210,
    shares: 154,
    comments: 43,
    timestamp: new Date(Date.now() - 5 * 3600000),
    language: 'English'
  },
  {
    platform: 'Twitter',
    author: '@amritsar_news',
    authorName: 'Amritsar News Update',
    text: 'ALERT: Citizens are warned about a fake website "passportindia-online.org" charging Rs 5000 for booking appointments. The official website is only passportindia.gov.in. Please do not pay agents!',
    region: 'India',
    likes: 54,
    shares: 32,
    comments: 9,
    timestamp: new Date(Date.now() - 4.5 * 3600000), // Duplicate alert
    language: 'English'
  },
  {
    platform: 'Twitter',
    author: '@cyber_police_punjab',
    authorName: 'Cyber Police Punjab',
    text: 'ALERT: Citizens are warned about a fake website "passportindia-online.org" charging Rs 5000 for booking appointments. The official website is only passportindia.gov.in. Please do not pay agents!',
    region: 'India',
    likes: 120,
    shares: 98,
    comments: 11,
    timestamp: new Date(Date.now() - 4 * 3600000), // Another duplicate alert
    language: 'English'
  },

  // Tatkal Success / Process
  {
    platform: 'Twitter',
    author: '@priya_patel',
    authorName: 'Priya Patel',
    text: 'Applied for passport under Tatkal scheme yesterday at Pune PSK. Police verification completed this morning and passport is dispatched! Absolutely amazing speed. Kudos to MEA India!',
    region: 'India',
    likes: 189,
    shares: 14,
    comments: 22,
    timestamp: new Date(Date.now() - 1 * 3600000), // 1 hr ago
    language: 'English'
  },
  {
    platform: 'LinkedIn',
    author: 'amit-kapur-pmp',
    authorName: 'Amit Kapur, PMP',
    text: 'Kudos to the Ministry of External Affairs! I applied for my daughter\'s passport under Tatkal on Monday. By Wednesday, it was delivered to my doorstep. The digitization of police verification has changed the game.',
    region: 'India',
    likes: 420,
    shares: 48,
    comments: 31,
    timestamp: new Date(Date.now() - 8 * 3600000),
    language: 'English'
  },

  // Renewal / Validity
  {
    platform: 'Twitter',
    author: '@rajesh_sharma',
    authorName: 'Rajesh Sharma',
    text: 'My passport has only 5 months validity left, and I need to book tickets to USA. Do I need to renew it before booking, or can I book now and renew later? Please advise.',
    region: 'USA',
    likes: 5,
    shares: 0,
    comments: 14,
    timestamp: new Date(Date.now() - 10 * 3600000),
    language: 'English'
  },
  {
    platform: 'Reddit',
    author: 'u/visa_seeker',
    authorName: 'Visa Seeker',
    text: 'Passport renewal status stuck at "Police Verification Report is under review". It has been 25 days since the cop visited my house. Jalandhar RPO. How do I speed this up?',
    region: 'India',
    likes: 15,
    shares: 0,
    comments: 24,
    timestamp: new Date(Date.now() - 12 * 3600000),
    language: 'English'
  },

  // Lost / Travel Issues
  {
    platform: 'Twitter',
    author: '@travelling_nomad',
    authorName: 'Vikram Singh',
    text: 'URGENT: Lost my passport at Heathrow Airport. Flight back to Delhi is in 10 hours. What is the emergency certificate procedure at the Indian High Commission in London? Help!',
    region: 'UK',
    likes: 85,
    shares: 43,
    comments: 32,
    timestamp: new Date(Date.now() - 2 * 3600000),
    language: 'English'
  },

  // Government Announcements
  {
    platform: 'Facebook',
    author: 'Ministry of External Affairs India',
    authorName: 'Ministry of External Affairs',
    text: 'OFFICIAL NOTICE: The Passport Seva Portal (passportindia.gov.in) will be down for scheduled maintenance from Friday 8 PM to Sunday 6 AM. Citizens are requested to reschedule their appointments accordingly.',
    region: 'India',
    likes: 1500,
    shares: 890,
    comments: 120,
    timestamp: new Date(Date.now() - 14 * 3600000),
    language: 'English'
  },
  {
    platform: 'Twitter',
    author: '@MEAIndia',
    authorName: 'MEA India',
    text: 'OFFICIAL NOTICE: The Passport Seva Portal (passportindia.gov.in) will be down for scheduled maintenance from Friday 8 PM to Sunday 6 AM. Citizens are requested to reschedule their appointments accordingly.',
    region: 'India',
    likes: 890,
    shares: 610,
    comments: 45,
    timestamp: new Date(Date.now() - 13.5 * 3600000), // Duplicate announcement
    language: 'English'
  },

  // News
  {
    platform: 'Twitter',
    author: '@financial_times',
    authorName: 'Financial Times India',
    text: 'According to the latest Henley Passport Index, the Indian passport now ranks 80th, offering visa-free or visa-on-arrival access to 62 countries globally. Read details here: ft.com/passport-index',
    region: 'UK',
    likes: 310,
    shares: 98,
    comments: 18,
    timestamp: new Date(Date.now() - 18 * 3600000),
    language: 'English'
  },

  // Personal Experiences
  {
    platform: 'Instagram',
    author: 'sneha_travels',
    authorName: 'Sneha Kapur',
    text: 'Finally holding my renewed passport! Super excited for my solo trip to Paris next month. Can\'t wait to stamp this baby with new visas! ✈️🇫🇷 #passportready #travelblogger #parisdiary',
    region: 'India',
    likes: 1240,
    shares: 12,
    comments: 54,
    timestamp: new Date(Date.now() - 4 * 3600000),
    language: 'English'
  },

  // Multilingual posts (in Devanagari, Gurmukhi, Spanish)
  {
    platform: 'Facebook',
    author: 'ਰਾਹੁਲ ਸ਼ਰਮਾ',
    authorName: 'Rahul Sharma',
    text: 'ਮੇਰਾ ਪਾਸਪੋਰਟ ਰੀਨਿਊ ਕਰਵਾਉਣ ਵਾਲਾ ਹੈ। ਕੀ ਜਲੰਧਰ ਦਫਤਰ ਵਿੱਚ ਅਪੌਇੰਟਮੈਂਟ ਆਸਾਨੀ ਨਾਲ ਮਿਲ ਜਾਂਦੀ ਹੈ ਜਾਂ ਏਜੰਟ ਦੀ ਲੋੜ ਪਵੇਗੀ?',
    region: 'India',
    likes: 8,
    shares: 0,
    comments: 5,
    timestamp: new Date(Date.now() - 11 * 3600000),
    language: 'Punjabi'
  },
  {
    platform: 'Twitter',
    author: '@deepak_jalandhari',
    authorName: 'Deepak Kumar',
    text: 'पासपोर्ट सेवा केंद्र जालंधर में अपॉइंटमेंट स्लॉट बुक करना एक जंग जीतने जैसा है। सर्वर हमेशा डाउन रहता है। कृपया इसे ठीक करें @MEAIndia #PassportIndia',
    region: 'India',
    likes: 35,
    shares: 18,
    comments: 7,
    timestamp: new Date(Date.now() - 9 * 3600000),
    language: 'Hindi'
  },
  {
    platform: 'Twitter',
    author: '@carlos_travels',
    authorName: 'Carlos Gomez',
    text: 'He perdido mi pasaporte en el aeropuerto de Barcelona. ¿Alguien sabe cuánto tiempo se tarda en obtener un pasaporte de emergencia? ¡Ayuda por favor!',
    region: 'Spain',
    likes: 14,
    shares: 8,
    comments: 11,
    timestamp: new Date(Date.now() - 7 * 3600000),
    language: 'Spanish'
  },

  // Gibberish / Spam Posts (Should be filtered)
  {
    platform: 'Twitter',
    author: '@bot_spammer_32',
    authorName: 'PassiveIncome99',
    text: 'Earn $500/day working from home!! No visa required! asdfghjklqwerty12345 Click here now: crypto-cash.net/free-bonus #passiveincome #makemoney',
    region: 'USA',
    likes: 0,
    shares: 0,
    comments: 0,
    timestamp: new Date(Date.now() - 2 * 3600000),
    language: 'English'
  },
  {
    platform: 'Twitter',
    author: '@scam_link_22',
    authorName: 'John8372',
    text: 'xxxxx!!!!!!!!@@@ buy passport online cheap price visa free delivery quick service contact telegram @cheapdocs66 xxxxxxxxxx',
    region: 'Canada',
    likes: 1,
    shares: 0,
    comments: 0,
    timestamp: new Date(Date.now() - 1.5 * 3600000),
    language: 'English'
  },
  {
    platform: 'Reddit',
    author: 'u/keyboard_smash',
    authorName: 'Spam Bot 404',
    text: 'qjwheqwiueryoiquwery oqiwueryoqiueyr oqiweyr passport appt slots free hack asdjfhasdjfasdf',
    region: 'India',
    likes: 0,
    shares: 0,
    comments: 0,
    timestamp: new Date(Date.now() - 5 * 60000), // 5 mins ago
    language: 'English'
  }
];

// Helper to generate a unique post ID reference
function generateId() {
  return 'post_' + Math.random().toString(36).substr(2, 9);
}

// Process raw post with NLP pipeline
export function processPost(rawPost) {
  const text = rawPost.text;
  const isSpam = isGibberish(text);
  const sentiment = analyzeSentiment(text);
  const category = classifyCategory(text);
  const summary = generateSummary(text, category, rawPost.platform);

  return {
    platform: rawPost.platform,
    author: rawPost.author,
    authorName: rawPost.authorName,
    text: text,
    region: rawPost.region || 'India',
    likes: rawPost.likes !== undefined ? rawPost.likes : 0,
    shares: rawPost.shares !== undefined ? rawPost.shares : 0,
    comments: rawPost.comments !== undefined ? rawPost.comments : 0,
    timestamp: rawPost.timestamp || new Date(),
    language: rawPost.language || 'English',
    sentiment: sentiment,
    category: category,
    summary: summary,
    isGibberish: isSpam
  };
}

// Seeding Initial Data into MongoDB
export async function seedInitialPosts() {
  try {
    const count = await Post.countDocuments();
    if (count === 0) {
      console.log('[Server] MongoDB is empty. Seeding initial posts...');
      const processed = SEED_POSTS.map(p => processPost(p));
      await Post.insertMany(processed);
      console.log(`[Server] Seeded ${processed.length} initial posts in MongoDB.`);
    } else {
      console.log(`[Server] Database contains ${count} posts. Seeding skipped.`);
    }
  } catch (error) {
    console.error('Error seeding MongoDB:', error);
  }
}

// List of templates for dynamic live post generation
const LIVE_TEMPLATES = [
  {
    platform: 'Twitter',
    author: '@jalandhar_rpo',
    authorName: 'Jalandhar RPO Official',
    text: 'Good news: Opening 500 extra Tatkal passport appointment slots at Jalandhar PSK starting this Wednesday at 10 AM. Book online via official app.',
    region: 'India',
    language: 'English',
    likes: 120,
    shares: 45,
    comments: 15
  },
  {
    platform: 'Reddit',
    author: 'u/world_wanderer',
    authorName: 'World Wanderer',
    text: 'Is Schengen visa stamping delayed for Indian passports? My passport has been at the German consulate in Mumbai for 4 weeks now. Flights are in June!',
    region: 'Germany',
    language: 'English',
    likes: 34,
    shares: 0,
    comments: 27
  },
  {
    platform: 'Twitter',
    author: '@scam_radar_in',
    authorName: 'Scam Radar India',
    text: 'WARNING: Fraud agents in Punjab are charging Rs 10000 promising "assured express Tatkal passport verification". Report these cheats directly to the MEA Helpline.',
    region: 'India',
    language: 'English',
    likes: 87,
    shares: 55,
    comments: 12
  },
  {
    platform: 'Twitter',
    author: '@agent_cheater_bot',
    authorName: 'DocHelper777',
    text: '$$$ fast fake visa fake passport duplicate ID verified papers quick delivery telegram link below $$$ asdfasdf http://fakepaperz.ru',
    region: 'Russia',
    language: 'English',
    likes: 0,
    shares: 0,
    comments: 0
  },
  {
    platform: 'Instagram',
    author: 'traveller_preet',
    authorName: 'Manpreet Singh',
    text: 'Super happy! Got my Canadian Study Visa today! Big shoutout to RPO Jalandhar for issuing my passport in 3 days under Tatkal. Time to fly! ✈️🇨🇦 #studypatricia #punjabicanada #travel',
    region: 'India',
    language: 'Punjabi'
  },
  {
    platform: 'Twitter',
    author: '@passport_agent_scam',
    authorName: 'SpamAlerts',
    text: 'Get passport slots in 1 hour guaranteed! Join my VIP telegram channel for auto-slot booking scripts. Cheap prices. Contact now!! asdklfjqweoiruqw',
    region: 'India',
    language: 'English',
    likes: 1,
    shares: 0,
    comments: 0
  }
];

// Simulates checking for "new" posts and appending them to the database
export async function scrapeNewPost() {
  try {
    // Pick a random template
    const templateIndex = Math.floor(Math.random() * LIVE_TEMPLATES.length);
    const template = LIVE_TEMPLATES[templateIndex];
    
    const newRawPost = {
      ...template,
      likes: Math.floor(Math.random() * 50) + (template.likes || 0),
      shares: Math.floor(Math.random() * 20) + (template.shares || 0),
      comments: Math.floor(Math.random() * 10) + (template.comments || 0),
      timestamp: new Date()
    };

    const processed = processPost(newRawPost);
    const newPostDoc = new Post(processed);
    await newPostDoc.save();

    console.log(`[Scraper] Aggregated new post from ${processed.platform} under category: ${processed.category} in MongoDB.`);
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
