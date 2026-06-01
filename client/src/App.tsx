import { Routes, Route } from 'react-router-dom';
import Header from '@/components/Header';
import ErrorBoundary from '@/components/ErrorBoundary';
import OfflineToast from '@/components/OfflineToast';
import { Toaster } from '@/components/ui/toaster';
import Home from '@/pages/Home';
import Details from '@/pages/Details';
import Favorites from '@/pages/Favorites';

export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Skip-to-content link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:z-50 focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:rounded-md focus:bg-primary focus:text-primary-foreground focus:font-medium"
      >
        Skip to main content
      </a>

      <Header />

      <main id="main-content" className="container mx-auto px-4 py-8 max-w-7xl">
        <ErrorBoundary>
          <Routes>
            <Route path="/"          element={<Home />} />
            <Route path="/meal/:id"  element={<Details />} />
            <Route path="/favorites" element={<Favorites />} />
          </Routes>
        </ErrorBoundary>
      </main>

      {/* Global toast renderer */}
      <Toaster />
      {/* Watches navigator.onLine and fires toasts on change */}
      <OfflineToast />
    </div>
  );
}
