// src/routes/analytics.routes.js
import { Router } from 'express';
import * as analyticsController from '../controllers/analytics.controller.js';
import verifyToken from '../middleware/auth.js';
import { analyticsLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.use(verifyToken, analyticsLimiter);   // all roles can access analytics

router.get('/summary',           analyticsController.summary);
router.get('/by-category',       analyticsController.byCategory);
router.get('/trends',            analyticsController.trends);
router.get('/income-vs-expense', analyticsController.incomeVsExpense);
router.get('/top-categories',    analyticsController.topCategories);

export default router;