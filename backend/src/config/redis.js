// src/config/redis.js
import Redis from 'ioredis';
import { config } from './env.js';

const redis = new Redis(config.REDIS_URL, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: true,          // don't auto-connect — we call connectRedis() manually
});

// ─── Connection Events ─────────────────────────────────────────────────────────
redis.on('connect',   () => console.log('✅ Redis connected'));
redis.on('error',     (err) => console.error('❌ Redis error:', err.message));
redis.on('close',     () => console.warn('⚠️  Redis connection closed'));
redis.on('reconnecting', () => console.log('🔄 Redis reconnecting...'));

// ─── Connect Function (called from server.js) ──────────────────────────────────
export const connectRedis = async () => {
  try {
    await redis.connect();
  } catch (err) {
    console.warn('⚠️  Could not connect to Redis. Proceeding without cache.', err.message);
  }
};

export default redis;