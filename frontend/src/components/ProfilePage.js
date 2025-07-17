import React from 'react';
import { useUser, SignOutButton } from '@clerk/clerk-react';

export default function ProfilePage({ theme }) {
  const { user } = useUser();
  if (!user) return null;
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl flex flex-col items-center gap-6">
        <img
          src={user.imageUrl}
          alt="User avatar"
          className="w-28 h-28 rounded-full border-4 border-blue-400 shadow-lg object-cover"
        />
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{user.fullName || 'No Name'}</h2>
          <p className="text-gray-500 dark:text-gray-300">{user.primaryEmailAddress?.emailAddress}</p>
        </div>
        <div className="flex gap-4 mt-4">
          <SignOutButton>
            <button className="px-6 py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition">Sign Out</button>
          </SignOutButton>
        </div>
      </div>
    </div>
  );
} 