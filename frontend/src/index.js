import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';

const clerkPublishableKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY; // Clerk publishable key from .env
if (!clerkPublishableKey) {
  console.error('Clerk publishable key is not set. Please check your .env file.');
}
const root = createRoot(document.getElementById('root'));
root.render(
  <ClerkProvider publishableKey={clerkPublishableKey}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ClerkProvider>
); 