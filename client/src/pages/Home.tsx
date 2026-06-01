import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import RecipeCard from '@/components/RecipeCard';
import CategoryChip from '@/components/CategoryChip';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Fetch all categories for the chip bar
  const { data: catData, isLoading: catLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: api.getCategories,
    staleTime: 1000 * 60 * 10,
  });

  // Search results (used when no category is selected)
  const {
    data: searchData,
    isLoading: searchLoading,
    error: searchError,
  } = useQuery({
    queryKey: ['search', query || 'a'],
    // Default browse: search for "a" to get a variety of meals
    queryFn: () => api.searchMeals(query || 'a'),
    enabled: activeCategory === null,
  });

  // Category filter results
  const { data: filterData, isLoading: filterLoading } = useQuery({
    queryKey: ['filter', activeCategory],
    queryFn: () => api.filterByCategory(activeCategory!),
    enabled: activeCategory !== null,
  });

  const meals     = activeCategory ? filterData?.meals : searchData?.meals;
  const isLoading = activeCategory ? filterLoading : searchLoading;

  const toggleCategory = (cat: string) =>
    setActiveCategory((prev) => (prev === cat ? null : cat));

  return (
    <div className="space-y-8">
      {/* Heading */}
      {query && !activeCategory && (
        <h1 className="text-2xl font-bold">
          Results for &ldquo;<span className="text-primary">{query}</span>&rdquo;
        </h1>
      )}

      {/* Category chips */}
      <section aria-labelledby="categories-heading">
        <h2
          id="categories-heading"
          className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3"
        >
          Browse by Category
        </h2>
        <ul className="flex flex-wrap gap-2" aria-label="Meal categories">
          <CategoryChip label="All" active={activeCategory === null} onClick={() => setActiveCategory(null)} />
          {catLoading
            ? Array.from({ length: 14 }).map((_, i) => (
                <li key={i} style={{ listStyle: 'none', display: 'inline' }}>
                  <Skeleton className="h-9 w-20 rounded-full" />
                </li>
              ))
            : catData?.categories.map((cat) => (
                <CategoryChip
                  key={cat.idCategory}
                  label={cat.strCategory}
                  active={activeCategory === cat.strCategory}
                  onClick={() => toggleCategory(cat.strCategory)}
                />
              ))}
        </ul>
      </section>

      {/* Results grid */}
      <section aria-labelledby="results-heading" aria-live="polite" aria-busy={isLoading}>
        <h2 id="results-heading" className="sr-only">Recipe results</h2>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : searchError ? (
          <div role="alert" className="py-16 text-center text-destructive">
            <p className="text-lg font-medium">Failed to load recipes</p>
            <p className="text-sm text-muted-foreground mt-1">Check your connection and try again.</p>
          </div>
        ) : !meals || meals.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            <p className="text-4xl mb-4" aria-hidden="true">🍽️</p>
            <p className="text-lg font-semibold">No recipes found</p>
            <p className="text-sm mt-1">Try a different search or pick another category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {meals.map((meal) => (
              <RecipeCard key={meal.idMeal} meal={meal} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="rounded-lg border overflow-hidden" aria-hidden="true">
      <Skeleton className="aspect-video w-full" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}
