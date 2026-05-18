// src/models/category.model.js
import pool from '../config/database.js';

// ─── LIST all ──────────────────────────────────────────────────────────────────
export const findAll = async () => {
  const { rows } = await pool.query(
    `SELECT
       c.id, c.name, c.type, c.icon, c.color,
       c.created_at,
       u.name AS created_by_name
     FROM categories c
     LEFT JOIN users u ON u.id = c.created_by
     ORDER BY c.type, c.name ASC`
  );
  return rows;
};

// ─── GET single ────────────────────────────────────────────────────────────────
export const findById = async (id) => {
  const { rows } = await pool.query(
    `SELECT * FROM categories WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
};

// ─── CHECK duplicate name + type ──────────────────────────────────────────────
export const findByNameAndType = async (name, type) => {
  const { rows } = await pool.query(
    `SELECT id FROM categories WHERE LOWER(name) = LOWER($1) AND type = $2`,
    [name, type]
  );
  return rows[0] || null;
};

// ─── CREATE ────────────────────────────────────────────────────────────────────
export const create = async ({ name, type, icon, color, created_by }) => {
  const { rows } = await pool.query(
    `INSERT INTO categories (name, type, icon, color, created_by)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [name, type, icon || null, color || null, created_by]
  );
  return rows[0];
};

// ─── UPDATE ────────────────────────────────────────────────────────────────────
export const update = async (id, fields) => {
  const allowed = ['name', 'type', 'icon', 'color'];
  const keys    = Object.keys(fields).filter((k) => allowed.includes(k));
  if (keys.length === 0) return null;

  const values    = keys.map((k) => fields[k]);
  const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');

  const { rows } = await pool.query(
    `UPDATE categories SET ${setClause}
     WHERE id = $${keys.length + 1}
     RETURNING *`,
    [...values, id]
  );
  return rows[0] || null;
};

// ─── DELETE ────────────────────────────────────────────────────────────────────
export const remove = async (id) => {
  // Check if any transactions use this category first
  const { rows: txCheck } = await pool.query(
    `SELECT COUNT(*) FROM transactions WHERE category_id = $1`,
    [id]
  );
  if (parseInt(txCheck[0].count) > 0) {
    throw Object.assign(
      new Error('Cannot delete category with existing transactions'),
      { status: 409 }
    );
  }

  const { rows } = await pool.query(
    `DELETE FROM categories WHERE id = $1 RETURNING id, name`,
    [id]
  );
  return rows[0] || null;
};