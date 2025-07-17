import React from 'react';

export default function BookmarkButton({ id, isBookmarked, onToggle }) {
  return (
    <button
      className={`ml-2 text-xl ${isBookmarked ? 'text-yellow-400' : 'text-gray-400'}`}
      onClick={onToggle}
      aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
    >
      {isBookmarked ? '★' : '☆'}
    </button>
  );
}
