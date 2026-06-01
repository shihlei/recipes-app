import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ExternalLink, Heart, Youtube } from 'lucide-react';
import { api } from '@/lib/api';
import { getIngredients } from '@/lib/utils';
import { saveFavorite, removeFavorite, isFavorite } from '@/features/favorites/db';
import { toast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export default function Details() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [fav, setFav] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['meal', id],
    queryFn: () => api.getMeal(id!),
    enabled: !!id,
  });

  const meal = data?.meals?.[0];

  useEffect(() => {
    if (meal) isFavorite(meal.idMeal).then(setFav);
  }, [meal]);

  // Update document title for accessibility and PWA display
  useEffect(() => {
    if (meal) document.title = `${meal.strMeal} — RecipeBox`;
    return () => { document.title = 'RecipeBox'; };
  }, [meal]);

  const toggleFav = async () => {
    if (!meal) return;
    if (fav) {
      await removeFavorite(meal.idMeal);
      setFav(false);
      toast({ title: 'Removed from favorites' });
    } else {
      await saveFavorite(meal);
      setFav(true);
      toast({ title: '❤️ Saved to favorites!', description: meal.strMeal });
    }
  };

  if (isLoading) return <DetailsSkeleton />;

  if (error || !meal) {
    return (
      <div role="alert" className="text-center py-24 space-y-4">
        <p className="text-5xl" aria-hidden="true">😕</p>
        <p className="text-lg font-semibold text-destructive">Recipe not found</p>
        <p className="text-sm text-muted-foreground">
          It may be unavailable offline. Try viewing it when you're connected.
        </p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
          Go Back
        </Button>
      </div>
    );
  }

  const ingredients = getIngredients(meal as Record<string, string | null | undefined>);
  const tags = meal.strTags?.split(',').map((t) => t.trim()).filter(Boolean) ?? [];

  return (
    <article className="max-w-4xl mx-auto space-y-10">
      {/* Top bar */}
      <div className="flex items-start gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          aria-label="Go back"
          className="shrink-0 mt-1"
        >
          <ArrowLeft className="w-5 h-5" aria-hidden="true" />
        </Button>

        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold leading-tight">{meal.strMeal}</h1>
          <div className="flex flex-wrap gap-2 mt-2">
            {meal.strCategory && <Badge>{meal.strCategory}</Badge>}
            {meal.strArea     && <Badge variant="outline">{meal.strArea}</Badge>}
            {tags.map((t)    => <Badge key={t} variant="secondary">{t}</Badge>)}
          </div>
        </div>

        <Button
          variant={fav ? 'default' : 'outline'}
          size="sm"
          onClick={toggleFav}
          aria-label={fav ? 'Remove from favorites' : 'Save to favorites'}
          aria-pressed={fav}
          className="shrink-0"
        >
          <Heart className={cn('w-4 h-4 mr-2', fav && 'fill-current')} aria-hidden="true" />
          {fav ? 'Saved' : 'Save'}
        </Button>
      </div>

      {/* Image + Ingredients */}
      <div className="grid md:grid-cols-2 gap-8 items-start">
        <figure className="m-0">
          <img
            src={meal.strMealThumb}
            alt={`Photo of ${meal.strMeal}`}
            className="w-full rounded-xl object-cover aspect-square shadow-md"
          />
        </figure>

        <section aria-labelledby="ingredients-heading">
          <h2 id="ingredients-heading" className="text-xl font-semibold mb-4">
            Ingredients
          </h2>
          <ul className="divide-y divide-border" aria-label="Ingredient list">
            {ingredients.map(({ ingredient, measure }) => (
              <li
                key={ingredient}
                className="flex justify-between items-center py-2 text-sm"
              >
                <span className="font-medium">{ingredient}</span>
                <span className="text-muted-foreground">{measure}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Instructions */}
      <section aria-labelledby="instructions-heading">
        <h2 id="instructions-heading" className="text-xl font-semibold mb-4">
          Instructions
        </h2>
        <div className="space-y-4 text-sm leading-relaxed text-foreground">
          {meal.strInstructions
            .split('\n')
            .map((p) => p.trim())
            .filter(Boolean)
            .map((para, i) => (
              <p key={i}>{para}</p>
            ))}
        </div>
      </section>

      {/* External links */}
      {(meal.strYoutube || meal.strSource) && (
        <section aria-label="External links" className="flex flex-wrap gap-3">
          {meal.strYoutube && (
            <Button variant="outline" asChild>
              <a href={meal.strYoutube} target="_blank" rel="noopener noreferrer">
                <Youtube className="w-4 h-4 mr-2 text-red-600" aria-hidden="true" />
                Watch on YouTube
              </a>
            </Button>
          )}
          {meal.strSource && (
            <Button variant="outline" asChild>
              <a href={meal.strSource} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" aria-hidden="true" />
                Original Recipe
              </a>
            </Button>
          )}
        </section>
      )}
    </article>
  );
}

function DetailsSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-10" aria-busy="true" aria-label="Loading recipe">
      <div className="flex items-start gap-4">
        <Skeleton className="w-10 h-10 rounded-md shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-5 w-1/3" />
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-8">
        <Skeleton className="aspect-square rounded-xl" />
        <div className="space-y-3 pt-12">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-full" />
          ))}
        </div>
      </div>
      <div className="space-y-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
    </div>
  );
}
