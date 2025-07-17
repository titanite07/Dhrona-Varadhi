import React from 'react';

function DarkModeToggle({ theme, setTheme, iconOnly }) {
  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className={iconOnly
        ? 'w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-800 text-xl text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-200'
        : 'px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-400'}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span>{theme === 'dark' ? '🌙' : '☀️'}</span>
      {!iconOnly && (
        <span className="ml-2">{theme.charAt(0).toUpperCase() + theme.slice(1)}</span>
      )}
    </button>
  );
}

export default DarkModeToggle;
