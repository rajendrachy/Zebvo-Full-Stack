import React, { useState, useEffect, useCallback } from 'react';
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
  Moon
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
const REGIONS = ['India', 'USA', 'UK', 'Canada', 'Germany', 'Spain', 'Russia', 'UAE'];
const CATEGORIES = [
  'Application',
  'Renewal',
  'Appointments',
  'Tatkal',
  'Visa',
  'Travel Issues',
  'Government Announcements',
  'Scams/Fraud',
  'News',
  'Personal Experiences'
];
const SENTIMENTS = ['Positive', 'Negative', 'Neutral'];

export default function App() {
  const [theme, setTheme] = useState('dark');
  
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Navigation & View Tabs
  // 'feed' (clean posts), 'clustered' (clean posts grouped), 'spam' (gibberish posts), 'analytics' (metrics & graphs)
  const [activeTab, setActiveTab] = useState('feed');
  
  // Data State
  const [posts, setPosts] = useState([]);
  const [clusteredPosts, setClusteredPosts] = useState([]);
  const [stats, setStats] = useState(null);
  
  // UI Indicators
  const [isLoading, setIsLoading] = useState(true);
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
  const [translatingIds, setTranslatingIds] = useState(new Set()); // set of postIds being translated
  const [expandedClusters, setExpandedClusters] = useState(new Set()); // set of cluster leadPost IDs

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

  // Load all components
  useEffect(() => {
    fetchFeed();
    fetchStats();
  }, [fetchFeed]);

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

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '30px', flexGrow: 1 }}>
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
              {activeTab === 'clustered' && 'Clustered Social Threads'}
              {activeTab === 'spam' && 'Gibberish & Spam Bin'}
              {activeTab === 'analytics' && 'Intelligence Analytics'}
            </h1>
            <p>
              {activeTab === 'feed' && 'Tracking verified social posts related to passport services.'}
              {activeTab === 'clustered' && 'Grouping duplicate posts to reveal trending topics.'}
              {activeTab === 'spam' && 'Filtered posts marked as keyboard mashing, bots, or promo spam.'}
              {activeTab === 'analytics' && 'Data trends, platform breakdowns, and NLP insights.'}
            </p>
          </div>

          <div className="header-actions">
            {activeTab !== 'analytics' && (
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
        {activeTab === 'analytics' ? (
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
                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
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
                              <div className="author-avatar">
                                {leadPost.authorName.substring(0, 2).toUpperCase()}
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

                          <div className="post-content">{leadPost.text}</div>

                          {/* Summary rendering */}
                          {leadPost.summary && (
                            <div className="ai-summary-box">
                              <div className="ai-summary-text">{leadPost.summary}</div>
                            </div>
                          )}

                          {/* Translation controls */}
                          <div className="translation-controls">
                            <div className="post-footer-stats">
                              <span className="stat-item"><ThumbsUp size={14} /> {leadPost.likes}</span>
                              <span className="stat-item"><Share2 size={14} /> {leadPost.shares}</span>
                              <span className="stat-item"><MessageSquare size={14} /> {leadPost.comments}</span>
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
                              <div className="translated-header">Translated to {selectedTargetLang[leadPost.id]}</div>
                              <div className="translated-text">
                                {translations[`${leadPost.id}_${selectedTargetLang[leadPost.id]}`]}
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
                                    <span>{new Date(subPost.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
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
                            <div className="author-avatar">
                              {post.authorName.substring(0, 2).toUpperCase()}
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

                        <div className="post-content">{post.text}</div>

                        {/* Summary rendering */}
                        {post.summary && !post.isGibberish && (
                          <div className="ai-summary-box">
                            <div className="ai-summary-text">{post.summary}</div>
                          </div>
                        )}

                        {/* Translation controls */}
                        <div className="translation-controls">
                          <div className="post-footer-stats">
                            <span className="stat-item"><ThumbsUp size={14} /> {post.likes}</span>
                            <span className="stat-item"><Share2 size={14} /> {post.shares}</span>
                            <span className="stat-item"><MessageSquare size={14} /> {post.comments}</span>
                            <span className="post-time-region">
                              <Clock size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                              {new Date(post.timestamp).toLocaleString()}
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
                            <div className="translated-header">Translated to {selectedTargetLang[post.id]}</div>
                            <div className="translated-text">
                              {translations[`${post.id}_${selectedTargetLang[post.id]}`]}
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
      </main>
    </div>
  );
}
