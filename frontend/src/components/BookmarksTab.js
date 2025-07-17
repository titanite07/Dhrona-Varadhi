import React, { useState, useMemo } from 'react';
import OpportunityCard from './OpportunityCard';

function BookmarksTab({ opportunities, bookmarkedIds = [], onBookmarkToggle, onClearBookmarks }) {
  const bookmarked = useMemo(() => opportunities.filter(o => bookmarkedIds.includes(o.url)), [opportunities, bookmarkedIds]);
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const sources = Array.from(new Set(bookmarked.map(j => j.source))).filter(Boolean);
  const types = Array.from(new Set(bookmarked.map(j => j.type))).filter(Boolean);
  const filtered = bookmarked.filter(j =>
    (sourceFilter === 'All' || j.source === sourceFilter) &&
    (typeFilter === 'All' || j.type === typeFilter) &&
    (search === '' || (j.title && j.title.toLowerCase().includes(search.toLowerCase())))
  );
  if (!bookmarked.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <svg className="w-24 h-24 text-yellow-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5v16l7-5 7 5V5a2 2 0 00-2-2H7a2 2 0 00-2 2z" /></svg>
        <div className="text-xl font-semibold text-gray-500 dark:text-gray-400 mb-2">No bookmarks yet</div>
        <div className="text-gray-400 dark:text-gray-500">Save jobs and opportunities to see them here!</div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-yellow-700 dark:text-yellow-300 flex items-center gap-2">
          <svg className="w-7 h-7 text-yellow-500 dark:text-yellow-300" fill="currentColor" viewBox="0 0 24 24"><path d="M5 5v16l7-5 7 5V5a2 2 0 00-2-2H7a2 2 0 00-2 2z" /></svg>
          Bookmarks
        </h1>
        <div className="flex gap-4 items-center">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search bookmarks..."
            className="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
          />
          <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)} className="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800">
            <option value="All">All Sources</option>
            {sources.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800">
            <option value="All">All Types</option>
            {types.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <button
            className="px-4 py-2 rounded bg-red-500 text-white font-semibold hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onClearBookmarks}
            disabled={bookmarked.length === 0}
            title="Clear all bookmarks"
          >
            Clear Bookmarks
          </button>
        </div>
      </div>
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((opportunity, idx) => (
          <OpportunityCard
            key={idx}
            opportunity={opportunity}
            isBookmarked={bookmarkedIds.includes(opportunity.url)}
            onBookmarkToggle={onBookmarkToggle}
          />
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="text-center text-gray-400 dark:text-gray-500 mt-12">No bookmarks match your filters.</div>
      )}
    </div>
  );
}

export default BookmarksTab;
