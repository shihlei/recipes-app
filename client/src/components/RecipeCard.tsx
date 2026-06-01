import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import type { Meal, MealSummary } from '@/lib/api';
import { saveFavorite, removeFavorite, isFavorite } from '@/features/favorites/db';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Props {
  meal: Meal | MealSummary;
  /** Pass a full Meal when available so we can save it directly to favorites. */
  fullMeal?: Meal;
}

export default function RecipeCard({ meal, fullMeal }: Props) {
  const [fav, setFav] = useState(false);
  const isFull = 'strCategory' in meal;
  const saveable = fullMeal ?? (isFull ? (meal as Meal) : null);

  useEffect(() => {
    isFavorite(meal.idMeal).then(setFav);
  }, [meal.idMeal]);

  const toggleFav = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (fav) {
        await removeFavorite(meal.idMeal);
        setFav(false);
        toast({ title: 'Removed from favorites' });
      } else if (saveable) {
        await saveFavorite(saveable);
        setFav(true);
        toast({ title: '❤️ Saved!', description: saveable.strMeal });
      } else {
        toast({
          title: 'Open the recipe first',
          description: 'View the full recipe to save it to favorites.',
          variant: 'destructive',
        });
      }
    },
    [fav, meal.idMeal, saveable]
  );

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-shadow focus-within:ring-2 focus-within:ring-ring">
      <Link
        to={`/meal/${meal.idMeal}`}
        className="block focus-visible:outline-none"
        aria-label={`View recipe for ${meal.strMeal}`}
      >
        <div className="relative aspect-video overflow-hidden bg-muted">
          <img
            src={meal.strMealThumb}
            alt={`Photo of ${meal.strMeal}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            decoding="async"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm hover:bg-background/95 h-8 w-8"
            onClick={toggleFav}
            aria-label={fav ? `Remove ${meal.strMeal} from favorites` : `Save ${meal.strMeal} to favorites`}
            aria-pressed={fav}
          >
            <Heart
              className={cn('w-4 h-4 transition-colors', fav ? 'fill-red-500 text-red-500' : 'text-muted-foreground')}
              aria-hidden="true"
            />
          </Button>
        </div>

        <CardContent className="p-3">
          <h3 className="font-semibold text-sm leading-snug line-clamp-2 mb-2">
            {meal.strMeal}
          </h3>
          {isFull && (
            <div className="flex flex-wrap gap-1">
              {(meal as Meal).strCategory && (
                <Badge variant="secondary" className="text-xs">
                  {(meal as Meal).strCategory}
                </Badge>
              )}
              {(meal as Meal).strArea && (
                <Badge variant="outline" className="text-xs">
                  {(meal as Meal).strArea}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Link>
    </Card>
  );
}
