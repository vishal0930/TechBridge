// src/services/cache.service.js
import redis from '../config/redis.js';

// ─── Get cached value or fetch + cache it ─────────────────────────────────────
export const getOrSet = async (key, ttlSeconds, fetchFn) => {
  try {
    const cached = await redis.get(key);
    if (cached) return JSON.parse(cached);        // CACHE HIT

    const data = await fetchFn();                 // CACHE MISS
    await redis.setex(key, ttlSeconds, JSON.stringify(data));
    return data;
  } catch {
    return await fetchFn();                       // Redis down → fallback to DB
  }
};

// ─── Invalidate by pattern (e.g. analytics:*:userId) ──────────────────────────
export const invalidate = async (pattern) => {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length) await redis.del(...keys);
  } catch {
    // non-critical — log and continue
    console.warn(`Cache invalidation failed for pattern: ${pattern}`);
  }
};

// ─── Invalidate all analytics for a user ──────────────────────────────────────
export const invalidateUserAnalytics = async (userId) => {
  await invalidate(`analytics:*:${userId}*`);
};