// src/middleware/validate.js
import { body, validationResult } from 'express-validator';

// ─── Reusable validation runner ────────────────────────────────────────────────
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  next();
};

// ─── Auth rules ────────────────────────────────────────────────────────────────
export const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password min 8 characters')
    .matches(/[A-Z]/).withMessage('Must contain uppercase')
    .matches(/[0-9]/).withMessage('Must contain a number'),
];

export const loginRules = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

// Add to src/middleware/validate.js

export const transactionRules = [
  body('type')
    .isIn(['income', 'expense'])
    .withMessage('Type must be income or expense'),
  body('amount')
    .isFloat({ gt: 0 })
    .withMessage('Amount must be greater than 0'),
  body('category_id')
    .isInt()
    .withMessage('Valid category_id integer required'),
  body('date')
    .isDate()
    .withMessage('Valid date required (YYYY-MM-DD)'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description max 500 chars'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
];

export const transactionUpdateRules = [
  body('type')
    .optional()
    .isIn(['income', 'expense']),
  body('amount')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('Amount must be greater than 0'),
  body('category_id')
    .optional()
    .isInt(),
  body('date')
    .optional()
    .isDate(),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }),
  body('tags')
    .optional()
    .isArray(),
];

// Add to src/middleware/validate.js

export const categoryRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 80 }).withMessage('Name max 80 chars'),
  body('type')
    .isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('icon')
    .optional()
    .trim()
    .isLength({ max: 50 }),
  body('color')
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Color must be a valid hex e.g. #FF5733'),
];

export const categoryUpdateRules = [
  body('name')
    .optional()
    .trim()
    .isLength({ max: 80 }),
  body('type')
    .optional()
    .isIn(['income', 'expense']),
  body('icon')
    .optional()
    .trim()
    .isLength({ max: 50 }),
  body('color')
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/),
];

// Add to src/middleware/validate.js

export const updateUserRules = [
  body('role')
    .optional()
    .isIn(['admin', 'user', 'read-only'])
    .withMessage('Role must be admin, user, or read-only'),
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active must be true or false'),
];

export const updateMeRules = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be 2–100 characters'),
  body('password')
    .optional()
    .isLength({ min: 8 })
    .withMessage('Password min 8 characters')
    .matches(/[A-Z]/).withMessage('Must contain uppercase')
    .matches(/[0-9]/).withMessage('Must contain a number'),
];