/**
 * Proxy client — all calls go through /api/* on our Express server.
 * TheMealDB is never called directly from the browser.
 */

export interface Meal {
  idMeal: string;
  strMeal: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strMealThumb: string;
  strTags: string | null;
  strYoutube: string | null;
  strSource: string | null;
  // MealDB packs up to 20 ingredient/measure pairs as numbered fields
  [key: string]: string | null | undefined;
}

export interface Category {
  idCategory: string;
  strCategory: string;
  strCategoryThumb: string;
  strCategoryDescription: string;
}

export interface MealSummary {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
}

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(path);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  searchMeals: (query: string) =>
    apiFetch<{ meals: Meal[] | null }>(`/api/search?s=${encodeURIComponent(query)}`),

  getMeal: (id: string) =>
    apiFetch<{ meals: Meal[] | null }>(`/api/meal/${encodeURIComponent(id)}`),

  getCategories: () =>
    apiFetch<{ categories: Category[] }>('/api/categories'),

  filterByCategory: (category: string) =>
    apiFetch<{ meals: MealSummary[] | null }>(`/api/filter?c=${encodeURIComponent(category)}`),

  getRandom: () =>
    apiFetch<{ meals: Meal[] | null }>('/api/random'),
};
