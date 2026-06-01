import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Extract non-empty ingredient/measure pairs from a MealDB meal object. */
export function getIngredients(
  meal: Record<string, string | null | undefined>
): Array<{ ingredient: string; measure: string }> {
  const pairs: Array<{ ingredient: string; measure: string }> = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`]?.trim();
    if (ingredient) {
      pairs.push({
        ingredient,
        measure: meal[`strMeasure${i}`]?.trim() ?? '',
      });
    }
  }
  return pairs;
}
