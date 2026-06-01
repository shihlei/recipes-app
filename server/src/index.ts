import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import 'dotenv/config';
import mealdbRouter from './routes/mealdb.js';

const app = express();
const PORT = process.env.PORT ?? 3001;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ?? 'http://localhost:5173';

app.use(helmet());
app.use(compression() as express.RequestHandler);
app.use(cors({ origin: CLIENT_ORIGIN, optionsSuccessStatus: 200 }));
app.use(express.json());

app.use('/api', mealdbRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 fallback
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🍽️  Recipes proxy server → http://localhost:${PORT}`);
  console.log(`   API key present: ${!!process.env.MEALDB_API_KEY}`);
});
