// src/controllers/user.controller.js
import pool               from '../config/database.js';
import * as cache         from '../services/cache.service.js';
import * as authService   from '../services/auth.service.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { getPagination, buildMeta }       from '../utils/pagination.js';

// ─── GET /api/users  (admin only) ─────────────────────────────────────────────
export const getAll = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const search = req.query.search || '';
    const role   = req.query.role   || '';

    // Build dynamic filters
    const conditions = ['is_active = TRUE'];
    const values     = [];
    let   idx        = 1;

    if (search) {
      conditions.push(`(name ILIKE $${idx} OR email ILIKE $${idx})`);
      values.push(`%${search}%`);
      idx++;
    }
    if (role) {
      conditions.push(`role = $${idx++}`);
      values.push(role);
    }

    const where = conditions.join(' AND ');

    const [data, count] = await Promise.all([
      pool.query(
        `SELECT id, name, email, role, is_active, created_at
         FROM users
         WHERE ${where}
         ORDER BY created_at DESC
         LIMIT $${idx} OFFSET $${idx + 1}`,
        [...values, limit, offset]
      ),
      pool.query(
        `SELECT COUNT(*) FROM users WHERE ${where}`,
        values
      ),
    ]);

    const meta = buildMeta(parseInt(count.rows[0].count), page, limit);
    return successResponse(res, data.rows, 200, meta);
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/users/:id  (admin only) ─────────────────────────────────────────
export const getOne = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT
         u.id, u.name, u.email, u.role, u.is_active, u.created_at,
         COUNT(t.id)::int                        AS total_transactions,
         COALESCE(SUM(CASE WHEN t.type='income'  THEN t.amount END), 0) AS total_income,
         COALESCE(SUM(CASE WHEN t.type='expense' THEN t.amount END), 0) AS total_expense
       FROM users u
       LEFT JOIN transactions t ON t.user_id = u.id
       WHERE u.id = $1
       GROUP BY u.id`,
      [req.params.id]
    );

    if (!rows[0]) return errorResponse(res, 'User not found', 404);
    return successResponse(res, rows[0]);
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/users/:id  (admin only — update role / status) ────────────────
export const updateUser = async (req, res, next) => {
  try {
    const { role, is_active } = req.body;

    // Prevent admin from demoting themselves
    if (req.params.id === req.user.id && role && role !== 'admin') {
      return errorResponse(res, 'You cannot change your own role', 403);
    }

    const allowed  = {};
    if (role      !== undefined) allowed.role      = role;
    if (is_active !== undefined) allowed.is_active = is_active;

    if (Object.keys(allowed).length === 0) {
      return errorResponse(res, 'No valid fields to update', 400);
    }

    const keys      = Object.keys(allowed);
    const values    = Object.values(allowed);
    const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');

    const { rows } = await pool.query(
      `UPDATE users
       SET ${setClause}, updated_at = NOW()
       WHERE id = $${keys.length + 1}
       RETURNING id, name, email, role, is_active, updated_at`,
      [...values, req.params.id]
    );

    if (!rows[0]) return errorResponse(res, 'User not found', 404);

    // Bust profile cache for this user
    await cache.invalidate(`user:profile:${req.params.id}`);
    return successResponse(res, rows[0]);
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/users/:id  (admin only — soft delete) ────────────────────────
export const deleteUser = async (req, res, next) => {
  try {
    // Prevent admin from deleting themselves
    if (req.params.id === req.user.id) {
      return errorResponse(res, 'You cannot delete your own account', 403);
    }

    const { rows } = await pool.query(
      `UPDATE users
       SET is_active = FALSE, updated_at = NOW()
       WHERE id = $1 AND is_active = TRUE
       RETURNING id, name, email`,
      [req.params.id]
    );

    if (!rows[0]) return errorResponse(res, 'User not found or already inactive', 404);

    await cache.invalidate(`user:profile:${req.params.id}`);
    return successResponse(res, {
      message: `User ${rows[0].name} deactivated`,
      id:      rows[0].id,
    });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/users/me  (own profile — any auth role) ───────────────────────
export const updateMe = async (req, res, next) => {
  try {
    const { name, password } = req.body;
    const updates = {};

    if (name) {
      if (name.trim().length < 2) {
        return errorResponse(res, 'Name must be at least 2 characters', 422);
      }
      updates.name = name.trim();
    }

    if (password) {
      if (password.length < 8) {
        return errorResponse(res, 'Password min 8 characters', 422);
      }
      if (!/[A-Z]/.test(password)) {
        return errorResponse(res, 'Password must contain at least one uppercase letter', 422);
      }
      if (!/[0-9]/.test(password)) {
        return errorResponse(res, 'Password must contain at least one number', 422);
      }
      updates.password = await authService.hashPassword(password);
    }

    if (Object.keys(updates).length === 0) {
      return errorResponse(res, 'Nothing to update — send name or password', 400);
    }

    const keys      = Object.keys(updates);
    const values    = Object.values(updates);
    const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');

    const { rows } = await pool.query(
      `UPDATE users
       SET ${setClause}, updated_at = NOW()
       WHERE id = $${keys.length + 1}
       RETURNING id, name, email, role, updated_at`,
      [...values, req.user.id]
    );

    // Bust own profile cache
    await cache.invalidate(`user:profile:${req.user.id}`);
    return successResponse(res, rows[0]);
  } catch (err) {
    next(err);
  }
};