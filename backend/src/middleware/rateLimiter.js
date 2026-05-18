// src/middleware/rateLimiter.js
import rateLimit from 'express-rate-limit';

const make = (max, windowMinutes) =>
  rateLimit({
    max,
    windowMs: windowMinutes * 60 * 1000,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: '429 Too Many Requests — slow down' },
  });

export const authLimiter        = make(5,   15);   // 5  / 15 min
export const transactionLimiter = make(100,  60);  // 100 / 1 hr
export const analyticsLimiter   = make(50,   60);  // 50  / 1 hr
export const userLimiter        = make(30,   60);  // 30  / 1 hr
export const categoryLimiter    = make(60,   60);  // 60  / 1 hr