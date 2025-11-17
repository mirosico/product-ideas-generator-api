import express from 'express';
import { env } from './shared/config/env.js';
import { logger } from './shared/utils/logger.js';
import { errorHandler } from './shared/middleware/error.middleware.js';
import authRoutes from './auth/auth.routes.js';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }

  next();
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = parseInt(env.PORT, 10);

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`, {
    env: env.NODE_ENV,
    port: PORT,
  });
});

export default app;
