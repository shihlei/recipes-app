import { useCallback, useEffect, useState } from 'react';
import { Trash2, Search } from 'lucide-react';
import { getAllFavorites, removeFavorite } from '@/features/favorites/db';
import type { Meal } from '@/lib/api';
import RecipeCard from '@/components/RecipeCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';

export default function Favorites() {
  const [favorites, setFavorites] = useState<Meal[]>([]);
  const [filter, setFilter]       = useState('');

  const load = useCallback(async () => {
    setFavorites(await getAllFavorites());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleRemove = async (meal: Meal, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await removeFavorite(meal.idMeal);
    await load();
    toast({ title: `Removed "${meal.strMeal}"` });
  };

  const filtered = filter
    ? favorites.filter((m) => m.strMeal.toLowerCase().includes(filter.toLowerCase()))
    : favorites;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Favorites</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {favorites.length === 0
              ? 'None saved yet'
              : `${favorites.length} recipe${favorites.length !== 1 ? 's' : ''} saved — available offline`}
          </p>
        </div>
      </div>

      {/* Filter input */}
      {favorites.length > 4 && (
        <div className="relative max-w-sm">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"
            aria-hidden="true"
          />
          <Input
            type="search"
            placeholder="Filter favorites…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-9"
            aria-label="Filter saved favorites"
          />
        </div>
      )}

      {/* Empty states */}
      {favorites.length === 0 ? (
        <div className="py-24 text-center text-muted-foreground">
          <p className="text-5xl mb-4" aria-hidden="true">💝</p>
          <p className="text-xl font-semibold mb-2">No favorites yet</p>
          <p className="text-sm max-w-xs mx-auto">
            Browse recipes and tap the heart icon to save them here — they'll work offline too!
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">No saved recipes match your filter.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((meal) => (
            <div key={meal.idMeal} className="relative">
              <RecipeCard meal={meal} fullMeal={meal} />
              {/* Overlaid remove button */}
              <Button
                variant="destructive"
                size="icon"
                className="absolute bottom-4 right-4 w-7 h-7 opacity-70 hover:opacity-100 transition-opacity"
                onClick={(e) => handleRemove(meal, e)}
                aria-label={`Remove ${meal.strMeal} from favorites`}
              >
                <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
