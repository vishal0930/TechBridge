// src/routes/auth.routes.js
import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { registerRules, loginRules, validate } from '../middleware/validate.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import verifyToken from '../middleware/auth.js';

const router = Router();

router.post('/register', authLimiter, registerRules, validate, authController.register);
router.post('/login',    authLimiter, loginRules,    validate, authController.login);
router.post('/refresh',  authLimiter,                          authController.refresh);
router.post('/logout',   verifyToken,                          authController.logout);
router.get('/me',        verifyToken,                          authController.me);

export default router;