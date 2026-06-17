import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  MessageSquare,
  Share2,
  ThumbsUp,
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
  GraduationCap
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
  'IPO in Nepal',
  'Trading',
  'Class 12',
  'Class 10',
  'Class 8'
];
const SENTIMENTS = ['Positive', 'Negative', 'Neutral'];

const CATEGORY_VIDEOS = {
  'Sports': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
  'Technology': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'Entertainment': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'Business': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'Politics': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  'General': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  'IPO in Nepal': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'Trading': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
};

const SPORTS_SCHEDULE = {
  'Football': {
    '2026-06-14': [
      { id: 'match_yesterday_football', homeTeam: 'Manchester United', awayTeam: 'Arsenal', score: '2 - 1', status: 'FINISHED', time: 'Yesterday', details: 'Old Trafford' }
    ],
    '2026-06-15': [
      { id: 'match_1', isLive: true, homeTeam: 'Real Madrid', awayTeam: 'Barcelona', status: 'LIVE', time: 'LIVE NOW', details: 'El Clasico', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4' }
    ],
    '2026-06-16': [
      { id: 'match_tomorrow_football', homeTeam: 'Manchester City', awayTeam: 'Chelsea', status: 'Upcoming', time: 'Tomorrow 8:00 PM', details: 'Etihad Stadium' }
    ],
    '2026-06-17': [
      { id: 'match_future_football', homeTeam: 'Paris Saint-Germain', awayTeam: 'Bayern Munich', status: 'Upcoming', time: 'June 17 7:30 PM', details: 'Parc des Princes' }
    ]
  },
  'Cricket': {
    '2026-06-14': [
      { id: 'match_yesterday_cricket', homeTeam: 'England', awayTeam: 'South Africa', score: '185/6 vs 182', status: 'FINISHED', time: 'Yesterday', details: 'Lord’s Cricket Ground - England won by 4 wickets' }
    ],
    '2026-06-15': [
      { id: 'match_2', isLive: true, homeTeam: 'India', awayTeam: 'Australia', status: 'LIVE', time: 'LIVE NOW', details: 'Border-Gavaskar Trophy Series', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' }
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
      { id: 'match_yesterday_badminton', homeTeam: 'Viktor Axelsen', awayTeam: 'Kento Momota', score: '2 - 1 (Sets)', status: 'FINISHED', time: 'Yesterday', details: 'BWF World Tour Finals' }
    ],
    '2026-06-15': [
      { id: 'match_3', isLive: true, homeTeam: 'P.V. Sindhu', awayTeam: 'Carolina Marin', status: 'LIVE', time: 'LIVE NOW', details: 'Indonesia Open Finals', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' }
    ],
    '2026-06-16': [
      { id: 'match_tomorrow_badminton', homeTeam: 'Tai Tzu-ying', awayTeam: 'An Se-young', status: 'Upcoming', time: 'Tomorrow 11:00 AM', details: 'Japan Open Semifinals' }
    ],
    '2026-06-17': [
      { id: 'match_future_badminton', homeTeam: 'Lakshya Sen', awayTeam: 'Lee Zii Jia', status: 'Upcoming', time: 'June 17 1:00 PM', details: 'Singapore Open Quarterfinals' }
    ]
  }
};

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

export default function App() {
  const [theme, setTheme] = useState('dark');

  // Navigation & View Tabs
  // 'feed' (clean posts), 'newspaper' (newspaper layout), 'clustered' (clean posts grouped), 'spam' (gibberish posts), 'analytics' (metrics & graphs)
  const [activeTab, setActiveTab] = useState('feed');
  const [eduActiveTab, setEduActiveTab] = useState('Class 12');

  // Live Sports Watch states
  const [selectedWatchSport, setSelectedWatchSport] = useState('Football');
  const [selectedWatchDate, setSelectedWatchDate] = useState('2026-06-15');
  const [selectedWatchMatch, setSelectedWatchMatch] = useState(
    SPORTS_SCHEDULE['Football'] && SPORTS_SCHEDULE['Football']['2026-06-15']
      ? SPORTS_SCHEDULE['Football']['2026-06-15'][0]
      : null
  );

  // Data State
  const [posts, setPosts] = useState([]);
  const [clusteredPosts, setClusteredPosts] = useState([]);
  const [eduPosts, setEduPosts] = useState([]);
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
      const res = await fetch(`${API_BASE}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: authUsername.trim(), password: authPassword.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setCurrentUser(data.user);
        setAuthToken(data.token);
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

  const handleLogout = () => {
    setCurrentUser(null);
    setAuthToken(null);
    localStorage.removeItem('zebvo_user');
    localStorage.removeItem('zebvo_token');
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
            <li>
              <a
                className={`nav-item ${activeTab === 'feed' ? 'active' : ''}`}
                onClick={() => { setActiveTab('feed'); }}
              >
                <List size={18} />
                <span>Aggregated Feed</span>
              </a>
            </li>
            <li>
              <a
                className={`nav-item ${activeTab === 'newspaper' ? 'active' : ''}`}
                onClick={() => { setActiveTab('newspaper'); }}
              >
                <FileText size={18} />
                <span>Daily Newspaper</span>
              </a>
            </li>
            <li>
              <a
                className={`nav-item ${activeTab === 'education' ? 'active' : ''}`}
                onClick={() => { setActiveTab('education'); }}
              >
                <GraduationCap size={18} />
                <span>Education Hub</span>
              </a>
            </li>
            <li>
              <a
                className={`nav-item ${activeTab === 'ipo-nepal' ? 'active' : ''}`}
                onClick={() => { setActiveTab('ipo-nepal'); }}
              >
                <TrendingUp size={18} />
                <span>IPO Nepal</span>
              </a>
            </li>
            <li>
              <a
                className={`nav-item ${activeTab === 'trading' ? 'active' : ''}`}
                onClick={() => { setActiveTab('trading'); }}
              >
                <Activity size={18} />
                <span>Trading Monitor</span>
              </a>
            </li>
            <li>
              <a
                className={`nav-item ${activeTab === 'sports' ? 'active' : ''}`}
                onClick={() => { setActiveTab('sports'); }}
              >
                <Tv size={18} />
                <span>Sports Center</span>
              </a>
            </li>
            <li>
              <a
                className={`nav-item ${activeTab === 'reels' ? 'active' : ''}`}
                onClick={() => { setActiveTab('reels'); }}
              >
                <Film size={18} />
                <span>News Reels</span>
              </a>
            </li>
            <li>
              <a
                className={`nav-item ${activeTab === 'clustered' ? 'active' : ''}`}
                onClick={() => { setActiveTab('clustered'); }}
              >
                <Layers size={18} />
                <span>Clustered View</span>
              </a>
            </li>
            <li>
              <a
                className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
                onClick={() => { setActiveTab('analytics'); }}
              >
                <BarChart2 size={18} />
                <span>Dashboard Analytics</span>
              </a>
            </li>
            <li>
              <a
                className={`nav-item ${activeTab === 'spam' ? 'active' : ''}`}
                onClick={() => { setActiveTab('spam'); }}
              >
                <ShieldAlert size={18} />
                <span>Spam / Gibberish</span>
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
                        setSelectedWatchDate('2026-06-15');
                        const matchesToday = (SPORTS_SCHEDULE[sport] || {})['2026-06-15'] || [];
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
                      setSelectedWatchDate('2026-06-15');
                      const matchesToday = (SPORTS_SCHEDULE[match.sport] || {})['2026-06-15'] || [];
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

            {activeTab !== 'analytics' && activeTab !== 'reels' && activeTab !== 'newspaper' && activeTab !== 'sports' && activeTab !== 'education' && activeTab !== 'ipo-nepal' && activeTab !== 'trading' && (
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
              <div className="metric-icon-wrapper">
                <ThumbsUp size={22} />
              </div>
              <div className="metric-info">
                <h3>Positive Ratio</h3>
                <div className="metric-value">{stats.summary.sentimentRatio.positive}%</div>
              </div>
            </div>
          </section>
        )}

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
                            <video src={post.postVideo} muted autoPlay loop playsInline />
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
                            <video src={post.postVideo} muted autoPlay loop playsInline style={{ maxHeight: '180px' }} />
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
                            <video src={post.postVideo} muted autoPlay loop playsInline style={{ maxHeight: '180px' }} />
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
                            <video src={post.postVideo} muted autoPlay loop playsInline style={{ maxHeight: '180px' }} />
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
                            <video src={post.postVideo} muted autoPlay loop playsInline style={{ maxHeight: '180px' }} />
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
            <div className="reels-container">
              {posts.filter(p => !p.isGibberish).length === 0 ? (
                <div className="empty-state" style={{ height: '100%' }}>
                  <AlertCircle size={36} className="empty-state-icon" />
                  <h3>No reels available</h3>
                  <p>Try scraping or changing category filters.</p>
                </div>
              ) : (
                posts.filter(p => !p.isGibberish).map((post) => {
                  const videoUrl = post.postVideo || CATEGORY_VIDEOS[post.category] || CATEGORY_VIDEOS['General'];

                  return (
                    <div key={post.id} className="reel-card">
                      {/* Background Visual Media Video Playing */}
                      <div className="reel-media-bg">
                        <video
                          src={videoUrl}
                          autoPlay
                          loop
                          muted
                          playsInline
                          onLoadedMetadata={(e) => {
                            e.target.muted = true;
                            e.target.play().catch(err => console.log("Reel autoplay blocked:", err));
                          }}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
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
                          <video src={post.postVideo} controls muted playsInline style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', display: 'block' }} />
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
        ) : activeTab === 'sports' ? (
          /* SPORTS ARENA VIEW */
          <div className="sports-center-container glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '0px', overflow: 'hidden', border: '1px solid var(--border-glass-bright)' }}>
            <div className="sports-center-header" style={{ padding: '24px 24px 16px 24px', borderBottom: '1px solid var(--border-glass)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="live-pulse-dot" style={{ width: '12px', height: '12px' }}></span>
                <h2 style={{ margin: 0, fontSize: '1.4rem', fontFamily: 'var(--font-display)', fontWeight: 800 }}>Zebvo Live Sports Arena</h2>
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
                      setSelectedWatchDate('2026-06-15');
                      const matchesToday = (SPORTS_SCHEDULE[sport] || {})['2026-06-15'] || [];
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
                {[
                  { label: 'Yesterday', value: '2026-06-14' },
                  { label: 'Today (Live)', value: '2026-06-15' },
                  { label: 'Tomorrow', value: '2026-06-16' },
                  { label: 'Wed, Jun 17', value: '2026-06-17' }
                ].map(d => (
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

            <div className="sports-center-body" style={{ display: 'grid', gridTemplateColumns: selectedWatchMatch ? '1.2fr 1fr' : '1fr', gap: '20px', padding: '0 24px 24px 24px' }}>
              {/* Left Column: Video stream player + commentary */}
              {selectedWatchMatch ? (
                <div className="sports-watch-stream" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="sports-video-player-container" style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-glass-bright)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', background: '#000' }}>
                    <video
                      src={selectedWatchMatch.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4'}
                      autoPlay
                      loop
                      muted
                      playsInline
                      onLoadedMetadata={(e) => {
                        e.target.muted = true;
                        e.target.play().catch(err => console.log("Sports autoplay blocked:", err));
                      }}
                      className="sports-live-video"
                      style={{ width: '100%', display: 'block', maxHeight: '380px', objectFit: 'cover' }}
                    />

                    {/* Live Scoreboard HUD overlay */}
                    <div className="sports-video-hud" style={{ position: 'absolute', bottom: '16px', left: '16px', right: '16px', display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div className="hud-badge-live" style={{ background: selectedWatchDate === '2026-06-15' && selectedWatchMatch.status !== 'FINISHED' ? 'rgba(34, 197, 94, 0.9)' : 'rgba(0,0,0,0.7)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 'bold', color: '#fff', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {selectedWatchDate === '2026-06-15' && selectedWatchMatch.status !== 'FINISHED' ? (
                            <>
                              <span className="live-pulse-dot" style={{ width: '6px', height: '6px', background: '#fff' }}></span>
                              <span>LIVE BROADCAST</span>
                            </>
                          ) : selectedWatchMatch.status === 'FINISHED' ? (
                            <span>MATCH REPLAY (FINISHED)</span>
                          ) : (
                            <span>BROADCAST PREVIEW</span>
                          )}
                        </div>
                        <div className="hud-status" style={{ fontSize: '0.72rem', background: 'rgba(0, 0, 0, 0.85)', padding: '4px 10px', borderRadius: '4px', color: '#22d3ee', fontWeight: 'bold' }}>
                          {(() => {
                            const isToday = selectedWatchDate === '2026-06-15';
                            const liveState = isToday ? matches.find(m => m.sport === selectedWatchSport) : null;
                            const showMatch = liveState || selectedWatchMatch;

                            if (selectedWatchSport === 'Football') {
                              return showMatch.status === 'FINISHED' ? 'FT (90\')' : `${showMatch.minute || 0}'`;
                            } else if (selectedWatchSport === 'Cricket') {
                              return `${showMatch.overs || 0.0} Overs`;
                            } else if (selectedWatchSport === 'Badminton') {
                              return `Pt: ${showMatch.homeScore || 0} - ${showMatch.awayScore || 0}`;
                            }
                            return showMatch.status;
                          })()}
                        </div>
                      </div>

                      {/* Interactive Dynamic Scoreboard */}
                      {(() => {
                        const isToday = selectedWatchDate === '2026-06-15';
                        const liveState = isToday ? matches.find(m => m.sport === selectedWatchSport) : null;
                        const showMatch = liveState || selectedWatchMatch;

                        return (
                          <div className="hud-scores" style={{ background: 'rgba(0,0,0,0.85)', padding: '12px 16px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div className="hud-team" style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 'bold' }}>{showMatch.homeTeam}</div>
                            <div className="hud-score-values" style={{ color: '#22d3ee', fontSize: '1.25rem', fontWeight: 800, display: 'flex', gap: '8px', alignItems: 'center' }}>
                              {selectedWatchSport === 'Football' && (
                                <>
                                  <span>{showMatch.homeScore}</span>
                                  <span>-</span>
                                  <span>{showMatch.awayScore}</span>
                                </>
                              )}
                              {selectedWatchSport === 'Cricket' && (
                                <>
                                  <span>{showMatch.homeScore}/{showMatch.awayScore}</span>
                                </>
                              )}
                              {selectedWatchSport === 'Badminton' && (
                                <>
                                  <span style={{ fontSize: '0.95rem' }}>Sets: {showMatch.sets}</span>
                                </>
                              )}
                            </div>
                            <div className="hud-team" style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 'bold' }}>{showMatch.awayTeam}</div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Commentary */}
                  {(() => {
                    const isToday = selectedWatchDate === '2026-06-15';
                    const liveState = isToday ? matches.find(m => m.sport === selectedWatchSport) : null;
                    const showMatch = liveState || selectedWatchMatch;

                    return (
                      <div className="glass-panel" style={{ padding: '16px', border: '1px solid var(--border-glass)', borderRadius: '12px', background: 'rgba(255,255,255,0.01)' }}>
                        <h4 style={{ fontSize: '0.92rem', color: 'var(--primary-light)', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          🏟️ Live Commentary
                        </h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
                          {showMatch.detail || 'Game in progress. Keep watching for highlights and score changes.'}
                        </p>

                        {showMatch.goalEvent && (
                          <div
                            style={{
                              marginTop: '12px',
                              padding: '8px 12px',
                              background: 'rgba(34, 197, 94, 0.12)',
                              borderLeft: '4px solid var(--success)',
                              borderRadius: '0 6px 6px 0',
                              fontSize: '0.8rem',
                              color: '#fff',
                              fontWeight: 500
                            }}
                          >
                            <strong>Event Alert</strong>: {showMatch.goalEvent.detail}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)', borderRadius: '12px', textAlign: 'center' }}>
                  <Tv size={36} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
                  <h4 style={{ margin: '0 0 6px 0', color: 'var(--text-primary)' }}>Select a Match to Watch</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Choose a match from the schedule below to watch high-quality live feed streams.</p>
                </div>
              )}

              {/* Right Column: Schedule / List of Matches */}
              <div className="sports-schedule-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-glass)', paddingBottom: '6px', margin: '0 0 4px 0', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{selectedWatchSport} Schedule</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {selectedWatchDate === '2026-06-15' ? 'Today (June 15)' : selectedWatchDate === '2026-06-14' ? 'Yesterday' : selectedWatchDate === '2026-06-16' ? 'Tomorrow' : 'Wed, Jun 17'}
                  </span>
                </h3>

                {(() => {
                  const dayMatches = (selectedWatchSport && SPORTS_SCHEDULE[selectedWatchSport]) ? (SPORTS_SCHEDULE[selectedWatchSport][selectedWatchDate] || []) : [];

                  if (dayMatches.length === 0) {
                    return (
                      <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        No matches scheduled for this date.
                      </div>
                    );
                  }

                  return dayMatches.map(m => {
                    const isToday = selectedWatchDate === '2026-06-15';
                    const liveMatch = isToday ? matches.find(lm => lm.sport === selectedWatchSport) : null;
                    const matchData = liveMatch || m;
                    const isWatchingThis = selectedWatchMatch && selectedWatchMatch.id === m.id;

                    return (
                      <div
                        key={m.id}
                        className={`sports-schedule-row glass-panel ${isWatchingThis ? 'watching-active' : ''}`}
                        style={{
                          padding: '12px 14px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          border: isWatchingThis ? '1px solid var(--primary)' : '1px solid var(--border-glass)',
                          background: isWatchingThis ? 'rgba(139, 92, 246, 0.08)' : 'rgba(255,255,255,0.01)',
                          borderRadius: '8px'
                        }}
                      >
                        <div style={{ flexGrow: 1, minWidth: 0, marginRight: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <span className="sports-team-name" style={{ fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{matchData.homeTeam}</span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>vs</span>
                            <span className="sports-team-name" style={{ fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{matchData.awayTeam}</span>
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {matchData.details || 'Scheduled Match'}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                          <div style={{ textAlign: 'right' }}>
                            {matchData.status === 'LIVE' ? (
                              <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '2px 6px', fontSize: '0.62rem', borderRadius: '3px' }}>
                                <span className="live-pulse-dot" style={{ width: '4px', height: '4px', background: '#fff' }}></span> LIVE
                              </span>
                            ) : matchData.status === 'FINISHED' ? (
                              <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)', fontSize: '0.68rem', padding: '2px 6px' }}>
                                SCORE: {matchData.score}
                              </span>
                            ) : (
                              <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)', border: '1px solid rgba(245, 158, 11, 0.2)', fontSize: '0.68rem', padding: '2px 6px' }}>
                                {matchData.time}
                              </span>
                            )}
                          </div>

                          {selectedWatchDate === '2026-06-16' || selectedWatchDate === '2026-06-17' ? (
                            <button
                              className="btn"
                              onClick={() => alert(`This match has not started yet. The broadcast is scheduled for ${matchData.time}.`)}
                              style={{
                                padding: '5px 10px',
                                fontSize: '0.7rem',
                                borderRadius: '4px',
                                background: 'rgba(255, 255, 255, 0.02)',
                                border: '1px solid var(--border-glass)',
                                color: 'var(--text-muted)',
                                cursor: 'pointer'
                              }}
                            >
                              Upcoming
                            </button>
                          ) : (
                            <button
                              className="btn btn-primary"
                              onClick={() => setSelectedWatchMatch(m)}
                              style={{
                                padding: '5px 12px',
                                fontSize: '0.72rem',
                                borderRadius: '4px',
                                cursor: 'pointer'
                              }}
                            >
                              {matchData.status === 'FINISHED' ? 'Highlights' : 'Watch Live'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  });
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
                          <video src={post.postVideo} controls muted playsInline style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', display: 'block' }} />
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
                  </span>
                </div>

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
              ) : (activeTab === 'clustered' ? clusteredPosts : posts).length === 0 ? (
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
                                <video
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
                    posts.map((post) => (
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
                              <video
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
              )}
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
      </nav>
    </div>
  );
}
