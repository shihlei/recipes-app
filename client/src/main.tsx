import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import { queryClient } from './lib/queryClient';
import './styles/globals.css';

if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    // Register SW only in production — in dev it intercepts Vite's requests and breaks HMR
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => console.log('[SW] registered', reg.scope))
        .catch((err) => console.warn('[SW] registration failed', err));
    });
  } else {
    // Unregister any SW left over from a previous session so normal refresh works
    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((reg) => reg.unregister());
    });
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);
