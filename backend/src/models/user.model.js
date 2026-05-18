// src/models/user.model.js
import pool from '../config/database.js';

export const createUser = async ({ name, email, hashedPassword }) => {
  const { rows } = await pool.query(
    `INSERT INTO users (name, email, password)
     VALUES ($1, $2, $3)
     RETURNING id, name, email, role, is_active, created_at`,
    [name, email, hashedPassword]
  );
  return rows[0];
};

export const findUserByEmail = async (email) => {
  const { rows } = await pool.query(
    `SELECT * FROM users WHERE email = $1 AND is_active = TRUE`,
    [email]
  );
  return rows[0] || null;
};

export const findUserById = async (id) => {
  const { rows } = await pool.query(
    `SELECT id, name, email, role, is_active, created_at
     FROM users WHERE id = $1 AND is_active = TRUE`,
    [id]
  );
  return rows[0] || null;
};

export const updateUser = async (id, fields) => {
  // Build dynamic SET clause safely
  const keys = Object.keys(fields);
  const values = Object.values(fields);
  const setClause = keys
    .map((key, i) => `${key} = $${i + 1}`)
    .join(', ');

  const { rows } = await pool.query(
    `UPDATE users SET ${setClause}, updated_at = NOW()
     WHERE id = $${keys.length + 1}
     RETURNING id, name, email, role, is_active, updated_at`,
    [...values, id]
  );
  return rows[0];
};