import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';

import { config } from './src/config/env.js';
import { connectRedis } from './src/config/redis.js';
import pool from './src/config/database.js';
import errorHandler from './src/middleware/errorHandler.js';

// Route imports
import authRoutes from './src/routes/auth.routes.js';
import userRoutes from './src/routes/user.routes.js';
import transactionRoutes from './src/routes/transaction.routes.js';
import categoryRoutes from './src/routes/category.routes.js';
import analyticsRoutes from './src/routes/analytics.routes.js';

dotenv.config();

const app = express();

// ─── Security Middleware ───────────────────────────────────────────────────────
app.use(helmet());

const allowedOrigins = [
  'https://tech-bridge-seven.vercel.app',
  'https://tech-bridge-git-main-vishals-projects-c289c590.vercel.app',
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (
      allowedOrigins.includes(origin) ||
      origin.includes('vercel.app')
    ) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// ─── General Middleware ────────────────────────────────────────────────────────
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ──────────────────────────────────────────────────────────────
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');

    res.status(200).json({
      status: 'ok',
      db: 'connected',
      uptime: process.uptime(),
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      db: 'disconnected',
    });
  }
});

// ─── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/analytics', analyticsRoutes);

// ─── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    error: `Route ${req.method} ${req.url} not found`,
  });
});

// ─── Global Error Handler ──────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ──────────────────────────────────────────────────────────────
const start = async () => {
  try {
    await connectRedis();
    await pool.query('SELECT 1');

    console.log('✅ PostgreSQL connected');

    app.listen(config.PORT, () => {
      console.log(`🚀 Server running on port ${config.PORT}`);
      console.log(`📦 Environment: ${config.NODE_ENV}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
};

start();