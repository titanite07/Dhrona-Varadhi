import React from 'react';
import OpportunityCard from './OpportunityCard';

function JobsPage({ jobs = [], bookmarkedIds = [], toggleBookmark }) {
  const allJobs = jobs.length ? jobs : (window.__ALL_JOBS__ || []);
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-green-700 dark:text-green-300 flex items-center gap-2">
          <svg className="w-7 h-7 text-green-600 dark:text-green-300" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/><path d="M0 0h24v24H0z" fill="none"/></svg>
          Glassdoor Jobs
        </h1>
      </div>
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {allJobs.map((job, idx) => (
          <div key={idx} className="transition-transform duration-300 hover:scale-105">
            <OpportunityCard opportunity={job} />
            <button
              className={`mt-2 px-3 py-1 rounded-full text-xs font-semibold border focus:outline-none focus:ring-2 focus:ring-green-400 ${bookmarkedIds?.includes(job.url) ? 'bg-green-600 text-white border-green-700' : 'bg-white dark:bg-gray-800 text-green-700 border-green-400 dark:text-green-300'}`}
              aria-label={bookmarkedIds?.includes(job.url) ? 'Remove bookmark' : 'Save job'}
              onClick={() => toggleBookmark && toggleBookmark(job.url)}
            >
              {bookmarkedIds?.includes(job.url) ? 'Saved' : 'Save'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default JobsPage; 