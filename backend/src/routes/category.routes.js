// src/routes/category.routes.js
import { Router } from 'express';
import * as categoryController from '../controllers/category.controller.js';
import verifyToken    from '../middleware/auth.js';
import authorizeRoles from '../middleware/authorize.js';
import { categoryRules, categoryUpdateRules, validate } from '../middleware/validate.js';
import { categoryLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.use(verifyToken, categoryLimiter);

router.get(   '/',    categoryController.getAll);
router.post(  '/',    authorizeRoles('admin'), categoryRules,       validate, categoryController.create);
router.patch( '/:id', authorizeRoles('admin'), categoryUpdateRules, validate, categoryController.update);
router.delete('/:id', authorizeRoles('admin'), categoryController.remove);

export default router;