import React, { useEffect, useState } from 'react';
import axios from 'axios';
import OpportunityList from './components/OpportunityList';
import DarkModeToggle from './components/DarkModeToggle';
import SearchBar from './components/SearchBar';
import BookmarksTab from './components/BookmarksTab';
import Recommendations from './components/Recommendations';
import ResumeUpload from './components/ResumeUpload';
import Chatbot from './components/Chatbot';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import GlassdoorCarousel from './components/GlassdoorCarousel';
import JobsPage from './components/JobsPage';
import UnstopCarousel from './components/UnstopCarousel';
import OpportunityCard from './components/OpportunityCard';
import { SignIn, SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import ProfilePage from './components/ProfilePage';

const TABS = ['All', 'Jobs', 'Bookmarks', 'Recommended'];
const SOURCE_ENDPOINTS = [
  { name: 'Devfolio', url: 'http://localhost:5000/api/opportunities/devfolio' },
  { name: 'MLH', url: 'http://localhost:5000/api/opportunities/mlh' },
  { name: 'Unstop', url: 'http://localhost:5000/api/opportunities/unstop' },
  { name: 'Glassdoor', url: 'http://localhost:5000/api/opportunities/glassdoor' },
  { name: 'LinkedIn', url: 'http://localhost:5000/api/opportunities/linkedin' },
  { name: 'LeetCode', url: 'http://localhost:5000/api/opportunities/leetcode' },
];

const GLASSDOOR_KEYWORDS = [
  'software', 'developer', 'engineer', 'data', 'ai', 'machine learning'
];

function Navbar({ theme, setTheme, userButton }) {
  const location = useLocation();
  const navTabs = [
    { name: 'All', path: '/' },
    { name: 'Jobs', path: '/jobs' },
    { name: 'Bookmarks', path: '/bookmarks' },
    { name: 'Recommended', path: '/recommended' }
  ];
  return (
    <header className="flex flex-col p-6 text-center text-gray-900 bg-white shadow-lg transition-colors duration-200 md:flex-row md:items-center md:justify-between dark:bg-gray-900 dark:text-white">
      <div className="flex flex-col items-center md:items-start">
        <div className="relative mb-2 w-40 h-14 transition-all duration-500">
          <img
            src={theme === 'dark' ? require('./logo/Screenshot 2025-07-15 202930.png') : require('./logo/Screenshot 2025-07-15 202924.png')}
            alt="Dhrona Varadhi Logo"
            className="object-contain w-full h-full rounded-lg shadow-md transition-opacity duration-500 bg-white/80 dark:bg-gray-900/80"
            style={{ opacity: 1, transition: 'opacity 0.5s' }}
            draggable="false"
          />
        </div>
      </div>
      <div className="flex gap-2 items-center ml-auto">
        {navTabs.map(tab => (
          <Link
            key={tab.name}
            to={tab.path}
            className={`px-4 py-2 rounded-md font-medium border-none shadow-none bg-transparent text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-150 ${location.pathname === tab.path || (tab.path === '/' && location.pathname === '/') ? 'underline font-bold' : ''}`}
            style={{ background: 'none' }}
          >
            {tab.name}
          </Link>
        ))}
        <DarkModeToggle theme={theme} setTheme={setTheme} iconOnly />
        {userButton && <div className="flex items-center ml-2">{userButton}</div>}
      </div>
    </header>
  );
}

function MainApp(props) {
  const location = useLocation();
  const navTabs = [
    { name: 'All', path: '/' },
    { name: 'Jobs', path: '/jobs' },
    { name: 'Bookmarks', path: '/bookmarks' },
    { name: 'Recommended', path: '/recommended' }
  ];
  return (
    <div className="min-h-screen bg-gray-50 transition-colors duration-200 dark:bg-gray-900">
      <main className="p-6 mx-auto max-w-6xl text-gray-900 transition-colors duration-200 dark:text-gray-100">
        <div className="flex flex-col gap-4 mb-4 md:flex-row md:items-center md:justify-between">
          <div />
          <SearchBar value={props.search} onChange={props.setSearch} />
        </div>
        {/* Remove the upload resume section entirely */}
        {/* Unstop Section with Carousel and See More button (moved above Glassdoor) */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Unstop</h3>
            <Link to="/unstop" className="font-medium text-blue-600 hover:underline">See More &rarr;</Link>
          </div>
          <UnstopCarousel
            opportunities={
              (props.sourceData['Unstop'] || []).filter(
                o =>
                  o.title?.toLowerCase().includes(props.search.toLowerCase()) ||
                  o.organization?.toLowerCase().includes(props.search.toLowerCase()) ||
                  o.description?.toLowerCase().includes(props.search.toLowerCase())
              )
            }
            loading={!!props.sourceLoading['Unstop']}
            bookmarkedIds={props.bookmarkedIds}
            onBookmarkToggle={props.setBookmarkedIds && (url => {
              let updated;
              if (props.bookmarkedIds.includes(url)) {
                updated = props.bookmarkedIds.filter(b => b !== url);
              } else {
                updated = [...props.bookmarkedIds, url];
              }
              props.setBookmarkedIds(updated);
              localStorage.setItem('bookmarks', JSON.stringify(updated));
            })}
          />
          {props.sourceError['Unstop'] && (
            <div className="p-2 mt-2 text-sm text-red-700 bg-red-50 rounded-md border border-red-200">Unstop error: {props.sourceError['Unstop']}</div>
          )}
        </div>
        {/* Glassdoor Section with Carousel and See More button */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Glassdoor</h3>
            <Link to="/jobs" className="font-medium text-blue-600 hover:underline">See More &rarr;</Link>
          </div>
          <GlassdoorCarousel
            opportunities={
              (props.sourceData['Glassdoor'] || []).filter(
                o =>
                  o.title?.toLowerCase().includes(props.search.toLowerCase()) ||
                  o.organization?.toLowerCase().includes(props.search.toLowerCase()) ||
                  o.description?.toLowerCase().includes(props.search.toLowerCase())
              )
            }
            loading={!!props.sourceLoading['Glassdoor']}
            bookmarkedIds={props.bookmarkedIds}
            onBookmarkToggle={props.setBookmarkedIds && (url => {
              let updated;
              if (props.bookmarkedIds.includes(url)) {
                updated = props.bookmarkedIds.filter(b => b !== url);
              } else {
                updated = [...props.bookmarkedIds, url];
              }
              props.setBookmarkedIds(updated);
              localStorage.setItem('bookmarks', JSON.stringify(updated));
            })}
          />
          {props.sourceError['Glassdoor'] && (
            <div className="p-2 mt-2 text-sm text-red-700 bg-red-50 rounded-md border border-red-200">Glassdoor error: {props.sourceError['Glassdoor']}</div>
          )}
        </div>
        {/* Render other sources as before, except Glassdoor and Unstop */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-3">
          {SOURCE_ENDPOINTS.filter(src => src.name !== 'Glassdoor' && src.name !== 'Unstop').map(src => (
            <div key={src.name}>
              <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-gray-100">{src.name}</h3>
              <OpportunityList
                opportunities={
                  (props.sourceData[src.name] || []).filter(
                    o =>
                      o.title?.toLowerCase().includes(props.search.toLowerCase()) ||
                      o.organization?.toLowerCase().includes(props.search.toLowerCase()) ||
                      o.description?.toLowerCase().includes(props.search.toLowerCase())
                  )
                }
                loading={!!props.sourceLoading[src.name]}
                bookmarkedIds={props.bookmarkedIds}
                onBookmarkToggle={props.setBookmarkedIds && (url => {
                  let updated;
                  if (props.bookmarkedIds.includes(url)) {
                    updated = props.bookmarkedIds.filter(b => b !== url);
                  } else {
                    updated = [...props.bookmarkedIds, url];
                  }
                  props.setBookmarkedIds(updated);
                  localStorage.setItem('bookmarks', JSON.stringify(updated));
                })}
              />
              {props.sourceError[src.name] && (
                <div className="p-2 mt-2 text-sm text-red-700 bg-red-50 rounded-md border border-red-200">{src.name} error: {props.sourceError[src.name]}</div>
              )}
            </div>
          ))}
        </div>
      </main>
      {/* ...chatbot logic as before... */}
    </div>
  );
}

function App() {
  // All state and logic here
  const [tab, setTab] = useState('All');
  const [search, setSearch] = useState('');
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [resumeSkills, setResumeSkills] = useState([]);
  const [showChatbot, setShowChatbot] = useState(false);
  const [sourceData, setSourceData] = useState({});
  const [sourceLoading, setSourceLoading] = useState({});
  const [sourceError, setSourceError] = useState({});
  const [bookmarkedIds, setBookmarkedIds] = useState(() => {
    return JSON.parse(localStorage.getItem('bookmarks') || '[]');
  });
  const [glassdoorJobs, setGlassdoorJobs] = useState([]);
  const [glassdoorLoading, setGlassdoorLoading] = useState(true);
  const [glassdoorError, setGlassdoorError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    // Fetch all sources except Glassdoor as before
    const fetchAllSources = async () => {
      const loadingState = {};
      SOURCE_ENDPOINTS.forEach(src => { if (src.name !== 'Glassdoor') loadingState[src.name] = true; });
      setSourceLoading(loadingState);
      setSourceError({});
      setSourceData({});
      await Promise.all(
        SOURCE_ENDPOINTS.filter(src => src.name !== 'Glassdoor').map(async (src) => {
          try {
            const res = await axios.get(src.url);
            setSourceData(prev => ({ ...prev, [src.name]: res.data }));
            setSourceLoading(prev => ({ ...prev, [src.name]: false }));
          } catch (err) {
            setSourceError(prev => ({ ...prev, [src.name]: err.message }));
            setSourceLoading(prev => ({ ...prev, [src.name]: false }));
          }
        })
      );
    };
    fetchAllSources();
  }, []);

  useEffect(() => {
    // Fetch Glassdoor jobs: first quick, then per keyword
    let isCancelled = false;
    setGlassdoorJobs([]);
    setGlassdoorLoading(true);
    setGlassdoorError(null);
    const fetchGlassdoorJobs = async () => {
      // 1. Fetch quick jobs for immediate display
      try {
        const quickRes = await axios.get('http://localhost:5000/api/opportunities/glassdoor?quick=true');
        if (!isCancelled) {
          setGlassdoorJobs(quickRes.data);
        }
      } catch (err) {
        if (!isCancelled) {
          setGlassdoorError(`Quick Glassdoor error: ${err.message}`);
        }
      }
      // 2. Fetch jobs per keyword and append
      for (const keyword of GLASSDOOR_KEYWORDS) {
        try {
          const res = await axios.get(`http://localhost:5000/api/opportunities/glassdoor?keyword=${encodeURIComponent(keyword)}`);
          if (!isCancelled) {
            setGlassdoorJobs(prev => [...prev, ...res.data]);
          }
        } catch (err) {
          if (!isCancelled) {
            setGlassdoorError(`Error for keyword '${keyword}': ${err.message}`);
          }
        }
      }
      if (!isCancelled) setGlassdoorLoading(false);
    };
    fetchGlassdoorJobs();
    return () => { isCancelled = true; };
  }, []);

  // Smart Recommendations logic
  const allOpportunities = Object.values(sourceData).flat();
  const recommended = resumeSkills.length > 0
    ? allOpportunities.filter(opp => {
        const text = [opp.title, opp.description, opp.organization].join(' ').toLowerCase();
        return resumeSkills.some(skill => text.includes(skill.toLowerCase()));
      }).slice(0, 12)
    : [];

  // Pass all state/handlers as props to MainApp
  return (
    <div>
      <SignedOut>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          className="bg-gray-50 dark:bg-gray-900"
        >
          <SignIn />
        </div>
      </SignedOut>
      <SignedIn>
        <Navbar theme={theme} setTheme={setTheme} userButton={<UserButton onClick={() => navigate('/profile')} />} />
        <Routes>
          <Route path="/" element={
            <MainApp
              tab={tab}
              setTab={setTab}
              search={search}
              setSearch={setSearch}
              theme={theme}
              setTheme={setTheme}
              resumeSkills={resumeSkills}
              setResumeSkills={setResumeSkills}
              showChatbot={showChatbot}
              setShowChatbot={setShowChatbot}
              sourceData={{ ...sourceData, Glassdoor: glassdoorJobs }}
              sourceLoading={{ ...sourceLoading, Glassdoor: glassdoorLoading }}
              sourceError={{ ...sourceError, Glassdoor: glassdoorError }}
              bookmarkedIds={bookmarkedIds}
              setBookmarkedIds={setBookmarkedIds}
            />
          } />
          <Route path="/jobs" element={<JobsCollectionPage
            allJobs={Object.values(sourceData).flat().filter(j => j.type && j.type.toLowerCase().includes('job'))}
            bookmarkedIds={bookmarkedIds}
            onBookmarkToggle={url => {
              let updated;
              if (bookmarkedIds.includes(url)) {
                updated = bookmarkedIds.filter(b => b !== url);
              } else {
                updated = [...bookmarkedIds, url];
              }
              setBookmarkedIds(updated);
              localStorage.setItem('bookmarks', JSON.stringify(updated));
            }}
          />} />
          <Route path="/unstop" element={<UnstopPage opportunities={sourceData['Unstop'] || []} bookmarkedIds={bookmarkedIds} toggleBookmark={url => {
            let updated;
            if (bookmarkedIds.includes(url)) {
              updated = bookmarkedIds.filter(b => b !== url);
            } else {
              updated = [...bookmarkedIds, url];
            }
            setBookmarkedIds(updated);
            localStorage.setItem('bookmarks', JSON.stringify(updated));
          }} />} />
          <Route path="/bookmarks" element={<BookmarksTab
            opportunities={Object.values(sourceData).flat()}
            bookmarkedIds={bookmarkedIds}
            onBookmarkToggle={url => {
              let updated;
              if (bookmarkedIds.includes(url)) {
                updated = bookmarkedIds.filter(b => b !== url);
              } else {
                updated = [...bookmarkedIds, url];
              }
              setBookmarkedIds(updated);
              localStorage.setItem('bookmarks', JSON.stringify(updated));
            }}
            onClearBookmarks={() => {
              setBookmarkedIds([]);
              localStorage.setItem('bookmarks', '[]');
            }}
          />} />
          {/* Smart Recommendations Section (Under Development) */}
          <Route path="/recommended" element={
            <div className="flex flex-col items-center justify-center min-h-[40vh]">
              <span className="inline-block px-4 py-2 text-lg font-semibold text-yellow-800 bg-yellow-200 rounded-full shadow-md animate-pulse">
                Smart Recommendations (Under Development)
              </span>
            </div>
          } />
          <Route path="/profile" element={<ProfilePage theme={theme} />} />
        </Routes>
      </SignedIn>
    </div>
  );
}

function JobsCollectionPage({ allJobs = [], bookmarkedIds = [], onBookmarkToggle }) {
  const [sourceFilter, setSourceFilter] = React.useState('All');
  const [typeFilter, setTypeFilter] = React.useState('All');
  const sources = Array.from(new Set(allJobs.map(j => j.source))).filter(Boolean);
  const types = Array.from(new Set(allJobs.map(j => j.type))).filter(Boolean);
  const filtered = allJobs.filter(j =>
    (sourceFilter === 'All' || j.source === sourceFilter) &&
    (typeFilter === 'All' || j.type === typeFilter)
  );
  return (
    <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">
        <h1 className="flex gap-2 items-center text-2xl font-bold text-blue-700 dark:text-blue-300">
          <svg className="w-7 h-7 text-blue-600 dark:text-blue-300" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/><path d="M0 0h24v24H0z" fill="none"/></svg>
          Jobs Collection
        </h1>
        <div className="flex gap-4 items-center">
          <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)} className="px-3 py-2 bg-white rounded border border-gray-300 dark:border-gray-700 dark:bg-gray-800">
            <option value="All">All Sources</option>
            {sources.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="px-3 py-2 bg-white rounded border border-gray-300 dark:border-gray-700 dark:bg-gray-800">
            <option value="All">All Types</option>
            {types.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>
      <OpportunityList
        opportunities={filtered}
        bookmarkedIds={bookmarkedIds}
        onBookmarkToggle={onBookmarkToggle}
      />
    </div>
  );
}

function UnstopPage({ opportunities = [], bookmarkedIds = [], toggleBookmark }) {
  const allOpportunities = opportunities.length ? opportunities : (window.__ALL_UNSTOP__ || []);
  return (
    <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex justify-between items-center mb-6">
        <h1 className="flex gap-2 items-center text-2xl font-bold text-purple-700 dark:text-purple-300">
          <svg className="w-7 h-7 text-purple-600 dark:text-purple-300" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/><path d="M0 0h24v24H0z" fill="none"/></svg>
          Unstop Opportunities
        </h1>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {allOpportunities.map((opp, idx) => (
          <div key={idx} className="transition-transform duration-300 hover:scale-105">
            <OpportunityCard opportunity={opp} />
            <button
              className={`mt-2 px-3 py-1 rounded-full text-xs font-semibold border focus:outline-none focus:ring-2 focus:ring-purple-400 ${bookmarkedIds?.includes(opp.url) ? 'bg-purple-600 text-white border-purple-700' : 'bg-white dark:bg-gray-800 text-purple-700 border-purple-400 dark:text-purple-300'}`}
              aria-label={bookmarkedIds?.includes(opp.url) ? 'Remove bookmark' : 'Save opportunity'}
              onClick={() => toggleBookmark && toggleBookmark(opp.url)}
            >
              {bookmarkedIds?.includes(opp.url) ? 'Saved' : 'Save'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App; 