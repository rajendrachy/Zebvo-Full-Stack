import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  MessageSquare,
  Share2,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Search,
  Globe,
  RefreshCw,
  AlertCircle,
  Trash2,
  BarChart2,
  Layers,
  List,
  Sparkles,
  Download,
  Clock,
  ShieldAlert,
  MapPin,
  ChevronDown,
  ChevronUp,
  FileText,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  X,
  Film,
  Tv,
  Bell,
  BellOff,
  Heart,
  User,
  LogOut,
  LogIn,
  UserPlus,
  Send,
  PlusCircle,
  TrendingUp,
  Activity,
  GraduationCap,
  BookOpen,
  Calendar,
  CheckSquare,
  Timer,
  BookMarked,
  Book,
  Phone,
  Map,
  Copy,
  Users,
  Crown,
  ExternalLink,
  HelpCircle,
  Skull,
  Smartphone,
  Lock
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { exportToCSV, exportToPDF } from './utils/exporters';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

const TARGET_LANGUAGES = [
  'English',
  'Hindi',
  'Punjabi',
  'Spanish',
  'French',
  'German',
  'Arabic',
  'Chinese',
  'Russian',
  'Japanese'
];

const PLATFORMS = ['Twitter', 'Facebook', 'Instagram', 'LinkedIn', 'YouTube', 'Reddit', 'TikTok'];
const REGIONS = ['India', 'USA', 'UK', 'Canada', 'Germany', 'Spain', 'Russia', 'UAE', 'Nepal'];
const CATEGORIES = [
  'General',
  'Sports',
  'Entertainment',
  'Technology',
  'Politics',
  'Business',
  'Health',
  'IPO in Nepal',
  'Trading',
  'Class 12',
  'Class 10',
  'Class 8'
];
const SENTIMENTS = ['Positive', 'Negative', 'Neutral'];

const TECH_GUIDES = [
  {
    platform: 'Facebook', icon: '📘', color: '#1877f2',
    steps: [
      'Go to facebook.com or download the Facebook app from your app store.',
      'Click on "Create New Account".',
      'Enter your first name, last name, mobile number or email address.',
      'Choose a password (at least 6 characters with letters and numbers).',
      'Select your date of birth and gender.',
      'Click "Sign Up" and complete the security check if prompted.',
      'Check your email or phone for a 6-digit confirmation code and enter it.',
      'Once verified, complete your profile: add a profile picture, cover photo, and bio.',
      'Find friends by syncing your contacts or searching by name.',
      'Start posting status updates, photos, and connecting with friends!'
    ],
    tips: ['Use a strong unique password with 12+ characters.', 'Enable two-factor authentication in Settings > Security.', 'Review your privacy settings - set posts to "Friends" by default.', 'Be careful what you share publicly - avoid posting personal contact details.']
  },
  {
    platform: 'Instagram', icon: '📸', color: '#e4405f',
    steps: [
      'Download Instagram from the App Store or Google Play Store.',
      'Open the app and tap "Create New Account".',
      'Enter your email or phone number, or tap "Sign up with Facebook" for faster setup.',
      'Enter your full name and create a username (this is your public handle).',
      'Create a password with at least 8 characters.',
      'Tap "Sign Up" and enter the confirmation code sent to your email/phone.',
      'Complete your profile: add a profile photo, bio, and website link.',
      'Connect your contacts to find friends, or search for people to follow.',
      'Start posting photos and videos! Use hashtags to reach more people.'
    ],
    tips: ['Use a business or creator account if you want insights and analytics.', 'Keep your bio clear and professional - it describes who you are.', 'Use hashtags relevant to your content to grow your audience.', 'Turn on two-factor authentication for account security.']
  },
  {
    platform: 'Twitter / X', icon: '🐦', color: '#1da1f2',
    steps: [
      'Go to x.com or download the X (Twitter) app.',
      'Click "Create account" or "Sign up".',
      'Enter your name, phone number or email address.',
      'Choose a date of birth (you must be at least 13 years old).',
      'Create a username (handle) - this will be your @username.',
      'Create a strong password.',
      'Verify your account by entering the code sent to your email or phone.',
      'Choose your interests to help X suggest accounts to follow.',
      'Follow at least 5 accounts to personalize your feed.',
      'Start posting tweets (280 characters max), share images, and engage with others!'
    ],
    tips: ['Keep your tweets concise - you have only 280 characters.', 'Use your bio to tell people who you are in 160 characters.', 'Verify your account with a phone number for added security.', 'Mute or block accounts that spam or harass you.']
  },
  {
    platform: 'YouTube', icon: '🎬', color: '#ff0000',
    steps: [
      'Go to youtube.com and click "Sign In" at the top right.',
      'Click "Create account" then "For personal use" or "For my child".',
      'Enter your first and last name, choose a Gmail username, and create a password.',
      'Enter your phone number for verification and enter the code sent via SMS.',
      'Add a recovery email and your date of birth, then accept the privacy and terms.',
      'Go to youtube.com and click your profile icon > "Your Channel" to create your channel.',
      'Add a channel name, profile picture, and channel description.',
      'Customize your channel layout, add a banner image, and create channel sections.',
      'Upload your first video by clicking the camera icon with a + sign > "Upload Video".',
      'Add a title, description, tags, and thumbnail. Choose visibility (Public, Unlisted, Private) and publish!'
    ],
    tips: ['Create eye-catching thumbnails to increase click-through rates.', 'Write detailed descriptions with keywords for better search visibility.', 'Post consistently - at least once a week to grow your audience.', 'Use YouTube Studio to analyze your video performance and audience.']
  },
  {
    platform: 'TikTok', icon: '🎵', color: '#000000',
    steps: [
      'Download TikTok from the App Store or Google Play Store.',
      'Open the app and tap "Profile" at the bottom right, then "Sign up".',
      'Choose to sign up with phone, email, or continue with Google/Facebook/Apple.',
      'Enter your date of birth (must be 13+), then create a password.',
      'Enter the verification code sent to your email or phone.',
      'Choose your interests (dance, comedy, education, etc.) to personalize your feed.',
      'Add a username, profile photo, and bio.',
      'Start watching videos on your "For You" page to learn what performs well.',
      'Tap the + button at the bottom to create your first video. Record or upload from gallery.',
      'Add effects, filters, text, stickers, and music. Write a caption with hashtags and post!'
    ],
    tips: ['Use trending sounds and hashtags to increase visibility.', 'Keep videos between 15-60 seconds for best engagement.', 'Post 1-3 times per day for maximum growth.', 'Engage with your audience by replying to comments.']
  },
  {
    platform: 'LinkedIn', icon: '💼', color: '#0a66c2',
    steps: [
      'Go to linkedin.com or download the LinkedIn app.',
      'Click "Join now" and enter your email address.',
      'Create a password with at least 6 characters.',
      'Enter your first and last name, country, and postal code.',
      'Select your employment status (student, employed, looking for job, etc.).',
      'Enter your job title, company, and industry to build your profile.',
      'Confirm your email by clicking the link sent to your inbox.',
      'Add a professional profile photo, headline, and summary.',
      'Add your education, work experience, skills, and certifications.',
      'Connect with colleagues, classmates, and professionals in your industry. Start posting and engaging!'
    ],
    tips: ['Use a professional headshot as your profile photo.', 'Write a keyword-rich headline that describes your expertise.', 'Share industry insights and articles to build your professional brand.', 'Personalize connection requests with a brief message.']
  },
  {
    platform: 'Snapchat', icon: '👻', color: '#fffc00',
    steps: [
      'Download Snapchat from your app store.',
      'Open the app and tap "Sign Up".',
      'Enter your first and last name, then your date of birth.',
      'Create a username (this is your permanent Snapchat handle).',
      'Create a password and enter your email or phone number.',
      'Verify your account by entering the code sent to your email or phone.',
      'Add friends by syncing contacts, searching usernames, or scanning Snapcodes.',
      'Take your first Snap! Tap the circle button to take a photo, hold to record a video.',
      'Add text, stickers, filters, or drawings. Send it to friends or add to your Story.',
      'Start a Snapstreak by Snapping friends daily!'
    ],
    tips: ['Snaps disappear after being viewed - but recipients can screenshot them.', 'Use Snap Map to share your location with friends (can be turned off in Ghost Mode).', 'Create custom lenses and filters using Lens Studio for creative content.', 'Be careful - even though Snaps disappear, people can still save them.']
  }
];

const CATEGORY_VIDEOS = {
  'Sports': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
  'Technology': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'Entertainment': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'Business': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'Politics': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  'General': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  'IPO in Nepal': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'Trading': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'Health': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4'
};

const VITAMINS = [
  {
    name: 'Vitamin A',
    nameAlt: 'Retinol',
    benefit: 'Essential for vision, immune function, skin health, and cell growth. Supports eye health and helps prevent night blindness.',
    color: '#f59e0b',
    icon: '👁️',
    foods: [
      { name: 'Carrots', image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=200&h=200&fit=crop&q=80' },
      { name: 'Sweet Potatoes', image: 'https://images.unsplash.com/photo-1596097635121-14b800e5fb4e?w=200&h=200&fit=crop&q=80' },
      { name: 'Spinach', image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=200&h=200&fit=crop&q=80' },
      { name: 'Mangoes', image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=200&h=200&fit=crop&q=80' },
      { name: 'Eggs', image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=200&h=200&fit=crop&q=80' }
    ]
  },
  {
    name: 'Vitamin B1',
    nameAlt: 'Thiamine',
    benefit: 'Helps convert food into energy. Essential for nerve function, muscle contraction, and carbohydrate metabolism.',
    color: '#10b981',
    icon: '⚡',
    foods: [
      { name: 'Whole Grains', image: 'https://images.unsplash.com/photo-1574323347407-f5e1c09b9c1a?w=200&h=200&fit=crop&q=80' },
      { name: 'Pork', image: 'https://images.unsplash.com/photo-1559742811-822f4580b12e?w=200&h=200&fit=crop&q=80' },
      { name: 'Sunflower Seeds', image: 'https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=200&h=200&fit=crop&q=80' },
      { name: 'Legumes', image: 'https://images.unsplash.com/photo-1515543904379-3d757f8b2d9c?w=200&h=200&fit=crop&q=80' },
      { name: 'Fish', image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=200&h=200&fit=crop&q=80' }
    ]
  },
  {
    name: 'Vitamin B2',
    nameAlt: 'Riboflavin',
    benefit: 'Important for energy production, cell growth, and metabolism of fats, drugs, and steroids. Supports skin and eye health.',
    color: '#8b5cf6',
    icon: '🔥',
    foods: [
      { name: 'Milk & Dairy', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200&h=200&fit=crop&q=80' },
      { name: 'Eggs', image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=200&h=200&fit=crop&q=80' },
      { name: 'Almonds', image: 'https://images.unsplash.com/photo-1508061253366-f7da1583aebc?w=200&h=200&fit=crop&q=80' },
      { name: 'Spinach', image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=200&h=200&fit=crop&q=80' },
      { name: 'Mushrooms', image: 'https://images.unsplash.com/photo-1504672281656-e4983d70414b?w=200&h=200&fit=crop&q=80' }
    ]
  },
  {
    name: 'Vitamin B3',
    nameAlt: 'Niacin',
    benefit: 'Helps lower cholesterol, boost brain function, and improve skin health. Essential for DNA repair and energy metabolism.',
    color: '#ef4444',
    icon: '❤️',
    foods: [
      { name: 'Chicken Breast', image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=200&h=200&fit=crop&q=80' },
      { name: 'Tuna', image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=200&h=200&fit=crop&q=80' },
      { name: 'Peanuts', image: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=200&h=200&fit=crop&q=80' },
      { name: 'Brown Rice', image: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=200&h=200&fit=crop&q=80' },
      { name: 'Avocado', image: 'https://images.unsplash.com/photo-1519162808019-7d1ca15b52e8?w=200&h=200&fit=crop&q=80' }
    ]
  },
  {
    name: 'Vitamin B5',
    nameAlt: 'Pantothenic Acid',
    benefit: 'Crucial for synthesizing coenzyme A, which is involved in fatty acid metabolism. Supports hormone production and nerve function.',
    color: '#ec4899',
    icon: '🧬',
    foods: [
      { name: 'Broccoli', image: 'https://images.unsplash.com/photo-1584270354949-c26b8d79e31b?w=200&h=200&fit=crop&q=80' },
      { name: 'Chicken', image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=200&h=200&fit=crop&q=80' },
      { name: 'Avocado', image: 'https://images.unsplash.com/photo-1519162808019-7d1ca15b52e8?w=200&h=200&fit=crop&q=80' },
      { name: 'Potatoes', image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=200&h=200&fit=crop&q=80' },
      { name: 'Sunflower Seeds', image: 'https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=200&h=200&fit=crop&q=80' }
    ]
  },
  {
    name: 'Vitamin B6',
    nameAlt: 'Pyridoxine',
    benefit: 'Key for brain development, immune function, and the production of neurotransmitters like serotonin and dopamine.',
    color: '#14b8a6',
    icon: '🧠',
    foods: [
      { name: 'Bananas', image: 'https://images.unsplash.com/photo-1571771894821-ce9b6ba11c94?w=200&h=200&fit=crop&q=80' },
      { name: 'Salmon', image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=200&h=200&fit=crop&q=80' },
      { name: 'Chickpeas', image: 'https://images.unsplash.com/photo-1515543904379-3d757f8b2d9c?w=200&h=200&fit=crop&q=80' },
      { name: 'Poultry', image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=200&h=200&fit=crop&q=80' },
      { name: 'Spinach', image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=200&h=200&fit=crop&q=80' }
    ]
  },
  {
    name: 'Vitamin B7',
    nameAlt: 'Biotin',
    benefit: 'Supports healthy hair, skin, and nails. Plays a role in carbohydrate and fat metabolism and gene regulation.',
    color: '#f97316',
    icon: '💇',
    foods: [
      { name: 'Egg Yolks', image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=200&h=200&fit=crop&q=80' },
      { name: 'Nuts & Seeds', image: 'https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=200&h=200&fit=crop&q=80' },
      { name: 'Sweet Potatoes', image: 'https://images.unsplash.com/photo-1596097635121-14b800e5fb4e?w=200&h=200&fit=crop&q=80' },
      { name: 'Broccoli', image: 'https://images.unsplash.com/photo-1584270354949-c26b8d79e31b?w=200&h=200&fit=crop&q=80' },
      { name: 'Bananas', image: 'https://images.unsplash.com/photo-1571771894821-ce9b6ba11c94?w=200&h=200&fit=crop&q=80' }
    ]
  },
  {
    name: 'Vitamin B9',
    nameAlt: 'Folate / Folic Acid',
    benefit: 'Critical for DNA synthesis and cell division. Especially important during pregnancy for fetal brain and spine development.',
    color: '#22c55e',
    icon: '🤰',
    foods: [
      { name: 'Leafy Greens', image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=200&h=200&fit=crop&q=80' },
      { name: 'Asparagus', image: 'https://images.unsplash.com/photo-1590146866327-7a45a6e8a5a1?w=200&h=200&fit=crop&q=80' },
      { name: 'Citrus Fruits', image: 'https://images.unsplash.com/photo-1557800636-894a64c1696f?w=200&h=200&fit=crop&q=80' },
      { name: 'Beans', image: 'https://images.unsplash.com/photo-1515543904379-3d757f8b2d9c?w=200&h=200&fit=crop&q=80' },
      { name: 'Fortified Grains', image: 'https://images.unsplash.com/photo-1574323347407-f5e1c09b9c1a?w=200&h=200&fit=crop&q=80' }
    ]
  },
  {
    name: 'Vitamin B12',
    nameAlt: 'Cobalamin',
    benefit: 'Essential for red blood cell formation, nerve function, and DNA synthesis. Deficiency can cause anemia and neurological issues.',
    color: '#a855f7',
    icon: '🩸',
    foods: [
      { name: 'Clams', image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=200&h=200&fit=crop&q=80' },
      { name: 'Liver', image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=200&h=200&fit=crop&q=80' },
      { name: 'Salmon', image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=200&h=200&fit=crop&q=80' },
      { name: 'Milk', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200&h=200&fit=crop&q=80' },
      { name: 'Eggs', image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=200&h=200&fit=crop&q=80' }
    ]
  },
  {
    name: 'Vitamin C',
    nameAlt: 'Ascorbic Acid',
    benefit: 'Powerful antioxidant that boosts immunity, helps collagen production, aids iron absorption, and promotes wound healing.',
    color: '#f97316',
    icon: '🍊',
    foods: [
      { name: 'Oranges', image: 'https://images.unsplash.com/photo-1557800636-894a64c1696f?w=200&h=200&fit=crop&q=80' },
      { name: 'Bell Peppers', image: 'https://images.unsplash.com/photo-1563565375-f3fdfdb2e3e1?w=200&h=200&fit=crop&q=80' },
      { name: 'Strawberries', image: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=200&h=200&fit=crop&q=80' },
      { name: 'Kiwifruit', image: 'https://images.unsplash.com/photo-1585059895524-723f3a2d7c9b?w=200&h=200&fit=crop&q=80' },
      { name: 'Broccoli', image: 'https://images.unsplash.com/photo-1584270354949-c26b8d79e31b?w=200&h=200&fit=crop&q=80' }
    ]
  },
  {
    name: 'Vitamin D',
    nameAlt: 'Calciferol',
    benefit: 'Regulates calcium absorption for strong bones and teeth. Supports immune function and mood regulation. Sunlight is the primary source.',
    color: '#3b82f6',
    icon: '☀️',
    foods: [
      { name: 'Sunlight', image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=200&h=200&fit=crop&q=80' },
      { name: 'Fatty Fish', image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=200&h=200&fit=crop&q=80' },
      { name: 'Egg Yolks', image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=200&h=200&fit=crop&q=80' },
      { name: 'Fortified Milk', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200&h=200&fit=crop&q=80' },
      { name: 'Mushrooms', image: 'https://images.unsplash.com/photo-1504672281656-e4983d70414b?w=200&h=200&fit=crop&q=80' }
    ]
  },
  {
    name: 'Vitamin E',
    nameAlt: 'Tocopherol',
    benefit: 'Powerful antioxidant that protects cells from damage, supports immune health, and helps widen blood vessels to prevent clotting.',
    color: '#84cc16',
    icon: '🛡️',
    foods: [
      { name: 'Almonds', image: 'https://images.unsplash.com/photo-1508061253366-f7da1583aebc?w=200&h=200&fit=crop&q=80' },
      { name: 'Sunflower Seeds', image: 'https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=200&h=200&fit=crop&q=80' },
      { name: 'Spinach', image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=200&h=200&fit=crop&q=80' },
      { name: 'Avocado', image: 'https://images.unsplash.com/photo-1519162808019-7d1ca15b52e8?w=200&h=200&fit=crop&q=80' },
      { name: 'Butternut Squash', image: 'https://images.unsplash.com/photo-1596097635121-14b800e5fb4e?w=200&h=200&fit=crop&q=80' }
    ]
  },
  {
    name: 'Vitamin K',
    nameAlt: 'Phylloquinone',
    benefit: 'Essential for blood clotting and bone metabolism. Helps activate proteins that regulate calcium binding in bones and arteries.',
    color: '#06b6d4',
    icon: '🩹',
    foods: [
      { name: 'Kale', image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=200&h=200&fit=crop&q=80' },
      { name: 'Brussels Sprouts', image: 'https://images.unsplash.com/photo-1584270354949-c26b8d79e31b?w=200&h=200&fit=crop&q=80' },
      { name: 'Broccoli', image: 'https://images.unsplash.com/photo-1584270354949-c26b8d79e31b?w=200&h=200&fit=crop&q=80' },
      { name: 'Cabbage', image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=200&h=200&fit=crop&q=80' },
      { name: 'Green Beans', image: 'https://images.unsplash.com/photo-1515543904379-3d757f8b2d9c?w=200&h=200&fit=crop&q=80' }
    ]
  }
];

const SPORTS_SCHEDULE = {
  'Football': {
    '2026-06-14': [
      { id: 'match_yesterday_football', homeTeam: 'Manchester United', awayTeam: 'Arsenal', homeScore: 2, awayScore: 1, minute: 90, score: '2 - 1', status: 'FINISHED', time: 'Yesterday', details: 'Old Trafford' }
    ],
    '2026-06-15': [
      { id: 'match_1', isLive: true, homeTeam: 'Real Madrid', awayTeam: 'Barcelona', homeScore: 4, awayScore: 1, minute: 34, status: 'LIVE', time: 'LIVE NOW', details: 'El Clasico', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4' }
    ],
    '2026-06-16': [
      { id: 'match_tomorrow_football', homeTeam: 'Manchester City', awayTeam: 'Chelsea', status: 'Upcoming', time: 'Tomorrow 8:00 PM', details: 'Etihad Stadium' }
    ],
    '2026-06-17': [
      { id: 'match_future_football', isLive: true, homeTeam: 'Paris Saint-Germain', awayTeam: 'Bayern Munich', homeScore: 2, awayScore: 1, minute: 67, status: 'LIVE', time: 'LIVE NOW', details: 'Parc des Princes - UEFA Champions League Final', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4' }
    ]
  },
  'Cricket': {
    '2026-06-14': [
      { id: 'match_yesterday_cricket', homeTeam: 'England', awayTeam: 'South Africa', homeScore: '185/6', awayScore: '182', overs: 50, score: '185/6 vs 182', status: 'FINISHED', time: 'Yesterday', details: 'Lord\u2019s Cricket Ground - England won by 4 wickets' }
    ],
    '2026-06-15': [
      { id: 'match_2', isLive: true, homeTeam: 'India', awayTeam: 'Australia', homeScore: '89/1', awayScore: '87', overs: 6.5, status: 'LIVE', time: 'LIVE NOW', details: 'Border-Gavaskar Trophy Series', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' }
    ],
    '2026-06-16': [
      { id: 'match_tomorrow_cricket', homeTeam: 'Pakistan', awayTeam: 'New Zealand', status: 'Upcoming', time: 'Tomorrow 2:00 PM', details: 'National Bank Arena' }
    ],
    '2026-06-17': [
      { id: 'match_future_cricket', homeTeam: 'India', awayTeam: 'West Indies', status: 'Upcoming', time: 'June 17 3:30 PM', details: 'Kensington Oval' }
    ]
  },
  'Badminton': {
    '2026-06-14': [
      { id: 'match_yesterday_badminton', homeTeam: 'Viktor Axelsen', awayTeam: 'Kento Momota', homeScore: 21, awayScore: 18, sets: 2, score: '2 - 1 (Sets)', status: 'FINISHED', time: 'Yesterday', details: 'BWF World Tour Finals' }
    ],
    '2026-06-15': [
      { id: 'match_3', isLive: true, homeTeam: 'P.V. Sindhu', awayTeam: 'Carolina Marin', homeScore: 21, awayScore: 14, sets: 1, status: 'LIVE', time: 'LIVE NOW', details: 'Indonesia Open Finals', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' }
    ],
    '2026-06-16': [
      { id: 'match_tomorrow_badminton', homeTeam: 'Tai Tzu-ying', awayTeam: 'An Se-young', status: 'Upcoming', time: 'Tomorrow 11:00 AM', details: 'Japan Open Semifinals' }
    ],
    '2026-06-17': [
      { id: 'match_future_badminton', homeTeam: 'Lakshya Sen', awayTeam: 'Lee Zii Jia', status: 'Upcoming', time: 'June 17 1:00 PM', details: 'Singapore Open Quarterfinals' }
    ]
  }
};

const HELPLINES = [
  { category: '🚨 Emergency', color: '#ef4444', contacts: [
    { name: 'Police Emergency', number: '100', desc: 'Immediate police assistance for any emergency situation' },
    { name: 'Fire Brigade', number: '101', desc: 'Report fires and request fire department assistance' },
    { name: 'Ambulance', number: '102', desc: 'Medical emergency ambulance service' },
    { name: 'Disaster Management', number: '103', desc: 'National disaster response and management' },
    { name: 'Women Helpline', number: '1091', desc: '24/7 support for women in distress' },
    { name: 'Child Helpline', number: '1098', desc: 'Support and rescue for children in need' },
    { name: 'Road Accident', number: '1073', desc: 'Highway road accident emergency service' },
    { name: 'Tourist Helpline', number: '1363', desc: 'Multi-language tourist assistance hotline' }
  ]},
  { category: '🏛️ Government', color: '#3b82f6', contacts: [
    { name: 'Prime Minister Office', number: '01-4212000', desc: 'Office of the Prime Minister' },
    { name: 'President Office', number: '01-4211000', desc: 'Office of the President' },
    { name: 'Education Ministry', number: '01-4200275', desc: 'Ministry of Education, Science and Technology' },
    { name: 'Health Ministry', number: '01-4262543', desc: 'Ministry of Health and Population' },
    { name: 'Home Ministry', number: '01-4213000', desc: 'Ministry of Home Affairs' },
    { name: 'Foreign Affairs', number: '01-4214000', desc: 'Ministry of Foreign Affairs' },
    { name: 'Finance Ministry', number: '01-4215000', desc: 'Ministry of Finance' },
    { name: 'Law Ministry', number: '01-4216000', desc: 'Ministry of Law, Justice and Parliamentary Affairs' }
  ]},
  { category: '🏥 Hospitals', color: '#10b981', contacts: [
    { name: 'Teaching Hospital', number: '01-4412301', desc: 'Tribhuvan University Teaching Hospital (TUTH)' },
    { name: 'Bir Hospital', number: '01-4221119', desc: 'National Academy of Medical Sciences' },
    { name: 'Patan Hospital', number: '01-5522295', desc: 'Patan Academy of Health Sciences' },
    { name: 'Kanti Children Hospital', number: '01-4412502', desc: 'Specialized children\'s hospital' },
    { name: 'Mental Hospital', number: '01-4270554', desc: 'Lagankhel Mental Hospital' },
    { name: 'Cancer Hospital', number: '01-4331885', desc: 'BP Koirala Memorial Cancer Hospital' },
    { name: 'Eye Hospital', number: '01-4412038', desc: 'Tilganga Institute of Ophthalmology' },
    { name: 'Maternity Hospital', number: '01-4412604', desc: 'Paropakar Maternity and Women\'s Hospital' }
  ]},
  { category: '📱 Social Media IDs', color: '#8b5cf6', contacts: [
    { name: 'Prime Minister (Facebook)', number: '@PMOfficeNepal', desc: 'Official Facebook page of PM Office' },
    { name: 'President (Facebook)', number: '@PresidencyNepal', desc: 'Official Facebook page of the President' },
    { name: 'Education Ministry (Facebook)', number: '@MOENepal', desc: 'Official Facebook page of Education Ministry' },
    { name: 'Nepal Police (Facebook)', number: '@NepalPoliceHQ', desc: 'Official Nepal Police Facebook page' },
    { name: 'Prime Minister (Twitter/X)', number: '@PM_Nepal', desc: 'Official Twitter account of PM Office' },
    { name: 'President (Twitter/X)', number: '@PresidentNepal', desc: 'Official Twitter account of the President' },
    { name: 'Nepal Police (Twitter/X)', number: '@NepalPoliceHQ', desc: 'Official Twitter account of Nepal Police' },
    { name: 'Tourism Nepal (Facebook)', number: '@NepalTourism', desc: 'Nepal Tourism Board Facebook page' }
  ]},
];
const STUDY_ROADMAPS = [
  { stream: '💻 Computer Science (CSE)', icon: '💻', color: '#10b981', roadmapLink: 'https://roadmap.sh/computer-science', courses: [
    { level: 'Bachelor', name: 'BE Computer', duration: '4 Years', colleges: ['IOE Pulchowk', 'IOE Thapathali', 'Kathford College', 'ACEM College'], subjects: ['DSA', 'OS', 'CN', 'DBMS', 'AI', 'SE'] },
    { level: 'Bachelor', name: 'BSc CSIT', duration: '4 Years', colleges: ['ASCOL', 'St. Xavier\'s', 'Prime College', 'KIST College'], subjects: ['Programming', 'Math', 'Statistics', 'Web Tech'] },
    { level: 'Bachelor', name: 'BCA', duration: '4 Years', colleges: ['Padma Kanya', 'Tribhuwan Uni', 'PU Reg'], subjects: ['Programming', 'Accounting', 'Multimedia'] },
    { level: 'Diploma', name: 'IT / Engineering', duration: '3 Years', colleges: ['CTEVT Affiliated'], subjects: ['Computer Hardware', 'Networking', 'Programming'] }
  ]},
  { stream: '📊 Management', icon: '📊', color: '#f59e0b', roadmapLink: 'https://roadmap.sh/business', courses: [
    { level: 'Bachelor', name: 'BBA', duration: '4 Years', colleges: ['Kathmandu College', 'NCC', 'Ace Institute', 'Prime College'], subjects: ['Marketing', 'Finance', 'HR', 'Accounting'] },
    { level: 'Bachelor', name: 'BBS', duration: '4 Years', colleges: ['TU Affiliated', 'PU Affiliated'], subjects: ['Accounting', 'Economics', 'Business Law'] },
    { level: 'Bachelor', name: 'BHM', duration: '4 Years', colleges: ['NATHM', 'KIM College', 'Purbanchal Uni'], subjects: ['Hotel Ops', 'Tourism', 'F&B Service'] },
    { level: 'Bachelor', name: 'CA (Chartered Accountancy)', duration: '3.5 Years', colleges: ['ICAN Affiliated'], subjects: ['Auditing', 'Taxation', 'Financial Reporting'] }
  ]},
  { stream: '🔬 Science & Biotech', icon: '🔬', color: '#3b82f6', roadmapLink: 'https://roadmap.sh/data-science', courses: [
    { level: 'Bachelor', name: 'BSc Nursing', duration: '4 Years', colleges: ['BPKIHS', 'Nursing Campus Maharajgunj', 'CMC'], subjects: ['Anatomy', 'Pharmacology', 'Community Health'] },
    { level: 'Bachelor', name: 'MBBS', duration: '5.5 Years', colleges: ['IOM Maharajgunj', 'BPKIHS', 'KMC', 'NMC'], subjects: ['Medicine', 'Surgery', 'Pediatrics', 'OBG'] },
    { level: 'Bachelor', name: 'BSc Microbiology', duration: '4 Years', colleges: ['ASCOL', 'St. Xavier\'s', 'Bhairahawa Campus'], subjects: ['Microbiology', 'Immunology', 'Genetics'] },
    { level: 'Bachelor', name: 'BPharm', duration: '4 Years', colleges: ['PU Reg', 'TU Affiliated'], subjects: ['Pharmacology', 'Pharm Chem', 'Pharmaceutics'] }
  ]},
  { stream: '📐 Engineering (Other)', icon: '📐', color: '#ec4899', roadmapLink: 'https://roadmap.sh/software-architect', courses: [
    { level: 'Bachelor', name: 'BE Civil', duration: '4 Years', colleges: ['IOE Pulchowk', 'IOE Kathmandu', 'Purbanchal Uni'], subjects: ['Structure', 'Geotech', 'Hydraulics', 'Transportation'] },
    { level: 'Bachelor', name: 'BE Electrical', duration: '4 Years', colleges: ['IOE Pulchowk', 'IOE Thapathali', 'NIT'], subjects: ['Power System', 'Electronics', 'Machines'] },
    { level: 'Bachelor', name: 'BE Architecture', duration: '5 Years', colleges: ['IOE Pulchowk', 'IOE Thapathali', 'KMC'], subjects: ['Design', 'History', 'Building Tech'] },
    { level: 'Bachelor', name: 'BE Mechanical', duration: '4 Years', colleges: ['IOE Pulchowk', 'NIT', 'KEC'], subjects: ['Thermal', 'Design', 'Manufacturing'] }
  ]},
  { stream: '📖 Humanities & Education', icon: '📖', color: '#a855f7', courses: [
    { level: 'Bachelor', name: 'BA', duration: '3-4 Years', colleges: ['TU Affiliated', 'PU Affiliated'], subjects: ['English', 'Sociology', 'Psychology', 'Economics'] },
    { level: 'Bachelor', name: 'BEd', duration: '4 Years', colleges: ['TU Affiliated', 'KU Affiliated'], subjects: ['Teaching Methods', 'Curriculum', 'Psychology'] },
    { level: 'Bachelor', name: 'BSW', duration: '4 Years', colleges: ['TU Affiliated'], subjects: ['Social Work', 'Community Dev', 'Research'] },
    { level: 'Bachelor', name: 'LLB', duration: '5 Years', colleges: ['NALSAR', 'TU Law', 'PU Law'], subjects: ['Constitution', 'Criminal Law', 'Contract Law'] }
  ]},
];
const NEPAL_QUESTIONS = [
  { category: '🏛️ Politics & Government', color: '#ef4444', icon: '🏛️', questions: [
    { q: 'Who is the current Prime Minister of Nepal (2026)?', a: 'Balendra (Balen) Shah — assumed office 27 March 2026, leader of Rastriya Swatantra Party (RSP).' },
    { q: 'Who is the current President of Nepal?', a: 'Ram Chandra Paudel — assumed office 13 March 2023, third President of the Federal Democratic Republic of Nepal.' },
    { q: 'Who is the Vice President of Nepal?', a: 'Ram Sahaya Yadav — assumed office alongside President Paudel in 2023.' },
    { q: 'Who was the first President of Nepal?', a: 'Dr. Ram Baran Yadav — served from 2008 to 2015 after Nepal became a federal republic.' },
    { q: 'When did Nepal become a Federal Democratic Republic?', a: '28 May 2008 — the 240-year-old Shah monarchy was abolished by the first Constituent Assembly.' },
    { q: 'How many provinces does Nepal have?', a: '7 provinces: Koshi, Madhesh, Bagmati, Gandaki, Lumbini, Karnali, Sudurpashchim.' },
    { q: 'What is the name of Nepal\'s parliament?', a: 'Federal Parliament — bicameral with House of Representatives (275 seats) and National Assembly (59 seats).' },
    { q: 'When was the current Constitution of Nepal promulgated?', a: '20 September 2015 (BS 2072 Ashoj 3).' }
  ]},
  { category: '🗺️ Geography & Nature', color: '#10b981', icon: '🏔️', questions: [
    { q: 'What is the highest peak in Nepal and the world?', a: 'Mount Everest (Sagarmatha in Nepali, Chomolungma in Tibetan) — 8,848.86 meters (29,031.7 feet).' },
    { q: 'What is the national flower of Nepal?', a: 'Rhododendron (Laligurans) — found in abundance across the Himalayan region.' },
    { q: 'What is the national bird of Nepal?', a: 'Danphe (Lophophorus / Himalayan Monal) — a colorful pheasant found in high-altitude regions.' },
    { q: 'What is the national animal of Nepal?', a: 'Cow — considered sacred in Hinduism and protected by law.' },
    { q: 'What is the longest river in Nepal?', a: 'Karnali River — approximately 507 km within Nepal, originating from Mount Kailash.' },
    { q: 'What is the deepest lake in Nepal?', a: 'Phoksundo Lake in Dolpa — 145 meters deep, known for its turquoise color.' },
    { q: 'Which UNESCO World Heritage Sites are in Nepal?', a: 'Kathmandu Valley (7 monument groups), Sagarmatha National Park, Chitwan National Park, Lumbini (birthplace of Buddha).' },
    { q: 'How many countries border Nepal?', a: '2 — China (Tibet) to the north and India to the south, east, and west.' }
  ]},
  { category: '📜 History & Culture', color: '#f59e0b', icon: '🕌', questions: [
    { q: 'Who is known as the "Father of the Nation" in Nepal?', a: 'Prithvi Narayan Shah — unified Nepal in 1744-1769 and founded the Shah dynasty.' },
    { q: 'When did unification of Nepal begin?', a: '1744 — Prithvi Narayan Shah launched the campaign from Gorkha to unify small kingdoms into modern Nepal.' },
    { q: 'What is the national language of Nepal?', a: 'Nepali — written in Devanagari script. There are 120+ languages spoken as mother tongues.' },
    { q: 'What is the national game of Nepal?', a: 'Dandi Biyo — a traditional outdoor game played with a stick and a wooden pin. (Volleyball was also declared National Game in 2017.)' },
    { q: 'How many ethnic groups are in Nepal?', a: '126+ caste/ethnic groups recognized in the 2021 census. The largest include Chhetri, Brahmin, Magar, Tharu, Tamang, Newar.' },
    { q: 'What major festival is known as the "Festival of Lights" in Nepal?', a: 'Tihar (Deepawali) — a 5-day festival honoring crows, dogs, cows, and Laxmi, Goddess of Wealth.' },
    { q: 'When is Constitution Day celebrated in Nepal?', a: '3rd of Asoj (September 20) — commemorating the 2015 Constitution.' },
    { q: 'Which Nepali is called "The Iron Man of Nepal"?', a: 'Khadga Prasad Sharma Oli (KP Oli) — former PM, earned the nickname for his assertive style.' }
  ]},
  { category: '💰 Economy & Statistics', color: '#8b5cf6', icon: '📊', questions: [
    { q: 'What is the currency of Nepal?', a: 'Nepalese Rupee (NPR). 1 Rupee = 100 Paisa.' },
    { q: 'Nepal\'s GDP is primarily driven by which sector?', a: 'Agriculture — employs ~60% of the population. Remittances (from overseas workers) are also a major contributor.' },
    { q: 'What is the main export of Nepal?', a: 'Textiles (garments, pashmina, carpets), tea, coffee, ginger, lentils, and handicrafts.' },
    { q: 'Which is the largest stock exchange in Nepal?', a: 'NEPSE — Nepal Stock Exchange, established in 1993, located in Kathmandu.' },
    { q: 'What is the current population of Nepal (2026 est.)?', a: 'Approximately 30-31 million (2021 census: 29.1 million, growing at ~1% annually).' },
    { q: 'What is the literacy rate of Nepal?', a: '~76% (2024) — male 83%, female 70%, improving steadily.' },
    { q: 'How much foreign remittance does Nepal receive annually?', a: 'Over NPR 1.2 trillion (~$9 billion USD) — one of the highest remittance-dependent economies in the world.' },
  ]},
  { category: '⚽ Sports & Achievements', color: '#3b82f6', icon: '⚽', questions: [
    { q: 'Who is Nepal\'s most famous international footballer?', a: 'Kiran Chemjong — goalkeeper, former captain of Nepal national team, played for clubs in Malaysia and India.' },
    { q: 'Which is the most popular sport in Nepal?', a: 'Cricket — has overtaken football in recent years. The national team achieved ODI status in 2018.' },
    { q: 'Who is the fastest Nepali runner?', a: 'Gopi Chandra Parki — holds multiple national records in long-distance running.' },
    { q: 'Who was the first Nepali to climb Mount Everest?', a: 'Tenzing Norgay Sherpa (with Sir Edmund Hillary) on 29 May 1953. Technically born in Nepal, died in India.' },
    { q: 'Who was the first woman to climb Everest from Nepal?', a: 'Junko Tabei (Japanese) was first woman overall. Pasang Lhamu Sherpa was the first Nepali woman (22 April 1993).' },
    { q: 'How many times has Nepal won the SAFF Championship?', a: 'Never as of 2026. Best result: Runners-up (3 times — 1993, 2003, 2025 in men\'s; women won SAFF in 2022).' },
  ]},
  { category: '⚡ Current Affairs (2082)', color: '#f97316', icon: '🔥', questions: [
    { q: 'Who became the 43rd Prime Minister of Nepal in 2026?', a: 'Balendra Shah (Balen Shah) — sworn in on 27 March 2026 after RSP\'s landslide victory in the March 5 general election.' },
    { q: 'What party won the 2026 general election in Nepal?', a: 'Rastriya Swatantra Party (RSP) led by Balen Shah — won a landslide majority, first time an independent-origin party governed alone.' },
    { q: 'Which former Prime Minister was defeated in the 2026 election?', a: 'Khadga Prasad Sharma Oli (KP Oli) — lost Jhapa 5 constituency to Balen Shah, a seat he held for decades.' },
    { q: 'What is the estimated GDP of Nepal for FY 2082/83?', a: 'Approx. NPR 55.4 trillion at consumer prices (as per National Statistics Office report, Jestha 2083).' },
    { q: 'Which province had the highest financial irregularities in the 63rd Auditor General report?', a: 'Bagmati Province — reported the highest amount of irregularities per the Mahalekha Parikshak\'s 63rd annual report (2082).' },
    { q: 'Which Nepali film won the Jury Prize at the 2026 Cannes Film Festival?', a: 'A Nepali film won the "Un Certain Regard" Jury Prize at the 79th Cannes Film Festival (2026) — a historic first for Nepal.' },
    { q: 'Which month (Nepali) is the federal parliament\'s current session ending?', a: 'The current session was decided to end in Chaitra 2082 (March/April 2026) per parliamentary decision.' },
    { q: 'What is the global happiness rank of Nepal in 2026?', a: 'Ranked in the top 100 (specific position updated annually in the World Happiness Report by UN Sustainable Development Solutions Network).' },
  ]},
];
const formatDateLabel = (dateStr) => {
  const date = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  const diff = Math.round((date - today) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Today';
  if (diff === -1) return 'Yesterday';
  if (diff === 1) return 'Tomorrow';
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

const PERSON_IMAGES = {
  'Balen Shah': 'https://upload.wikimedia.org/wikipedia/commons/5/55/Balen_Shah_-_Mayor_of_Kathmandu.png',
  'Ram Chandra Paudel': 'https://upload.wikimedia.org/wikipedia/commons/6/62/President_Ram_Chandra_Poudel%2C_Official_portrait_%28January_2024%29.jpg',
  'Ram Sahaya Yadav': '',
  'Balendra Shah': 'https://upload.wikimedia.org/wikipedia/commons/5/55/Balen_Shah_-_Mayor_of_Kathmandu.png',
};
const PersonAvatar = ({ name, size = 56, imgUrl }) => {
  const initials = (name || '').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const colors = ['#ef4444','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ec4899','#f97316'];
  const c = colors[name ? name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length : 0];
  const fs = Math.max(12, size * 0.36);
  if (!imgUrl) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: size, height: size, borderRadius: '50%', background: c + '25', color: c, fontWeight: 700, fontSize: fs + 'px', flexShrink: 0, border: '2px solid ' + c + '40' }}>
        {initials || '?'}
      </span>
    );
  }
  return (
    <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: size, height: size, borderRadius: '50%', flexShrink: 0, border: '2px solid rgba(255,255,255,0.12)', background: c + '25' }}>
      <span style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: fs + 'px', fontWeight: 700, color: c, borderRadius: '50%' }}>
        {initials}
      </span>
      <img src={imgUrl} alt={name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', position: 'relative', zIndex: 1 }} onError={e => { e.target.style.display = 'none'; }} />
    </span>
  );
};

const GEN_Z_MARTYRS = [
  { name: 'Buddha Bahadur Tamang', location: 'Kirtipur-2, Kathmandu', desc: 'Son of Nepal, laid down his life for democracy' },
  { name: 'Iswat Bahadur Adhikari', location: 'Kathmandu-11', desc: 'Young voice silenced in the fight for justice' },
  { name: 'Santosh Bishwakarma', location: 'Belka-4, Udayapur', desc: 'Dreams cut short by bullets on Bhadra 23' },
  { name: 'Sulav Raj Shrestha', location: 'Nepalgunj-1, Banke', desc: 'Rose against corruption, gave everything' },
  { name: 'Ayush Thapa', location: 'Nepalgunj-1, Banke', desc: 'Youth icon who marched for a better Nepal' },
  { name: 'Shriyam Chaulagain', location: 'Belbari-11, Morang', desc: '21 years old, martyr of the Gen Z movement' },
  { name: 'Gaurav Joshi', location: 'Dhangadhi-5, Kailali', desc: 'Far-west hero who stood for good governance' },
  { name: 'Yog Bahadur Shrestha', location: 'Bahrabise-6, Sindhupalchok', desc: 'Laid to rest draped in the national flag' },
  { name: 'Umesh Mahat', location: 'Chautara-8, Sindhupalchok', desc: 'Among the first to fall on that fateful day' },
  { name: 'Asahab Alam Thakurai', location: 'Birgunj-12, Parsa', desc: 'Gave his tomorrow so Nepal could have a future' },
  { name: 'Sauran Kishor Shrestha', location: 'Baglung-4, Baglung', desc: 'Student leader who never returned home' },
  { name: 'Subhash Kumar Bohora', location: 'Khaptad Chhanna-7, Bajhang', desc: 'Martyr with state honours at Pashupati' },
  { name: 'Bhimraj Dhami', location: 'Durgathali Rural Municipality-1', desc: '28 years old, married just a year ago' },
  { name: 'Rasik Khatri Khatiwada', location: 'Panauti-10, Kavrepalanchok', desc: 'Dreamed of an uncorrupt Nepal' },
  { name: 'Dilanarayan Tamang', location: 'Temal Rural Municipality-7', desc: 'Brave heart who fought for his rights' },
  { name: 'Vinod Maharjan', location: 'Lalitpur-7', desc: 'Cremated at Pashupati Aryaghat with full honours' },
  { name: 'Yogendra Nyaupane', location: 'Golanjor-1, Sindhuli', desc: 'His name now etched in the Gazette as martyr' },
  { name: 'Milan Rai', location: 'Dudhauli-8', desc: 'Police constable, declared martyr by the state' },
  { name: 'Dipesh Sunuwar', location: 'Tinpatan-6', desc: 'Youngest among the 45 declared martyrs' },
  { name: 'Chhatraman Kuthumi', location: 'Pakhribas-2, Dhankuta', desc: 'Fell in the eastern hills for a free Nepal' },
  { name: 'Ojhan Budha', location: 'Swamikartik-2, Bajura', desc: 'From remote Bajura to national martyr' },
  { name: 'Sarkumar Rai', location: 'Chaudandigadhi-3, Udayapur', desc: 'Never saw the change he died for' },
  { name: 'Shabharaj Balami Shrestha', location: 'Kakani-1, Nuwakot', desc: 'His sacrifice shall not be forgotten' },
  { name: 'Lachhuman Rai', location: 'Panchakanya-2', desc: 'Gave his life in the movement for justice' },
  { name: 'Dhiraj Shrestha', location: 'Tadi-3', desc: 'Martyred while demanding accountability' },
  { name: 'Devkumar Subedi', location: 'Lalbandi-5, Sarlahi', desc: 'From the plains of Sarlahi to martyrdom' },
  { name: 'Pravin Kulung', location: 'Silichong-3, Sankhuwasabha', desc: 'Himalayan son who fell for the nation' },
  { name: 'Nikhita Gautam', location: 'Kalika-8, Chitwan', desc: 'Brave sister whose voice will echo forever' },
  { name: 'Abhishek Chaulagain', location: 'Shailung-4, Dolakha', desc: 'Laid down his life in Bhadra 2082' },
  { name: 'Mahesh Budhathoki', location: 'Bigu-3', desc: 'One of the many who paid the ultimate price' },
  { name: 'Vijay Chaudhary', location: 'Lahan-15, Siraha', desc: 'Madhesh son who stood against corruption' },
  { name: 'Niraj Pant', location: 'Dasharathchanda-6, Baitadi', desc: 'From the far-west to eternal glory' },
  { name: 'Deepak Singh Saud', location: 'Shivanath-2, Baitadi', desc: 'Brave youth who fought for good governance' },
  { name: 'Abhishek Shrestha', location: 'Inaruwa-6, Sunsari', desc: 'His dreams now live on in a free Nepal' },
  { name: 'Sajan Rai', location: 'Dharan-22', desc: 'His name is now a symbol of resistance' },
  { name: 'Mohan Sardar', location: 'Itahari-14', desc: 'Laid down his life for future generations' },
  { name: 'Madhav Saru Magar', location: 'Bhumikasthan-4, Arghakhanchi', desc: 'His courage will never be forgotten' },
  { name: 'Bimbal Babu Bhatt', location: 'Barpak Sulikot-5, Gorkha', desc: 'From Gorkha hills to martyr\'s hall of fame' },
  { name: 'Arjun Bhatt', location: 'Gandaki-4', desc: 'Young soul who gave his all for the cause' },
  { name: 'Anish Parajuli', location: 'Palungtar-2', desc: 'His sacrifice recorded in the Nepal Gazette' },
  { name: 'Gyanindra Sedhai', location: 'Arjundhara-11, Jhapa', desc: 'Forever young, forever in our hearts' },
  { name: 'Dinesh Rajbanshi', location: 'Ward No. 8', desc: 'Martyred for a corruption-free nation' },
  { name: 'Kamal Bhandari', location: 'Hilihang-2, Panchthar', desc: 'Panchthar\'s son who died for democracy' },
  { name: 'Amrit Gurung', location: 'Rupa-5, Kaski', desc: 'Police havildar, martyr in the line of duty' },
  { name: 'Uttam Thapa', location: 'Lekam-3, Darchula', desc: 'Police jawan, declared martyr by the state' },
];

const ZEN_G_PHOTOS = GEN_Z_MARTYRS.map((m, i) => ({
  id: i + 1,
  url: `https://images.unsplash.com/photo-${[
    '1507003211169-0a1dd7228f2d', '1518531933037-91b2f5f229cc', '1519834785169-98be25ec3f84',
    '1506905925346-21bda4d32df4', '1470071459604-3b09ec3b49c9', '1433086966358-54859d0ed716',
    '1464822759023-fed622ff2c3b', '1502082553048-f009c37129b9', '1447752875215-b2761acb3c5d',
    '1475924156734-496f6cac6ec1', '1504198453319-5ce911bafcde', '1519681393784-d120267933ba',
    '1518173946687-a36f968f7fb9', '1494500764479-0c8f2919a3d8', '1486870591958-9b9d0d1dda99',
    '1482938289607-e9573fc25ebb', '1469474968028-56623f02e42e', '1440581811476-16e6c054d51e',
    '1518173946687-a36f968f7fb9', '1504198453319-5ce911bafcde', '1447752875215-b2761acb3c5d',
    '1519681393784-d120267933ba', '1507003211169-0a1dd7228f2d', '1518531933037-91b2f5f229cc',
    '1464822759023-fed622ff2c3b', '1475924156734-496f6cac6ec1', '1506905925346-21bda4d32df4',
    '1470071459604-3b09ec3b49c9', '1433086966358-54859d0ed716', '1494500764479-0c8f2919a3d8',
    '1486870591958-9b9d0d1dda99', '1482938289607-e9573fc25ebb', '1469474968028-56623f02e42e',
    '1440581811476-16e6c054d51e', '1507003211169-0a1dd7228f2d', '1518531933037-91b2f5f229cc',
    '1519834785169-98be25ec3f84', '1506905925346-21bda4d32df4', '1470071459604-3b09ec3b49c9',
    '1433086966358-54859d0ed716', '1464822759023-fed622ff2c3b', '1475924156734-496f6cac6ec1',
    '1504198453319-5ce911bafcde', '1519681393784-d120267933ba', '1447752875215-b2761acb3c5d',
  ][i % 45]}?w=600&h=800&fit=crop`,
  title: `${m.name}`,
  desc: `${m.location} — ${m.desc}`,
}));

const LinkifiedText = ({ text }) => {
  if (!text) return null;
  // Match URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return (
    <>
      {parts.map((part, i) => {
        if (part.match(urlRegex)) {
          return <a key={i} href={part} target="_blank" rel="noopener noreferrer" style={{ color: '#8b5cf6', textDecoration: 'underline' }} onClick={(e) => e.stopPropagation()}>{part}</a>;
        }
        return part;
      })}
    </>
  );
};

const NotifToggle = ({ section, state, onToggle, size = '1rem' }) => {
  const isOn = state[section] !== false;
  return (
    <span
      onClick={(e) => { e.stopPropagation(); onToggle(section); }}
      style={{ cursor: 'pointer', fontSize: size, opacity: isOn ? 1 : 0.35, transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', gap: '2px', padding: '2px 4px', borderRadius: '6px', background: isOn ? 'rgba(99,102,241,0.08)' : 'transparent', lineHeight: 1, marginLeft: '6px' }}
      title={isOn ? 'Notifications ON — tap to mute this section' : 'Notifications OFF — tap to enable'}
    >
      {isOn ? '🔔' : '🔕'}
    </span>
  );
};

const VideoPlayer = ({ src, style, ...videoProps }) => {
  if (!src) return null;
  const isYouTube = src.includes('youtube.com/embed') || src.includes('youtube.com/watch') || src.includes('youtu.be');
  if (isYouTube) {
    let embedSrc = src;
    if (src.includes('youtube.com/watch')) {
      try {
        const videoId = new URL(src).searchParams.get('v');
        if (videoId) embedSrc = `https://www.youtube.com/embed/${videoId}`;
      } catch (e) { /* ignore invalid URLs */ }
    } else if (src.includes('youtu.be/')) {
      const videoId = src.split('youtu.be/')[1]?.split('?')[0];
      if (videoId) embedSrc = `https://www.youtube.com/embed/${videoId}`;
    }
    return (
      <iframe
        src={embedSrc}
        style={{ width: '100%', height: '400px', border: 'none', borderRadius: 'inherit', ...style }}
        allowFullScreen
        title="YouTube video player"
      />
    );
  }
  return <video src={src} style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', display: 'block', ...style }} {...videoProps} />;
};

const ReelVideo = ({ src, isPlaying, isMuted }) => {
  const videoRef = useRef(null);
  const isYouTube = src && (src.includes('youtube.com/embed') || src.includes('youtube.com/watch') || src.includes('youtu.be'));

  useEffect(() => {
    if (isYouTube) return;
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log("Reel playback blocked or interrupted:", error);
        });
      }
    } else {
      video.pause();
    }
  }, [isPlaying, isYouTube]);

  useEffect(() => {
    if (isYouTube) return;
    const video = videoRef.current;
    if (!video) return;
    video.muted = isMuted;
  }, [isMuted, isYouTube]);

  if (isYouTube) {
    let embedSrc = src;
    if (src.includes('youtube.com/watch')) {
      try {
        const videoId = new URL(src).searchParams.get('v');
        if (videoId) embedSrc = `https://www.youtube.com/embed/${videoId}`;
      } catch (e) { /* ignore invalid URLs */ }
    } else if (src.includes('youtu.be/')) {
      const videoId = src.split('youtu.be/')[1]?.split('?')[0];
      if (videoId) embedSrc = `https://www.youtube.com/embed/${videoId}`;
    }
    return (
      <iframe
        src={embedSrc}
        style={{ width: '100%', height: '100%', border: 'none' }}
        allowFullScreen
        title="YouTube reel"
      />
    );
  }

    return (
      <video
        ref={videoRef}
        src={src}
        loop
        playsInline
        controls
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    );
};

export default function App() {
  const [theme, setTheme] = useState('dark');
  const [activeReelIndex, setActiveReelIndex] = useState(0);
  const [reelsMuted, setReelsMuted] = useState(true);

  const handleReelsScroll = useCallback((e) => {
    const container = e.target;
    const index = Math.round(container.scrollTop / container.clientHeight);
    setActiveReelIndex(index);
  }, []);

  // Navigation & View Tabs
  // 'feed' (clean posts), 'newspaper' (newspaper layout), 'clustered' (clean posts grouped), 'spam' (gibberish posts), 'analytics' (metrics & graphs)
  const [activeTab, setActiveTab] = useState('feed');
  const [eduActiveTab, setEduActiveTab] = useState('Class 12');

  // Live Sports Watch states
  const todayStr = '2026-06-17';
  const [selectedWatchSport, setSelectedWatchSport] = useState('Football');
  const [selectedWatchDate, setSelectedWatchDate] = useState(todayStr);
  const [selectedWatchMatch, setSelectedWatchMatch] = useState(
    SPORTS_SCHEDULE['Football'] && SPORTS_SCHEDULE['Football'][todayStr]
      ? SPORTS_SCHEDULE['Football'][todayStr][0]
      : null
  );

  // Data State
  const [posts, setPosts] = useState([]);
  const [clusteredPosts, setClusteredPosts] = useState([]);
  const [eduPosts, setEduPosts] = useState([]);
  const [balenPosts, setBalenPosts] = useState([]);
  const [leadersPosts, setLeadersPosts] = useState([]);
  const [isLoadingBalen, setIsLoadingBalen] = useState(false);
  const [isLoadingLeaders, setIsLoadingLeaders] = useState(false);
  const [stats, setStats] = useState(null);

  // UI Indicators
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingEdu, setIsLoadingEdu] = useState(false);
  const [error, setError] = useState(null);
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeNotification, setScrapeNotification] = useState(null);

  // Filters State
  const [search, setSearch] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSentiment, setSelectedSentiment] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [sortBy, setSortBy] = useState('time'); // 'time' or 'engagement'

  // Post Actions State
  const [selectedTargetLang, setSelectedTargetLang] = useState({}); // postId -> selected language
  const [translations, setTranslations] = useState({}); // key 'postId_lang' -> text
  const [isTranslatingAudio, setIsTranslatingAudio] = useState(false);
  const [translatingIds, setTranslatingIds] = useState(new Set()); // set of postIds being translated
  const [speakingPostId, setSpeakingPostId] = useState(null); // tracking currently playing speech
  const [expandedClusters, setExpandedClusters] = useState(new Set()); // set of cluster leadPost IDs

  // Comments State
  const [postComments, setPostComments] = useState({}); // postId -> array of comments
  const [activeCommentPostId, setActiveCommentPostId] = useState(null); // tracking which post has comments pane open
  const [typedComments, setTypedComments] = useState({}); // postId -> current typed text

  // Auth State
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('zebvo_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('zebvo_token') || null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // User Preferences State
  const [myFeedOnly, setMyFeedOnly] = useState(false);
  const [authPreferredCategories, setAuthPreferredCategories] = useState([]);

  // Books State
  const [userBooks, setUserBooks] = useState([]);
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookAuthor, setNewBookAuthor] = useState('');
  const [newBookUrl, setNewBookUrl] = useState('');
  const [activeTimerBookId, setActiveTimerBookId] = useState(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerIntervalRef = useRef(null);

  // Todos State
  const [userTodos, setUserTodos] = useState([]);
  const [newTodoText, setNewTodoText] = useState('');
  const [newTodoDue, setNewTodoDue] = useState('');

  // Calendar State
  const [readingCalendar, setReadingCalendar] = useState([]);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(() => new Date().getFullYear());

  // Tech guide speech synthesis voices ready
  const [voicesReady, setVoicesReady] = useState(false);
  const [speakingGuide, setSpeakingGuide] = useState(null);

  // Android unlock pattern state
  const [patternDots, setPatternDots] = useState([]);
  const [patternResult, setPatternResult] = useState('');
  const [patternError, setPatternError] = useState('');

  // Notification toggles per section
  const [sectionNotifs, setSectionNotifs] = useState(() => {
    try {
      const saved = localStorage.getItem('sectionNotifs');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });
  useEffect(() => {
    localStorage.setItem('sectionNotifs', JSON.stringify(sectionNotifs));
  }, [sectionNotifs]);
  const toggleNotif = (section) => setSectionNotifs(prev => ({...prev, [section]: prev[section] === false ? true : false}));

  // Nepal Quiz state
  const [quizCategory, setQuizCategory] = useState(0);
  const [revealedAnswers, setRevealedAnswers] = useState(new Set());
  const [quizScore, setQuizScore] = useState(0);
  const [quizAttempted, setQuizAttempted] = useState(0);
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      if (window.speechSynthesis.getVoices().length > 0) setVoicesReady(true);
      window.speechSynthesis.onvoiceschanged = () => setVoicesReady(true);
    }
  }, []);

  // Notification permission
  const [notifGranted, setNotifGranted] = useState(false);
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(perm => setNotifGranted(perm === 'granted'));
    }
    if ('Notification' in window && Notification.permission === 'granted') {
      setNotifGranted(true);
    }
  }, []);

  // Create Post State
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [newPostText, setNewPostText] = useState('');
  const [newPostCategory, setNewPostCategory] = useState('General');
  const [newPostRegion, setNewPostRegion] = useState('Nepal');
  const [isCreatingPost, setIsCreatingPost] = useState(false);

  // Newspaper TTS State
  const [speakingArticleId, setSpeakingArticleId] = useState(null);

  // Persisted liked posts tracking (postId -> boolean)
  const [likedPosts, setLikedPosts] = useState({});

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Deletion Timer state
  const [timerTick, setTimerTick] = useState(0);
  const deletedPostIdsRef = useRef(new Set()); // Track posts already sent for deletion to avoid duplicate calls
  useEffect(() => {
    const timer = setInterval(() => setTimerTick(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // Helper: check if a post has expired
  const isPostExpired = (timestamp, category) => {
    const postTime = new Date(timestamp).getTime();
    const isEdu = category && (category.includes('Class 12') || category.includes('Class 10') || category.includes('Class 8'));
    const duration = isEdu ? 60 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    return Date.now() >= postTime + duration;
  };

  // Actually delete an expired post from MongoDB and remove from local state
  const deleteExpiredPost = async (postId) => {
    if (deletedPostIdsRef.current.has(postId)) return; // Already being deleted
    deletedPostIdsRef.current.add(postId);
    try {
      await fetch(`${API_BASE}/posts/${postId}`, { method: 'DELETE' });
      // Remove from local state
      setPosts(prev => prev.filter(p => p.id !== postId));
      setClusteredPosts(prev => prev.filter(c => c.leadPost.id !== postId));
      setEduPosts(prev => prev.filter(p => p.id !== postId));
      console.log(`[App] Expired post ${postId} deleted from MongoDB.`);
    } catch (err) {
      console.error(`[App] Failed to delete expired post ${postId}:`, err);
      deletedPostIdsRef.current.delete(postId); // Allow retry on failure
    }
  };

  // Auto-delete expired posts on every timer tick
  useEffect(() => {
    posts.forEach(post => {
      if (isPostExpired(post.timestamp, post.category)) {
        deleteExpiredPost(post.id);
      }
    });
    clusteredPosts.forEach(cluster => {
      if (cluster.leadPost && isPostExpired(cluster.leadPost.timestamp, cluster.leadPost.category)) {
        deleteExpiredPost(cluster.leadPost.id);
      }
    });
    eduPosts.forEach(post => {
      if (isPostExpired(post.timestamp, post.category)) {
        deleteExpiredPost(post.id);
      }
    });
  }, [timerTick, posts, clusteredPosts, eduPosts]);

  const getDeletionTimer = (timestamp, category) => {
    const postTime = new Date(timestamp).getTime();
    const isEdu = category && (category.includes('Class 12') || category.includes('Class 10') || category.includes('Class 8'));
    const duration = isEdu ? 60 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    const expiryTime = postTime + duration;
    const now = Date.now();
    const remaining = expiryTime - now;
    if (remaining <= 0) return 'This post deleted from this website or platform';

    const d = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const h = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((remaining % (1000 * 60)) / 1000);

    if (isEdu) {
      return `This post deleted from this website or platform: ${d}d ${h}h ${m}m ${s}s`;
    }
    return `This post deleted from this website or platform: ${h}h ${m}m ${s}s`;
  };



  const DEFAULT_COMMENTS_BY_CATEGORY = {
    'Sports': [
      { id: 'c1', authorName: 'Alex Mercer', text: 'This was an absolutely legendary match! Still recovering from that intensity.', timestamp: new Date(Date.now() - 3600000) },
      { id: 'c2', authorName: 'Sarah Jenkins', text: 'Stunning performance. They totally deserved this victory!', timestamp: new Date(Date.now() - 7200000) }
    ],
    'Technology': [
      { id: 'c1', authorName: 'Dr. Evelyn Carter', text: 'The agentic reasoning capabilities here are game-changing. Exciting times ahead.', timestamp: new Date(Date.now() - 1800000) },
      { id: 'c2', authorName: 'TechEnthusiast99', text: 'Amazing, but we need to pay serious attention to safety benchmarks and open access.', timestamp: new Date(Date.now() - 5400000) }
    ],
    'Entertainment': [
      { id: 'c1', authorName: 'MovieCritic_Dave', text: 'Visually spectacular! Nolan does it again. Can’t wait for the official trailer.', timestamp: new Date(Date.now() - 7200000) },
      { id: 'c2', authorName: 'Lina G.', text: 'This cast is loaded! Definite Oscar contender.', timestamp: new Date(Date.now() - 14400000) }
    ],
    'Politics': [
      { id: 'c1', authorName: 'CitizenVoice', text: 'Strongly agree with the need for binding policies. Action speaks louder than words.', timestamp: new Date(Date.now() - 3600000) },
      { id: 'c2', authorName: 'Marcus V.', text: 'Interesting diplomatic dynamics at the summit this year.', timestamp: new Date(Date.now() - 10800000) }
    ],
    'Business': [
      { id: 'c1', authorName: 'InvestorHub', text: 'A cut in interest rates will definitely spark a new wave of venture funding. Bullish!', timestamp: new Date(Date.now() - 1800000) },
      { id: 'c2', authorName: 'PennyTrader', text: 'Market was priced for this, but the quick inflation cool down is great news.', timestamp: new Date(Date.now() - 7200000) }
    ],
    'General': [
      { id: 'c1', authorName: 'CommunityLead', text: 'So happy to see this happening locally! More neighborhoods should start green gardens.', timestamp: new Date(Date.now() - 3600000) },
      { id: 'c2', authorName: 'John Doe', text: 'Great coverage on these community achievements.', timestamp: new Date(Date.now() - 14400000) }
    ],
    'IPO in Nepal': [
      { id: 'c1', authorName: 'NepseBull', text: 'Meroshare has been so slow today. Hoping my application for the hydropower IPO goes through!', timestamp: new Date(Date.now() - 3600000) },
      { id: 'c2', authorName: 'Shambhu_Stock', text: 'Allotment is next Tuesday. Pre-allotment figures show over-subscription by 12 times.', timestamp: new Date(Date.now() - 7200000) }
    ],
    'Trading': [
      { id: 'c1', authorName: 'CryptoTrader', text: 'Bitcoin is holding the support line. Leverage longs are looking risky here.', timestamp: new Date(Date.now() - 1800000) },
      { id: 'c2', authorName: 'FxKing', text: 'CPI data this week will decide the next major trend. I am sitting in cash for now.', timestamp: new Date(Date.now() - 5400000) }
    ],
    'Health': [
      { id: 'c1', authorName: 'NutritionExpert', text: 'Great information! Vitamin D deficiency is more common than people think, especially in winter months.', timestamp: new Date(Date.now() - 1800000) },
      { id: 'c2', authorName: 'FitLife_Anita', text: 'I incorporate most of these vitamin-rich foods in my daily diet and have seen amazing improvements in my energy levels!', timestamp: new Date(Date.now() - 7200000) }
    ]
  };



  // Auth Functions
  const handleAuthSubmit = async () => {
    if (!authUsername.trim() || !authPassword.trim()) {
      setAuthError('Username and password are required.');
      return;
    }
    setAuthLoading(true);
    setAuthError('');
    try {
      const endpoint = authMode === 'register' ? 'auth/register' : 'auth/login';
      const body = { username: authUsername.trim(), password: authPassword.trim() };
      if (authMode === 'register') {
        body.preferredCategories = authPreferredCategories;
      }
      const res = await fetch(`${API_BASE}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.success) {
        setCurrentUser(data.user);
        setAuthToken(data.token);
        if (data.user.preferredCategories) {
          setAuthPreferredCategories(data.user.preferredCategories);
        }
        // Auto-enable myFeedOnly after login/register
        if (data.user.preferredCategories && data.user.preferredCategories.length > 0) {
          setMyFeedOnly(true);
        }
        // Fetch full user data (books, todos, calendar)
        fetchUserData(data.token);
        localStorage.setItem('zebvo_user', JSON.stringify(data.user));
        localStorage.setItem('zebvo_token', data.token);
        setShowAuthModal(false);
        setAuthUsername('');
        setAuthPassword('');
      } else {
        setAuthError(data.error || 'Authentication failed.');
      }
    } catch (err) {
      setAuthError('Network error. Is the backend running?');
    } finally {
      setAuthLoading(false);
    }
  };

  const fetchUserData = async (token) => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        const u = data.user;
        setCurrentUser(prev => prev ? { ...prev, preferredCategories: u.preferredCategories } : null);
        setAuthPreferredCategories(u.preferredCategories || []);
        setUserBooks(u.books || []);
        setUserTodos(u.todos || []);
        setReadingCalendar(u.readingCalendar || []);
        localStorage.setItem('zebvo_user', JSON.stringify({
          id: u.id, username: u.username, avatar: u.avatar, preferredCategories: u.preferredCategories
        }));
      }
    } catch (err) {
      console.error('Failed to fetch user data:', err);
    }
  };

  // Fetch full user data on mount if logged in
  useEffect(() => {
    if (authToken) {
      fetchUserData(authToken);
    }
  }, []);

  const handleLogout = () => {
    setCurrentUser(null);
    setAuthToken(null);
    setUserBooks([]);
    setUserTodos([]);
    setReadingCalendar([]);
    setAuthPreferredCategories([]);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setTimerRunning(false);
    setTimerSeconds(0);
    setActiveTimerBookId(null);
    localStorage.removeItem('zebvo_user');
    localStorage.removeItem('zebvo_token');
  };

  // Timer logic
  useEffect(() => {
    if (timerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds(s => s + 1);
      }, 1000);
    } else if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [timerRunning]);

  const formatTimer = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Notification sound using Web Audio API
  const playNotifSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 800;
      gain.gain.value = 0.3;
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) { /* silent fail */ }
  };

  const sendNotification = (title, body) => {
    if (notifGranted) {
      try {
        new Notification(title, { body, icon: '/favicon.ico' });
      } catch (e) { /* silent fail */ }
    }
    playNotifSound();
  };

  // Create Post Function
  const handleCreatePost = async () => {
    if (!newPostText.trim()) return;
    setIsCreatingPost(true);
    try {
      const res = await fetch(`${API_BASE}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          text: newPostText.trim(),
          category: newPostCategory,
          region: newPostRegion
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowCreatePostModal(false);
        setNewPostText('');
        fetchFeed();
        fetchStats();
        if (activeTab === 'education') {
          fetchEducationPosts(eduActiveTab);
        }
      } else {
        alert(data.error || 'Failed to create post.');
      }
    } catch (err) {
      alert('Failed to create post: ' + err.message);
    } finally {
      setIsCreatingPost(false);
    }
  };

  // Persisted Like Function
  const handleLikePost = async (postId) => {
    if (!currentUser || !authToken) {
      setShowAuthModal(true);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (data.success) {
        setLikedPosts(prev => ({ ...prev, [postId]: data.liked }));
        setPosts(prevPosts =>
          prevPosts.map(p => p.id === postId ? { ...p, likes: data.likes } : p)
        );
        setClusteredPosts(prevClusters =>
          prevClusters.map(c => {
            if (c.leadPost.id === postId) {
              return { ...c, leadPost: { ...c.leadPost, likes: data.likes } };
            }
            return c;
          })
        );
        setEduPosts(prevPosts =>
          prevPosts.map(p => p.id === postId ? { ...p, likes: data.likes } : p)
        );
      }
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  // Persisted Comment Function
  const handlePersistComment = async (postId) => {
    const text = typedComments[postId] || '';
    if (!text.trim()) return;
    if (!currentUser || !authToken) {
      setShowAuthModal(true);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/posts/${postId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ text: text.trim() })
      });
      const data = await res.json();
      if (data.success) {
        const newComment = {
          id: 'comment_' + Math.random().toString(36).substr(2, 9),
          authorName: currentUser.username,
          text: data.comment.text,
          timestamp: new Date(data.comment.timestamp)
        };
        setPostComments(prev => ({
          ...prev,
          [postId]: [newComment, ...(prev[postId] || [])]
        }));
        setPosts(prevPosts =>
          prevPosts.map(p => p.id === postId ? { ...p, comments: data.commentsCount } : p)
        );
        setClusteredPosts(prevClusters =>
          prevClusters.map(c => {
            if (c.leadPost.id === postId) {
              return { ...c, leadPost: { ...c.leadPost, comments: data.commentsCount } };
            }
            return c;
          })
        );
        setEduPosts(prevPosts =>
          prevPosts.map(p => p.id === postId ? { ...p, comments: data.commentsCount } : p)
        );
        setTypedComments(prev => ({ ...prev, [postId]: '' }));
      }
    } catch (err) {
      console.error('Comment error:', err);
    }
  };

  // Newspaper Text-to-Speech
  const handleArticleListen = async (articleId, text, targetLang) => {
    if (speakingArticleId === articleId) {
      window.speechSynthesis.cancel();
      setSpeakingArticleId(null);
      setIsTranslatingAudio(false);
      return;
    }
    window.speechSynthesis.cancel();
    if (!text) return;

    setIsTranslatingAudio(true);
    setSpeakingArticleId(articleId); // Optimistic UI

    try {
      const res = await fetch(`${API_BASE}/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, targetLang })
      });
      const data = await res.json();
      const translatedText = data.success ? data.translatedText : text;

      const utterance = new SpeechSynthesisUtterance(translatedText);
      utterance.lang = targetLang === 'hi' ? 'hi-IN' : targetLang === 'ne' ? 'ne-NP' : 'en-US';
      utterance.rate = 0.95;

      utterance.onend = () => { setSpeakingArticleId(null); setIsTranslatingAudio(false); };
      utterance.onerror = () => { setSpeakingArticleId(null); setIsTranslatingAudio(false); };

      setIsTranslatingAudio(false);
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error('TTS error:', e);
      setIsTranslatingAudio(false);
      setSpeakingArticleId(null);
    }
  };

  const ArticleTTSControls = ({ articleId, text }) => (
    <div className="article-tts-controls" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      <button
        className={`article-tts-btn ${speakingArticleId === articleId ? 'active' : ''}`}
        onClick={() => handleArticleListen(articleId, text, 'ne')}
        disabled={isTranslatingAudio && speakingArticleId === articleId}
      >
        {speakingArticleId === articleId ? <><VolumeX size={12} /> {isTranslatingAudio ? 'Translating...' : 'Listening...'}</> : <><Volume2 size={12} /> Listen Nepali</>}
      </button>
      <button
        className={`article-tts-btn ${speakingArticleId === articleId ? 'active' : ''}`}
        onClick={() => handleArticleListen(articleId, text, 'hi')}
        disabled={isTranslatingAudio && speakingArticleId === articleId}
      >
        {speakingArticleId === articleId ? <><VolumeX size={12} /> {isTranslatingAudio ? 'Translating...' : 'Listening...'}</> : <><Volume2 size={12} /> Listen Hindi</>}
      </button>
      {speakingArticleId === articleId && (
        <button
          className="article-tts-btn cut-btn"
          onClick={() => { window.speechSynthesis.cancel(); setSpeakingArticleId(null); setIsTranslatingAudio(false); }}
        >
          <X size={12} /> Cut
        </button>
      )}
    </div>
  );

  const toggleComments = (postId, category) => {
    setSelectedTargetLang(prev => {
      const next = { ...prev };
      delete next[postId];
      return next;
    });

    if (activeCommentPostId === postId) {
      setActiveCommentPostId(null);
    } else {
      setActiveCommentPostId(postId);
      if (!postComments[postId]) {
        const defaults = DEFAULT_COMMENTS_BY_CATEGORY[category] || DEFAULT_COMMENTS_BY_CATEGORY['General'];
        setPostComments(prev => ({
          ...prev,
          [postId]: defaults
        }));
      }
    }
  };

  const handleAddComment = (postId) => {
    if (!currentUser || !authToken) {
      setShowAuthModal(true);
      return;
    }
    handlePersistComment(postId);
  };

  // Live Football & Native Browser Notification States
  const [footballNotificationsEnabled, setFootballNotificationsEnabled] = useState(() => {
    return localStorage.getItem('football_notifications_enabled') === 'true';
  });
  const [matches, setMatches] = useState([]);
  const processedGoalsRef = useRef(new Set());

  // Web Audio API Double-Tone Chime Synthesizer
  const playGoalChime = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      // First tone (higher frequency, short)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
      gain1.gain.setValueAtTime(0, ctx.currentTime);
      gain1.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.3);

      // Second tone (slightly lower frequency, starting slightly later)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(659.25, ctx.currentTime + 0.12); // E5 note
      gain2.gain.setValueAtTime(0, ctx.currentTime + 0.12);
      gain2.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.17);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ctx.currentTime + 0.12);
      osc2.stop(ctx.currentTime + 0.55);
    } catch (e) {
      console.error('AudioContext error:', e);
    }
  };

  // Trigger browser push notification
  const triggerNotification = (title, body) => {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body: body,
        icon: 'https://ui-avatars.com/api/?name=Zebvo&background=8b5cf6&color=fff'
      });
    }
  };

  // Toggle Live Match Notifications & request permission
  const toggleNotifications = async () => {
    if (footballNotificationsEnabled) {
      setFootballNotificationsEnabled(false);
      localStorage.setItem('football_notifications_enabled', 'false');
    } else {
      if (!('Notification' in window)) {
        alert('Desktop notifications are not supported in this browser.');
        return;
      }
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setFootballNotificationsEnabled(true);
        localStorage.setItem('football_notifications_enabled', 'true');
        triggerNotification('Zebvo Live Tracker', 'Live match notifications enabled!');
        playGoalChime();
      } else {
        alert('Permission denied. Please enable notifications in your browser settings.');
      }
    }
  };

  // Poll live football matches status from backend simulation
  useEffect(() => {
    const fetchLiveMatches = async () => {
      try {
        const res = await fetch(`${API_BASE}/football/live`);
        if (!res.ok) throw new Error('Failed to fetch live matches');
        const data = await res.json();
        if (data.success && data.matches) {
          setMatches(data.matches);

          // Check for new goal events
          data.matches.forEach(match => {
            if (match.goalEvent) {
              const eventKey = `${match.id}_${match.goalEvent.minute}_${match.goalEvent.score}`;
              if (!processedGoalsRef.current.has(eventKey)) {
                processedGoalsRef.current.add(eventKey);

                // Trigger notification and sound chime if enabled
                if (footballNotificationsEnabled) {
                  playGoalChime();
                  triggerNotification(
                    `⚽ GOAL! ${match.homeTeam} vs ${match.awayTeam}`,
                    `${match.goalEvent.team} scores! ${match.goalEvent.scorer} (${match.goalEvent.minute}') - Score: ${match.goalEvent.score}`
                  );
                }
              }
            }
          });
        }
      } catch (err) {
        console.error('Error fetching live matches:', err);
      }
    };

    fetchLiveMatches();
    const interval = setInterval(fetchLiveMatches, 5000);
    return () => clearInterval(interval);
  }, [footballNotificationsEnabled]);

  // Fetch Stats Data
  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/stats`);
      if (!res.ok) throw new Error('Failed to fetch analytics statistics');
      const data = await res.json();
      if (data.success) {
        setStats(data);
      }
    } catch (err) {
      console.error('Stats error:', err);
    }
  };

  // Fetch Main Feed or Clustered Posts based on current filters and activeTab
  const fetchFeed = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Build filter parameters
      const params = new URLSearchParams();

      // If we are on the 'spam' tab, we query for gibberish posts
      if (activeTab === 'spam') {
        params.append('includeSpam', 'true');
      } else {
        params.append('includeSpam', 'false');
      }

      if (selectedPlatform !== 'all') params.append('platform', selectedPlatform);
      if (selectedRegion !== 'all') params.append('region', selectedRegion);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedSentiment !== 'all') params.append('sentiment', selectedSentiment);
      if (selectedLanguage !== 'all') params.append('language', selectedLanguage);
      if (search) params.append('search', search);

      params.append('sortBy', sortBy);
      params.append('sortOrder', 'desc');

      // Fetch normal posts
      const feedRes = await fetch(`${API_BASE}/posts?${params.toString()}`);
      if (!feedRes.ok) throw new Error('Failed to fetch feeds');
      const feedData = await feedRes.json();

      if (feedData.success) {
        setPosts(feedData.posts);
      }

      // Fetch clustered posts
      const clusterRes = await fetch(`${API_BASE}/posts/clustered?${params.toString()}`);
      if (!clusterRes.ok) throw new Error('Failed to fetch clustered threads');
      const clusterData = await clusterRes.json();

      if (clusterData.success) {
        setClusteredPosts(clusterData.clusters);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, selectedPlatform, selectedRegion, selectedCategory, selectedSentiment, selectedLanguage, search, sortBy]);

  // Fetch Education Posts
  const fetchEducationPosts = useCallback(async (classLevel) => {
    setIsLoadingEdu(true);
    try {
      const res = await fetch(`${API_BASE}/posts/education?classLevel=${encodeURIComponent(classLevel)}`);
      if (!res.ok) throw new Error('Failed to fetch education posts');
      const data = await res.json();
      if (data.success) {
        setEduPosts(data.posts);
      }
    } catch (err) {
      console.error('Education fetch error:', err);
    } finally {
      setIsLoadingEdu(false);
    }
  }, []);

  // Load all components
  useEffect(() => {
    fetchFeed();
    fetchStats();
  }, [fetchFeed]);

  // Fetch education posts when activeTab is education or eduActiveTab changes
  useEffect(() => {
    if (activeTab === 'education') {
      fetchEducationPosts(eduActiveTab);
    }
  }, [activeTab, eduActiveTab, fetchEducationPosts]);

  // Fetch Balen Shah posts
  const fetchBalenPosts = useCallback(async () => {
    setIsLoadingBalen(true);
    try {
      const res = await fetch(`${API_BASE}/posts?search=${encodeURIComponent('Balen Shah')}&includeSpam=false&sortBy=time&sortOrder=desc`);
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      if (data.success) setBalenPosts(data.posts);
    } catch (err) {
      console.error('Balen fetch error:', err);
    } finally {
      setIsLoadingBalen(false);
    }
  }, []);

  // Fetch Leaders posts (President, Home Minister, etc.)
  const fetchLeadersPosts = useCallback(async () => {
    setIsLoadingLeaders(true);
    try {
      const res = await fetch(`${API_BASE}/posts?search=${encodeURIComponent('President Nepal Home Minister')}&includeSpam=false&sortBy=time&sortOrder=desc`);
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      if (data.success) setLeadersPosts(data.posts);
    } catch (err) {
      console.error('Leaders fetch error:', err);
    } finally {
      setIsLoadingLeaders(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'balen') fetchBalenPosts();
  }, [activeTab, fetchBalenPosts]);

  useEffect(() => {
    if (activeTab === 'leaders') fetchLeadersPosts();
  }, [activeTab, fetchLeadersPosts]);

  // Listen to window focus or periodically pull stats every 30s to match scraper interval
  useEffect(() => {
    const interval = setInterval(() => {
      fetchStats();
      // If user is on analytics, let's refresh stats. If on feeds, we let them manual refresh or see new updates
      if (activeTab === 'analytics') {
        fetchStats();
      }
    }, 20000);
    return () => clearInterval(interval);
  }, [activeTab]);

  // Handle translation triggering
  const handleTranslate = async (postId, text, targetLang) => {
    if (!targetLang) return;
    setActiveCommentPostId(null); // close comment view to avoid overlap

    const cacheKey = `${postId}_${targetLang}`;
    if (translations[cacheKey]) return; // Already translated

    // Add to translating set
    setTranslatingIds(prev => {
      const next = new Set(prev);
      next.add(postId);
      return next;
    });

    try {
      const response = await fetch(`${API_BASE}/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, targetLang })
      });

      if (!response.ok) throw new Error('Translation failed');
      const data = await response.json();

      if (data.success) {
        setTranslations(prev => ({
          ...prev,
          [cacheKey]: data.translatedText
        }));
      }
    } catch (err) {
      alert(`Could not translate text: ${err.message}`);
    } finally {
      setTranslatingIds(prev => {
        const next = new Set(prev);
        next.delete(postId);
        return next;
      });
    }
  };

  const LANGUAGE_VOICE_MAP = {
    'English': 'en-US',
    'Hindi': 'hi-IN',
    'Punjabi': 'pa-IN',
    'Spanish': 'es-ES',
    'French': 'fr-FR',
    'German': 'de-DE',
    'Arabic': 'ar-SA',
    'Chinese': 'zh-CN',
    'Russian': 'ru-RU',
    'Japanese': 'ja-JP'
  };

  // Initialize SpeechSynthesis on mount to avoid load delays
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  const handleSpeak = (postId, text, targetLang) => {
    if (speakingPostId === postId) {
      window.speechSynthesis.cancel();
      setSpeakingPostId(null);
      return;
    }

    window.speechSynthesis.cancel();

    if (!text) return;

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      const langCode = LANGUAGE_VOICE_MAP[targetLang] || 'en-US';
      utterance.lang = langCode;

      const voices = window.speechSynthesis.getVoices();
      const matchingVoice = voices.find(v => v.lang.startsWith(langCode) || v.lang.includes(langCode.replace('-', '_')));
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }

      utterance.onend = () => {
        setSpeakingPostId(null);
      };
      utterance.onerror = () => {
        setSpeakingPostId(null);
      };

      setSpeakingPostId(postId);
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error('Speech synthesis error:', e);
      setSpeakingPostId(null);
    }
  };

  const handleClearTranslation = (postId) => {
    if (speakingPostId === postId) {
      window.speechSynthesis.cancel();
      setSpeakingPostId(null);
    }
    setSelectedTargetLang(prev => {
      const next = { ...prev };
      delete next[postId];
      return next;
    });
  };

  // Trigger Manual Scraper Simulation
  const handleScrapeTrigger = async () => {
    setIsScraping(true);
    try {
      const res = await fetch(`${API_BASE}/scrape/trigger`, { method: 'POST' });
      if (!res.ok) throw new Error('Scraper simulation failed');
      const data = await res.json();
      if (data.success && data.post) {
        setScrapeNotification(`Scraped new post from ${data.post.platform} (@${data.post.author})!`);
        setTimeout(() => setScrapeNotification(null), 5000);

        // Refresh feed and stats
        fetchFeed();
        fetchStats();
        if (activeTab === 'education') {
          fetchEducationPosts(eduActiveTab);
        }
      } else {
        alert(data.message || 'No new unique posts found at this time.');
      }
    } catch (err) {
      alert(`Failed to scrape: ${err.message}`);
    } finally {
      setIsScraping(false);
    }
  };

  // Reset database back to seed records
  const handleReset = async () => {
    if (!window.confirm('Are you sure you want to reset the database? This will clear any live scraped posts.')) return;
    try {
      const res = await fetch(`${API_BASE}/reset`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to reset database');
      const data = await res.json();
      if (data.success) {
        alert('Database reset to original seed posts!');
        fetchFeed();
        fetchStats();
        if (activeTab === 'education') {
          fetchEducationPosts(eduActiveTab);
        }
      }
    } catch (err) {
      alert(`Reset failed: ${err.message}`);
    }
  };

  // Toggle Clustered thread display
  const toggleCluster = (leadId) => {
    setExpandedClusters(prev => {
      const next = new Set(prev);
      if (next.has(leadId)) next.delete(leadId);
      else next.add(leadId);
      return next;
    });
  };

  // Exporters wrapping active filters
  const handleCSVExport = () => {
    const activePosts = activeTab === 'clustered'
      ? clusteredPosts.map(c => c.leadPost)
      : posts;
    exportToCSV(activePosts);
  };

  const handlePDFExport = () => {
    const activePosts = activeTab === 'clustered'
      ? clusteredPosts.map(c => c.leadPost)
      : posts;
    exportToPDF(activePosts, {
      Tab: activeTab,
      Platform: selectedPlatform,
      Region: selectedRegion,
      Category: selectedCategory,
      Sentiment: selectedSentiment,
      Language: selectedLanguage
    });
  };

  // Recharts color palettes
  const SENTIMENT_COLORS = {
    Positive: '#4ade80',
    Negative: '#fca5a5',
    Neutral: '#9ca3af'
  };
  const COLOR_PALETTE = ['#8b5cf6', '#06b6d4', '#f59e0b', '#10b981', '#ef4444', '#ec4899', '#3b82f6'];

  return (
    <div className="app-container">
      {/* SIDEBAR NAVIGATION */}
      <aside className="sidebar">
        <div className="logo-container">
          <div className="logo-icon">Z</div>
          <div>
            <h2 className="logo-text">Zebvo News</h2>
            <span className="logo-sub">Passport Monitor</span>
          </div>
          <button
            onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
            className="btn btn-secondary"
            style={{ marginLeft: 'auto', padding: '8px', borderRadius: '50%', background: 'transparent' }}
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={18} color="var(--primary)" /> : <Moon size={18} color="var(--primary)" />}
          </button>
        </div>

        <nav style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          flexGrow: 1,
          overflowY: 'auto',
          maxHeight: 'calc(100vh - 160px)',
          paddingRight: '4px',
          scrollbarWidth: 'thin'
        }}>
          <ul className="nav-links">
            {/* NAVIGATION */}
            <li className="nav-group-label" style={{ padding: '16px 12px 4px', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', opacity: 0.6, listStyle: 'none' }}>Navigation</li>
            <li>
              <a
                className={`nav-item ${activeTab === 'feed' ? 'active' : ''}`}
                onClick={() => { setActiveTab('feed'); }}
              >
                <List size={18} />
                <span>📰 News Feed</span>
              </a>
            </li>
            <li>
              <a
                className={`nav-item ${activeTab === 'newspaper' ? 'active' : ''}`}
                onClick={() => { setActiveTab('newspaper'); }}
              >
                <FileText size={18} />
                <span>📄 Daily Newspaper</span>
              </a>
            </li>
            <li>
              <a
                className={`nav-item ${activeTab === 'sports' ? 'active' : ''}`}
                onClick={() => { setActiveTab('sports'); }}
              >
                <Tv size={18} />
                <span>🏆 Sports Center</span>
              </a>
            </li>
            <li>
              <a
                className={`nav-item ${activeTab === 'reels' ? 'active' : ''}`}
                onClick={() => { setActiveTab('reels'); }}
              >
                <Film size={18} />
                <span>🎬 News Reels</span>
              </a>
            </li>

            {/* LEARNING */}
            <li className="nav-group-label" style={{ padding: '16px 12px 4px', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', opacity: 0.6, listStyle: 'none' }}>Learning</li>
            <li>
              <a
                className={`nav-item ${activeTab === 'health' ? 'active' : ''}`}
                onClick={() => { setActiveTab('health'); }}
              >
                <Heart size={18} />
                <span>❤️ Health Guide</span>
              </a>
            </li>
            <li>
              <a
                className={`nav-item ${activeTab === 'tech-guide' ? 'active' : ''}`}
                onClick={() => { setActiveTab('tech-guide'); }}
              >
                <Globe size={18} />
                <span>🌐 Tech Guide</span>
              </a>
            </li>
            <li>
              <a
                className={`nav-item ${activeTab === 'helplines' ? 'active' : ''}`}
                onClick={() => { setActiveTab('helplines'); }}
              >
                <Phone size={18} />
                <span>📞 Help Lines</span>
              </a>
            </li>
            <li>
              <a
                className={`nav-item ${activeTab === 'roadmap' ? 'active' : ''}`}
                onClick={() => { setActiveTab('roadmap'); }}
              >
                <Map size={18} />
                <span>🗺️ Study Roadmap</span>
              </a>
            </li>
            <li>
              <a
                className={`nav-item ${activeTab === 'nepal-quiz' ? 'active' : ''}`}
                onClick={() => { setActiveTab('nepal-quiz'); }}
              >
                <HelpCircle size={18} />
                <span>🇳🇵 Nepal Quiz</span>
              </a>
            </li>
            <li>
              <a
                className={`nav-item ${activeTab === 'balen' ? 'active' : ''}`}
                onClick={() => { setActiveTab('balen'); }}
              >
                <Users size={18} />
                <span>👤 Balen Shah</span>
              </a>
            </li>
            <li>
              <a
                className={`nav-item ${activeTab === 'leaders' ? 'active' : ''}`}
                onClick={() => { setActiveTab('leaders'); }}
              >
                <Crown size={18} />
                <span>👑 Leaders Track</span>
              </a>
            </li>
            <li>
              <a
                className={`nav-item ${activeTab === 'zen-g' ? 'active' : ''}`}
                onClick={() => { setActiveTab('zen-g'); }}
              >
                <Skull size={18} />
                <span>💀 Zen G</span>
              </a>
            </li>
            <li>
              <a
                className={`nav-item ${activeTab === 'android-unlock' ? 'active' : ''}`}
                onClick={() => { setActiveTab('android-unlock'); }}
              >
                <Smartphone size={18} />
                <span>🔓 Pattern Unlock</span>
              </a>
            </li>
            <li>
              <a
                className={`nav-item ${activeTab === 'education' ? 'active' : ''}`}
                onClick={() => { setActiveTab('education'); }}
              >
                <GraduationCap size={18} />
                <span>🎓 Education Hub</span>
              </a>
            </li>

            {/* MY TASKS */}
            <li className="nav-group-label" style={{ padding: '16px 12px 4px', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', opacity: 0.6, listStyle: 'none' }}>My Tasks</li>
            <li>
              <a
                className={`nav-item ${activeTab === 'books' ? 'active' : ''}`}
                onClick={() => { setActiveTab('books'); }}
              >
                <BookOpen size={18} />
                <span>📖 My Books</span>
              </a>
            </li>
            <li>
              <a
                className={`nav-item ${activeTab === 'calendar' ? 'active' : ''}`}
                onClick={() => { setActiveTab('calendar'); }}
              >
                <Calendar size={18} />
                <span>📅 Reading Calendar</span>
              </a>
            </li>
            <li>
              <a
                className={`nav-item ${activeTab === 'todo' ? 'active' : ''}`}
                onClick={() => { setActiveTab('todo'); }}
              >
                <CheckSquare size={18} />
                <span>✅ To-Do List</span>
              </a>
            </li>

            {/* MARKETS */}
            <li className="nav-group-label" style={{ padding: '16px 12px 4px', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', opacity: 0.6, listStyle: 'none' }}>Markets</li>
            <li>
              <a
                className={`nav-item ${activeTab === 'ipo-nepal' ? 'active' : ''}`}
                onClick={() => { setActiveTab('ipo-nepal'); }}
              >
                <TrendingUp size={18} />
                <span>📈 IPO Nepal</span>
              </a>
            </li>
            <li>
              <a
                className={`nav-item ${activeTab === 'trading' ? 'active' : ''}`}
                onClick={() => { setActiveTab('trading'); }}
              >
                <Activity size={18} />
                <span>📊 Trading Monitor</span>
              </a>
            </li>

            {/* DATA */}
            <li className="nav-group-label" style={{ padding: '16px 12px 4px', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', opacity: 0.6, listStyle: 'none' }}>Data</li>
            <li>
              <a
                className={`nav-item ${activeTab === 'clustered' ? 'active' : ''}`}
                onClick={() => { setActiveTab('clustered'); }}
              >
                <Layers size={18} />
                <span>🔗 Clustered View</span>
              </a>
            </li>
            <li>
              <a
                className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
                onClick={() => { setActiveTab('analytics'); }}
              >
                <BarChart2 size={18} />
                <span>📉 Dashboard Analytics</span>
              </a>
            </li>
            <li>
              <a
                className={`nav-item ${activeTab === 'spam' ? 'active' : ''}`}
                onClick={() => { setActiveTab('spam'); }}
              >
                <ShieldAlert size={18} />
                <span>🗑️ Spam / Gibberish</span>
              </a>
            </li>
          </ul>

          <div className="sidebar-scrape-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={handleScrapeTrigger}
              disabled={isScraping}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px' }}
            >
              <RefreshCw size={16} className={isScraping ? 'animate-spin' : ''} />
              {isScraping ? 'Scraping...' : 'Scrape Live Feed'}
            </button>
          </div>

          {/* Match Alerts Toggle & Live Sports Widget */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {footballNotificationsEnabled ? <Bell size={13} color="var(--success)" className="animate-bounce" /> : <BellOff size={13} color="var(--text-muted)" />}
                Match Alerts
              </span>
              <button
                onClick={toggleNotifications}
                className="btn"
                style={{
                  padding: '3px 8px',
                  fontSize: '0.7rem',
                  borderRadius: '10px',
                  background: footballNotificationsEnabled ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid ' + (footballNotificationsEnabled ? 'var(--success)' : 'var(--border-glass)'),
                  color: footballNotificationsEnabled ? 'var(--success)' : 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
              >
                {footballNotificationsEnabled ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className="football-widget">
              <div className="football-widget-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '8px' }}>
                <span className="football-widget-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="live-pulse-dot"></span>
                  Live Sports
                </span>

                {/* Sport Pills */}
                <div style={{ display: 'flex', gap: '4px', margin: '4px 0', overflowX: 'auto', paddingBottom: '4px' }}>
                  {['Football', 'Cricket', 'Badminton'].map(sport => (
                    <button
                      key={sport}
                      onClick={() => {
                        setSelectedWatchSport(sport);
                        setSelectedWatchDate(todayStr);
                        const matchesToday = (SPORTS_SCHEDULE[sport] || {})[todayStr] || [];
                        setSelectedWatchMatch(matchesToday[0] || null);
                      }}
                      className="btn"
                      style={{
                        padding: '4px 8px',
                        fontSize: '0.65rem',
                        borderRadius: '6px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border-glass)',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        flexShrink: 0
                      }}
                    >
                      {sport === 'Football' ? '⚽ Football' : sport === 'Cricket' ? '🏏 Cricket' : '🏸 Badminton'}
                    </button>
                  ))}
                </div>
              </div>

              {matches.length === 0 ? (
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center', padding: '4px 0' }}>
                  No active matches
                </div>
              ) : (
                matches.map(match => (
                  <div
                    key={match.id}
                    className="football-match-row glass-card-interactive"
                    onClick={() => {
                      setSelectedWatchSport(match.sport);
                      setSelectedWatchDate(todayStr);
                      const matchesToday = (SPORTS_SCHEDULE[match.sport] || {})[todayStr] || [];
                      const schedMatch = matchesToday.find(sm => sm.id === match.id) || matchesToday[0];
                      setSelectedWatchMatch(schedMatch || match);
                      setActiveTab('sports');
                    }}
                    style={{
                      flexDirection: 'column',
                      alignItems: 'stretch',
                      gap: '4px',
                      padding: '8px 10px',
                      cursor: 'pointer',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-glass)',
                      marginTop: '6px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--primary-light)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      <span>{match.sport}</span>
                      <span style={{ color: match.status === 'FINISHED' ? 'var(--text-muted)' : 'var(--success)' }}>{match.status}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div className="football-match-teams" style={{ gap: '0px' }}>
                        <span style={{ fontSize: '0.85rem' }}>{match.homeTeam}</span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>vs {match.awayTeam}</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                        {match.sport === 'Football' && (
                          <>
                            <span className="football-match-score">{match.homeScore} - {match.awayScore}</span>
                            <span className="football-match-minute">{match.status === 'FINISHED' ? 'FT' : `${match.minute}'`}</span>
                          </>
                        )}
                        {match.sport === 'Cricket' && (
                          <>
                            <span className="football-match-score">{match.homeScore}/{match.awayScore}</span>
                            <span className="football-match-minute" style={{ fontSize: '0.65rem' }}>{match.overs} ov</span>
                          </>
                        )}
                        {match.sport === 'Badminton' && (
                          <>
                            <span className="football-match-score" style={{ background: 'rgba(6, 182, 212, 0.1)', color: '#22d3ee' }}>
                              Sets: {match.sets}
                            </span>
                            <span className="football-match-minute" style={{ fontSize: '0.68rem', fontWeight: 600 }}>
                              Pt: {match.homeScore} - {match.awayScore}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    {match.detail && (
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '4px', marginTop: '2px' }}>
                        {match.detail}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="status-indicator" style={{ marginBottom: '16px' }}>
            <span className="pulse-dot"></span>
            <span>Real-time Scraper Running</span>
          </div>
          <button
            onClick={handleReset}
            className="btn btn-secondary btn-danger"
            style={{ width: '100%', fontSize: '0.8rem', padding: '6px 12px' }}
          >
            <Trash2 size={12} />
            Reset Data Store
          </button>
        </div>
      </aside>

      {/* MAIN PANEL */}
      <main className="main-content">

        {/* NOTIFICATIONS */}
        {scrapeNotification && (
          <div
            className="glass-panel"
            style={{
              padding: '12px 20px',
              marginBottom: '24px',
              background: 'rgba(34, 197, 94, 0.15)',
              borderLeft: '4px solid var(--success)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              animation: 'slideDown 0.3s ease'
            }}
          >
            <Sparkles size={18} style={{ color: 'var(--success)' }} />
            <span style={{ fontSize: '0.9rem', color: '#fff' }}>{scrapeNotification}</span>
          </div>
        )}

        {/* HEADER SECTION */}
        <header className="dashboard-header">
          <div className="header-title-section">
            <h1>
              {activeTab === 'feed' && 'Social Media Aggregated Feed'}
              {activeTab === 'newspaper' && 'The Zebvo Times Newspaper'}
              {activeTab === 'reels' && 'Trending News Reels'}
              {activeTab === 'clustered' && 'Clustered Social Threads'}
              {activeTab === 'spam' && 'Gibberish & Spam Bin'}
              {activeTab === 'analytics' && 'Intelligence Analytics'}
              {activeTab === 'sports' && 'Live Sports Arena'}
              {activeTab === 'education' && 'Nepal Education Hub'}
              {activeTab === 'health' && 'Health & Nutrition Guide'}
              {activeTab === 'tech-guide' && 'Social Media Setup Guide'}
              {activeTab === 'helplines' && 'Emergency Helplines & Government Contacts'}
              {activeTab === 'roadmap' && 'Study Roadmap & Bachelor Course Guide'}
              {activeTab === 'nepal-quiz' && '🇳🇵 Nepal General Knowledge Quiz'}
              {activeTab === 'balen' && 'Balen Shah - Social Media Tracker'}
              {activeTab === 'leaders' && 'Nepal Leaders - Social Media Tracker'}
              {activeTab === 'zen-g' && '💀 Zen G — Death Genre Gallery'}
              {activeTab === 'android-unlock' && '🔓 Android Pattern Lock Recovery'}
              {activeTab === 'books' && 'My Books & Study Timer'}
              {activeTab === 'calendar' && 'Daily Reading Calendar'}
              {activeTab === 'todo' && 'To-Do & Reminders'}
              {activeTab === 'ipo-nepal' && 'Nepal IPO Monitor'}
              {activeTab === 'trading' && 'Global Trading Monitor'}
            </h1>
            <p>
              {activeTab === 'feed' && 'Tracking verified social posts and categories.'}
              {activeTab === 'newspaper' && 'Real-time daily print edition. All news automatically deleted after 24 hours.'}
              {activeTab === 'reels' && 'Scroll through vertical short-form stories and real posts.'}
              {activeTab === 'clustered' && 'Grouping duplicate posts to reveal trending topics.'}
              {activeTab === 'spam' && 'Filtered posts marked as keyboard mashing, bots, or promo spam.'}
              {activeTab === 'analytics' && 'Data trends, platform breakdowns, and NLP insights.'}
              {activeTab === 'sports' && 'Live scores, real-time commentary, and video broadcasts.'}
              {activeTab === 'education' && 'Latest updates, routines, and results for Class 8 (BLE), Class 10 (SEE), and Class 12 (NEB).'}
              {activeTab === 'health' && 'Complete vitamin guide with food sources, benefits, and nutritional information.'}
              {activeTab === 'tech-guide' && 'Step-by-step guides for creating accounts on Facebook, Instagram, Twitter, YouTube, TikTok, LinkedIn, and Snapchat.'}
              {activeTab === 'helplines' && 'Important phone numbers, social media IDs of government officials, and emergency contacts with copy-to-clipboard.'}
              {activeTab === 'roadmap' && 'Bachelor degree programs in CSE, Management, Science, Engineering, Humanities and more with college lists and subjects.'}
              {activeTab === 'nepal-quiz' && 'Test your knowledge about Nepal — Politics, Geography, History, Culture, Sports, Economy & Current Affairs.'}
              {activeTab === 'zen-g' && 'Dark aesthetic gallery — Memento mori, abandoned places, skulls, and the beauty of mortality.'}
              {activeTab === 'android-unlock' && 'Forgot your Android pattern? Use these methods to recover your phone — visual grid guide, ADB commands, Google/Samsung recovery, and factory reset instructions.'}
              {activeTab === 'balen' && 'Real-time social media posts about Balen Shah (Mayor of Kathmandu) from Facebook, YouTube, Reddit, Twitter and more.'}
              {activeTab === 'leaders' && 'Real-time social media posts about the President, Home Minister, and other Nepal government leaders.'}
              {activeTab === 'books' && 'Add books from any resource and track your reading with a built-in timer.'}
              {activeTab === 'calendar' && 'Set your daily news reading schedule and track your progress.'}
              {activeTab === 'todo' && 'Manage tasks with notifications and sound reminders.'}
              {activeTab === 'ipo-nepal' && 'Real-time IPO updates and Meroshare listings.'}
              {activeTab === 'trading' && 'Real-time stock ticks, global market analysis, and trends.'}
            </p>
          </div>

          <div className="header-actions" style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`btn btn-secondary ${activeTab === 'analytics' ? 'active' : ''}`}
              style={{ padding: '8px 12px', fontSize: '0.82rem', gap: '6px', display: 'inline-flex', alignItems: 'center' }}
              title="Dashboard Analytics"
            >
              <BarChart2 size={14} />
              <span className="hide-on-mobile">Analytics</span>
            </button>

            {/* Auth Controls */}
            {currentUser ? (
              <>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowCreatePostModal(true)}
                  style={{ padding: '8px 14px', fontSize: '0.82rem', gap: '6px' }}
                >
                  <PlusCircle size={14} />
                  Create Post
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-full)', padding: '4px 12px 4px 4px' }}>
                  <img
                    src={currentUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.username)}&background=8b5cf6&color=fff`}
                    alt={currentUser.username}
                    style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{currentUser.username}</span>
                  <button
                    onClick={handleLogout}
                    className="btn"
                    style={{ padding: '4px 8px', fontSize: '0.72rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', borderRadius: '6px', cursor: 'pointer', marginLeft: '4px' }}
                    title="Log Out"
                  >
                    <LogOut size={12} />
                  </button>
                </div>
              </>
            ) : (
              <>
                <button
                  className="btn btn-primary"
                  onClick={() => { setAuthMode('login'); setShowAuthModal(true); setAuthError(''); }}
                  style={{ padding: '8px 14px', fontSize: '0.82rem', gap: '6px' }}
                >
                  <LogIn size={14} />
                  Sign In
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => { setAuthMode('register'); setShowAuthModal(true); setAuthError(''); }}
                  style={{ padding: '8px 14px', fontSize: '0.82rem', gap: '6px' }}
                >
                  <UserPlus size={14} />
                  Sign Up
                </button>
              </>
            )}

            {activeTab !== 'analytics' && activeTab !== 'reels' && activeTab !== 'newspaper' && activeTab !== 'sports' && activeTab !== 'education' && activeTab !== 'health' && activeTab !== 'ipo-nepal' && activeTab !== 'trading' && (
              <>
                <button onClick={handleCSVExport} className="btn btn-secondary">
                  <Download size={14} />
                  Export CSV
                </button>
                <button onClick={handlePDFExport} className="btn btn-secondary">
                  <FileText size={14} />
                  Export PDF
                </button>
              </>
            )}
          </div>
        </header>

        {/* METRIC BOXES PANEL */}
        {stats && (
          <section className="metrics-grid">
            <div className="glass-panel metric-card">
              <div className="metric-icon-wrapper">
                <List size={22} />
              </div>
              <div className="metric-info">
                <h3>Total Processed</h3>
                <div className="metric-value">{stats.summary.totalProcessed}</div>
              </div>
            </div>

            <div className="glass-panel metric-card">
              <div className="metric-icon-wrapper">
                <Layers size={22} />
              </div>
              <div className="metric-info">
                <h3>Active Feed</h3>
                <div className="metric-value">{stats.summary.activePosts}</div>
              </div>
            </div>

            <div className="glass-panel metric-card">
              <div className="metric-icon-wrapper">
                <ShieldAlert size={22} />
              </div>
              <div className="metric-info">
                <h3>Gibberish Blocked</h3>
                <div className="metric-value">{stats.summary.spamBlocked}</div>
              </div>
            </div>

            <div className="glass-panel metric-card">
              <div className="metric-icon-wrapper" style={{ color: 'var(--success)' }}>
                <ThumbsUp size={22} />
              </div>
              <div className="metric-info">
                <h3>Positive Ratio</h3>
                <div className="metric-value">{stats.summary.sentimentRatio.positive}%</div>
              </div>
            </div>

            <div className="glass-panel metric-card">
              <div className="metric-icon-wrapper" style={{ color: 'var(--danger)' }}>
                <ThumbsDown size={22} />
              </div>
              <div className="metric-info">
                <h3>Negative Ratio</h3>
                <div className="metric-value">{stats.summary.sentimentRatio.negative}%</div>
              </div>
            </div>

            <div className="glass-panel metric-card">
              <div className="metric-icon-wrapper" style={{ color: 'var(--warning)' }}>
                <Minus size={22} />
              </div>
              <div className="metric-info">
                <h3>Neutral Ratio</h3>
                <div className="metric-value">{stats.summary.sentimentRatio.neutral}%</div>
              </div>
            </div>
          </section>
        )}

        {/* GLOBAL SEARCH BAR */}
        <div className="glass-panel" style={{ padding: '10px 16px', borderRadius: '12px', border: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <Search size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            type="text"
            className="form-control"
            placeholder={'Search ' + (activeTab === 'health' ? 'vitamins, foods, benefits...' : activeTab === 'tech-guide' ? 'platforms, steps, tips...' : activeTab === 'helplines' ? 'contacts, numbers, categories...' : activeTab === 'roadmap' ? 'courses, colleges, subjects...' : activeTab === 'nepal-quiz' ? 'questions, categories...' : activeTab === 'balen' ? 'Balen Shah posts...' : activeTab === 'leaders' ? 'leader posts...' : activeTab === 'zen-g' ? 'photos, titles, tags...' : activeTab === 'android-unlock' ? 'methods, patterns, commands...' : activeTab === 'education' ? 'classes, subjects, topics...' : activeTab === 'sports' ? 'matches, teams, sports...' : activeTab === 'books' ? 'books, authors...' : activeTab === 'todo' ? 'tasks, reminders...' : activeTab === 'ipo-nepal' || activeTab === 'trading' ? 'stocks, companies...' : 'original text, summary, or handle...')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: 'none', background: 'transparent', color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none', width: '100%' }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px', fontSize: '1rem', lineHeight: 1 }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* MAIN VIEWS */}
        {/* MAIN VIEWS */}
        {activeTab === 'newspaper' ? (
          <div className="newspaper-container">
            <div className="newspaper-print-box">
              {/* Newspaper Masthead */}
              <div className="newspaper-masthead">
                <div className="newspaper-masthead-top">
                  <span>Vol CXXIV No. 167</span>
                  <span>"All the News That's Fit to Scrape"</span>
                  <span>New York & New Delhi</span>
                </div>
                <h1 className="newspaper-title">THE ZEBVO TIMES</h1>
                <div className="newspaper-masthead-bottom">
                  <span>Monday, June 15, 2026</span>
                  <span style={{ textTransform: 'uppercase' }}>Real-time Daily Edition</span>
                  <span>Price: FREE</span>
                </div>
              </div>

              {/* Newspaper Body */}
              <div className="newspaper-columns-grid">
                {/* Section: Front Page / Top Stories */}
                <div className="newspaper-section-header">FRONT PAGE & POLITICS</div>
                <div className="newspaper-row">
                  {posts.filter(p => !p.isGibberish && (p.category === 'General' || p.category === 'Politics' || p.category === 'Technology')).slice(0, 3).length === 0 ? (
                    <div className="newspaper-empty-ad">
                      <h3>ZEBVO PASSPORT SYSTEM</h3>
                      <p>Monitor your documents with cutting-edge real-time tracking technology. Trusted worldwide by travellers and agents alike.</p>
                      <ArticleTTSControls articleId="static_passport" text="ZEBVO PASSPORT SYSTEM. Monitor your documents with cutting-edge real-time tracking technology. Trusted worldwide by travellers and agents alike." />
                    </div>
                  ) : (
                    posts.filter(p => !p.isGibberish && (p.category === 'General' || p.category === 'Politics' || p.category === 'Technology')).slice(0, 3).map((post, idx) => (
                      <div key={post.id} className={`newspaper-article ${idx === 0 ? 'lead-article' : ''}`}>
                        <h2 className="article-title">{post.summary || post.text.substring(0, 80) + '...'}</h2>
                        <div className="article-meta">
                          <span>By {post.authorName} ({post.platform})</span>
                          <span>&bull; {new Date(post.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} &bull; <span style={{ color: '#ef4444', fontWeight: 'bold' }}>{getDeletionTimer(post.timestamp, post.category)}</span></span>
                        </div>

                        {post.postVideo ? (
                          <div className="article-media-woodcut">
                            <VideoPlayer src={post.postVideo} muted autoPlay loop playsInline />
                            <span className="media-caption">Figure {idx + 1}: Motion broadcast recorded via {post.platform}</span>
                          </div>
                        ) : post.postImage ? (
                          <div className="article-media-woodcut">
                            <img src={post.postImage} alt="Woodcut Print" />
                            <span className="media-caption">Figure {idx + 1}: Wirephoto capture from {post.region}</span>
                          </div>
                        ) : null}

                        <p className="article-body">
                          <span className="drop-cap">{post.text.charAt(0)}</span>
                          <LinkifiedText text={post.text.substring(1)} />
                        </p>
                        <ArticleTTSControls articleId={post.id} text={post.text} />
                      </div>
                    ))
                  )}
                </div>

                {/* Section: Business & Finance */}
                <div className="newspaper-section-header">BUSINESS & FINANCE</div>
                <div className="newspaper-row columns-2">
                  {posts.filter(p => !p.isGibberish && p.category === 'Business').slice(0, 4).length === 0 ? (
                    <div className="newspaper-empty-ad" style={{ gridColumn: 'span 2' }}>
                      <h3>GLOBAL MARKETS</h3>
                      <p>Financial feeds are momentarily silent. Day traders are advised to maintain strict stop-losses.</p>
                      <ArticleTTSControls articleId="static_markets" text="GLOBAL MARKETS. Financial feeds are momentarily silent. Day traders are advised to maintain strict stop-losses." />
                    </div>
                  ) : (
                    posts.filter(p => !p.isGibberish && p.category === 'Business').slice(0, 4).map((post, idx) => (
                      <div key={post.id} className="newspaper-article">
                        <h3 className="article-subtitle">BUSINESS</h3>
                        <h2 className="article-title">{post.summary || post.text.substring(0, 60) + '...'}</h2>
                        <div className="article-meta">
                          <span>By {post.authorName} ({post.platform})</span>
                        </div>
                        {post.postVideo ? (
                          <div className="article-media-woodcut">
                            <VideoPlayer src={post.postVideo} muted autoPlay loop playsInline style={{ maxHeight: '180px' }} />
                          </div>
                        ) : post.postImage ? (
                          <div className="article-media-woodcut">
                            <img src={post.postImage} alt="Market wirephoto" style={{ maxHeight: '180px' }} />
                          </div>
                        ) : null}
                        <p className="article-body">
                          <span className="drop-cap">{post.text.charAt(0)}</span>
                          <LinkifiedText text={post.text.substring(1)} />
                        </p>
                        <ArticleTTSControls articleId={post.id} text={post.text} />
                      </div>
                    ))
                  )}
                </div>

                {/* Section: IPO Nepal */}
                <div className="newspaper-section-header">🇳🇵 IPO NEPAL DISPATCH</div>
                <div className="newspaper-row columns-2">
                  {posts.filter(p => !p.isGibberish && p.category === 'IPO in Nepal').slice(0, 4).length === 0 ? (
                    <div className="newspaper-article" style={{ gridColumn: 'span 2' }}>
                      <h2 className="article-title">NEPSE Feeds Quiet</h2>
                      <div className="article-meta">Special Nepal Financial Correspondent</div>
                      <p className="article-body">Hydropower IPO applicants await allocations on Meroshare with bated breath. NEPSE index watchers are monitoring banking and hydropower sectors closely.</p>
                      <ArticleTTSControls articleId="static_nepse" text="NEPSE and Trading Feeds Quiet. Special Nepal Financial Correspondent. Hydropower IPO applicants await allocations on Meroshare with bated breath. NEPSE index watchers are monitoring banking and hydropower sectors closely." />
                    </div>
                  ) : (
                    posts.filter(p => !p.isGibberish && p.category === 'IPO in Nepal').slice(0, 4).map((post, idx) => (
                      <div key={post.id} className="newspaper-article">
                        <h3 className="article-subtitle">{post.category.toUpperCase()}</h3>
                        <h2 className="article-title">{post.summary || post.text.substring(0, 60) + '...'}</h2>
                        <div className="article-meta">
                          <span>By {post.authorName} ({post.platform})</span>
                        </div>
                        {post.postVideo ? (
                          <div className="article-media-woodcut">
                            <VideoPlayer src={post.postVideo} muted autoPlay loop playsInline style={{ maxHeight: '180px' }} />
                          </div>
                        ) : post.postImage ? (
                          <div className="article-media-woodcut">
                            <img src={post.postImage} alt="Nepal market wirephoto" style={{ maxHeight: '180px' }} />
                          </div>
                        ) : null}
                        <p className="article-body">
                          <span className="drop-cap">{post.text.charAt(0)}</span>
                          <LinkifiedText text={post.text.substring(1)} />
                        </p>
                        <ArticleTTSControls articleId={post.id} text={post.text} />
                      </div>
                    ))
                  )}
                </div>

                {/* Section: Trading */}
                <div className="newspaper-section-header">📈 GLOBAL TRADING & MARKETS</div>
                <div className="newspaper-row columns-2">
                  {posts.filter(p => !p.isGibberish && p.category === 'Trading').slice(0, 4).length === 0 ? (
                    <div className="newspaper-empty-ad" style={{ gridColumn: 'span 2' }}>
                      <h3>TRADE WITH PRECISION</h3>
                      <p>Zebvo Terminal offers zero-latency market analysis and sentiment tracking. Join the elite rank of retail investors monitoring daily stock and option sweeps today.</p>
                    </div>
                  ) : (
                    posts.filter(p => !p.isGibberish && p.category === 'Trading').slice(0, 4).map((post, idx) => (
                      <div key={post.id} className="newspaper-article">
                        <h3 className="article-subtitle">{post.category.toUpperCase()}</h3>
                        <h2 className="article-title">{post.summary || post.text.substring(0, 60) + '...'}</h2>
                        <div className="article-meta">
                          <span>By {post.authorName} ({post.platform})</span>
                        </div>
                        {post.postVideo ? (
                          <div className="article-media-woodcut">
                            <VideoPlayer src={post.postVideo} muted autoPlay loop playsInline style={{ maxHeight: '180px' }} />
                          </div>
                        ) : post.postImage ? (
                          <div className="article-media-woodcut">
                            <img src={post.postImage} alt="Trading market wirephoto" style={{ maxHeight: '180px' }} />
                          </div>
                        ) : null}
                        <p className="article-body">
                          <span className="drop-cap">{post.text.charAt(0)}</span>
                          <LinkifiedText text={post.text.substring(1)} />
                        </p>
                        <ArticleTTSControls articleId={post.id} text={post.text} />
                      </div>
                    ))
                  )}
                </div>

                {/* Section: Sports Dispatch & Entertainment */}
                <div className="newspaper-section-header">SPORTS DISPATCH & ARTS</div>
                <div className="newspaper-row columns-2">
                  {posts.filter(p => !p.isGibberish && (p.category === 'Sports' || p.category === 'Entertainment')).slice(0, 4).length === 0 ? (
                    <div className="newspaper-empty-ad" style={{ gridColumn: 'span 2' }}>
                      <h3>ZEBVO ARENA CHAMPIONS</h3>
                      <p>Catch every overhead kick, boundary clearance, and badminton smash in real-time.</p>
                      <ArticleTTSControls articleId="static_sports" text="ZEBVO ARENA CHAMPIONS. Catch every overhead kick, boundary clearance, and badminton smash in real-time." />
                    </div>
                  ) : (
                    posts.filter(p => !p.isGibberish && (p.category === 'Sports' || p.category === 'Entertainment')).slice(0, 4).map((post, idx) => (
                      <div key={post.id} className="newspaper-article">
                        <h3 className="article-subtitle">{post.category.toUpperCase()}</h3>
                        <h2 className="article-title">{post.summary || post.text.substring(0, 60) + '...'}</h2>
                        <div className="article-meta">
                          <span>By {post.authorName} ({post.platform})</span>
                        </div>
                        {post.postVideo ? (
                          <div className="article-media-woodcut">
                            <VideoPlayer src={post.postVideo} muted autoPlay loop playsInline style={{ maxHeight: '180px' }} />
                          </div>
                        ) : post.postImage ? (
                          <div className="article-media-woodcut">
                            <img src={post.postImage} alt="Sports action wirephoto" style={{ maxHeight: '180px' }} />
                          </div>
                        ) : null}
                        <p className="article-body">
                          <span className="drop-cap">{post.text.charAt(0)}</span>
                          <LinkifiedText text={post.text.substring(1)} />
                        </p>
                        <ArticleTTSControls articleId={post.id} text={post.text} />
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Newspaper Footer */}
              <div className="newspaper-footer-banner">
                <span>THE ZEBVO TIMES &copy; 2026</span>
                <span>RETRIEVED FROM MONGO DATABASE &bull; EXPIRING REAL-TIME AGGREGATION</span>
                <span>END OF PRINT EDITION</span>
              </div>
            </div>
          </div>
        ) : activeTab === 'reels' ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
            <div className="reels-container" onScroll={handleReelsScroll}>
              {isLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <div className="loader" style={{ margin: '0 auto' }}></div>
                </div>
              ) : posts.filter(p => !p.isGibberish).length === 0 ? (
                <div className="empty-state" style={{ height: '100%' }}>
                  <AlertCircle size={36} className="empty-state-icon" />
                  <h3>No reels available</h3>
                  <p>Try scraping or changing category filters.</p>
                </div>
              ) : (
                posts.filter(p => !p.isGibberish).map((post, idx) => {
                  const videoUrl = post.postVideo || CATEGORY_VIDEOS[post.category] || CATEGORY_VIDEOS['General'];

                  return (
                    <div key={post.id} className="reel-card">
                      {/* Background Visual Media Video Playing */}
                      <div className="reel-media-bg">
                        <ReelVideo src={videoUrl} isPlaying={idx === activeReelIndex && activeTab === 'reels'} isMuted={reelsMuted} />
                      </div>

                      {/* Content Overlay */}
                      <div className="reel-content-overlay">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div className="author-avatar" style={{ width: '32px', height: '32px', overflow: 'hidden' }}>
                            <img
                              src={post.authorAvatar || `https://i.pravatar.cc/150?u=${encodeURIComponent(post.author.replace(/^[@u/]+/, ''))}`}
                              alt={post.authorName}
                              onError={(e) => {
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(post.authorName)}&background=8b5cf6&color=fff`;
                              }}
                            />
                          </div>
                          <div>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>{post.authorName}</span>
                            <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', display: 'block' }}>{post.author}</span>
                          </div>
                          <span className="badge badge-category" style={{ fontSize: '0.65rem', padding: '2px 8px', marginLeft: 'auto' }}>
                            {post.category}
                          </span>
                        </div>

                        <h3 style={{ fontSize: '1.1rem', color: '#fff', fontWeight: 700, margin: '8px 0 4px 0', lineHeight: '1.4' }}>
                          {post.summary || post.text.substring(0, 100) + '...'}
                        </h3>

                        <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.85)', lineHeight: '1.5', WebkitLineClamp: 3, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          <LinkifiedText text={post.text} />
                        </p>

                        <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                          <span className={`badge badge-sentiment-${post.sentiment}`} style={{ fontSize: '0.65rem' }}>{post.sentiment}</span>
                          <span className={`badge badge-platform badge-${post.platform}`} style={{ fontSize: '0.65rem' }}>{post.platform}</span>
                          <span className="badge badge-platform" style={{ fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={8} />
                            {post.region}
                          </span>
                        </div>
                      </div>

                      {/* Interaction Sidebar Overlay inside card */}
                      <div className="reel-actions-bar">
                        {/* Likes Button */}
                        <div className="reel-action-group">
                          <button
                            className={`reel-action-btn ${likedPosts[post.id] ? 'liked' : ''}`}
                            onClick={() => handleLikePost(post.id)}
                            title="Like"
                          >
                            <Heart size={18} fill={likedPosts[post.id] ? "currentColor" : "none"} style={{ color: likedPosts[post.id] ? 'var(--danger)' : '#fff' }} />
                          </button>
                          <span className="reel-action-label">{post.likes}</span>
                        </div>

                        {/* Comments Button */}
                        <div className="reel-action-group">
                          <button
                            className={`reel-action-btn ${activeCommentPostId === post.id ? 'active' : ''}`}
                            onClick={() => toggleComments(post.id, post.category)}
                            title="Comments"
                          >
                            <MessageSquare size={18} />
                          </button>
                          <span className="reel-action-label">{post.comments}</span>
                        </div>

                        {/* Share Button */}
                        <div className="reel-action-group">
                          <button
                            className="reel-action-btn"
                            onClick={() => alert(`Shared post link: http://zebvo.news/post/${post.id}`)}
                          >
                            <Share2 size={18} />
                          </button>
                          <span className="reel-action-label">{post.shares}</span>
                        </div>

                        {/* TTS Speak Button */}
                        <div className="reel-action-group">
                          <button
                            className={`reel-action-btn ${speakingPostId === post.id ? 'active' : ''}`}
                            onClick={() => handleSpeak(post.id, post.text, 'English')}
                            title={speakingPostId === post.id ? "Stop Listening" : "Listen to News"}
                          >
                            {speakingPostId === post.id ? <VolumeX size={18} /> : <Volume2 size={18} />}
                          </button>
                          <span className="reel-action-label">Listen</span>
                        </div>

                        {/* Reels Mute/Unmute Button */}
                        <div className="reel-action-group">
                          <button
                            className="reel-action-btn"
                            onClick={() => setReelsMuted(prev => !prev)}
                            title={reelsMuted ? "Unmute Video" : "Mute Video"}
                            style={{
                              background: reelsMuted ? 'rgba(255, 255, 255, 0.08)' : 'var(--primary)',
                              color: '#fff',
                              borderColor: reelsMuted ? 'var(--border-glass)' : 'transparent',
                              boxShadow: reelsMuted ? 'none' : '0 0 12px var(--primary-glow)'
                            }}
                          >
                            {reelsMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                          </button>
                          <span className="reel-action-label">{reelsMuted ? "Muted" : "Sound On"}</span>
                        </div>

                        {/* Translate Button */}
                        <div className="reel-action-group">
                          <button
                            className="reel-action-btn"
                            onClick={() => {
                              const target = selectedTargetLang[post.id] || 'Hindi';
                              if (translations[`${post.id}_${target}`]) {
                                handleClearTranslation(post.id);
                              } else {
                                setSelectedTargetLang(prev => ({ ...prev, [post.id]: target }));
                                handleTranslate(post.id, post.text, target);
                              }
                            }}
                            title="Translate"
                          >
                            <Globe size={18} />
                          </button>
                          <span className="reel-action-label">Translate</span>
                        </div>
                      </div>

                      {/* Reels Comments Overlay inside Card */}
                      {activeCommentPostId === post.id && (
                        <div
                          className="glass-panel reels-inline-comments-panel"
                          style={{
                            position: 'absolute',
                            left: '16px',
                            right: '76px',
                            bottom: '180px',
                            zIndex: 5,
                            padding: '16px',
                            background: 'rgba(17, 22, 37, 0.95)',
                            border: '1px solid var(--border-glass)',
                            borderRadius: 'var(--radius-md)',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px',
                            animation: 'slideDown 0.3s ease'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '6px' }}>
                            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary-light)' }}>
                              Reel Comments
                            </span>
                            <button
                              onClick={() => setActiveCommentPostId(null)}
                              style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}
                            >
                              <X size={12} />
                            </button>
                          </div>

                          {/* Comments List */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '140px', overflowY: 'auto', paddingRight: '4px' }}>
                            {(postComments[post.id] || []).length === 0 ? (
                              <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>No comments yet.</span>
                            ) : (
                              (postComments[post.id] || []).map(comment => (
                                <div key={comment.id} style={{ display: 'flex', flexDirection: 'column', gap: '2px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', padding: '6px' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 600, color: '#fff' }}>
                                    <span>{comment.authorName}</span>
                                    <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>
                                      {new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                  <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.8)', lineHeight: '1.3' }}>{comment.text}</span>
                                </div>
                              ))
                            )}
                          </div>

                          {/* Comment Input */}
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Add a comment..."
                              value={typedComments[post.id] || ''}
                              onChange={(e) => setTypedComments(prev => ({ ...prev, [post.id]: e.target.value }))}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleAddComment(post.id);
                              }}
                              style={{ padding: '6px 10px', fontSize: '0.78rem', background: 'rgba(255,255,255,0.06)', color: '#fff', border: '1px solid var(--border-glass)' }}
                            />
                            <button
                              className="btn btn-primary"
                              onClick={() => handleAddComment(post.id)}
                              style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                            >
                              Post
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Floating Translation Result Overlay inside Card if translated */}
                      {selectedTargetLang[post.id] && translations[`${post.id}_${selectedTargetLang[post.id]}`] && (
                        <div
                          className="glass-panel"
                          style={{
                            position: 'absolute',
                            left: '16px',
                            right: '76px',
                            bottom: '180px',
                            zIndex: 4,
                            padding: '12px',
                            background: 'rgba(17, 22, 37, 0.9)',
                            border: '1px solid var(--border-glass)',
                            borderRadius: 'var(--radius-md)',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                            animation: 'slideDown 0.3s ease'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary-light)' }}>
                              Translated to {selectedTargetLang[post.id]}
                            </span>
                            <button
                              onClick={() => handleClearTranslation(post.id)}
                              style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}
                            >
                              <X size={12} />
                            </button>
                          </div>
                          <p style={{ fontSize: '0.8rem', color: '#fff', fontStyle: 'italic', lineHeight: '1.4' }}>
                            {translations[`${post.id}_${selectedTargetLang[post.id]}`]}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : activeTab === 'analytics' ? (
          /* ANALYTICS TAB CONTENT */
          stats ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="charts-grid">
                {/* 24 hour timeline Area chart */}
                <div className="glass-panel chart-panel">
                  <h3 className="chart-title">
                    Aggregation Volume (Last 24 Hours)
                    <span>Updates in real-time</span>
                  </h3>
                  <div style={{ width: '100%', height: 260 }}>
                    <ResponsiveContainer>
                      <AreaChart data={stats.timeline}>
                        <defs>
                          <linearGradient id="colorPosts" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="interval" stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                        <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                        <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', borderRadius: '8px' }} />
                        <Area type="monotone" dataKey="posts" stroke="var(--primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorPosts)" name="Posts Volume" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Sentiment Distribution Pie Chart */}
                <div className="glass-panel chart-panel">
                  <h3 className="chart-title">Sentiment Analysis</h3>
                  <div style={{ width: '100%', height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ResponsiveContainer width="80%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Positive', value: stats.summary.sentimentRatio.positive },
                            { name: 'Negative', value: stats.summary.sentimentRatio.negative },
                            { name: 'Neutral', value: stats.summary.sentimentRatio.neutral }
                          ]}
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          <Cell fill={SENTIMENT_COLORS.Positive} />
                          <Cell fill={SENTIMENT_COLORS.Negative} />
                          <Cell fill={SENTIMENT_COLORS.Neutral} />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: SENTIMENT_COLORS.Positive }}></div>
                      <span>Positive ({stats.summary.sentimentRatio.positive}%)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: SENTIMENT_COLORS.Negative }}></div>
                      <span>Negative ({stats.summary.sentimentRatio.negative}%)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: SENTIMENT_COLORS.Neutral }}></div>
                      <span>Neutral ({stats.summary.sentimentRatio.neutral}%)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="charts-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                {/* Categories Bar Chart */}
                <div className="glass-panel chart-panel">
                  <h3 className="chart-title">Category Auto-Classification</h3>
                  <div style={{ width: '100%', height: 260 }}>
                    <ResponsiveContainer>
                      <BarChart data={stats.categories.slice(0, 7)}>
                        <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={9} tickLine={false} />
                        <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                        <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', borderRadius: '8px' }} />
                        <Bar dataKey="count" fill="var(--primary)" name="Posts Count" radius={[4, 4, 0, 0]}>
                          {stats.categories.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLOR_PALETTE[index % COLOR_PALETTE.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Platforms Bar Chart */}
                <div className="glass-panel chart-panel">
                  <h3 className="chart-title">Platform Distribution</h3>
                  <div style={{ width: '100%', height: 260 }}>
                    <ResponsiveContainer>
                      <BarChart data={stats.platforms}>
                        <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                        <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                        <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', borderRadius: '8px' }} />
                        <Bar dataKey="count" fill="var(--secondary)" name="Posts Count" radius={[4, 4, 0, 0]}>
                          {stats.platforms.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLOR_PALETTE[(index + 3) % COLOR_PALETTE.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="loader"></div>
          )
        ) : activeTab === 'education' ? (
          <div className="education-container" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <div className="education-header glass-panel" style={{ padding: '24px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
              <h2 style={{ margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <GraduationCap size={28} style={{ color: '#8b5cf6' }} />
                Nepal Education Hub
                <NotifToggle section="education" state={sectionNotifs} onToggle={toggleNotif} />
              </h2>
              <p style={{ margin: 0, color: 'var(--text-muted)' }}>Latest updates, routines, and results for Class 8 (BLE), Class 10 (SEE), and Class 12 (NEB).</p>
            </div>

            {/* Class Tabs */}
            <div className="edu-tabs" style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px', flexWrap: 'wrap' }}>
              {[
                { label: 'Class 12 (NEB)', value: 'Class 12', color: '#8b5cf6' },
                { label: 'Class 10 (SEE)', value: 'Class 10', color: '#10b981' },
                { label: 'Class 8 (BLE)', value: 'Class 8', color: '#f59e0b' }
              ].map(tab => (
                <button
                  key={tab.value}
                  onClick={() => setEduActiveTab(tab.value)}
                  className={`btn ${eduActiveTab === tab.value ? 'active' : ''}`}
                  style={{
                    background: eduActiveTab === tab.value ? tab.color : 'rgba(255,255,255,0.04)',
                    border: '1px solid ' + (eduActiveTab === tab.value ? tab.color : 'var(--border-glass)'),
                    color: '#fff',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    transition: 'all 0.2s ease',
                    boxShadow: eduActiveTab === tab.value ? `0 4px 12px ${tab.color}33` : 'none'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content list */}
            <div className="post-feed" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {(() => {
                const targetColor = eduActiveTab === 'Class 12' ? '#8b5cf6' : eduActiveTab === 'Class 10' ? '#10b981' : '#f59e0b';

                if (isLoadingEdu) {
                  return (
                    <div className="loader" style={{ margin: '40px auto' }}></div>
                  );
                }

                if (eduPosts.length === 0) {
                  return (
                    <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                      <AlertCircle size={36} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
                      <h3 style={{ color: 'var(--text-primary)', margin: '0 0 8px 0' }}>No Recent Updates</h3>
                      <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.88rem' }}>
                        No social media posts found matching {eduActiveTab} in the past 24 hours. Try triggering a scrape!
                      </p>
                    </div>
                  );
                }

                return eduPosts.map(post => (
                  <div key={post.id} className="glass-panel post-card" style={{ borderLeft: `4px solid ${targetColor}` }}>
                    <div className="post-card-header">
                      <div className="post-author-info">
                        <div className="author-avatar" style={{ overflow: 'hidden' }}>
                          <img
                            src={post.authorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.authorName)}&background=8b5cf6&color=fff`}
                            alt={post.authorName}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(post.authorName)}&background=8b5cf6&color=fff`;
                            }}
                          />
                        </div>
                        <div className="author-name-handle">
                          <span className="author-name">{post.authorName}</span>
                          <span className="author-handle">{post.author}</span>
                        </div>
                      </div>
                      <div className="post-meta-badges">
                        <span className={`badge badge-platform badge-${post.platform}`}>{post.platform}</span>
                        <span className="badge badge-category" style={{ background: `${targetColor}1a`, color: targetColor, border: `1px solid ${targetColor}33` }}>{post.category}</span>
                        <span className={`badge badge-sentiment-${post.sentiment}`}>{post.sentiment}</span>
                        <span className="badge badge-platform" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={10} />
                          {post.region}
                        </span>
                      </div>
                    </div>

                    <div className="post-content">
                      <LinkifiedText text={post.text} />
                      {post.postVideo ? (
                        <div className="post-media" style={{ marginTop: '14px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-glass)' }}>
                          <VideoPlayer src={post.postVideo} controls muted playsInline style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', display: 'block' }} />
                        </div>
                      ) : post.postImage ? (
                        <div className="post-media" style={{ marginTop: '14px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-glass)' }}>
                          <img src={post.postImage} alt="Attached media" style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', display: 'block' }} />
                        </div>
                      ) : null}
                    </div>

                    {post.summary && (
                      <div className="ai-summary-box">
                        <div className="ai-summary-text"><LinkifiedText text={post.summary} /></div>
                      </div>
                    )}

                    {/* Interaction and translation controls */}
                    <div className="translation-controls">
                      <div className="post-footer-stats">
                        <span className={`stat-item ${likedPosts[post.id] ? 'liked' : ''}`} style={{ cursor: 'pointer' }} onClick={() => handleLikePost(post.id)}>
                          <ThumbsUp size={14} /> {post.likes}
                        </span>
                        <span className="stat-item"><Share2 size={14} /> {post.shares}</span>
                        <span className="stat-item" style={{ cursor: 'pointer' }} onClick={() => toggleComments(post.id, post.category)}>
                          <MessageSquare size={14} /> {post.comments}
                        </span>
                        <span className="post-time-region">
                          <Clock size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                          {new Date(post.timestamp).toLocaleString()} &bull; <span style={{ color: '#ef4444', fontWeight: 'bold' }}>{getDeletionTimer(post.timestamp, post.category)}</span>
                        </span>
                      </div>

                      <div className="translation-action-group">
                        <Globe size={14} style={{ color: 'var(--text-muted)' }} />
                        <select
                          className="select-lang-dropdown"
                          value={selectedTargetLang[post.id] || ''}
                          onChange={(e) => {
                            const lang = e.target.value;
                            setSelectedTargetLang(prev => ({ ...prev, [post.id]: lang }));
                            setActiveCommentPostId(null);
                            handleTranslate(post.id, post.text, lang);
                          }}
                        >
                          <option value="" disabled>Translate post</option>
                          {TARGET_LANGUAGES.map(lang => (
                            <option key={lang} value={lang}>{lang}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Translation result */}
                    {selectedTargetLang[post.id] && translations[`${post.id}_${selectedTargetLang[post.id]}`] && (
                      <div className="translated-result-box">
                        <div className="translated-header">
                          <span>Translated to {selectedTargetLang[post.id]}</span>
                          <div className="translated-actions">
                            <button
                              className={`translate-action-btn ${speakingPostId === post.id ? 'active' : ''}`}
                              onClick={() => handleSpeak(post.id, translations[`${post.id}_${selectedTargetLang[post.id]}`], selectedTargetLang[post.id])}
                            >
                              {speakingPostId === post.id ? <VolumeX size={13} /> : <Volume2 size={13} />}
                              <span>{speakingPostId === post.id ? "Stop" : "Listen"}</span>
                            </button>
                            <button className="translate-action-btn clear-btn" onClick={() => handleClearTranslation(post.id)}>
                              <X size={13} />
                              <span>Clear</span>
                            </button>
                          </div>
                        </div>
                        <div className="translated-text">
                          {translations[`${post.id}_${selectedTargetLang[post.id]}`]}
                        </div>
                      </div>
                    )}

                    {/* Comments Panel */}
                    {activeCommentPostId === post.id && (
                      <div className="glass-panel inline-comments-panel" style={{ marginTop: '16px', padding: '16px', borderTop: '1px dashed var(--border-glass)', background: 'rgba(255, 255, 255, 0.02)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h4 style={{ fontSize: '0.85rem', color: 'var(--primary-light)' }}>Comments</h4>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Write a comment..."
                            value={typedComments[post.id] || ''}
                            onChange={(e) => setTypedComments(prev => ({ ...prev, [post.id]: e.target.value }))}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleAddComment(post.id);
                            }}
                            style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                          />
                          <button className="btn btn-primary" onClick={() => handleAddComment(post.id)} style={{ padding: '6px 14px', fontSize: '0.8rem' }}>Post</button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto', paddingRight: '4px' }}>
                          {(postComments[post.id] || []).length === 0 ? (
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>No comments yet.</span>
                          ) : (
                            (postComments[post.id] || []).map(comment => (
                              <div key={comment.id} style={{ display: 'flex', flexDirection: 'column', gap: '2px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', padding: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                  <span>{comment.authorName}</span>
                                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 400 }}>{new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{comment.text}</span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ));
              })()}
            </div>
          </div>
        ) : activeTab === 'health' ? (
          /* HEALTH & NUTRITION GUIDE */
          <div className="health-container" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="health-header glass-panel" style={{ padding: '24px', borderRadius: '12px', border: '1px solid var(--border-glass)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <Heart size={28} style={{ color: '#ef4444' }} />
                <h2 style={{ margin: 0, fontSize: '1.4rem', fontFamily: 'var(--font-display)', fontWeight: 800 }}>Vitamins & Nutrition Guide
                  <NotifToggle section="health" state={sectionNotifs} onToggle={toggleNotif} />
                </h2>
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px', minWidth: '220px' }}>
                  <Search size={14} style={{ color: 'var(--text-muted)' }} />
                  <input
                    className="form-control"
                    placeholder="Search food, vitamin, or benefit..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ padding: '6px 10px', fontSize: '0.8rem', flex: 1, minWidth: '140px' }}
                  />
                  {search && (
                    <X size={14} style={{ color: 'var(--text-muted)', cursor: 'pointer' }} onClick={() => setSearch('')} />
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {VITAMINS.map(v => (
                  <span
                    key={v.name}
                    onClick={() => document.getElementById('vitamin-' + v.name.replace(/\s+/g, '-'))?.scrollIntoView({ behavior: 'smooth' })}
                    style={{ cursor: 'pointer', padding: '4px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 600, background: v.color + '22', color: v.color, border: '1px solid ' + v.color + '44', whiteSpace: 'nowrap' }}
                  >
                    {v.icon} {v.name}
                  </span>
                ))}
              </div>
              {search && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Searching: <strong>{search}</strong> — matching vitamins and foods highlighted below
                </div>
              )}
            </div>

            {/* HEALTH GUIDE SECTION */}
            <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
              <h3 style={{ margin: '0 0 14px 0', fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={20} style={{ color: 'var(--primary)' }} /> Health & Wellness Guide
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
                <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '0.9rem', color: '#10b981' }}>🥗 Balanced Diet</h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                    Eat a variety of foods from all food groups. Include fruits, vegetables, whole grains, lean proteins, and healthy fats daily.
                  </p>
                </div>
                <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '0.9rem', color: '#f59e0b' }}>💧 Hydration</h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                    Drink at least 8 glasses (2 liters) of water daily. Proper hydration supports digestion, skin health, and energy levels.
                  </p>
                </div>
                <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)' }}>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '0.9rem', color: '#a78bfa' }}>🏃 Daily Activity</h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                    Aim for at least 30 minutes of moderate exercise daily. Combine cardio, strength training, and flexibility exercises.
                  </p>
                </div>
                <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '0.9rem', color: '#ef4444' }}>😴 Sleep & Rest</h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                    Get 7-9 hours of quality sleep per night. Consistent sleep schedules improve immune function and mental clarity.
                  </p>
                </div>
              </div>
              {/* Daily Tip */}
              <div style={{ marginTop: '14px', padding: '12px 16px', borderRadius: '10px', background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(16,185,129,0.1))', border: '1px solid rgba(139,92,246,0.2)' }}>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                  <strong style={{ color: 'var(--primary)' }}>💡 Daily Health Tip:</strong> {['Start your day with a glass of warm lemon water to boost digestion and vitamin C intake.', 'Include at least 5 servings of colorful fruits and vegetables in your meals today.', 'Take a 10-minute walk after meals to improve blood sugar regulation and digestion.', 'Practice mindful eating - chew slowly and avoid screens during meals for better nutrient absorption.', 'Get 15 minutes of morning sunlight for natural vitamin D synthesis and circadian rhythm regulation.'][new Date().getDate() % 5]}
                </p>
              </div>
            </div>

            <div className="vitamins-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
              {VITAMINS.filter(vitamin => {
                if (!search.trim()) return true;
                const q = search.toLowerCase();
                return vitamin.name.toLowerCase().includes(q) ||
                  vitamin.nameAlt.toLowerCase().includes(q) ||
                  vitamin.benefit.toLowerCase().includes(q) ||
                  vitamin.foods.some(f => f.name.toLowerCase().includes(q));
              }).map(vitamin => {
                const matchedFoods = search.trim()
                  ? vitamin.foods.filter(f => f.name.toLowerCase().includes(search.toLowerCase()))
                  : null;
                return (
                <div key={vitamin.name} id={'vitamin-' + vitamin.name.replace(/\s+/g, '-')} className="glass-panel" style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-glass)', transition: 'transform 0.2s, box-shadow 0.2s', outline: search && (vitamin.name.toLowerCase().includes(search.toLowerCase()) || vitamin.nameAlt.toLowerCase().includes(search.toLowerCase()) || vitamin.benefit.toLowerCase().includes(search.toLowerCase())) ? '2px solid var(--primary)' : 'none' }}>
                  {/* Vitamin header */}
                  <div style={{ padding: '18px 20px', borderBottom: '1px solid ' + vitamin.color + '33', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ fontSize: '1.8rem' }}>{vitamin.icon}</div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: vitamin.color }}>{vitamin.name}</h3>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{vitamin.nameAlt}</span>
                    </div>
                  </div>

                  {/* Benefit */}
                  <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-glass)' }}>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{vitamin.benefit}</p>
                  </div>

                  {/* Food sources grid */}
                  <div style={{ padding: '14px 20px' }}>
                    <p style={{ margin: '0 0 10px 0', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Food Sources</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                      {(matchedFoods || vitamin.foods).map(food => {
                        const foodEmoji = ({
                          'Carrots': '🥕', 'Sweet Potatoes': '🍠', 'Spinach': '🥬', 'Mangoes': '🥭', 'Eggs': '🥚',
                          'Whole Grains': '🌾', 'Pork': '🥩', 'Sunflower Seeds': '🌻', 'Legumes': '🫘', 'Fish': '🐟',
                          'Milk & Dairy': '🥛', 'Almonds': '🥜', 'Mushrooms': '🍄', 'Tuna': '🐟', 'Chicken Breast': '🍗',
                          'Chicken': '🍗', 'Poultry': '🍗', 'Peanuts': '🥜', 'Brown Rice': '🍚', 'Avocado': '🥑',
                          'Broccoli': '🥦', 'Potatoes': '🥔', 'Bananas': '🍌', 'Salmon': '🐟', 'Chickpeas': '🫘',
                          'Beef': '🥩', 'Liver': '🥩', 'Egg Yolks': '🥚', 'Nuts & Seeds': '🥜', 'Oranges': '🍊',
                          'Strawberries': '🍓', 'Kiwi': '🥝', 'Bell Peppers': '🫑', 'Tomatoes': '🍅', 'Kale': '🥬',
                          'Cod Liver Oil': '🫒', 'Fortified Milk': '🥛', 'Cheese': '🧀', 'Yogurt': '🥛', 'Soy Milk': '🥛',
                          'Pumpkin Seeds': '🎃', 'Cashews': '🥜', 'Hazelnuts': '🥜', 'Walnuts': '🥜', 'Flaxseeds': '🌱',
                          'Tofu': '🫘', 'Fortified Cereal': '🥣', 'Green Peas': '🫛', 'Pineapple': '🍍', 'Grapes': '🍇',
                          'Watermelon': '🍉', 'Lemon': '🍋', 'Coconut': '🥥', 'Papaya': '🍈', 'Blueberries': '🫐',
                          'Pumpkin': '🎃', 'Squash': '🫑', 'Beetroot': '🫑', 'Asparagus': '🥦', 'Cabbage': '🥬',
                          'Cauliflower': '🥦', 'Celery': '🥬', 'Cucumber': '🥒', 'Lettuce': '🥬', 'Onion': '🧅',
                          'Garlic': '🧄', 'Ginger': '🫚', 'Turnip': '🫑', 'Radish': '🫑'
                        })[food.name] || '🍽️';
                        return (
                        <div key={food.name} style={{ textAlign: 'center' }}>
                          <div style={{ width: '100%', aspectRatio: '1', borderRadius: '12px', overflow: 'hidden', border: '2px solid ' + (matchedFoods && matchedFoods.includes(food) ? 'var(--primary)' : 'var(--border-glass)'), marginBottom: '6px', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', position: 'relative' }}>
                            <img
                              src={'https://images.unsplash.com/photo-' + ({
                                'Carrots': '1598170845058-32b9d6a5da37',
                                'Sweet Potatoes': '1596097635121-14b800e5fb4e',
                                'Spinach': '1576045057995-568f588f82fb',
                                'Mangoes': '1553279768-865429fa0078',
                                'Eggs': '1582722872445-44dc5f7e3c8f',
                                'Whole Grains': '1574323347407-f5e1c09b9c1a',
                                'Pork': '1559742811-822f4580b12e',
                                'Sunflower Seeds': '1606925797300-0b35e9d1794e',
                                'Legumes': '1515543904379-3d757f8b2d9c',
                                'Fish': '1519708227418-c8fd9a32b7a2',
                                'Milk & Dairy': '1550583724-b2692b85b150',
                                'Almonds': '1508061253366-f7da1583aebc',
                                'Mushrooms': '1504672281656-e4983d70414b',
                                'Chicken Breast': '1604503468506-a8da13d82791',
                                'Tuna': '1519708227418-c8fd9a32b7a2',
                                'Peanuts': '1544022613-e87ca75a784a',
                                'Brown Rice': '1536304993881-ff6e9eefa2a6',
                                'Avocado': '1519162808019-7d1ca15b52e8',
                                'Broccoli': '1584270354949-c26b8d79e31b',
                                'Chicken': '1604503468506-a8da13d82791',
                                'Potatoes': '1518977676601-b53f82aba655',
                                'Bananas': '1571771894821-ce9b6ba11c94',
                                'Salmon': '1519708227418-c8fd9a32b7a2',
                                'Chickpeas': '1515543904379-3d757f8b2d9c',
                                'Poultry': '1604503468506-a8da13d82791',
                                'Egg Yolks': '1582722872445-44dc5f7e3c8f',
                                'Nuts & Seeds': '1606925797300-0b35e9d1794e',
                                'Oranges': '1547510771-a16404c0980f',
                                'Strawberries': '1540674729-475ebb18e60f',
                                'Kiwi': '1618895250242-6f76d19b63a6',
                                'Bell Peppers': '1563565375-f3fdb1e3c83a',
                                'Tomatoes': '1592924357229-3e975f3c2072',
                                'Kale': '1522835689008-6e6e9c3d90d7',
                                'Cod Liver Oil': '1584304725286-50948ed951b4',
                                'Fortified Milk': '1550583724-b2692b85b150',
                                'Cheese': '1486297678162-eb2a19b0a46d',
                                'Yogurt': '1488477185342-315eb0f34e71',
                                'Soy Milk': '1550583724-b2692b85b150',
                                'Beef': '1559742811-822f4580b12e',
                                'Liver': '1604503468506-a8da13d82791',
                                'Pumpkin Seeds': '1606925797300-0b35e9d1794e',
                                'Cashews': '1508061253366-f7da1583aebc',
                                'Walnuts': '1508061253366-f7da1583aebc',
                                'Flaxseeds': '1606925797300-0b35e9d1794e',
                                'Tofu': '1515543904379-3d757f8b2d9c',
                                'Fortified Cereal': '1574323347407-f5e1c09b9c1a',
                                'Green Peas': '1515543904379-3d757f8b2d9c',
                                'Pineapple': '1553279768-865429fa0078',
                                'Grapes': '1571771894821-ce9b6ba11c94',
                                'Watermelon': '1553279768-865429fa0078',
                                'Lemon': '1547510771-a16404c0980f',
                                'Coconut': '1553279768-865429fa0078',
                                'Papaya': '1553279768-865429fa0078',
                                'Blueberries': '1540674729-475ebb18e60f',
                                'Pumpkin': '1596097635121-14b800e5fb4e',
                                'Asparagus': '1584270354949-c26b8d79e31b',
                                'Cabbage': '1576045057995-568f588f82fb',
                                'Cauliflower': '1584270354949-c26b8d79e31b',
                                'Cucumber': '1592924357229-3e975f3c2072',
                                'Onion': '1592924357229-3e975f3c2072',
                                'Garlic': '1592924357229-3e975f3c2072'
                              })[food.name] + '?w=200&h=200&fit=crop&q=80'}
                              alt={food.name}
                              loading="lazy"
                              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                              onError={function() {
                                const el = this;
                                el.style.display = 'none';
                                const parent = el.parentElement;
                                if (parent && !parent.querySelector('span[data-food-emoji]')) {
                                  const span = document.createElement('span');
                                  span.setAttribute('data-food-emoji', 'true');
                                  span.style.cssText = 'font-size:2.5rem;line-height:1';
                                  span.textContent = foodEmoji;
                                  parent.appendChild(span);
                                }
                              }}
                            />
                          </div>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-primary)', fontWeight: 500, lineHeight: '1.2' }}>{food.name}</span>
                        </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
              })}
            </div>
          </div>
        ) : activeTab === 'tech-guide' ? (
          /* TECH GUIDE SECTION */
          <div className="tech-guide-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Language Selector & Listen Controls */}
            <div className="glass-panel" style={{ padding: '14px 20px', borderRadius: '14px', border: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Globe size={20} style={{ color: 'var(--primary)' }} />
                Tech Guide for All
                <NotifToggle section="tech-guide" state={sectionNotifs} onToggle={toggleNotif} />
              </span>
              <span style={{ fontWeight: 600, fontSize: '0.85rem', marginLeft: 'auto' }}>🔊 Listen in:</span>
              <select id="guide-lang-select" className="form-control" style={{ padding: '6px 12px', fontSize: '0.85rem', minWidth: '120px', borderRadius: '8px' }}
                defaultValue="en-US"
                onChange={() => {
                  if (window.speechSynthesis) window.speechSynthesis.cancel();
                }}
              >
                <option value="en-US">English</option>
                <option value="hi-IN">हिन्दी (Hindi)</option>
                <option value="ne-NP">नेपाली (Nepali)</option>
              </select>
              {!voicesReady && <span style={{ fontSize: '0.75rem', color: 'var(--warning)' }}>⏳ Loading voices...</span>}
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Select language then click 🔊 on any guide card</span>
            </div>

            {/* Search hint */}
            {search && <div style={{ padding: '10px 16px', borderRadius: '10px', background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)', fontSize: '0.82rem', color: 'var(--text-muted)' }}>🔍 Showing guides matching "<strong>{search}</strong>"</div>}

            {/* Platform Cards - Redesigned */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
              {TECH_GUIDES.filter(g => {
                if (!search.trim()) return true;
                const q = search.toLowerCase();
                return g.platform.toLowerCase().includes(q) || g.steps.some(s => s.toLowerCase().includes(q)) || g.tips.some(t => t.toLowerCase().includes(q));
              }).map(guide => {
                const guideId = 'guide-' + guide.platform.replace(/\s+/g, '-').toLowerCase();
                const isSpeakingThis = speakingGuide === guide.platform;
                return (
                  <div key={guide.platform} id={guideId} className="glass-panel" style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-glass)', transition: 'transform 0.2s, box-shadow 0.2s', background: 'linear-gradient(135deg, ' + guide.color + '08, rgba(255,255,255,0.01))' }}>
                    {/* Header with icon & listen */}
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid ' + guide.color + '25', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: guide.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                        {guide.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: guide.color }}>{guide.platform}</h3>
                      </div>
                      <button
                        onClick={() => {
                          if (!window.speechSynthesis) return;
                          window.speechSynthesis.cancel();
                          setSpeakingGuide(guide.platform);
                          const lang = document.getElementById('guide-lang-select').value;
                          const text = guide.steps.join('. ') + '. Tips: ' + guide.tips.join('. ');
                          const utter = new SpeechSynthesisUtterance(text);
                          utter.lang = lang;
                          utter.rate = 0.9;
                          utter.pitch = 1;
                          const voices = window.speechSynthesis.getVoices();
                          if (voices.length > 0) {
                            const matching = voices.find(v => v.lang.startsWith(lang.split('-')[0]));
                            if (matching) utter.voice = matching;
                          }
                          utter.onend = () => setSpeakingGuide(null);
                          utter.onerror = () => setSpeakingGuide(null);
                          window.speechSynthesis.speak(utter);
                        }}
                        disabled={isSpeakingThis || !voicesReady}
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap', borderRadius: '8px', opacity: isSpeakingThis || !voicesReady ? 0.6 : 1 }}
                        title={isSpeakingThis ? 'Speaking...' : 'Listen to guide'}
                      >
                        <Volume2 size={13} /> {isSpeakingThis ? '🔊' : 'Listen'}
                      </button>
                    </div>

                    {/* Steps with step numbers */}
                    <div style={{ padding: '14px 20px' }}>
                      <p style={{ margin: '0 0 10px 0', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: guide.color }}></span>
                        Step-by-Step Guide
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {guide.steps.map((step, i) => (
                          <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                            <span style={{ minWidth: '22px', height: '22px', borderRadius: '6px', background: guide.color + '20', color: guide.color, fontSize: '0.68rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                              {i + 1}
                            </span>
                            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5', flex: 1 }}>{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tips */}
                    <div style={{ padding: '12px 20px', background: guide.color + '08', borderTop: '1px solid ' + guide.color + '15' }}>
                      <p style={{ margin: '0 0 8px 0', fontSize: '0.72rem', fontWeight: 600, color: guide.color, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        💡 Pro Tips
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        {guide.tips.map((tip, i) => (
                          <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                            <span style={{ fontSize: '0.65rem', color: guide.color, marginTop: '3px' }}>✦</span>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{tip}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : activeTab === 'helplines' ? (
          /* HELPLINES SECTION */
          <div className="helplines-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="glass-panel" style={{ padding: '14px 20px', borderRadius: '14px', border: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <Phone size={20} style={{ color: 'var(--primary)' }} />
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                📞 Emergency Helplines
                <NotifToggle section="helplines" state={sectionNotifs} onToggle={toggleNotif} />
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>Tap to copy</span>
              <Copy size={14} style={{ color: 'var(--text-muted)' }} />
            </div>

            {search && <div style={{ padding: '10px 16px', borderRadius: '10px', background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)', fontSize: '0.82rem', color: 'var(--text-muted)' }}>🔍 Showing contacts matching "<strong>{search}</strong>"</div>}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
              {HELPLINES.map(group => ({
                ...group,
                contacts: group.contacts.filter(c => {
                  if (!search.trim()) return true;
                  const q = search.toLowerCase();
                  return c.name.toLowerCase().includes(q) || c.number.includes(q) || c.desc.toLowerCase().includes(q) || group.category.toLowerCase().includes(q);
                })
              })).filter(g => g.contacts.length > 0).map(group => (
                <div key={group.category} className="glass-panel" style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-glass)' }}>
                  <div style={{ padding: '14px 18px', background: group.color + '15', borderBottom: '1px solid ' + group.color + '25' }}>
                    <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: group.color }}>{group.category}</h3>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {group.contacts.map((c, i) => (
                      <div
                        key={c.name}
                        onClick={() => {
                          const text = c.number;
                          navigator.clipboard.writeText(text).then(() => {
                            const el = document.getElementById('copy-toast');
                            if (el) { el.style.display = 'block'; el.textContent = '✓ Copied ' + c.name + ': ' + text; setTimeout(() => { el.style.display = 'none'; }, 2000); }
                          }).catch(() => {});
                        }}
                        style={{
                          padding: '10px 18px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          cursor: 'pointer',
                          borderBottom: i < group.contacts.length - 1 ? '1px solid var(--border-glass)' : 'none',
                          transition: 'background 0.15s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span style={{ fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: 500, display: 'block' }}>{c.name}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>{c.desc}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, marginLeft: '10px' }}>
                          <span style={{
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            color: group.color,
                            padding: '3px 10px',
                            borderRadius: '6px',
                            background: group.color + '12',
                            fontFamily: 'monospace',
                            letterSpacing: '0.5px'
                          }}>
                            {c.number}
                          </span>
                          <Copy size={14} style={{ color: 'var(--text-muted)', opacity: 0.6 }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Copy Toast */}
            <div id="copy-toast" style={{ display: 'none', position: 'fixed', bottom: '80px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(16,185,129,0.95)', color: '#fff', padding: '10px 20px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600, zIndex: 9999, backdropFilter: 'blur(8px)', maxWidth: '90vw', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
            </div>
          </div>
        ) : activeTab === 'roadmap' ? (
          /* STUDY ROADMAP SECTION */
          <div className="roadmap-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="glass-panel" style={{ padding: '14px 20px', borderRadius: '14px', border: '1px solid var(--border-glass)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Map size={20} style={{ color: 'var(--primary)' }} />
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>🎓 Bachelor Degree Programs
                  <NotifToggle section="roadmap" state={sectionNotifs} onToggle={toggleNotif} />
                </span>
              </div>
              <p style={{ margin: '8px 0 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Explore courses, college options, and subjects for each stream. Click to expand details.
              </p>
            </div>

            {/* 📌 Per-Stream Roadmap Links */}
            <div className="glass-panel" style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-glass)', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>📌 Roadmaps</span>
              <a href="https://roadmap.sh/computer-science" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.78rem', color: 'var(--primary)', textDecoration: 'none' }}>💻 CS Roadmap ↗</a>
              <a href="https://roadmap.sh/frontend" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.78rem', color: 'var(--primary)', textDecoration: 'none' }}>🎨 Frontend ↗</a>
              <a href="https://roadmap.sh/backend" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.78rem', color: 'var(--primary)', textDecoration: 'none' }}>⚙️ Backend ↗</a>
              <a href="https://roadmap.sh/devops" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.78rem', color: 'var(--primary)', textDecoration: 'none' }}>🛠️ DevOps ↗</a>
              <a href="https://roadmap.sh/android" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.78rem', color: 'var(--primary)', textDecoration: 'none' }}>📱 Android ↗</a>
              <a href="https://roadmap.sh/python" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.78rem', color: 'var(--primary)', textDecoration: 'none' }}>🐍 Python ↗</a>
              <a href="https://roadmap.sh/data-science" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.78rem', color: 'var(--primary)', textDecoration: 'none' }}>📊 Data Science ↗</a>
              <a href="https://www.geeksforgeeks.org/blogs/roadmaps/" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.78rem', color: 'var(--primary)', textDecoration: 'none' }}>📘 GFG Roadmaps ↗</a>
            </div>

            {search && <div style={{ padding: '10px 16px', borderRadius: '10px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', fontSize: '0.82rem', color: 'var(--text-muted)' }}>🔍 Showing courses matching "<strong>{search}</strong>"</div>}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '18px' }}>
              {STUDY_ROADMAPS.map(stream => ({
                ...stream,
                courses: stream.courses.filter(c => {
                  if (!search.trim()) return true;
                  const q = search.toLowerCase();
                  return c.name.toLowerCase().includes(q) || c.level.toLowerCase().includes(q) || c.duration.includes(q) || (c.colleges && c.colleges.some(col => col.toLowerCase().includes(q))) || (c.subjects && c.subjects.some(sub => sub.toLowerCase().includes(q))) || stream.stream.toLowerCase().includes(q);
                })
              })).filter(s => s.courses.length > 0).map(stream => (
                <div key={stream.stream} className="glass-panel" style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-glass)' }}>
                  <div style={{ padding: '14px 18px', background: stream.color + '12', borderBottom: '1px solid ' + stream.color + '20', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.3rem' }}>{stream.icon}</span>
                    <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: stream.color }}>{stream.stream}</h3>
                    {stream.roadmapLink && (
                      <a href={stream.roadmapLink} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ marginLeft: 'auto', fontSize: '0.7rem', color: stream.color, textDecoration: 'none', padding: '3px 10px', borderRadius: '6px', background: stream.color + '15', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        🗺️ Roadmap ↗
                      </a>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {stream.courses.map((course, idx) => (
                      <div
                        key={course.name}
                        style={{
                          padding: '12px 18px',
                          borderBottom: idx < stream.courses.length - 1 ? '1px solid var(--border-glass)' : 'none',
                          cursor: 'pointer',
                          transition: 'background 0.15s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        onClick={() => {
                          const detailsId = 'course-details-' + course.name.replace(/\s+/g, '-');
                          const el = document.getElementById(detailsId);
                          if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{course.name}</span>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '8px' }}>({course.duration})</span>
                            <span style={{ fontSize: '0.68rem', color: stream.color, marginLeft: '8px', background: stream.color + '15', padding: '1px 8px', borderRadius: '4px' }}>{course.level}</span>
                          </div>
                          <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />
                        </div>
                        <div id={'course-details-' + course.name.replace(/\s+/g, '-')} style={{ display: 'none', marginTop: '10px', padding: '10px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                          {course.colleges && (
                            <div style={{ marginBottom: '8px' }}>
                              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>🏛️ Colleges:</span>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                                {course.colleges.map(col => (
                                  <span key={col} style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.04)', padding: '2px 8px', borderRadius: '4px' }}>{col}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          {course.subjects && (
                            <div>
                              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📚 Subjects:</span>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                                {course.subjects.map(sub => (
                                  <span key={sub} style={{ fontSize: '0.72rem', color: 'var(--text-primary)', background: stream.color + '15', padding: '2px 8px', borderRadius: '4px' }}>{sub}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === 'nepal-quiz' ? (
          /* NEPAL GK QUIZ */
          <div className="glass-panel" style={{ borderRadius: '16px', padding: '0px', overflow: 'hidden', border: '1px solid var(--border-glass-bright)' }}>
            <div style={{ padding: '20px 24px 14px 24px', borderBottom: '1px solid var(--border-glass)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <HelpCircle size={22} style={{ color: 'var(--primary)' }} />
                <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>🇳🇵 Nepal General Knowledge Quiz
                  <NotifToggle section="nepal-quiz" state={sectionNotifs} onToggle={toggleNotif} />
                </h2>
                <span style={{ marginLeft: 'auto', fontSize: '0.72rem', padding: '3px 10px', borderRadius: '20px', background: 'rgba(16,185,129,0.1)', color: 'var(--success)', border: '1px solid rgba(16,185,129,0.2)' }}>
                  {quizAttempted > 0 ? `✅ ${quizScore}/${quizAttempted}` : '📝 Ready'}
                </span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: '6px 0 0 0' }}>
                Tap a question to reveal the answer. Test your knowledge about Nepal!
              </p>
            </div>

            {/* Category Tabs */}
            <div style={{ padding: '12px 24px', borderBottom: '1px solid var(--border-glass)', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {NEPAL_QUESTIONS.map((cat, i) => (
                <button
                  key={cat.category}
                  onClick={() => { setQuizCategory(i); setRevealedAnswers(new Set()); }}
                  style={{
                    padding: '6px 14px', borderRadius: '20px', border: '1px solid ' + (quizCategory === i ? cat.color + '60' : 'var(--border-glass)'),
                    background: quizCategory === i ? cat.color + '18' : 'transparent', color: quizCategory === i ? cat.color : 'var(--text-muted)',
                    cursor: 'pointer', fontSize: '0.78rem', fontWeight: quizCategory === i ? 600 : 400,
                    transition: 'all 0.2s'
                  }}
                >
                  {cat.icon} {cat.category.split(' ').slice(1).join(' ')}
                </button>
              ))}
            </div>

            {/* Questions */}
            <div style={{ padding: '20px 24px 24px 24px' }}>
              {search && (
                <div style={{ padding: '10px 16px', borderRadius: '10px', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  🔍 Filtering questions matching "<strong>{search}</strong>"
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(() => {
                  const currentCategory = NEPAL_QUESTIONS[quizCategory];
                  const filteredQuestions = currentCategory.questions.filter(q => {
                    if (!search.trim()) return true;
                    const query = search.toLowerCase();
                    return q.q.toLowerCase().includes(query) || q.a.toLowerCase().includes(query);
                  });
                  return filteredQuestions.map((item, idx) => {
                    const globalIdx = currentCategory.questions.indexOf(item);
                    const isRevealed = revealedAnswers.has(globalIdx);
                    return (
                      <div
                        key={globalIdx}
                        className="glass-panel"
                        onClick={() => {
                          if (!isRevealed) {
                            setRevealedAnswers(prev => {
                              const next = new Set(prev);
                              next.add(globalIdx);
                              return next;
                            });
                            setQuizAttempted(prev => prev + 1);
                            setQuizScore(prev => {
                              document.getElementById('quiz-feedback-' + globalIdx)?.classList.add('correct-flash');
                              return prev + 1;
                            });
                          }
                        }}
                        style={{
                          borderRadius: '12px', padding: '14px 16px', border: '1px solid var(--border-glass)',
                          cursor: 'pointer', transition: 'all 0.25s',
                          background: isRevealed ? currentCategory.color + '08' : 'var(--glass-bg)',
                          position: 'relative', overflow: 'hidden'
                        }}
                      >
                        {/* Question */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                          <span style={{
                            width: '28px', height: '28px', borderRadius: '50%', background: currentCategory.color + '18',
                            color: currentCategory.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.75rem', fontWeight: 700, flexShrink: 0, marginTop: '1px'
                          }}>
                            {globalIdx + 1}
                          </span>
                          <div style={{ flex: 1 }}>
                            <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 600, color: 'var(--text)', lineHeight: 1.5 }}>
                              {item.q}
                            </p>
                            {/* Answer (revealed on click) */}
                            <div
                              id={'quiz-feedback-' + globalIdx}
                              style={{
                                marginTop: isRevealed ? '10px' : '0', maxHeight: isRevealed ? '300px' : '0',
                                overflow: 'hidden', transition: 'all 0.35s ease', opacity: isRevealed ? 1 : 0
                              }}
                            >
                              <div style={{
                                padding: '10px 14px', borderRadius: '8px',
                                background: currentCategory.color + '10', border: '1px solid ' + currentCategory.color + '20',
                                fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5
                              }}>
                                <span style={{ fontWeight: 600, color: currentCategory.color }}>✅ </span>
                                {item.a}
                              </div>
                            </div>
                            {!isRevealed && (
                              <p style={{ margin: '4px 0 0 0', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                👆 Tap to reveal answer
                              </p>
                            )}
                          </div>
                          <span style={{ fontSize: '0.9rem', flexShrink: 0 }}>{isRevealed ? '✅' : '❓'}</span>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>

              {/* Reset & Stats */}
              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  {quizAttempted > 0 ? (
                    <span>📊 Score: <strong style={{ color: 'var(--success)' }}>{quizScore}</strong> / {quizAttempted} ({quizAttempted > 0 ? Math.round(quizScore / quizAttempted * 100) : 0}%)</span>
                  ) : (
                    <span>Start tapping questions to track your score!</span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => {
                      setRevealedAnswers(new Set(NEPAL_QUESTIONS[quizCategory].questions.map((_, i) => i)));
                      setQuizAttempted(prev => {
                        const cat = NEPAL_QUESTIONS[quizCategory];
                        const unrevealed = cat.questions.filter((_, i) => !revealedAnswers.has(i)).length;
                        setQuizScore(s => s + unrevealed);
                        return prev + unrevealed;
                      });
                    }}
                    style={{ padding: '7px 16px', borderRadius: '10px', border: '1px solid var(--border-glass)', background: 'var(--glass-bg)', color: 'var(--text)', cursor: 'pointer', fontSize: '0.78rem' }}
                  >
                    👁️ Reveal All
                  </button>
                  <button
                    onClick={() => {
                      setRevealedAnswers(new Set());
                      setQuizScore(0);
                      setQuizAttempted(0);
                    }}
                    style={{ padding: '7px 16px', borderRadius: '10px', border: '1px solid var(--border-glass)', background: 'var(--glass-bg)', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.78rem' }}
                  >
                    🔄 Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'balen' ? (
          /* BALEN SHAH SOCIAL MEDIA TRACKER */
          <div className="glass-panel" style={{ borderRadius: '16px', padding: '0px', overflow: 'hidden', border: '1px solid var(--border-glass-bright)' }}>
            <div style={{ padding: '22px 24px 14px 24px', borderBottom: '1px solid var(--border-glass)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <PersonAvatar name="Balen Shah" size={52} imgUrl={PERSON_IMAGES['Balen Shah']} />
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Balen Shah — Social Media Monitor
                  <NotifToggle section="balen" state={sectionNotifs} onToggle={toggleNotif} />
                </h2>
                <span style={{ marginLeft: 'auto', fontSize: '0.72rem', padding: '3px 10px', borderRadius: '20px', background: 'rgba(16,185,129,0.1)', color: 'var(--success)', border: '1px solid rgba(16,185,129,0.2)' }}>🔴 Real-time</span>
              </div>
            </div>
            </div>
            <div style={{ padding: '0 24px 14px 24px' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: 0 }}>
                Aggregated social media posts mentioning Balen Shah (Mayor of Kathmandu Metropolitan City)
              </p>
            </div>
            <div style={{ padding: '16px 24px 24px 24px' }}>
              {isLoadingBalen ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div className="loading-spinner" style={{ width: '32px', height: '32px', borderWidth: '3px', margin: '0 auto 12px auto' }}></div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Fetching Balen Shah posts...</p>
                </div>
              ) : balenPosts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                  <Users size={32} style={{ opacity: 0.4, marginBottom: '10px' }} />
                  <p>No posts found for Balen Shah yet.</p>
                  <p style={{ fontSize: '0.78rem' }}>Posts will appear once the scraper collects them.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {(search ? balenPosts.filter(p => p.content?.toLowerCase().includes(search.toLowerCase()) || p.author?.toLowerCase().includes(search.toLowerCase()) || p.platform?.toLowerCase().includes(search.toLowerCase())) : balenPosts).slice(0, 50).map(post => (
                    <div key={post._id} className="glass-panel" style={{ borderRadius: '12px', padding: '14px 16px', border: '1px solid var(--border-glass)', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>
                        {post.platform === 'Facebook' ? '📘' : post.platform === 'YouTube' ? '📺' : post.platform === 'Reddit' ? '🔴' : post.platform === 'Twitter' ? '🐦' : '🌐'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                          <strong style={{ fontSize: '0.85rem', color: 'var(--text)' }}>{post.author || 'Unknown'}</strong>
                          <span style={{ fontSize: '0.7rem', padding: '1px 8px', borderRadius: '10px', background: post.platform === 'Facebook' ? '#1877F220' : post.platform === 'YouTube' ? '#FF000020' : post.platform === 'Reddit' ? '#FF450020' : post.platform === 'Twitter' ? '#1DA1F220' : 'rgba(99,102,241,0.1)', color: post.platform === 'Facebook' ? '#1877F2' : post.platform === 'YouTube' ? '#FF0000' : post.platform === 'Reddit' ? '#FF4500' : post.platform === 'Twitter' ? '#1DA1F2' : 'var(--primary)', fontSize: '0.65rem', fontWeight: 600 }}>{post.platform}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>{new Date(post.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{post.content?.length > 280 ? post.content.slice(0, 280) + '...' : post.content}</p>
                        {post.postVideo && (
                          <div style={{ marginTop: '8px' }}>
                            <a href={post.postVideo} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <ExternalLink size={12} /> Watch Video
                            </a>
                          </div>
                        )}
                        <div style={{ marginTop: '6px', display: 'flex', gap: '12px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {post.likes !== undefined && <span>❤️ {post.likes}</span>}
                          {post.comments !== undefined && <span>💬 {post.comments}</span>}
                          {post.shares !== undefined && <span>🔄 {post.shares}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'leaders' ? (
          /* NEPAL LEADERS SOCIAL MEDIA TRACKER */
          <div className="glass-panel" style={{ borderRadius: '16px', padding: '0px', overflow: 'hidden', border: '1px solid var(--border-glass-bright)' }}>
            <div style={{ padding: '22px 24px 14px 24px', borderBottom: '1px solid var(--border-glass)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '-6px' }}>
                  <PersonAvatar name="Ram Chandra Paudel" size={46} imgUrl={PERSON_IMAGES['Ram Chandra Paudel']} />
                  <span style={{ marginLeft: '-8px' }}><PersonAvatar name="Ram Sahaya Yadav" size={46} imgUrl={PERSON_IMAGES['Ram Sahaya Yadav']} /></span>
                  <span style={{ marginLeft: '-8px' }}><PersonAvatar name="Balen Shah" size={46} imgUrl={PERSON_IMAGES['Balen Shah']} /></span>
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Nepal Leaders Track
                    <NotifToggle section="leaders" state={sectionNotifs} onToggle={toggleNotif} />
                  </h2>
                </div>
                <span style={{ marginLeft: 'auto', fontSize: '0.72rem', padding: '3px 10px', borderRadius: '20px', background: 'rgba(234,179,8,0.1)', color: 'var(--warning)', border: '1px solid rgba(234,179,8,0.2)' }}>🔴 Real-time</span>
              </div>
              <div style={{ padding: '0 24px 14px 24px' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: 0 }}>
                  Posts about the President of Nepal, Home Minister, and other government leaders
                </p>
              </div>
            </div>
            <div style={{ padding: '16px 24px 24px 24px' }}>
              {isLoadingLeaders ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div className="loading-spinner" style={{ width: '32px', height: '32px', borderWidth: '3px', margin: '0 auto 12px auto' }}></div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Fetching leaders posts...</p>
                </div>
              ) : leadersPosts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                  <Crown size={32} style={{ opacity: 0.4, marginBottom: '10px' }} />
                  <p>No posts found for Nepal leaders yet.</p>
                  <p style={{ fontSize: '0.78rem' }}>Posts will appear once the scraper collects them.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {(search ? leadersPosts.filter(p => p.content?.toLowerCase().includes(search.toLowerCase()) || p.author?.toLowerCase().includes(search.toLowerCase()) || p.platform?.toLowerCase().includes(search.toLowerCase())) : leadersPosts).slice(0, 50).map(post => (
                    <div key={post._id} className="glass-panel" style={{ borderRadius: '12px', padding: '14px 16px', border: '1px solid var(--border-glass)', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(234,179,8,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>
                        {post.platform === 'Facebook' ? '📘' : post.platform === 'YouTube' ? '📺' : post.platform === 'Reddit' ? '🔴' : post.platform === 'Twitter' ? '🐦' : '🌐'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                          <strong style={{ fontSize: '0.85rem', color: 'var(--text)' }}>{post.author || 'Unknown'}</strong>
                          <span style={{ fontSize: '0.7rem', padding: '1px 8px', borderRadius: '10px', background: post.platform === 'Facebook' ? '#1877F220' : post.platform === 'YouTube' ? '#FF000020' : post.platform === 'Reddit' ? '#FF450020' : post.platform === 'Twitter' ? '#1DA1F220' : 'rgba(99,102,241,0.1)', color: post.platform === 'Facebook' ? '#1877F2' : post.platform === 'YouTube' ? '#FF0000' : post.platform === 'Reddit' ? '#FF4500' : post.platform === 'Twitter' ? '#1DA1F2' : 'var(--primary)', fontSize: '0.65rem', fontWeight: 600 }}>{post.platform}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>{new Date(post.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{post.content?.length > 280 ? post.content.slice(0, 280) + '...' : post.content}</p>
                        {post.postVideo && (
                          <div style={{ marginTop: '8px' }}>
                            <a href={post.postVideo} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <ExternalLink size={12} /> Watch Video
                            </a>
                          </div>
                        )}
                        <div style={{ marginTop: '6px', display: 'flex', gap: '12px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {post.likes !== undefined && <span>❤️ {post.likes}</span>}
                          {post.comments !== undefined && <span>💬 {post.comments}</span>}
                          {post.shares !== undefined && <span>🔄 {post.shares}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'zen-g' ? (
          /* ZEN G — DEATH GENRE GALLERY */
          <div className="glass-panel" style={{ borderRadius: '16px', padding: '0px', overflow: 'hidden', border: '1px solid var(--border-glass-bright)' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <Skull size={22} style={{ color: 'var(--text-muted)' }} />
              <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>
                💀 Zen G — Memento Mori
                <NotifToggle section="zen-g" state={sectionNotifs} onToggle={toggleNotif} />
              </h2>
              <span style={{ marginLeft: 'auto', fontSize: '0.72rem', padding: '3px 10px', borderRadius: '20px', background: 'rgba(100,100,100,0.15)', color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.06)' }}>
                {ZEN_G_PHOTOS.length} photos
              </span>
            </div>
            <div style={{ padding: '20px 24px 24px 24px' }}>
              {search && (
                <div style={{ padding: '10px 16px', borderRadius: '10px', background: 'rgba(100,100,100,0.06)', border: '1px solid rgba(100,100,100,0.15)', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  🔍 Filtering photos matching "<strong>{search}</strong>"
                </div>
              )}
              <div style={{ columns: '280px', columnGap: '14px' }}>
                {(search ? ZEN_G_PHOTOS.filter(p => p.title.toLowerCase().includes(search.toLowerCase()) || p.desc.toLowerCase().includes(search.toLowerCase())) : ZEN_G_PHOTOS).map(photo => (
                  <div
                    key={photo.id}
                    className="glass-panel"
                    style={{
                      breakInside: 'avoid', marginBottom: '14px', borderRadius: '12px', overflow: 'hidden',
                      border: '1px solid var(--border-glass)', transition: 'transform 0.2s, box-shadow 0.2s',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.3)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                    onClick={() => window.open(photo.url.split('?')[0], '_blank')}
                  >
                    <img
                      src={photo.url}
                      alt={photo.title}
                      style={{ width: '100%', height: 'auto', display: 'block', aspectRatio: 'auto' }}
                      loading="lazy"
                      onError={e => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<div style=\'padding:40px;text-align:center;color:var(--text-muted);font-size:0.8rem\'>💀 image unavailable</div>'; }}
                    />
                    <div style={{ padding: '12px 14px' }}>
                      <h4 style={{ margin: '0 0 3px 0', fontSize: '0.88rem', fontWeight: 700, color: 'var(--text)' }}>{photo.title}</h4>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>{photo.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              {(search && ZEN_G_PHOTOS.filter(p => p.title.toLowerCase().includes(search.toLowerCase()) || p.desc.toLowerCase().includes(search.toLowerCase())).length === 0) && (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                  <Skull size={36} style={{ opacity: 0.3, marginBottom: '8px' }} />
                  <p>No photos match your search.</p>
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'android-unlock' ? (
          /* ANDROID PATTERN UNLOCK RECOVERY */
          <div className="glass-panel" style={{ borderRadius: '16px', padding: '0px', overflow: 'hidden', border: '1px solid var(--border-glass-bright)' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <Smartphone size={22} style={{ color: 'var(--warning)' }} />
              <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>
                🔓 Android Pattern Lock Recovery
                <NotifToggle section="android-unlock" state={sectionNotifs} onToggle={toggleNotif} />
              </h2>
            </div>
            <div style={{ padding: '20px 24px 24px 24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

              {/* 3x3 Pattern Grid Visualizer */}
              <div className="glass-panel" style={{ padding: '20px', borderRadius: '14px', border: '1px solid var(--border-glass)', textAlign: 'center' }}>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', fontWeight: 700 }}>🔍 Pattern Visualizer</h3>
                <p style={{ margin: '0 0 16px 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>Tap the dots to draw your remembered pattern (3–9 dots)</p>
                <div style={{ display: 'inline-grid', gridTemplateColumns: 'repeat(3, 56px)', gap: '8px', padding: '16px', borderRadius: '12px', background: 'rgba(0,0,0,0.15)' }}>
                  {[0,1,2,3,4,5,6,7,8].map(i => {
                    const row = Math.floor(i / 3), col = i % 3;
                    const isSelected = patternDots.includes(i);
                    const order = patternDots.indexOf(i) + 1;
                    return (
                      <button
                        key={i}
                        onClick={() => {
                          if (isSelected) {
                            setPatternDots(patternDots.slice(0, order - 1));
                          } else if (patternDots.length < 9) {
                            const newDots = [...patternDots, i];
                            setPatternDots(newDots);
                          }
                        }}
                        style={{
                          width: '56px', height: '56px', borderRadius: '50%', border: '3px solid ' + (isSelected ? '#10b981' : 'rgba(255,255,255,0.15)'),
                          background: isSelected ? 'rgba(16,185,129,0.2)' : 'transparent', cursor: 'pointer', position: 'relative',
                          transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                      >
                        <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: isSelected ? '#10b981' : 'rgba(255,255,255,0.25)' }} />
                        {isSelected && <span style={{ position: 'absolute', fontSize: '0.7rem', fontWeight: 700, color: '#10b981', top: '-6px', right: '-6px', background: '#1a1a2e', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(16,185,129,0.3)' }}>{order}</span>}
                      </button>
                    );
                  })}
                </div>
                {patternDots.length >= 3 && (
                  <div style={{ marginTop: '12px', padding: '8px 14px', borderRadius: '8px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)', fontSize: '0.85rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                    Pattern: <strong style={{ color: '#10b981' }}>{patternDots.map(d => d + 1).join(' → ')}</strong>
                    <span style={{ marginLeft: '8px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>({patternDots.length} dots)</span>
                  </div>
                )}
                <button
                  onClick={() => { setPatternDots([]); setPatternResult(''); setPatternError(''); }}
                  style={{ marginTop: '10px', padding: '6px 16px', borderRadius: '8px', border: '1px solid var(--border-glass)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.78rem' }}
                >
                  🔄 Clear Pattern
                </button>
              </div>

              {/* Common Patterns Reference */}
              <div className="glass-panel" style={{ padding: '16px 20px', borderRadius: '14px', border: '1px solid var(--border-glass)' }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', fontWeight: 700 }}>📋 Common Unlock Patterns</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px' }}>
                  {[
                    { label: 'L-shape', dots: [0,3,6,7,8] },
                    { label: 'Z-shape', dots: [0,1,2,5,8] },
                    { label: 'Cross', dots: [1,3,4,5,7] },
                    { label: 'Box', dots: [0,1,2,5,8,7,6,3] },
                    { label: 'Snake', dots: [0,1,2,5,4,3,6,7,8] },
                    { label: 'Spiral', dots: [4,1,0,3,6,7,8,5,2] },
                    { label: 'Corner', dots: [0,2,6,8] },
                    { label: 'Heart', dots: [0,4,8,5,2,4,6] },
                  ].map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => setPatternDots(p.dots)}
                      style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--border-glass)', background: 'transparent', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s' }}
                    >
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 8px)', gap: '3px', justifyContent: 'center', marginBottom: '4px' }}>
                        {[0,1,2,3,4,5,6,7,8].map(i => (
                          <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.dots.includes(i) ? '#10b981' : 'rgba(255,255,255,0.1)' }} />
                        ))}
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Recovery Methods */}
              <div>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', fontWeight: 700 }}>🛠️ Recovery Methods</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}>
                  {[
                    { icon: '🌐', title: 'Google Find My Device', steps: ['Go to android.com/find on any device', 'Sign in with your Google account', 'Select your locked phone', 'Click "Lock" and set a new password', 'Unlock phone with new password, then disable pattern'], color: '#3b82f6' },
                    { icon: '📱', title: 'Samsung Find My Mobile', steps: ['Visit findmymobile.samsung.com', 'Sign in with Samsung account', 'Select your device', 'Click "Unlock" button', 'Pattern will be removed instantly'], color: '#8b5cf6' },
                    { icon: '💻', title: 'ADB Method (USB Debugging)', steps: ['Connect phone to PC via USB', 'Open command prompt / terminal', 'Type: adb shell', 'Type: rm /data/system/gesture.key', 'Type: rm /data/system/locksettings.db', 'Reboot phone — pattern is cleared'], color: '#10b981' },
                    { icon: '🔧', title: 'Recovery Mode (Factory Reset)', steps: ['Power off phone completely', 'Press Volume Up + Power (or Bixby + Vol Up + Power for Samsung)', 'Navigate to "Wipe data/factory reset"', 'Confirm reset', 'Phone will reboot — pattern is gone but all data erased'], color: '#ef4444', warn: true },
                  ].map((method, idx) => (
                    <div key={idx} className="glass-panel" style={{ borderRadius: '12px', padding: '14px 16px', border: '1px solid var(--border-glass)', borderLeft: '3px solid ' + method.color }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '1.2rem' }}>{method.icon}</span>
                        <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 700, color: 'var(--text)' }}>{method.title}</h4>
                      </div>
                      <ol style={{ margin: '0 0 0 18px', padding: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
                        {method.steps.map((step, si) => <li key={si}>{step}</li>)}
                      </ol>
                      {method.warn && (
                        <div style={{ marginTop: '8px', padding: '8px 12px', borderRadius: '6px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', fontSize: '0.72rem', color: '#ef4444' }}>
                          ⚠️ This method erases ALL data on your phone (photos, contacts, apps). Use as last resort.
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Bluetooth Pattern Finder — Real Guide */}
              <div className="glass-panel" style={{ padding: '16px 20px', borderRadius: '14px', border: '1px solid var(--border-glass)' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '0.88rem', fontWeight: 700 }}>🦷 Bluetooth Pattern Finder</h3>
                <p style={{ margin: '0 0 12px 0', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  Extract your Android lock pattern using a laptop — no root needed
                </p>

                {/* Prerequisites */}
                <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.12)', fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '12px' }}>
                  <strong style={{ color: '#ef4444' }}>⚠️ Required: USB Debugging must be ON</strong><br />
                  This must have been enabled in Developer Options <em>before</em> the phone was locked. Without it, ADB cannot connect and the pattern hash cannot be read.
                  <br /><br />
                  <strong style={{ color: '#f59e0b' }}>Samsung users only:</strong> If USB Debugging is OFF, try <a href="https://findmymobile.samsung.com" target="_blank" rel="noopener noreferrer" style={{ color: '#8b5cf6' }}>Find My Mobile</a> — some models let you remotely unlock or enable USB Debugging from the web portal.
                </div>

                {/* Step 1 */}
                <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.12)', fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '10px' }}>
                  <strong style={{ color: '#3b82f6' }}>📥 Step 1: Install ADB on your laptop</strong>
                  <ol style={{ margin: '6px 0 0 18px', padding: 0, lineHeight: '1.8' }}>
                    <li>Download <a href="https://developer.android.com/studio/releases/platform-tools" target="_blank" rel="noopener noreferrer" style={{ color: '#8b5cf6' }}>Android SDK Platform Tools</a> (adb.exe included)</li>
                    <li>Extract the ZIP to a folder, e.g. <code style={{ color: '#10b981' }}>C:\adb</code></li>
                    <li>Open Command Prompt / Terminal in that folder</li>
                  </ol>
                </div>

                {/* Step 2 */}
                <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.12)', fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '10px' }}>
                  <strong style={{ color: '#10b981' }}>📶 Step 2: Connect to your phone via Bluetooth</strong>
                  <ol style={{ margin: '6px 0 0 18px', padding: 0, lineHeight: '1.8' }}>
                    <li>On your laptop, go to Bluetooth settings → Add a device</li>
                    <li>Select your phone from the list and pair them</li>
                    <li>Once paired, the phone gets a local IP — usually <code style={{ color: '#10b981' }}>192.168.42.1</code></li>
                    <li>In Command Prompt, run:
                      <div style={{ marginTop: '4px', padding: '6px 10px', borderRadius: '4px', background: 'rgba(0,0,0,0.15)', fontFamily: 'monospace', color: '#f59e0b' }}>$ adb connect 192.168.42.1:5555</div>
                    </li>
                    <li>You should see: <code style={{ color: '#10b981' }}>connected to 192.168.42.1:5555</code></li>
                  </ol>
                </div>

                {/* Step 3 */}
                <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(139,92,246,0.04)', border: '1px solid rgba(139,92,246,0.12)', fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '10px' }}>
                  <strong style={{ color: '#8b5cf6' }}>🔎 Step 3: Extract the pattern hash</strong>
                  <p style={{ margin: '6px 0', lineHeight: '1.6' }}>Run this command in the terminal to read the saved pattern hash directly:</p>
                  <div style={{ padding: '6px 10px', borderRadius: '4px', background: 'rgba(0,0,0,0.15)', fontFamily: 'monospace', color: '#f59e0b', marginBottom: '8px' }}>$ adb shell locksettings get-string --old</div>
                  <p style={{ margin: '0 0 6px 0', lineHeight: '1.6' }}>Or pull the full pattern file:</p>
                  <div style={{ padding: '6px 10px', borderRadius: '4px', background: 'rgba(0,0,0,0.15)', fontFamily: 'monospace', color: '#f59e0b', marginBottom: '4px' }}>$ adb pull /data/system/gesture.key</div>
                  <div style={{ padding: '6px 10px', borderRadius: '4px', background: 'rgba(0,0,0,0.15)', fontFamily: 'monospace', color: '#f59e0b' }}>$ adb pull /data/system/locksettings.db</div>
                </div>

                {/* Step 4 */}
                <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.12)', fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '10px' }}>
                  <strong style={{ color: '#f59e0b' }}>🧩 Step 4: Decode the hash to see the pattern grid</strong>
                  <p style={{ margin: '6px 0', lineHeight: '1.6' }}>Use one of these free tools to convert the hash into the visual pattern:</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {[
                      { icon: '☕', name: 'AndroidPatternLock (Java GUI)', url: 'https://github.com/Konloch/AndroidPatternLock', desc: 'Download the JAR, paste the hash, it draws the exact 3×3 pattern on screen' },
                      { icon: '🐍', name: 'pulledpork (Python)', url: 'https://github.com/mattjegan/pulledpork', desc: 'Python script — run against gesture.key, outputs the pattern sequence' },
                      { icon: '⚡', name: 'Online Hash Decoder', url: 'https://www.androidsu.com/android-pattern-lock-calculator/', desc: 'Web-based tool — paste hash, get pattern instantly' },
                    ].map((t, i) => (
                      <div key={i} style={{ padding: '8px 10px', borderRadius: '6px', background: 'rgba(0,0,0,0.1)', border: '1px solid rgba(255,255,255,0.04)' }}>
                        <span style={{ marginRight: '4px' }}>{t.icon}</span>
                        <a href={t.url} target="_blank" rel="noopener noreferrer" style={{ color: '#8b5cf6', fontWeight: 600, fontSize: '0.75rem' }}>{t.name}</a>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginLeft: '4px' }}>— {t.desc}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: '8px', padding: '8px 12px', borderRadius: '6px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.1)', fontSize: '0.72rem', color: '#10b981' }}>
                    💡 <strong>How decoding works:</strong> Android stores your pattern as a salted SHA-1 hash in <code>gesture.key</code>. These tools compare the hash against all 389,112 possible 3-to-9-dot patterns. When a match is found, they draw the exact pattern sequence on a 3×3 grid — so you can enter it on your phone.
                  </div>
                </div>

                {/* Visual Preview - 3x3 grid shows sample patterns */}
                <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(0,0,0,0.1)', border: '1px solid rgba(255,255,255,0.04)', fontSize: '0.76rem' }}>
                  <strong style={{ color: 'var(--text)' }}>📱 Example decoded patterns:</strong>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '8px', marginTop: '8px' }}>
                    {[
                      { label: 'L-shape', dots: [0,3,6,7,8] },
                      { label: 'Snake', dots: [0,1,2,5,4,3,6,7,8] },
                      { label: 'Cross', dots: [1,3,4,5,7] },
                      { label: 'Box', dots: [0,1,2,5,8,7,6,3] },
                      { label: 'Heart', dots: [0,4,8,5,2,4,6] },
                    ].map((p, idx) => (
                      <div key={idx} style={{ textAlign: 'center', padding: '8px', borderRadius: '6px', background: 'rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'inline-grid', gridTemplateColumns: 'repeat(3, 10px)', gap: '3px', marginBottom: '4px' }}>
                          {[0,1,2,3,4,5,6,7,8].map(i => (
                            <div key={i} style={{ width: '10px', height: '10px', borderRadius: '50%', background: p.dots.includes(i) ? '#10b981' : 'rgba(255,255,255,0.1)' }} />
                          ))}
                        </div>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{p.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Extra tips */}
                <div style={{ marginTop: '12px', padding: '10px 14px', borderRadius: '8px', background: 'rgba(234,179,8,0.04)', border: '1px solid rgba(234,179,8,0.1)', fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                  <strong>💡 Tips:</strong><br />
                  • If <code>adb connect</code> fails, try <code style={{ color: '#10b981' }}>adb connect 192.168.42.1:4321</code> (some brands use a different port)<br />
                  • On Samsung phones, you need to enable "USB Debugging" in Developer Options first<br />
                  • The <code>gesture.key</code> file only exists on Android 8 and below. Android 9+ uses <code>locksettings.db</code><br />
                  • Pattern length must be 3–9 dots. Brute-force checks all 389,112 combinations instantly
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '14px 18px', borderRadius: '14px', border: '1px solid var(--border-glass)' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '0.85rem', fontWeight: 700 }}>💻 ADB Quick Commands</h3>
                <p style={{ margin: '0 0 10px 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>For phones with USB Debugging already enabled:</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {[
                    { cmd: 'adb shell', desc: 'Access Android shell' },
                    { cmd: 'adb shell pm disable-user --user 0 com.android.systemui', desc: 'Disable lock screen (temporary)' },
                    { cmd: 'adb shell rm /data/system/gesture.key', desc: 'Delete pattern file (Android < 9)' },
                    { cmd: 'adb shell rm /data/system/locksettings.db', desc: 'Delete lock settings (Android 9+)' },
                    { cmd: 'adb reboot', desc: 'Reboot device' },
                  ].map((c, i) => (
                    <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '6px 10px', borderRadius: '6px', background: 'rgba(0,0,0,0.15)', fontFamily: 'monospace', fontSize: '0.76rem' }}>
                      <code style={{ color: '#10b981', flexShrink: 0 }}>$ {c.cmd}</code>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>— {c.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tips */}
              <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.12)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                💡 <strong>Tip:</strong> If your phone is Samsung and you have a Samsung account, try <strong>Find My Mobile</strong> first — it's the only method that won't erase your data. Google Find My Device requires the phone to be online. ADB needs USB Debugging to have been enabled before locking.
              </div>
            </div>
          </div>
        ) : activeTab === 'sports' ? (
          /* SPORTS ARENA VIEW */
          <div className="sports-center-container glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '0px', overflow: 'hidden', border: '1px solid var(--border-glass-bright)' }}>
            <div className="sports-center-header" style={{ padding: '24px 24px 16px 24px', borderBottom: '1px solid var(--border-glass)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="live-pulse-dot" style={{ width: '12px', height: '12px' }}></span>
                <h2 style={{ margin: 0, fontSize: '1.4rem', fontFamily: 'var(--font-display)', fontWeight: 800 }}>Zebvo Live Sports Arena
                  <NotifToggle section="sports" state={sectionNotifs} onToggle={toggleNotif} />
                </h2>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '6px 0 0 0' }}>
                Watch live broadcasts, check upcoming schedules, and follow real-time match events.
              </p>
            </div>

            {/* Sport & Date Selectors */}
            <div className="sports-selectors-bar" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', padding: '0 24px 16px 24px', borderBottom: '1px solid var(--border-glass)' }}>
              {/* Sport Pills */}
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                {['Football', 'Cricket', 'Badminton'].map(sport => (
                  <button
                    key={sport}
                    onClick={() => {
                      setSelectedWatchSport(sport);
                      setSelectedWatchDate(todayStr);
                      const matchesToday = (SPORTS_SCHEDULE[sport] || {})[todayStr] || [];
                      setSelectedWatchMatch(matchesToday[0] || null);
                    }}
                    className={`btn ${selectedWatchSport === sport ? 'btn-primary' : 'btn-secondary'}`}
                    style={{
                      padding: '8px 16px',
                      fontSize: '0.85rem',
                      borderRadius: 'var(--radius-full)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {sport === 'Football' ? '⚽ Football' : sport === 'Cricket' ? '🏏 Cricket' : '🏸 Badminton'}
                  </button>
                ))}
              </div>

              {/* Date Tabs */}
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px', marginLeft: 'auto' }}>
                {['2026-06-14', '2026-06-15', '2026-06-16', '2026-06-17'].map(dateStr => ({
                  label: formatDateLabel(dateStr),
                  value: dateStr
                })).map(d => (
                  <button
                    key={d.value}
                    onClick={() => {
                      setSelectedWatchDate(d.value);
                      setSelectedWatchMatch(null);
                    }}
                    className={`btn sports-date-tab ${selectedWatchDate === d.value ? 'active' : ''}`}
                    style={{
                      background: selectedWatchDate === d.value ? 'var(--primary)' : 'rgba(255,255,255,0.04)',
                      border: '1px solid ' + (selectedWatchDate === d.value ? 'var(--primary)' : 'var(--border-glass)'),
                      color: '#fff',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="sports-center-body" style={{ display: 'flex', flexDirection: 'column', gap: '0', padding: '0 24px 24px 24px' }}>
              {/* Video Player Section */}
              <div className="sports-watch-stream" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: selectedWatchMatch ? '20px' : '0' }}>
                {selectedWatchMatch ? (
                  <>
                    <div className="sports-video-player-container" style={{ position: 'relative', borderRadius: '14px', overflow: 'hidden', border: '1px solid var(--border-glass-bright)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', background: '#000' }}>
                      <video
                        src={selectedWatchMatch.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4'}
                        autoPlay
                        loop
                        muted
                        playsInline
                        controls
                        style={{ width: '100%', display: 'block', maxHeight: '420px', objectFit: 'cover' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                      {/* Scoreboard HUD overlay */}
                      <div className="sports-video-hud" style={{ position: 'absolute', bottom: '16px', left: '16px', right: '16px', display: 'flex', flexDirection: 'column', gap: '6px', zIndex: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div className="hud-badge-live" style={{ background: selectedWatchDate === todayStr && selectedWatchMatch.status !== 'FINISHED' ? 'rgba(34, 197, 94, 0.9)' : 'rgba(0,0,0,0.7)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.68rem', fontWeight: 'bold', color: '#fff', display: 'flex', alignItems: 'center', gap: '4px', backdropFilter: 'blur(4px)' }}>
                            {selectedWatchDate === todayStr && selectedWatchMatch.status !== 'FINISHED' ? (
                              <><span className="live-pulse-dot" style={{ width: '6px', height: '6px', background: '#fff' }}></span><span>LIVE</span></>
                            ) : selectedWatchMatch.status === 'FINISHED' ? (
                              <span>📼 REPLAY</span>
                            ) : (
                              <span>📺 UPCOMING</span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.72rem', background: 'rgba(0,0,0,0.85)', padding: '4px 10px', borderRadius: '6px', color: '#22d3ee', fontWeight: 'bold', backdropFilter: 'blur(4px)' }}>
                            {selectedWatchSport === 'Football' && (selectedWatchMatch.status === 'FINISHED' ? "FT (90')" : `${selectedWatchMatch.minute || 0}'`)}
                            {selectedWatchSport === 'Cricket' && `${selectedWatchMatch.overs || 0.0} Overs`}
                            {selectedWatchSport === 'Badminton' && `Pt: ${selectedWatchMatch.homeScore || 0} - ${selectedWatchMatch.awayScore || 0}`}
                          </div>
                        </div>
                        {/* Scoreboard */}
                        <div className="hud-scores" style={{ background: 'rgba(0,0,0,0.85)', padding: '10px 16px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(4px)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                            <span style={{ fontSize: '1.1rem' }}>{selectedWatchSport === 'Football' ? '⚽' : selectedWatchSport === 'Cricket' ? '🏏' : '🏸'}</span>
                            <span style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 'bold' }}>{selectedWatchMatch.homeTeam}</span>
                          </div>
                          <div style={{ color: '#22d3ee', fontSize: '1.35rem', fontWeight: 800, display: 'flex', gap: '8px', alignItems: 'center' }}>
                            {selectedWatchSport === 'Cricket' ? (
                              <span>{selectedWatchMatch.homeScore}/{selectedWatchMatch.awayScore}</span>
                            ) : selectedWatchSport === 'Badminton' ? (
                              <span style={{ fontSize: '1rem' }}>Sets: {selectedWatchMatch.sets || 0}</span>
                            ) : (
                              <><span>{selectedWatchMatch.homeScore ?? '-'}</span><span>-</span><span>{selectedWatchMatch.awayScore ?? '-'}</span></>
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, justifyContent: 'flex-end' }}>
                            <span style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 'bold' }}>{selectedWatchMatch.awayTeam}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Commentary Panel */}
                    <div className="glass-panel" style={{ padding: '12px 18px', border: '1px solid var(--border-glass)', borderRadius: '12px', background: 'rgba(255,255,255,0.015)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.85rem' }}>🎙️</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary-light)' }}>Commentary</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>— {selectedWatchMatch.details || selectedWatchSport}</span>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
                        {selectedWatchMatch.detail || (selectedWatchMatch.status === 'LIVE' ? 'Intense action underway! Both teams battling for control.' : selectedWatchMatch.status === 'FINISHED' ? 'Match has concluded. Check the final score above.' : 'Pre-match analysis and build-up coverage.')}
                      </p>
                    </div>
                  </>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '36px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)', borderRadius: '14px', textAlign: 'center' }}>
                    <Tv size={36} style={{ color: 'var(--text-muted)', marginBottom: '10px' }} />
                    <h4 style={{ margin: '0 0 4px 0', color: 'var(--text-primary)' }}>Select a Match to Watch</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Click on any match card below to start watching.</p>
                  </div>
                )}
              </div>

              {/* Match Cards Grid */}
              <div className="sports-schedule-list">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>
                    {selectedWatchSport} — <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>{formatDateLabel(selectedWatchDate)}</span>
                  </h3>
                </div>

                {(() => {
                  const dayMatches = (selectedWatchSport && SPORTS_SCHEDULE[selectedWatchSport]) ? (SPORTS_SCHEDULE[selectedWatchSport][selectedWatchDate] || []) : [];
                  const filteredMatches = dayMatches.filter(m => {
                    if (!search.trim()) return true;
                    const q = search.toLowerCase();
                    return m.homeTeam.toLowerCase().includes(q) || m.awayTeam.toLowerCase().includes(q) || (m.details && m.details.toLowerCase().includes(q)) || selectedWatchSport.toLowerCase().includes(q);
                  });
                  if (filteredMatches.length === 0) return <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{search ? 'No matches match your search.' : 'No matches scheduled for this date.'}</div>;

                  return (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
                      {filteredMatches.map(m => {
                        const isWatchingThis = selectedWatchMatch && selectedWatchMatch.id === m.id;
                        return (
                          <div
                            key={m.id}
                            onClick={() => { if (selectedWatchDate <= todayStr) setSelectedWatchMatch(m); }}
                            className={`glass-panel ${isWatchingThis ? 'watching-active' : ''}`}
                            style={{
                              padding: '16px',
                              borderRadius: '14px',
                              border: isWatchingThis ? '2px solid var(--primary)' : '1px solid var(--border-glass)',
                              background: isWatchingThis ? 'rgba(139,92,246,0.1)' : 'rgba(255,255,255,0.02)',
                              cursor: selectedWatchDate <= todayStr ? 'pointer' : 'default',
                              transition: 'all 0.2s',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '10px'
                            }}
                          >
                            {/* Status badge */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              {m.status === 'LIVE' ? (
                                <span style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', padding: '2px 8px', borderRadius: '4px', fontSize: '0.62rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <span className="live-pulse-dot" style={{ width: '4px', height: '4px', background: '#22c55e' }}></span> LIVE
                                </span>
                              ) : m.status === 'FINISHED' ? (
                                <span style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.62rem' }}>
                                  FINISHED
                                </span>
                              ) : (
                                <span style={{ background: 'rgba(245,158,11,0.1)', color: 'var(--warning)', border: '1px solid rgba(245,158,11,0.2)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.62rem' }}>
                                  {m.time}
                                </span>
                              )}
                              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                                {selectedWatchDate > todayStr ? 'Upcoming' : ''}
                              </span>
                            </div>
                            {/* Teams */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                              <div style={{ flex: 1, textAlign: 'center' }}>
                                <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{selectedWatchSport === 'Football' ? '⚽' : selectedWatchSport === 'Cricket' ? '🏏' : '🏸'}</div>
                                <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', display: 'block', lineHeight: '1.2' }}>{m.homeTeam}</span>
                              </div>
                              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-light)', minWidth: '60px', textAlign: 'center' }}>
                                {m.status === 'LIVE' || m.status === 'FINISHED' ? (
                                  selectedWatchSport === 'Cricket' ? `${m.homeScore}/${m.awayScore}` : `${m.homeScore ?? '-'} - ${m.awayScore ?? '-'}`
                                ) : (
                                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>VS</span>
                                )}
                              </div>
                              <div style={{ flex: 1, textAlign: 'center' }}>
                                <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{selectedWatchSport === 'Football' ? '⚽' : selectedWatchSport === 'Cricket' ? '🏏' : '🏸'}</div>
                                <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', display: 'block', lineHeight: '1.2' }}>{m.awayTeam}</span>
                              </div>
                            </div>
                            {/* Detail */}
                            <div style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {m.details || selectedWatchSport}
                            </div>
                            {/* Watch button */}
                            {selectedWatchDate <= todayStr && (
                              <button
                                className={`btn ${isWatchingThis ? 'btn-secondary' : 'btn-primary'}`}
                                onClick={(e) => { e.stopPropagation(); setSelectedWatchMatch(m); }}
                                style={{
                                  padding: '7px 0',
                                  fontSize: '0.75rem',
                                  borderRadius: '8px',
                                  width: '100%',
                                  cursor: 'pointer',
                                  border: 'none'
                                }}
                              >
                                {isWatchingThis ? '🟢 Watching' : m.status === 'FINISHED' ? '▶ Highlights' : '▶ Watch Live'}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        ) : (activeTab === 'ipo-nepal' || activeTab === 'trading') ? (
          /* IPO & TRADING VIEW */
          <div className="ipo-trading-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Live Financial Ticker */}
            <div className="nepse-ticker-bar glass-panel" style={{ display: 'flex', gap: '24px', overflowX: 'auto', padding: '14px 20px', border: '1px solid var(--border-glass-bright)', borderRadius: '12px', whiteSpace: 'nowrap', scrollbarWidth: 'none', background: 'rgba(10, 15, 28, 0.4)' }}>
              {activeTab === 'ipo-nepal' ? (
                <>
                  <div className="ticker-item" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '0.85rem' }}>🇳🇵 NEPSE:</span>
                    <span style={{ color: '#10b981', fontWeight: 600, fontSize: '0.85rem' }}>2,045.24 (+0.82%)</span>
                  </div>
                  <div className="ticker-item" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>NTC:</span>
                    <span style={{ color: '#10b981', fontSize: '0.85rem' }}>Rs 890.00 (+1.25%)</span>
                  </div>
                  <div className="ticker-item" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>AHPC:</span>
                    <span style={{ color: '#10b981', fontSize: '0.85rem' }}>Rs 195.00 (+3.40%)</span>
                  </div>
                  <div className="ticker-item" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>UPCL:</span>
                    <span style={{ color: '#10b981', fontSize: '0.85rem' }}>Rs 162.00 (+0.80%)</span>
                  </div>
                  <div className="ticker-item" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>NIB:</span>
                    <span style={{ color: '#ef4444', fontSize: '0.85rem' }}>Rs 210.00 (-0.48%)</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="ticker-item" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '0.85rem' }}>BTC:</span>
                    <span style={{ color: '#10b981', fontWeight: 600, fontSize: '0.85rem' }}>$67,420.50 (+2.15%)</span>
                  </div>
                  <div className="ticker-item" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '0.85rem' }}>ETH:</span>
                    <span style={{ color: '#10b981', fontWeight: 600, fontSize: '0.85rem' }}>$3,540.80 (+1.90%)</span>
                  </div>
                </>
              )}
            </div>

            {/* Content header */}
            <div className="ipo-trading-header" style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0', fontSize: '1.4rem', fontFamily: 'var(--font-display)', fontWeight: 800 }}>
                {activeTab === 'ipo-nepal' ? <TrendingUp size={22} style={{ color: '#10b981' }} /> : <Activity size={22} style={{ color: '#8b5cf6' }} />}
                {activeTab === 'ipo-nepal' ? 'Nepal IPO Center' : 'Global Trading Monitor'}
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '4px 0 0 0' }}>
                {activeTab === 'ipo-nepal' ? 'Dedicated tracking for NEPSE index, hydropower IPOs, and Meroshare updates.' : 'Day trading analysis, global market indexes, and crypto tickers.'}
              </p>
            </div>

            {/* List of IPO/Trading posts */}
            <div className="post-feed" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {posts.filter(p => !p.isGibberish && p.category === (activeTab === 'ipo-nepal' ? 'IPO in Nepal' : 'Trading')).length === 0 ? (
                <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                  <AlertCircle size={36} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
                  <h3 style={{ color: 'var(--text-primary)', margin: '0 0 8px 0' }}>No Updates</h3>
                  <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.88rem' }}>
                    Trigger a feed scrape to fetch new updates!
                  </p>
                </div>
              ) : (
                posts.filter(p => !p.isGibberish && p.category === (activeTab === 'ipo-nepal' ? 'IPO in Nepal' : 'Trading')).map((post) => (
                  <div key={post.id} className="glass-panel post-card" style={{ borderLeft: `4px solid ${post.category === 'IPO in Nepal' ? '#10b981' : '#8b5cf6'}` }}>
                    <div className="post-card-header">
                      <div className="post-author-info">
                        <div className="author-avatar" style={{ overflow: 'hidden' }}>
                          <img
                            src={post.authorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.authorName)}&background=8b5cf6&color=fff`}
                            alt={post.authorName}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(post.authorName)}&background=8b5cf6&color=fff`;
                            }}
                          />
                        </div>
                        <div className="author-name-handle">
                          <span className="author-name">{post.authorName}</span>
                          <span className="author-handle">{post.author}</span>
                        </div>
                      </div>
                      <div className="post-meta-badges">
                        <span className={`badge badge-platform badge-${post.platform}`}>{post.platform}</span>
                        <span className="badge badge-category" style={{ background: post.category === 'IPO in Nepal' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(139, 92, 246, 0.15)', color: post.category === 'IPO in Nepal' ? '#10b981' : '#a78bfa', border: `1px solid ${post.category === 'IPO in Nepal' ? '#10b98133' : '#8b5cf633'}` }}>{post.category}</span>
                        <span className={`badge badge-sentiment-${post.sentiment}`}>{post.sentiment}</span>
                        <span className="badge badge-platform" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={10} />
                          {post.region}
                        </span>
                      </div>
                    </div>

                    <div className="post-content">
                      <LinkifiedText text={post.text} />
                      {post.postVideo ? (
                        <div className="post-media" style={{ marginTop: '14px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-glass)' }}>
                          <VideoPlayer src={post.postVideo} controls muted playsInline style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', display: 'block' }} />
                        </div>
                      ) : post.postImage ? (
                        <div className="post-media" style={{ marginTop: '14px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-glass)' }}>
                          <img src={post.postImage} alt="Attached media" style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', display: 'block' }} />
                        </div>
                      ) : null}
                    </div>

                    {post.summary && (
                      <div className="ai-summary-box">
                        <div className="ai-summary-text"><LinkifiedText text={post.summary} /></div>
                      </div>
                    )}

                    {/* Interaction and translation controls */}
                    <div className="translation-controls">
                      <div className="post-footer-stats">
                        <span className={`stat-item ${likedPosts[post.id] ? 'liked' : ''}`} style={{ cursor: 'pointer' }} onClick={() => handleLikePost(post.id)}>
                          <ThumbsUp size={14} /> {post.likes}
                        </span>
                        <span className="stat-item"><Share2 size={14} /> {post.shares}</span>
                        <span className="stat-item" style={{ cursor: 'pointer' }} onClick={() => toggleComments(post.id, post.category)}>
                          <MessageSquare size={14} /> {post.comments}
                        </span>
                        <span className="post-time-region">
                          <Clock size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                          {new Date(post.timestamp).toLocaleString()} &bull; <span style={{ color: '#ef4444', fontWeight: 'bold' }}>{getDeletionTimer(post.timestamp, post.category)}</span>
                        </span>
                      </div>

                      <div className="translation-action-group">
                        <Globe size={14} style={{ color: 'var(--text-muted)' }} />
                        <select
                          className="select-lang-dropdown"
                          value={selectedTargetLang[post.id] || ''}
                          onChange={(e) => {
                            const lang = e.target.value;
                            setSelectedTargetLang(prev => ({ ...prev, [post.id]: lang }));
                            setActiveCommentPostId(null);
                            handleTranslate(post.id, post.text, lang);
                          }}
                        >
                          <option value="" disabled>Translate post</option>
                          {TARGET_LANGUAGES.map(lang => (
                            <option key={lang} value={lang}>{lang}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Translation result */}
                    {selectedTargetLang[post.id] && translations[`${post.id}_${selectedTargetLang[post.id]}`] && (
                      <div className="translated-result-box">
                        <div className="translated-header">
                          <span>Translated to {selectedTargetLang[post.id]}</span>
                          <div className="translated-actions">
                            <button
                              className={`translate-action-btn ${speakingPostId === post.id ? 'active' : ''}`}
                              onClick={() => handleSpeak(post.id, translations[`${post.id}_${selectedTargetLang[post.id]}`], selectedTargetLang[post.id])}
                            >
                              {speakingPostId === post.id ? <VolumeX size={13} /> : <Volume2 size={13} />}
                              <span>{speakingPostId === post.id ? "Stop" : "Listen"}</span>
                            </button>
                            <button className="translate-action-btn clear-btn" onClick={() => handleClearTranslation(post.id)}>
                              <X size={13} />
                              <span>Clear</span>
                            </button>
                          </div>
                        </div>
                        <div className="translated-text">
                          {translations[`${post.id}_${selectedTargetLang[post.id]}`]}
                        </div>
                      </div>
                    )}

                    {/* Comments Panel */}
                    {activeCommentPostId === post.id && (
                      <div className="glass-panel inline-comments-panel" style={{ marginTop: '16px', padding: '16px', borderTop: '1px dashed var(--border-glass)', background: 'rgba(255, 255, 255, 0.02)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h4 style={{ fontSize: '0.85rem', color: 'var(--primary-light)' }}>Comments</h4>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Write a comment..."
                            value={typedComments[post.id] || ''}
                            onChange={(e) => setTypedComments(prev => ({ ...prev, [post.id]: e.target.value }))}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleAddComment(post.id);
                            }}
                            style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                          />
                          <button className="btn btn-primary" onClick={() => handleAddComment(post.id)} style={{ padding: '6px 14px', fontSize: '0.8rem' }}>Post</button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto', paddingRight: '4px' }}>
                          {(postComments[post.id] || []).length === 0 ? (
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>No comments yet.</span>
                          ) : (
                            (postComments[post.id] || []).map(comment => (
                              <div key={comment.id} style={{ display: 'flex', flexDirection: 'column', gap: '2px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', padding: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                  <span>{comment.authorName}</span>
                                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 400 }}>{new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{comment.text}</span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        ) : activeTab === 'calendar' ? (
          /* READING CALENDAR VIEW */
          <div className="glass-panel" style={{ padding: '24px', border: '1px solid var(--border-glass-bright)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <Calendar size={24} style={{ color: 'var(--primary)' }} />
              <div>
                <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700 }}>Daily Reading Calendar
                  <NotifToggle section="calendar" state={sectionNotifs} onToggle={toggleNotif} />
                </h2>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Mark days you've completed your news reading</p>
              </div>
            </div>
            {/* Month Navigator */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <button className="btn btn-secondary" onClick={() => {
                if (calendarMonth === 0) { setCalendarMonth(11); setCalendarYear(y => y - 1); }
                else setCalendarMonth(m => m - 1);
              }} style={{ padding: '6px 14px', cursor: 'pointer' }}>← Prev</button>
              <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                {new Date(calendarYear, calendarMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
              </span>
              <button className="btn btn-secondary" onClick={() => {
                if (calendarMonth === 11) { setCalendarMonth(0); setCalendarYear(y => y + 1); }
                else setCalendarMonth(m => m + 1);
              }} style={{ padding: '6px 14px', cursor: 'pointer' }}>Next →</button>
            </div>
            {/* Calendar Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center' }}>
              {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                <div key={d} style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', padding: '4px 0' }}>{d}</div>
              ))}
              {(() => {
                const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
                const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
                const cells = [];
                for (let i = 0; i < firstDay; i++) cells.push(<div key={'empty-'+i} />);
                for (let d = 1; d <= daysInMonth; d++) {
                  const dateStr = `${calendarYear}-${String(calendarMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
                  const isToday = dateStr === todayStr;
                  const entry = readingCalendar.find(e => e.date === dateStr);
                  const isCompleted = entry && entry.completed;
                  cells.push(
                    <div key={d} onClick={() => {
                      if (!authToken) { setShowAuthModal(true); return; }
                      const newCompleted = !isCompleted;
                      fetch(`${API_BASE}/auth/calendar`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
                        body: JSON.stringify({ date: dateStr, completed: newCompleted })
                      }).then(r => r.json()).then(data => {
                        if (data.success) setReadingCalendar(data.readingCalendar);
                      }).catch(() => {});
                    }}
                    style={{
                      padding: '10px 4px', borderRadius: '8px', cursor: authToken ? 'pointer' : 'default',
                      background: isCompleted ? 'rgba(16,185,129,0.2)' : isToday ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.03)',
                      border: isToday ? '2px solid var(--primary)' : '1px solid var(--border-glass)',
                      color: isCompleted ? '#10b981' : isToday ? 'var(--primary)' : 'var(--text-primary)',
                      fontWeight: isToday || isCompleted ? 700 : 400, fontSize: '0.85rem', transition: 'all 0.15s'
                    }}
                    title={isCompleted ? 'Completed' : 'Click to mark as read'}
                  >
                    {d}
                    {isCompleted && <div style={{ fontSize: '0.6rem' }}>✓</div>}
                  </div>
                  );
                }
                return cells;
              })()}
            </div>
            {/* Streak */}
            <div style={{ marginTop: '16px', padding: '12px 16px', borderRadius: '10px', background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)' }}>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                ⚡ Reading streak: <strong style={{ color: 'var(--primary)' }}>{readingCalendar.filter(e => e.completed).length} days</strong> this month
              </p>
            </div>
            {!authToken && (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '12px', textAlign: 'center' }}>
                <a onClick={() => setShowAuthModal(true)} style={{ color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline' }}>Sign in</a> to track your reading progress
              </p>
            )}
          </div>
        ) : activeTab === 'books' ? (
          /* BOOKS WITH TIMER VIEW */
          <div className="glass-panel" style={{ padding: '24px', border: '1px solid var(--border-glass-bright)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <BookOpen size={24} style={{ color: '#f59e0b' }} />
              <div>
                <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700 }}>My Books & Study Timer
                  <NotifToggle section="books" state={sectionNotifs} onToggle={toggleNotif} />
                </h2>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Add books from any resource and track your study time</p>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ padding: '6px 14px', borderRadius: '20px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', fontSize: '0.8rem', fontWeight: 600, color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={14} /> Study Streak: <strong>{readingCalendar.filter(e => e.completed).length} days</strong>
                </div>
              </div>
            </div>

            {/* Add Book Form */}
            {authToken ? (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px', padding: '14px', borderRadius: '12px', background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.15)' }}>
                <input className="form-control" placeholder="Book title *" value={newBookTitle} onChange={e => setNewBookTitle(e.target.value)} style={{ flex: '2', minWidth: '150px', padding: '8px 12px', fontSize: '0.85rem' }} />
                <input className="form-control" placeholder="Author" value={newBookAuthor} onChange={e => setNewBookAuthor(e.target.value)} style={{ flex: '1', minWidth: '120px', padding: '8px 12px', fontSize: '0.85rem' }} />
                <input className="form-control" placeholder="URL (Amazon, PDF, etc)" value={newBookUrl} onChange={e => setNewBookUrl(e.target.value)} style={{ flex: '2', minWidth: '150px', padding: '8px 12px', fontSize: '0.85rem' }} />
                <button className="btn btn-primary" onClick={async () => {
                  if (!newBookTitle.trim()) return;
                  try {
                    const res = await fetch(`${API_BASE}/auth/books`, {
                      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
                      body: JSON.stringify({ title: newBookTitle.trim(), author: newBookAuthor.trim(), url: newBookUrl.trim() })
                    });
                    const data = await res.json();
                    if (data.success) { setUserBooks(data.books); setNewBookTitle(''); setNewBookAuthor(''); setNewBookUrl(''); }
                  } catch (e) { console.error(e); }
                }} style={{ padding: '8px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Book size={14} /> Add Book
                </button>
              </div>
            ) : (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                <a onClick={() => setShowAuthModal(true)} style={{ color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline' }}>Sign in</a> to add books
              </p>
            )}

            {/* Books List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {userBooks.length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', borderRadius: '12px', background: 'rgba(255,255,255,0.02)' }}>
                  <BookMarked size={32} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>No books yet. Add your first book above!</p>
                </div>
              ) : userBooks.filter(book => {
                if (!search.trim()) return true;
                const q = search.toLowerCase();
                return book.title.toLowerCase().includes(q) || (book.author && book.author.toLowerCase().includes(q));
              }).map(book => {
                const isActiveTimer = activeTimerBookId === book._id;
                return (
                  <div key={book._id} className="glass-panel" style={{ padding: '16px', borderRadius: '12px', border: isActiveTimer ? '1px solid var(--primary)' : '1px solid var(--border-glass)', transition: 'all 0.2s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: '150px' }}>
                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#f59e0b' }}>{book.title}</h4>
                        {book.author && <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>by {book.author}</p>}
                        {book.url && <a href={book.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: 'var(--primary)', textDecoration: 'underline', wordBreak: 'break-all' }}>{book.url}</a>}
                        <p style={{ margin: '6px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          ⏱ Read: <strong>{book.readMinutes || 0} min</strong>
                          {book.totalMinutes > 0 && <> / {book.totalMinutes} min goal</>}
                        </p>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                        {/* Timer Controls */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {isActiveTimer ? (
                            <>
                              <span style={{ fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)', minWidth: '70px', textAlign: 'center' }}>{formatTimer(timerSeconds)}</span>
                              <button className="btn btn-primary" onClick={() => {
                                setTimerRunning(!timerRunning);
                              }} style={{ padding: '4px 10px', fontSize: '0.75rem', cursor: 'pointer' }}>
                                {timerRunning ? '⏸' : '▶'}
                              </button>
                              <button className="btn btn-secondary" onClick={() => {
                                setTimerRunning(false);
                                setTimerSeconds(0);
                                // Save read time
                                const mins = Math.floor(timerSeconds / 60);
                                if (mins > 0) {
                                  fetch(`${API_BASE}/auth/books/${book._id}`, {
                                    method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
                                    body: JSON.stringify({ readMinutes: (book.readMinutes || 0) + mins })
                                  }).then(r => r.json()).then(d => { if (d.success) setUserBooks(d.books); }).catch(() => {});
                                }
                                // Auto-mark today in reading calendar
                                fetch(`${API_BASE}/auth/calendar`, {
                                  method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
                                  body: JSON.stringify({ date: todayStr, completed: true })
                                }).then(r => r.json()).then(data => {
                                  if (data.success) setReadingCalendar(data.readingCalendar);
                                }).catch(() => {});
                                setActiveTimerBookId(null);
                              }} style={{ padding: '4px 10px', fontSize: '0.75rem', cursor: 'pointer' }}>
                                ⏹ Save & Stop
                              </button>
                            </>
                          ) : (
                            <button className="btn btn-primary" onClick={() => {
                              if (activeTimerBookId) {
                                // Save previous timer before switching
                                const prevBook = userBooks.find(b => b._id === activeTimerBookId);
                                if (prevBook && timerSeconds > 0) {
                                  const mins = Math.floor(timerSeconds / 60);
                                  fetch(`${API_BASE}/auth/books/${prevBook._id}`, {
                                    method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
                                    body: JSON.stringify({ readMinutes: (prevBook.readMinutes || 0) + mins })
                                  }).then(r => r.json()).then(d => { if (d.success) setUserBooks(d.books); }).catch(() => {});
                                }
                              }
                              // Auto-mark today in reading calendar
                              fetch(`${API_BASE}/auth/calendar`, {
                                method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
                                body: JSON.stringify({ date: todayStr, completed: true })
                              }).then(r => r.json()).then(data => {
                                if (data.success) setReadingCalendar(data.readingCalendar);
                              }).catch(() => {});
                              setActiveTimerBookId(book._id);
                              setTimerSeconds(0);
                              setTimerRunning(true);
                            }} style={{ padding: '6px 14px', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Timer size={14} /> Start Timer
                            </button>
                          )}
                        </div>
                        <button onClick={async () => {
                          try {
                            const res = await fetch(`${API_BASE}/auth/books/${book._id}`, {
                              method: 'DELETE', headers: { 'Authorization': `Bearer ${authToken}` }
                            });
                            const data = await res.json();
                            if (data.success) setUserBooks(data.books);
                          } catch (e) { console.error(e); }
                        }} style={{ padding: '3px 10px', fontSize: '0.7rem', cursor: 'pointer', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', borderRadius: '6px' }}>
                          <Trash2 size={12} /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : activeTab === 'todo' ? (
          /* TO-DO VIEW */
          <div className="glass-panel" style={{ padding: '24px', border: '1px solid var(--border-glass-bright)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <CheckSquare size={24} style={{ color: '#10b981' }} />
              <div>
                <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700 }}>To-Do & Reminders
                  <NotifToggle section="todo" state={sectionNotifs} onToggle={toggleNotif} />
                </h2>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Manage tasks with notifications and sound reminders</p>
              </div>
            </div>

            {/* Add Todo Form */}
            {authToken ? (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px', padding: '14px', borderRadius: '12px', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)' }}>
                <input className="form-control" placeholder="Task description *" value={newTodoText} onChange={e => setNewTodoText(e.target.value)} style={{ flex: '3', minWidth: '180px', padding: '8px 12px', fontSize: '0.85rem' }}
                  onKeyDown={async (e) => {
                    if (e.key === 'Enter' && newTodoText.trim()) {
                      try {
                        const res = await fetch(`${API_BASE}/auth/todos`, {
                          method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
                          body: JSON.stringify({ text: newTodoText.trim(), dueDate: newTodoDue || null })
                        });
                        const data = await res.json();
                        if (data.success) { setUserTodos(data.todos); setNewTodoText(''); setNewTodoDue(''); }
                      } catch (e) { console.error(e); }
                    }
                  }}
                />
                <input type="date" className="form-control" value={newTodoDue} onChange={e => setNewTodoDue(e.target.value)} style={{ flex: '1', minWidth: '120px', padding: '8px 12px', fontSize: '0.85rem' }} />
                <button className="btn btn-primary" onClick={async () => {
                  if (!newTodoText.trim()) return;
                  try {
                    const res = await fetch(`${API_BASE}/auth/todos`, {
                      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
                      body: JSON.stringify({ text: newTodoText.trim(), dueDate: newTodoDue || null })
                    });
                    const data = await res.json();
                    if (data.success) { setUserTodos(data.todos); setNewTodoText(''); setNewTodoDue(''); }
                  } catch (e) { console.error(e); }
                }} style={{ padding: '8px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <PlusCircle size={14} /> Add Task
                </button>
              </div>
            ) : (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                <a onClick={() => setShowAuthModal(true)} style={{ color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline' }}>Sign in</a> to manage tasks
              </p>
            )}

            {/* Todos List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {userTodos.length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', borderRadius: '12px', background: 'rgba(255,255,255,0.02)' }}>
                  <CheckSquare size={32} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>No tasks yet. Add your first task above!</p>
                </div>
              ) : userTodos.filter(todo => {
                if (!search.trim()) return true;
                const q = search.toLowerCase();
                return todo.text.toLowerCase().includes(q) || (todo.dueDate && todo.dueDate.includes(q));
              }).map(todo => {
                const isOverdue = todo.dueDate && !todo.done && new Date(todo.dueDate) < new Date();
                return (
                  <div key={todo._id} className="glass-panel" style={{
                    padding: '12px 16px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '12px',
                    border: isOverdue ? '1px solid rgba(239,68,68,0.3)' : '1px solid var(--border-glass)',
                    background: isOverdue ? 'rgba(239,68,68,0.04)' : todo.done ? 'rgba(16,185,129,0.04)' : 'transparent',
                    opacity: todo.done ? 0.6 : 1, transition: 'all 0.15s'
                  }}>
                    <input type="checkbox" checked={todo.done}
                      onChange={async () => {
                        const newDone = !todo.done;
                        try {
                          const res = await fetch(`${API_BASE}/auth/todos/${todo._id}`, {
                            method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
                            body: JSON.stringify({ done: newDone })
                          });
                          const data = await res.json();
                          if (data.success) {
                            setUserTodos(data.todos);
                            if (newDone) sendNotification('Task Completed', `"${todo.text}" is done! 🎉`);
                          }
                        } catch (e) { console.error(e); }
                      }}
                      style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#10b981' }}
                    />
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 500, color: todo.done ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: todo.done ? 'line-through' : 'none' }}>
                        {todo.text}
                      </span>
                      {todo.dueDate && (
                        <span style={{ fontSize: '0.72rem', color: isOverdue ? '#ef4444' : 'var(--text-muted)', marginLeft: '8px' }}>
                          {isOverdue ? '🔴 ' : '📅 '}{new Date(todo.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <button onClick={async () => {
                      try {
                        const res = await fetch(`${API_BASE}/auth/todos/${todo._id}`, {
                          method: 'DELETE', headers: { 'Authorization': `Bearer ${authToken}` }
                        });
                        const data = await res.json();
                        if (data.success) setUserTodos(data.todos);
                      } catch (e) { console.error(e); }
                    }} style={{ padding: '4px 8px', cursor: 'pointer', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', borderRadius: '6px', fontSize: '0.7rem' }}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Check overdue todos on mount */}
            {authToken && userTodos.some(t => t.dueDate && !t.done && new Date(t.dueDate) < new Date()) && (
              <div style={{ marginTop: '12px', padding: '8px 14px', borderRadius: '8px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#ef4444' }}>
                  ⏰ Some tasks are overdue! Complete them or update due dates.
                </p>
              </div>
            )}
          </div>
        ) : (
          /* FILTER CONTROLS AND LISTS VIEW (FEED, CLUSTERED, SPAM) */
          <>
            {/* FILTER PANEL */}
            <section className="glass-panel filters-panel">
              <div className="filters-row">
                <div className="search-input-wrapper">
                  <Search size={16} className="search-icon" />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search original text, AI summary, or handle..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <div>
                  <select
                    className="form-control"
                    value={selectedPlatform}
                    onChange={(e) => setSelectedPlatform(e.target.value)}
                  >
                    <option value="all">All Platforms</option>
                    {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                <div>
                  <select
                    className="form-control"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="all">All Categories</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <select
                    className="form-control"
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                  >
                    <option value="all">All Regions</option>
                    {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                <div>
                  <select
                    className="form-control"
                    value={selectedSentiment}
                    onChange={(e) => setSelectedSentiment(e.target.value)}
                  >
                    <option value="all">All Sentiment</option>
                    {SENTIMENTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <select
                    className="form-control"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    style={{ minWidth: '120px' }}
                  >
                    <option value="time">Sort: Newest</option>
                    <option value="engagement">Sort: Popular</option>
                  </select>
                </div>
              </div>
            </section>

            {/* FEED CONTAINER */}
            <section className="feed-container">
              <div className="feed-header">
                <div className="feed-header-info">
                  <h2>
                    {activeTab === 'feed' && 'Active Social Stream'}
                    {activeTab === 'clustered' && 'Aggregated Trending Clusters'}
                    {activeTab === 'spam' && 'Blocked spam posts'}
                  </h2>
                  <span className="feed-count-badge">
                    {activeTab === 'clustered' ? clusteredPosts.length : posts.length} records found
                    {myFeedOnly && currentUser && <span style={{ marginLeft: '6px', fontSize: '0.7rem', color: 'var(--primary)' }}>(My Feed)</span>}
                  </span>
                </div>
                {currentUser && authPreferredCategories.length > 0 && (
                  <button
                    onClick={() => setMyFeedOnly(!myFeedOnly)}
                    className={`btn ${myFeedOnly ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                    title="Show only your preferred categories"
                  >
                    <User size={14} />
                    {myFeedOnly ? 'My Feed' : 'All News'}
                  </button>
                )}

                <div className="feed-header-actions" style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={handleCSVExport}
                    className="btn btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: 'var(--success)' }}
                  >
                    <Download size={14} />
                    Export CSV
                  </button>
                  <button
                    onClick={handlePDFExport}
                    className="btn btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: 'var(--danger)' }}
                  >
                    <FileText size={14} />
                    Export PDF
                  </button>
                </div>
              </div>


              {isLoading ? (
                <div className="loader"></div>
              ) : error ? (
                <div className="empty-state">
                  <AlertCircle size={36} className="empty-state-icon" style={{ color: 'var(--danger)' }} />
                  <h3>Failed to Load Data</h3>
                  <p>{error}</p>
                </div>
              ) : (() => {
                const feedPosts = myFeedOnly && currentUser && authPreferredCategories.length > 0
                  ? posts.filter(p => !p.isGibberish && authPreferredCategories.includes(p.category))
                  : (activeTab === 'clustered' ? clusteredPosts : posts);
                return feedPosts.length === 0 ? (
                  <div className="empty-state">
                    <AlertCircle size={36} className="empty-state-icon" />
                    <h3>No matching posts found</h3>
                    <p>Try refining your search keyword or clearing filters.</p>
                  </div>
                ) : (
                  <div className="post-feed">
                    {activeTab === 'clustered' ? (
                      /* CLUSTERED THREADED VIEW RENDER */
                    clusteredPosts.map((cluster) => {
                      const { leadPost, similarPosts } = cluster;
                      const isExpanded = expandedClusters.has(leadPost.id);

                      return (
                        <div key={leadPost.id} className="glass-panel post-card cluster-master-card">
                          {/* Render Lead Post Card */}
                          <div className="post-card-header">
                            <div className="post-author-info">
                              <div className="author-avatar" style={{ overflow: 'hidden' }}>
                                <img
                                  src={leadPost.authorAvatar || `https://i.pravatar.cc/150?u=${encodeURIComponent(leadPost.author.replace(/^[@u/]+/, ''))}`}
                                  alt={leadPost.authorName}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  onError={(e) => {
                                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(leadPost.authorName)}&background=8b5cf6&color=fff`;
                                  }}
                                />
                              </div>
                              <div className="author-name-handle">
                                <span className="author-name">{leadPost.authorName}</span>
                                <span className="author-handle">{leadPost.author}</span>
                              </div>
                            </div>
                            <div className="post-meta-badges">
                              <span className={`badge badge-platform badge-${leadPost.platform}`}>{leadPost.platform}</span>
                              <span className="badge badge-category">{leadPost.category}</span>
                              <span className={`badge badge-sentiment-${leadPost.sentiment}`}>{leadPost.sentiment}</span>
                            </div>
                          </div>

                          <div className="post-content">
                            {leadPost.text}
                            {leadPost.postVideo ? (
                              <div className="post-media" style={{ marginTop: '14px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-glass)' }}>
                                <VideoPlayer
                                  src={leadPost.postVideo}
                                  controls
                                  muted
                                  playsInline
                                  style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', display: 'block' }}
                                />
                              </div>
                            ) : leadPost.postImage ? (
                              <div className="post-media" style={{ marginTop: '14px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-glass)' }}>
                                <img
                                  src={leadPost.postImage}
                                  alt="Attached media"
                                  style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', display: 'block' }}
                                />
                              </div>
                            ) : null}
                          </div>

                          {/* Summary rendering */}
                          {leadPost.summary && (
                            <div className="ai-summary-box">
                              <div className="ai-summary-text">{leadPost.summary}</div>
                            </div>
                          )}

                          {/* Translation controls */}
                          <div className="translation-controls">
                            <div className="post-footer-stats">
                              <span className={`stat-item ${likedPosts[leadPost.id] ? 'liked' : ''}`} style={{ cursor: 'pointer' }} onClick={() => handleLikePost(leadPost.id)}><ThumbsUp size={14} /> {leadPost.likes}</span>
                              <span className="stat-item"><Share2 size={14} /> {leadPost.shares}</span>
                              <span
                                className="stat-item"
                                style={{ cursor: 'pointer' }}
                                onClick={() => toggleComments(leadPost.id, leadPost.category)}
                              >
                                <MessageSquare size={14} /> {leadPost.comments}
                              </span>
                              {similarPosts.length > 0 && (
                                <button
                                  className="cluster-badge"
                                  onClick={() => toggleCluster(leadPost.id)}
                                >
                                  {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                  <span>{similarPosts.length} similar {similarPosts.length === 1 ? 'post' : 'posts'} grouped</span>
                                </button>
                              )}
                            </div>

                            <div className="translation-action-group">
                              <Globe size={14} style={{ color: 'var(--text-muted)' }} />
                              <select
                                className="select-lang-dropdown"
                                value={selectedTargetLang[leadPost.id] || ''}
                                onChange={(e) => {
                                  const lang = e.target.value;
                                  setSelectedTargetLang(prev => ({ ...prev, [leadPost.id]: lang }));
                                  handleTranslate(leadPost.id, leadPost.text, lang);
                                }}
                              >
                                <option value="" disabled>Translate post</option>
                                {TARGET_LANGUAGES.map(lang => (
                                  <option key={lang} value={lang}>{lang}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* Translation Results Box */}
                          {selectedTargetLang[leadPost.id] && translations[`${leadPost.id}_${selectedTargetLang[leadPost.id]}`] && (
                            <div className="translated-result-box">
                              <div className="translated-header">
                                <span>Translated to {selectedTargetLang[leadPost.id]}</span>
                                <div className="translated-actions">
                                  <button
                                    className={`translate-action-btn ${speakingPostId === leadPost.id ? 'active' : ''}`}
                                    onClick={() => handleSpeak(
                                      leadPost.id,
                                      translations[`${leadPost.id}_${selectedTargetLang[leadPost.id]}`],
                                      selectedTargetLang[leadPost.id]
                                    )}
                                    title={speakingPostId === leadPost.id ? "Stop Listening" : "Listen to Translation"}
                                  >
                                    {speakingPostId === leadPost.id ? <VolumeX size={13} /> : <Volume2 size={13} />}
                                    <span>{speakingPostId === leadPost.id ? "Stop" : "Listen"}</span>
                                  </button>
                                  <button
                                    className="translate-action-btn clear-btn"
                                    onClick={() => handleClearTranslation(leadPost.id)}
                                    title="Clear Translation"
                                  >
                                    <X size={13} />
                                    <span>Clear</span>
                                  </button>
                                </div>
                              </div>
                              <div className="translated-text">
                                {translations[`${leadPost.id}_${selectedTargetLang[leadPost.id]}`]}
                              </div>
                            </div>
                          )}

                          {/* Comments Panel */}
                          {activeCommentPostId === leadPost.id && (
                            <div
                              className="glass-panel"
                              style={{
                                marginTop: '16px',
                                padding: '16px',
                                borderTop: '1px dashed var(--border-glass)',
                                background: 'rgba(255, 255, 255, 0.02)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '12px'
                              }}
                            >
                              <h4 style={{ fontSize: '0.85rem', color: 'var(--primary-light)' }}>Comments</h4>

                              {/* Comment Input */}
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Write a comment..."
                                  value={typedComments[leadPost.id] || ''}
                                  onChange={(e) => setTypedComments(prev => ({ ...prev, [leadPost.id]: e.target.value }))}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleAddComment(leadPost.id);
                                  }}
                                  style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                                />
                                <button
                                  className="btn btn-primary"
                                  onClick={() => handleAddComment(leadPost.id)}
                                  style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                                >
                                  Post
                                </button>
                              </div>

                              {/* Comments List */}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto', paddingRight: '4px' }}>
                                {(postComments[leadPost.id] || []).length === 0 ? (
                                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>No comments yet.</span>
                                ) : (
                                  (postComments[leadPost.id] || []).map(comment => (
                                    <div key={comment.id} style={{ display: 'flex', flexDirection: 'column', gap: '2px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', padding: '8px' }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                        <span>{comment.authorName}</span>
                                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                                          {new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                      </div>
                                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{comment.text}</span>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          )}

                          {/* Expanding Thread Similar Posts */}
                          {isExpanded && similarPosts.length > 0 && (
                            <div className="cluster-threads-container">
                              {similarPosts.map(subPost => (
                                <div key={subPost.id} className="sub-post-card">
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                                    <span><strong>{subPost.authorName}</strong> ({subPost.author}) on {subPost.platform}</span>
                                    <span>{new Date(subPost.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} &bull; <span style={{ color: '#ef4444', fontWeight: 'bold' }}>{getDeletionTimer(subPost.timestamp, subPost.category)}</span></span>
                                  </div>
                                  <div className="post-content" style={{ fontSize: '0.88rem', margin: 0 }}>{subPost.text}</div>
                                  <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                                    <span>Likes: {subPost.likes}</span>
                                    <span>Region: {subPost.region}</span>
                                    <span>Sentiment: {subPost.sentiment}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    /* FEED VIEW & SPAM BIN RENDER */
                    feedPosts.map((post) => (
                      <div key={post.id} className="glass-panel post-card">
                        <div className="post-card-header">
                          <div className="post-author-info">
                            <div className="author-avatar" style={{ overflow: 'hidden' }}>
                              <img
                                src={post.authorAvatar || `https://i.pravatar.cc/150?u=${encodeURIComponent(post.author.replace(/^[@u/]+/, ''))}`}
                                alt={post.authorName}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e) => {
                                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(post.authorName)}&background=8b5cf6&color=fff`;
                                }}
                              />
                            </div>
                            <div className="author-name-handle">
                              <span className="author-name">{post.authorName}</span>
                              <span className="author-handle">{post.author}</span>
                            </div>
                          </div>
                          <div className="post-meta-badges">
                            <span className={`badge badge-platform badge-${post.platform}`}>{post.platform}</span>
                            <span className="badge badge-category">{post.category}</span>
                            <span className={`badge badge-sentiment-${post.sentiment}`}>{post.sentiment}</span>
                            <span className="badge badge-platform" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <MapPin size={10} />
                              {post.region}
                            </span>
                          </div>
                        </div>

                        <div className="post-content">
                          <LinkifiedText text={post.text} />
                          {post.postVideo ? (
                            <div className="post-media" style={{ marginTop: '14px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-glass)' }}>
                              <VideoPlayer
                                src={post.postVideo}
                                controls
                                muted
                                playsInline
                                style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', display: 'block' }}
                              />
                            </div>
                          ) : post.postImage ? (
                            <div className="post-media" style={{ marginTop: '14px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-glass)' }}>
                              <img
                                src={post.postImage}
                                alt="Attached media"
                                style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', display: 'block' }}
                              />
                            </div>
                          ) : null}
                        </div>

                        {/* Summary rendering */}
                        {post.summary && !post.isGibberish && (
                          <div className="ai-summary-box">
                            <div className="ai-summary-text"><LinkifiedText text={post.summary} /></div>
                          </div>
                        )}

                        {/* Translation controls */}
                        <div className="translation-controls">
                          <div className="post-footer-stats">
                            <span className={`stat-item ${likedPosts[post.id] ? 'liked' : ''}`} style={{ cursor: 'pointer' }} onClick={() => handleLikePost(post.id)}><ThumbsUp size={14} /> {post.likes}</span>
                            <span className="stat-item"><Share2 size={14} /> {post.shares}</span>
                            <span
                              className="stat-item"
                              style={{ cursor: 'pointer' }}
                              onClick={() => toggleComments(post.id, post.category)}
                            >
                              <MessageSquare size={14} /> {post.comments}
                            </span>
                            <span className="post-time-region">
                              <Clock size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                              {new Date(post.timestamp).toLocaleString()} &bull; <span style={{ color: '#ef4444', fontWeight: 'bold' }}>{getDeletionTimer(post.timestamp, post.category)}</span>
                            </span>
                          </div>

                          <div className="translation-action-group">
                            <Globe size={14} style={{ color: 'var(--text-muted)' }} />
                            <select
                              className="select-lang-dropdown"
                              value={selectedTargetLang[post.id] || ''}
                              onChange={(e) => {
                                const lang = e.target.value;
                                setSelectedTargetLang(prev => ({ ...prev, [post.id]: lang }));
                                setActiveCommentPostId(null);
                                handleTranslate(post.id, post.text, lang);
                              }}
                            >
                              <option value="" disabled>Translate post</option>
                              {TARGET_LANGUAGES.map(lang => (
                                <option key={lang} value={lang}>{lang}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Translation Results Box */}
                        {selectedTargetLang[post.id] && translations[`${post.id}_${selectedTargetLang[post.id]}`] && (
                          <div className="translated-result-box">
                            <div className="translated-header">
                              <span>Translated to {selectedTargetLang[post.id]}</span>
                              <div className="translated-actions">
                                <button
                                  className={`translate-action-btn ${speakingPostId === post.id ? 'active' : ''}`}
                                  onClick={() => handleSpeak(
                                    post.id,
                                    translations[`${post.id}_${selectedTargetLang[post.id]}`],
                                    selectedTargetLang[post.id]
                                  )}
                                  title={speakingPostId === post.id ? "Stop Listening" : "Listen to Translation"}
                                >
                                  {speakingPostId === post.id ? <VolumeX size={13} /> : <Volume2 size={13} />}
                                  <span>{speakingPostId === post.id ? "Stop" : "Listen"}</span>
                                </button>
                                <button
                                  className="translate-action-btn clear-btn"
                                  onClick={() => handleClearTranslation(post.id)}
                                  title="Clear Translation"
                                >
                                  <X size={13} />
                                  <span>Clear</span>
                                </button>
                              </div>
                            </div>
                            <div className="translated-text">
                              {translations[`${post.id}_${selectedTargetLang[post.id]}`]}
                            </div>
                          </div>
                        )}

                        {/* Comments Panel */}
                        {activeCommentPostId === post.id && (
                          <div
                            className="glass-panel"
                            style={{
                              marginTop: '16px',
                              padding: '16px',
                              borderTop: '1px dashed var(--border-glass)',
                              background: 'rgba(255, 255, 255, 0.02)',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '12px'
                            }}
                          >
                            <h4 style={{ fontSize: '0.85rem', color: 'var(--primary-light)' }}>Comments</h4>

                            {/* Comment Input */}
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Write a comment..."
                                value={typedComments[post.id] || ''}
                                onChange={(e) => setTypedComments(prev => ({ ...prev, [post.id]: e.target.value }))}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleAddComment(post.id);
                                }}
                                style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                              />
                              <button
                                className="btn btn-primary"
                                onClick={() => handleAddComment(post.id)}
                                style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                              >
                                Post
                              </button>
                            </div>

                            {/* Comments List */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto', paddingRight: '4px' }}>
                              {(postComments[post.id] || []).length === 0 ? (
                                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>No comments yet.</span>
                              ) : (
                                (postComments[post.id] || []).map(comment => (
                                  <div key={comment.id} style={{ display: 'flex', flexDirection: 'column', gap: '2px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', padding: '8px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                      <span>{comment.authorName}</span>
                                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                                        {new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                    </div>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{comment.text}</span>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              );
            })()}
            </section>
          </>
        )}

        {/* MOBILE STICKY ADMIN FOOTER */}
        <div className="mobile-admin-footer">
          <button
            onClick={handleScrapeTrigger}
            disabled={isScraping}
            className="btn btn-primary"
          >
            <RefreshCw size={14} className={isScraping ? 'animate-spin' : ''} />
            <span>{isScraping ? 'Scraping...' : 'Scrape Live'}</span>
          </button>
          <button
            onClick={handleReset}
            className="btn btn-secondary btn-danger"
          >
            <Trash2 size={14} />
            <span>Reset Store</span>
          </button>
        </div>

        {/* MOBILE COMMENTS BOTTOM SHEET */}
        {activeCommentPostId && (
          <>
            <div className="mobile-comments-overlay" onClick={() => setActiveCommentPostId(null)} />
            <div className="mobile-comments-drawer glass-panel">
              <div className="mobile-comments-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid var(--border-glass-bright)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary-light)', margin: 0 }}>
                  Comments ({(() => {
                    const p = posts.find(post => post.id === activeCommentPostId) || clusteredPosts.map(c => c.leadPost).find(post => post.id === activeCommentPostId);
                    return p ? p.comments : 0;
                  })()})
                </h3>
                <button
                  onClick={() => setActiveCommentPostId(null)}
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-glass)', borderRadius: '50%', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Comments List */}
              <div className="mobile-comments-list" style={{ flexGrow: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(postComments[activeCommentPostId] || []).length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    No comments yet. Be the first to share your thoughts!
                  </div>
                ) : (
                  (postComments[activeCommentPostId] || []).map(comment => (
                    <div key={comment.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '8px', padding: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, color: '#fff' }}>
                        <span>{comment.authorName}</span>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                          {new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4', margin: 0 }}>
                        {comment.text}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Sticky Input Field */}
              <div className="mobile-comments-footer" style={{ padding: '16px', borderTop: '1px solid var(--border-glass)', background: 'rgba(17, 22, 37, 0.98)', display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Write a comment..."
                  value={typedComments[activeCommentPostId] || ''}
                  onChange={(e) => setTypedComments(prev => ({ ...prev, [activeCommentPostId]: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddComment(activeCommentPostId);
                  }}
                  style={{ flexGrow: 1, padding: '10px 14px', fontSize: '0.9rem', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid var(--border-glass)', borderRadius: '20px' }}
                />
                <button
                  className="btn btn-primary"
                  onClick={() => handleAddComment(activeCommentPostId)}
                  style={{ padding: '8px 16px', fontSize: '0.85rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="modal-overlay" onClick={() => setShowAuthModal(false)}>
          <div className="auth-modal glass-panel" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowAuthModal(false)}>
              <X size={20} />
            </button>
            <div className="auth-modal-header">
              <div className="auth-logo-icon">Z</div>
              <h2>{authMode === 'register' ? 'Create Account' : 'Welcome Back'}</h2>
              <p>{authMode === 'register' ? 'Join Zebvo News community' : 'Sign in to your account'}</p>
            </div>
            {authError && (
              <div className="auth-error-box">
                <AlertCircle size={14} />
                {authError}
              </div>
            )}
            <div className="auth-form">
              <label className="auth-label">Username</label>
              <input
                className="auth-input"
                type="text"
                placeholder="Enter username"
                value={authUsername}
                onChange={(e) => setAuthUsername(e.target.value)}
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleAuthSubmit()}
              />
              <label className="auth-label">Password</label>
              <input
                className="auth-input"
                type="password"
                placeholder="Enter password"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAuthSubmit()}
              />
              {authMode === 'register' && (
                <div style={{ marginTop: '8px' }}>
                  <label className="auth-label" style={{ marginBottom: '6px', display: 'block' }}>News Preferences</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '130px', overflowY: 'auto', padding: '4px 0' }}>
                    {CATEGORIES.filter(c => c !== 'General').map(cat => (
                      <label key={cat} style={{
                        display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem',
                        padding: '3px 8px', borderRadius: '20px', cursor: 'pointer',
                        background: authPreferredCategories.includes(cat) ? 'var(--primary)' : 'rgba(255,255,255,0.06)',
                        color: authPreferredCategories.includes(cat) ? '#fff' : 'var(--text-secondary)',
                        border: '1px solid', borderColor: authPreferredCategories.includes(cat) ? 'var(--primary)' : 'var(--border-glass)',
                        transition: 'all 0.15s'
                      }}>
                        <input
                          type="checkbox"
                          checked={authPreferredCategories.includes(cat)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setAuthPreferredCategories(prev => [...prev, cat]);
                            } else {
                              setAuthPreferredCategories(prev => prev.filter(c => c !== cat));
                            }
                          }}
                          style={{ display: 'none' }}
                        />
                        {cat}
                      </label>
                    ))}
                  </div>
                  <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                    Select categories you want to see in your feed
                  </p>
                </div>
              )}
              <button
                className="btn btn-primary auth-submit-btn"
                onClick={handleAuthSubmit}
                disabled={authLoading}
              >
                {authLoading ? 'Processing...' : (authMode === 'register' ? 'Create Account' : 'Sign In')}
              </button>
              <p className="auth-switch-link">
                {authMode === 'register' ? (
                  <>Already have an account? <span onClick={() => { setAuthMode('login'); setAuthError(''); }}>Sign In</span></>
                ) : (
                  <>Don't have an account? <span onClick={() => { setAuthMode('register'); setAuthError(''); }}>Sign Up</span></>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Create Post Modal */}
      {showCreatePostModal && (
        <div className="modal-overlay" onClick={() => setShowCreatePostModal(false)}>
          <div className="create-post-modal glass-panel" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowCreatePostModal(false)}>
              <X size={20} />
            </button>
            <div className="auth-modal-header">
              <PlusCircle size={28} style={{ color: 'var(--primary)' }} />
              <h2>Create New Post</h2>
              <p>Share your thoughts with the Zebvo community</p>
            </div>
            <div className="auth-form">
              <label className="auth-label">Post Content</label>
              <textarea
                className="auth-input create-post-textarea"
                placeholder="What's happening?"
                value={newPostText}
                onChange={(e) => setNewPostText(e.target.value)}
                rows={4}
                autoFocus
              />
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label className="auth-label">Category</label>
                  <select
                    className="auth-input"
                    value={newPostCategory}
                    onChange={(e) => setNewPostCategory(e.target.value)}
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label className="auth-label">Region</label>
                  <select
                    className="auth-input"
                    value={newPostRegion}
                    onChange={(e) => setNewPostRegion(e.target.value)}
                  >
                    {REGIONS.map(reg => (
                      <option key={reg} value={reg}>{reg}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                className="btn btn-primary auth-submit-btn"
                onClick={handleCreatePost}
                disabled={isCreatingPost || !newPostText.trim()}
              >
                {isCreatingPost ? 'Publishing...' : 'Publish Post'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <nav className="mobile-bottom-nav">
        <button className={`mobile-nav-btn ${activeTab === 'feed' ? 'active' : ''}`} onClick={() => setActiveTab('feed')}>
          <List size={20} />
          <span>Feed</span>
        </button>
        <button className={`mobile-nav-btn ${activeTab === 'newspaper' ? 'active' : ''}`} onClick={() => setActiveTab('newspaper')}>
          <FileText size={20} />
          <span>News</span>
        </button>
        <button className={`mobile-nav-btn ${activeTab === 'reels' ? 'active' : ''}`} onClick={() => setActiveTab('reels')}>
          <Film size={20} />
          <span>Reels</span>
        </button>
        <button className={`mobile-nav-btn ${activeTab === 'ipo-nepal' ? 'active' : ''}`} onClick={() => setActiveTab('ipo-nepal')}>
          <TrendingUp size={20} />
          <span>IPO Nepal</span>
        </button>
        <button className={`mobile-nav-btn ${activeTab === 'trading' ? 'active' : ''}`} onClick={() => setActiveTab('trading')}>
          <Activity size={20} />
          <span>Trading</span>
        </button>
        <button className={`mobile-nav-btn ${activeTab === 'education' ? 'active' : ''}`} onClick={() => setActiveTab('education')}>
          <GraduationCap size={20} />
          <span>Edu</span>
        </button>
        <button className={`mobile-nav-btn ${activeTab === 'sports' ? 'active' : ''}`} onClick={() => setActiveTab('sports')}>
          <Tv size={20} />
          <span>Sports</span>
        </button>
        <button className={`mobile-nav-btn ${activeTab === 'health' ? 'active' : ''}`} onClick={() => setActiveTab('health')}>
          <Heart size={20} />
          <span>Health</span>
        </button>
        <button className={`mobile-nav-btn ${activeTab === 'tech-guide' ? 'active' : ''}`} onClick={() => setActiveTab('tech-guide')}>
          <Globe size={20} />
          <span>Tech Guide</span>
        </button>
        <button className={`mobile-nav-btn ${activeTab === 'helplines' ? 'active' : ''}`} onClick={() => setActiveTab('helplines')}>
          <Phone size={20} />
          <span>Helplines</span>
        </button>
        <button className={`mobile-nav-btn ${activeTab === 'roadmap' ? 'active' : ''}`} onClick={() => setActiveTab('roadmap')}>
          <Map size={20} />
          <span>Roadmap</span>
        </button>
        <button className={`mobile-nav-btn ${activeTab === 'balen' ? 'active' : ''}`} onClick={() => setActiveTab('balen')}>
          <Users size={20} />
          <span>Balen</span>
        </button>
        <button className={`mobile-nav-btn ${activeTab === 'nepal-quiz' ? 'active' : ''}`} onClick={() => setActiveTab('nepal-quiz')}>
          <HelpCircle size={20} />
          <span>Quiz</span>
        </button>
        <button className={`mobile-nav-btn ${activeTab === 'leaders' ? 'active' : ''}`} onClick={() => setActiveTab('leaders')}>
          <Crown size={20} />
          <span>Leaders</span>
        </button>
        <button className={`mobile-nav-btn ${activeTab === 'zen-g' ? 'active' : ''}`} onClick={() => setActiveTab('zen-g')}>
          <Skull size={20} />
          <span>Zen G</span>
        </button>
        <button className={`mobile-nav-btn ${activeTab === 'android-unlock' ? 'active' : ''}`} onClick={() => setActiveTab('android-unlock')}>
          <Smartphone size={20} />
          <span>Unlock</span>
        </button>
        <button className={`mobile-nav-btn ${activeTab === 'books' ? 'active' : ''}`} onClick={() => setActiveTab('books')}>
          <BookOpen size={20} />
          <span>Books</span>
        </button>
        <button className={`mobile-nav-btn ${activeTab === 'calendar' ? 'active' : ''}`} onClick={() => setActiveTab('calendar')}>
          <Calendar size={20} />
          <span>Calendar</span>
        </button>
        <button className={`mobile-nav-btn ${activeTab === 'todo' ? 'active' : ''}`} onClick={() => setActiveTab('todo')}>
          <CheckSquare size={20} />
          <span>To-Do</span>
        </button>
      </nav>
    </div>
  );
}
