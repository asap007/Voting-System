import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from './types';

// Import route handlers
import { authRoutes } from './routes/auth';
import { formRoutes } from './routes/forms';
import { responseRoutes } from './routes/responses';
import { analyticsRoutes } from './routes/analytics';

const app = new Hono<{ Bindings: Env }>();

// CORS middleware
app.use('/*', cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'https://votehub.vercel.app'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: Date.now() });
});

// Mount routes
app.route('/auth', authRoutes);
app.route('/forms', formRoutes);
app.route('/responses', responseRoutes);
app.route('/analytics', analyticsRoutes);

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Error:', err);
  return c.json({ error: err.message || 'Internal server error' }, 500);
});

export default app;
