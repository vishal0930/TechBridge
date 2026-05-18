// src/config/env.js
import dotenv from 'dotenv';
dotenv.config();

const required = ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'DB_PASSWORD'];
required.forEach((key) => {
  if (!process.env[key]) {
    console.error(`❌ Missing required env var: ${key}`);
    process.exit(1);
  }
});

export const config = {
  PORT:               process.env.PORT              || 5000,
  NODE_ENV:           process.env.NODE_ENV          || 'development',
  CLIENT_URL:         process.env.CLIENT_URL        || 'http://localhost:3000',

  // PostgreSQL
  DB_HOST:            process.env.DB_HOST           || 'localhost',
  DB_PORT:            Number(process.env.DB_PORT)   || 5432,
  DB_NAME:            process.env.DB_NAME           || 'finance_tracker',
  DB_USER:            process.env.DB_USER           || 'postgres',
  DB_PASSWORD:        process.env.DB_PASSWORD,

  // JWT
  JWT_SECRET:         process.env.JWT_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_EXPIRES_IN:     '15m',
  JWT_REFRESH_EXPIRES_IN: '7d',

  // Redis
  REDIS_URL:          process.env.REDIS_URL         || 'redis://localhost:6379',
};