// src/routes/transaction.routes.js
import { Router } from 'express';
import * as txController from '../controllers/transaction.controller.js';
import verifyToken        from '../middleware/auth.js';
import authorizeRoles     from '../middleware/authorize.js';
import { transactionRules, transactionUpdateRules, validate } from '../middleware/validate.js';
import { transactionLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// All transaction routes require a valid JWT
router.use(verifyToken, transactionLimiter);

router.get(  '/',        txController.getAll);
router.get(  '/export',  authorizeRoles('admin', 'user'), txController.exportCSV);
router.get(  '/:id',     txController.getOne);
router.post( '/',        authorizeRoles('admin', 'user'), transactionRules,       validate, txController.create);
router.patch('/:id',     authorizeRoles('admin', 'user'), transactionUpdateRules, validate, txController.update);
router.delete('/:id',    authorizeRoles('admin', 'user'), txController.remove);

export default router;