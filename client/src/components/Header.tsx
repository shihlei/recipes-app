import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ChefHat, Heart, Moon, Search, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function useTheme() {
  const [dark, setDark] = useState<boolean>(() => {
    const stored = localStorage.getItem('theme');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  return { dark, toggle: () => setDark((d) => !d) };
}

export default function Header() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const navigate = useNavigate();
  const { dark, toggle } = useTheme();

  // Keep input in sync when navigating back/forward
  useEffect(() => {
    setQuery(searchParams.get('q') ?? '');
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) navigate(`/?q=${encodeURIComponent(trimmed)}`);
    else navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center gap-3 h-16">
          {/* Brand */}
          <Link
            to="/"
            className="flex items-center gap-2 font-bold text-lg text-primary shrink-0 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="RecipeBox — go to home"
          >
            <ChefHat className="w-6 h-6" aria-hidden="true" />
            <span className="hidden sm:inline">RecipeBox</span>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex flex-1 gap-2 max-w-xl" role="search">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"
                aria-hidden="true"
              />
              <Input
                type="search"
                placeholder="Search recipes…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9"
                aria-label="Search recipes"
              />
            </div>
            <Button type="submit" size="sm" className="shrink-0">
              Search
            </Button>
          </form>

          {/* Actions */}
          <nav aria-label="Site navigation" className="flex items-center gap-1 ml-auto">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/favorites" aria-label="My Favorites">
                <Heart className="w-5 h-5" aria-hidden="true" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggle}
              aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-pressed={dark}
            >
              {dark ? (
                <Sun className="w-5 h-5" aria-hidden="true" />
              ) : (
                <Moon className="w-5 h-5" aria-hidden="true" />
              )}
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
