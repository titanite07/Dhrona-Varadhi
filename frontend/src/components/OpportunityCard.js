import React from 'react';
import BookmarkButton from './BookmarkButton';

function OpportunityCard({ opportunity, isBookmarked, onBookmarkToggle }) {
  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'hackathon':
        return 'bg-purple-100 text-purple-800';
      case 'job':
        return 'bg-blue-100 text-blue-800';
      case 'coding problem':
      case 'coding contest':
        return 'bg-green-100 text-green-800';
      case 'internship':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'hard':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="relative p-6 bg-white dark:bg-gray-800 dark:border-gray-700 border border-gray-200 rounded-lg shadow-md transition-colors duration-200 hover:shadow-lg">
      {/* Bookmark button in top-right */}
      <div className="absolute top-3 right-3 z-10">
        <BookmarkButton
          id={opportunity.url}
          isBookmarked={isBookmarked}
          onToggle={() => onBookmarkToggle && onBookmarkToggle(opportunity.url)}
        />
      </div>
      <div className="flex flex-col gap-4 md:flex-row">
        {opportunity.image && (
          <div className="flex-shrink-0">
            <img
              src={opportunity.image}
              alt={opportunity.title}
              className="object-cover w-24 h-24 rounded-lg"
            />
          </div>
        )}
        <div className="flex-1">
          <div className="flex flex-col gap-2 mb-3 sm:flex-row sm:items-start sm:justify-between">
            <h2 className="text-xl font-bold leading-tight text-gray-900 dark:text-white transition-colors duration-200">
              {opportunity.title}
            </h2>
            <div className="flex flex-wrap gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(opportunity.type)}`}>
                {opportunity.type}
              </span>
              {opportunity.difficulty && (
                <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gray-100 ${getDifficultyColor(opportunity.difficulty)}`}>
                  {opportunity.difficulty}
                </span>
              )}
            </div>
          </div>
          {opportunity.description && (
            <p className="mb-4 text-gray-600 dark:text-gray-300 line-clamp-2 transition-colors duration-200">
              {opportunity.description}
            </p>
          )}
          <div className="grid grid-cols-1 gap-3 mb-4 sm:grid-cols-2 lg:grid-cols-3">
            {opportunity.organization && (
              <div className="flex gap-2 items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">🏢</span>
                <span className="text-sm text-gray-700 dark:text-gray-200 transition-colors duration-200">{opportunity.organization}</span>
              </div>
            )}
            {opportunity.location && (
              <div className="flex gap-2 items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">📍</span>
                <span className="text-sm text-gray-700 dark:text-gray-200 transition-colors duration-200">{opportunity.location}</span>
              </div>
            )}
            {opportunity.source && (
              <div className="flex gap-2 items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">🔗</span>
                <span className="text-sm text-gray-700 dark:text-gray-200 transition-colors duration-200">{opportunity.source}</span>
              </div>
            )}
            {opportunity.salary && (
              <div className="flex gap-2 items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">💰</span>
                <span className="text-sm text-gray-700 dark:text-gray-200 transition-colors duration-200">{opportunity.salary}</span>
              </div>
            )}
            {opportunity.category && (
              <div className="flex gap-2 items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">🏷️</span>
                <span className="text-sm text-gray-700 dark:text-gray-200 transition-colors duration-200">{opportunity.category}</span>
              </div>
            )}
            {(opportunity.startDate || opportunity.endDate) && (
              <div className="flex gap-2 items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">📅</span>
                <span className="text-sm text-gray-700 dark:text-gray-200 transition-colors duration-200">
                  {opportunity.startDate && opportunity.endDate 
                    ? `${opportunity.startDate} - ${opportunity.endDate}`
                    : opportunity.startDate || opportunity.endDate
                  }
                </span>
              </div>
            )}
          </div>
          <div className="flex justify-end">
            <a
              href={opportunity.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md transition-colors duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              View Opportunity
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
            {(opportunity.startDate || opportunity.endDate) && (
              <a
                href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(opportunity.title)}&dates=${opportunity.startDate.replace(/-/g, '')}/${opportunity.endDate.replace(/-/g, '')}&details=${encodeURIComponent(opportunity.description)}&location=${encodeURIComponent(opportunity.location || '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-2 py-1 ml-2 text-xs text-white bg-green-600 rounded hover:bg-green-700"
              >
                Add to Google Calendar
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OpportunityCard; 