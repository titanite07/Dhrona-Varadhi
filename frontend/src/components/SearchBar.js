import React from 'react';

function SearchBar({ value, onChange }) {
  return (
    <input
      type="text"
      className="w-full md:w-96 px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
      placeholder="Search opportunities by title, company, or type..."
      value={value}
      onChange={e => onChange(e.target.value)}
    />
  );
}

export default SearchBar;
