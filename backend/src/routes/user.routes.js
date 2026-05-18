// src/routes/user.routes.js
import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import verifyToken    from '../middleware/auth.js';
import authorizeRoles from '../middleware/authorize.js';
import { updateUserRules, updateMeRules, validate } from '../middleware/validate.js';
import { userLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.use(verifyToken, userLimiter);

// ─── Own profile (any authenticated role) ─────────────────────────────────────
router.patch('/me', updateMeRules, validate, userController.updateMe);

// ─── Admin only ────────────────────────────────────────────────────────────────
router.get(   '/',    authorizeRoles('admin'), userController.getAll);
router.get(   '/:id', authorizeRoles('admin'), userController.getOne);
router.patch( '/:id', authorizeRoles('admin'), updateUserRules, validate, userController.updateUser);
router.delete('/:id', authorizeRoles('admin'), userController.deleteUser);

export default router;