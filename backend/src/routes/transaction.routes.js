// src/routes/transaction.routes.js
import { Router } from 'express';
import * as txController from '../controllers/transaction.controller.js';
import verifyToken        from '../middleware/auth.js';
import authorizeRoles     from '../middleware/authorize.js';
import { transactionRules, transactionUpdateRules, validate } from '../middleware/validate.js';
import { transactionLimiter } from '../middleware/rateLimiter.js';

const router = Router();



// Protect all routes
router.use(verifyToken, transactionLimiter);

router.get('/', txController.getAll);

router.get(
  '/export',
  authorizeRoles('admin', 'user'),
  txController.exportCSV
);

router.get('/:id', txController.getOne);

// CREATE → admin + user
router.post(
  '/',
  authorizeRoles('admin', 'user'),
  transactionRules,
  validate,
  txController.create
);

// UPDATE → admin only
router.patch(
  '/:id',
  authorizeRoles('admin'),
  transactionUpdateRules,
  validate,
  txController.update
);

// DELETE → admin only
router.delete(
  '/:id',
  authorizeRoles('admin'),
  txController.remove
);


export default router;