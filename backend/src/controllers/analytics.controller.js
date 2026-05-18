// src/controllers/analytics.controller.js
import * as analyticsService from '../services/analytics.service.js';
import * as cache            from '../services/cache.service.js';
import { successResponse }   from '../utils/apiResponse.js';

const TTL = 15 * 60;    // 15 minutes for all analytics

// ─── Helper: extract month/year from query (default = current) ─────────────────
const getMonthYear = (query) => ({
  month: parseInt(query.month) || new Date().getMonth() + 1,
  year:  parseInt(query.year)  || new Date().getFullYear(),
});

// ─── GET /api/analytics/summary ───────────────────────────────────────────────
export const summary = async (req, res, next) => {
  try {
    const { month, year } = getMonthYear(req.query);
    const key  = `analytics:summary:${req.user.id}:${year}-${month}`;
    const data = await cache.getOrSet(key, TTL, () =>
      analyticsService.getMonthlySummary(req.user.id, month, year)
    );
    return successResponse(res, data);
  } catch (err) { next(err); }
};

// ─── GET /api/analytics/by-category ───────────────────────────────────────────
export const byCategory = async (req, res, next) => {
  try {
    const { month, year } = getMonthYear(req.query);
    const key  = `analytics:by-category:${req.user.id}:${year}-${month}`;
    const data = await cache.getOrSet(key, TTL, () =>
      analyticsService.getByCategory(req.user.id, month, year)
    );
    return successResponse(res, data);
  } catch (err) { next(err); }
};

// ─── GET /api/analytics/trends ────────────────────────────────────────────────
export const trends = async (req, res, next) => {
  try {
    const key  = `analytics:trends:${req.user.id}`;
    const data = await cache.getOrSet(key, TTL, () =>
      analyticsService.getTrends(req.user.id)
    );
    return successResponse(res, data);
  } catch (err) { next(err); }
};

// ─── GET /api/analytics/income-vs-expense ─────────────────────────────────────
export const incomeVsExpense = async (req, res, next) => {
  try {
    const key  = `analytics:income-vs-expense:${req.user.id}`;
    const data = await cache.getOrSet(key, TTL, () =>
      analyticsService.getIncomeVsExpense(req.user.id)
    );
    return successResponse(res, data);
  } catch (err) { next(err); }
};

// ─── GET /api/analytics/top-categories ────────────────────────────────────────
export const topCategories = async (req, res, next) => {
  try {
    const { month, year } = getMonthYear(req.query);
    const key  = `analytics:top-categories:${req.user.id}:${year}-${month}`;
    const data = await cache.getOrSet(key, TTL, () =>
      analyticsService.getTopCategories(req.user.id, month, year)
    );
    return successResponse(res, data);
  } catch (err) { next(err); }
};