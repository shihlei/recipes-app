# RecipeBox PWA

Browse and save recipes from [TheMealDB](https://www.themealdb.com/) — installable, works offline.

## Stack

- **Client** — React 18, Vite, TypeScript, Tailwind, shadcn/ui, TanStack Query
- **Server** — Node.js, Express, TypeScript (API key proxy)
- **Offline** — Manual service worker + IndexedDB favorites

## Quick Start

```bash
# Terminal 1 — server (port 3001)
cd server && cp .env.example .env && npm install && npm run dev

# Terminal 2 — client (port 5173)
cd client && npm install && npm run dev
```

Open **http://localhost:5173**

## Environment Variables (`server/.env`)

| Variable          | Default                                 |
|-------------------|-----------------------------------------|
| `MEALDB_API_KEY`  | `1`                                     |
| `MEALDB_API_BASE` | `https://www.themealdb.com/api/json/v1` |
| `PORT`            | `3001`                                  |
| `CLIENT_ORIGIN`   | `http://localhost:5173`                 |

## Deployment

- **Server** → [Render](https://render.com) — set env vars in dashboard, update `CLIENT_ORIGIN` to your client URL
- **Client** → Netlify / Vercel — run `cd client && npm run build`, deploy the `dist/` folder

Add a SPA fallback for Netlify:

```toml
# netlify.toml
[[redirects]]
  from = "/*"
  to   = "/index.html"
  status = 200
```
