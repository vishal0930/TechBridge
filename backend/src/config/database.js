// src/config/database.js
import pg from 'pg';
import { config } from './env.js';

const { Pool } = pg;

const pool = new Pool({
  host:     config.DB_HOST,
  port:     config.DB_PORT,
  database: config.DB_NAME,
  user:     config.DB_USER,
  password: config.DB_PASSWORD,
  max: 10,                  // max connections in pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ PostgreSQL connection error:', err.message);
  } else {
    console.log('✅ PostgreSQL connected');
    release();
  }
});

export default pool;