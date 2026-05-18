// src/models/transaction.model.js
import pool from '../config/database.js';

// ─── Build dynamic WHERE clause from filters ───────────────────────────────────
const buildFilters = (userId, query) => {
  const conditions = ['t.user_id = $1'];
  const values     = [userId];
  let   idx        = 2;

  if (query.type) {
    conditions.push(`t.type = $${idx++}`);
    values.push(query.type);
  }
  if (query.category_id) {
    conditions.push(`t.category_id = $${idx++}`);
    values.push(query.category_id);
  }
  if (query.date_from) {
    conditions.push(`t.date >= $${idx++}`);
    values.push(query.date_from);
  }
  if (query.date_to) {
    conditions.push(`t.date <= $${idx++}`);
    values.push(query.date_to);
  }
  if (query.search) {
    conditions.push(`t.description ILIKE $${idx++}`);
    values.push(`%${query.search}%`);
  }

  return { where: conditions.join(' AND '), values, idx };
};

// ─── LIST with filters + pagination ───────────────────────────────────────────
export const findAll = async (userId, query, limit, offset) => {
  const { where, values, idx } = buildFilters(userId, query);

  const dataQuery = `
    SELECT
      t.id, t.type, t.amount, t.description,
      t.date, t.tags, t.created_at, t.updated_at,
      c.id   AS category_id,
      c.name AS category_name,
      c.icon AS category_icon,
      c.color AS category_color
    FROM transactions t
    JOIN categories c ON c.id = t.category_id
    WHERE ${where}
    ORDER BY t.date DESC, t.created_at DESC
    LIMIT $${idx} OFFSET $${idx + 1}
  `;

  const countQuery = `
    SELECT COUNT(*) FROM transactions t WHERE ${where}
  `;

  const [data, count] = await Promise.all([
    pool.query(dataQuery,  [...values, limit, offset]),
    pool.query(countQuery, values),
  ]);

  return {
    rows:  data.rows,
    total: parseInt(count.rows[0].count),
  };
};

// ─── GET single (must belong to user) ─────────────────────────────────────────
export const findById = async (id, userId) => {
  const { rows } = await pool.query(
    `SELECT
       t.id, t.type, t.amount, t.description,
       t.date, t.tags, t.created_at, t.updated_at,
       c.id   AS category_id,
       c.name AS category_name,
       c.icon AS category_icon,
       c.color AS category_color
     FROM transactions t
     JOIN categories c ON c.id = t.category_id
     WHERE t.id = $1 AND t.user_id = $2`,
    [id, userId]
  );
  return rows[0] || null;
};

// ─── CREATE ────────────────────────────────────────────────────────────────────
export const create = async (userId, { type, amount, category_id, description, date, tags }) => {
  const { rows } = await pool.query(
    `INSERT INTO transactions
       (user_id, category_id, type, amount, description, date, tags)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [userId, category_id, type, amount, description || null, date, tags || []]
  );
  return rows[0];
};

// ─── UPDATE (only own transaction) ────────────────────────────────────────────
export const update = async (id, userId, fields) => {
  const allowed = ['type', 'amount', 'category_id', 'description', 'date', 'tags'];
  const keys    = Object.keys(fields).filter((k) => allowed.includes(k));

  if (keys.length === 0) return null;

  const values    = keys.map((k) => fields[k]);
  const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');

  const { rows } = await pool.query(
    `UPDATE transactions
     SET ${setClause}, updated_at = NOW()
     WHERE id = $${keys.length + 1} AND user_id = $${keys.length + 2}
     RETURNING *`,
    [...values, id, userId]
  );
  return rows[0] || null;
};

// ─── DELETE (only own transaction) ────────────────────────────────────────────
export const remove = async (id, userId) => {
  const { rows } = await pool.query(
    `DELETE FROM transactions
     WHERE id = $1 AND user_id = $2
     RETURNING id`,
    [id, userId]
  );
  return rows[0] || null;
};

// ─── EXPORT — all rows for CSV (no pagination) ────────────────────────────────
export const findAllForExport = async (userId, query) => {
  const { where, values } = buildFilters(userId, query);
  const { rows } = await pool.query(
    `SELECT
       t.id, t.type, t.amount, t.description,
       t.date, t.tags,
       c.name AS category
     FROM transactions t
     JOIN categories c ON c.id = t.category_id
     WHERE ${where}
     ORDER BY t.date DESC`,
    values
  );
  return rows;
};