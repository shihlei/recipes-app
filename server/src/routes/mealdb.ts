import { Router, type Request, type Response } from 'express';

const router = Router();

const API_BASE = process.env.MEALDB_API_BASE ?? 'https://www.themealdb.com/api/json/v1';
// MEALDB_API_KEY stays server-side only — clients never see it
const API_KEY = process.env.MEALDB_API_KEY ?? '1';

// ── Simple in-memory TTL cache ────────────────────────────────────────────────
interface CacheEntry {
  data: unknown;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();
const TTL_MS = 5 * 60 * 1000; // 5 minutes

function getCached(key: string): unknown | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key: string, data: unknown): void {
  cache.set(key, { data, expiresAt: Date.now() + TTL_MS });
}

// Forwards a path fragment to the upstream MealDB API with the key injected
async function proxyFetch(fragment: string): Promise<unknown> {
  const url = `${API_BASE}/${API_KEY}/${fragment}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Upstream ${res.status}: ${res.statusText}`);
  return res.json();
}

// ── Routes ────────────────────────────────────────────────────────────────────

// GET /api/search?s=chicken
router.get('/search', async (req: Request, res: Response) => {
  const q = String(req.query.s ?? '').trim();
  if (!q) return void res.status(400).json({ error: 'Missing query param ?s=' });

  try {
    const data = await proxyFetch(`search.php?s=${encodeURIComponent(q)}`);
    res.set('Cache-Control', 'public, max-age=60');
    res.json(data);
  } catch (err) {
    console.error('[search]', err);
    res.status(502).json({ error: 'Failed to fetch search results' });
  }
});

// GET /api/meal/:id
router.get('/meal/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const cacheKey = `meal:${id}`;
  const hit = getCached(cacheKey);
  if (hit) return void res.set('X-Cache', 'HIT').json(hit);

  try {
    const data = await proxyFetch(`lookup.php?i=${encodeURIComponent(id)}`);
    setCache(cacheKey, data);
    res.set('Cache-Control', 'public, max-age=300');
    res.json(data);
  } catch (err) {
    console.error('[meal]', err);
    res.status(502).json({ error: 'Failed to fetch meal details' });
  }
});

// GET /api/categories   — long TTL: category list rarely changes
router.get('/categories', async (_req: Request, res: Response) => {
  const cacheKey = 'categories';
  const hit = getCached(cacheKey);
  if (hit) return void res.set('X-Cache', 'HIT').json(hit);

  try {
    const data = await proxyFetch('categories.php');
    setCache(cacheKey, data);
    res.set('Cache-Control', 'public, max-age=600');
    res.json(data);
  } catch (err) {
    console.error('[categories]', err);
    res.status(502).json({ error: 'Failed to fetch categories' });
  }
});

// GET /api/filter?c=Seafood
router.get('/filter', async (req: Request, res: Response) => {
  const category = String(req.query.c ?? '').trim();
  if (!category) return void res.status(400).json({ error: 'Missing query param ?c=' });

  const cacheKey = `filter:${category}`;
  const hit = getCached(cacheKey);
  if (hit) return void res.set('X-Cache', 'HIT').json(hit);

  try {
    const data = await proxyFetch(`filter.php?c=${encodeURIComponent(category)}`);
    setCache(cacheKey, data);
    res.set('Cache-Control', 'public, max-age=300');
    res.json(data);
  } catch (err) {
    console.error('[filter]', err);
    res.status(502).json({ error: 'Failed to fetch category meals' });
  }
});

// GET /api/random
router.get('/random', async (_req: Request, res: Response) => {
  try {
    const data = await proxyFetch('random.php');
    res.json(data);
  } catch (err) {
    console.error('[random]', err);
    res.status(502).json({ error: 'Failed to fetch random meal' });
  }
});

export default router;
