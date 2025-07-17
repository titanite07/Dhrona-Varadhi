import React from 'react';
import OpportunityCard from './OpportunityCard';

function OpportunityList({ opportunities, loading, bookmarkedIds = [], onBookmarkToggle }) {
  if (loading) {
    return (
      <div className="grid gap-4">
        {[1,2,3].map(i => (
          <div key={i} className="p-6 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md animate-pulse">
            <div className="h-6 w-1/2 bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
            <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
            <div className="h-4 w-1/4 bg-gray-200 dark:bg-gray-600 rounded mb-4"></div>
            <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        ))}
      </div>
    );
  }
  if (!opportunities.length) {
    return <div className="text-center text-gray-500 dark:text-gray-400 transition-colors duration-200">No opportunities found.</div>;
  }
  if (opportunities.length > 1) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-blue-100 transition-all duration-500 ease-in-out">
        {opportunities.map((opportunity, idx) => (
          <div key={idx} className="min-w-[340px] max-w-xs flex-shrink-0 transform transition-transform duration-300 hover:scale-105">
            <OpportunityCard
              opportunity={opportunity}
              isBookmarked={bookmarkedIds.includes(opportunity.url)}
              onBookmarkToggle={onBookmarkToggle}
            />
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="grid gap-4">
      {opportunities.map((opportunity, idx) => (
        <OpportunityCard
          key={idx}
          opportunity={opportunity}
          isBookmarked={bookmarkedIds.includes(opportunity.url)}
          onBookmarkToggle={onBookmarkToggle}
        />
      ))}
    </div>
  );
}

export default OpportunityList; 