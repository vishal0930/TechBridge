// src/services/analytics.service.js
import pool from '../config/database.js';

// ─── Monthly summary: income, expense, net ─────────────────────────────────────
export const getMonthlySummary = async (userId, month, year) => {
  const { rows } = await pool.query(
    `SELECT
       type,
       COALESCE(SUM(amount), 0) AS total
     FROM transactions
     WHERE user_id = $1
       AND EXTRACT(MONTH FROM date) = $2
       AND EXTRACT(YEAR  FROM date) = $3
     GROUP BY type`,
    [userId, month, year]
  );

  const income  = parseFloat(rows.find((r) => r.type === 'income')?.total  || 0);
  const expense = parseFloat(rows.find((r) => r.type === 'expense')?.total || 0);

  // Previous month for % change
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear  = month === 1 ? year - 1 : year;

  const { rows: prev } = await pool.query(
    `SELECT type, COALESCE(SUM(amount), 0) AS total
     FROM transactions
     WHERE user_id = $1
       AND EXTRACT(MONTH FROM date) = $2
       AND EXTRACT(YEAR  FROM date) = $3
     GROUP BY type`,
    [userId, prevMonth, prevYear]
  );

  const prevIncome  = parseFloat(prev.find((r) => r.type === 'income')?.total  || 0);
  const prevExpense = parseFloat(prev.find((r) => r.type === 'expense')?.total || 0);

  const pctChange = (curr, prev) =>
    prev === 0 ? null : (((curr - prev) / prev) * 100).toFixed(2);

  return {
    month, year,
    income,
    expense,
    net: income - expense,
    changes: {
      income:  pctChange(income,  prevIncome),
      expense: pctChange(expense, prevExpense),
    },
  };
};

// ─── Expense breakdown by category (pie chart) ─────────────────────────────────
export const getByCategory = async (userId, month, year) => {
  const { rows } = await pool.query(
    `SELECT
       c.id,
       c.name,
       c.color,
       c.icon,
       COALESCE(SUM(t.amount), 0)                        AS total,
       ROUND(
         COALESCE(SUM(t.amount), 0) /
         NULLIF(SUM(SUM(t.amount)) OVER (), 0) * 100, 2
       )                                                  AS percentage
     FROM transactions t
     JOIN categories c ON c.id = t.category_id
     WHERE t.user_id = $1
       AND t.type = 'expense'
       AND EXTRACT(MONTH FROM t.date) = $2
       AND EXTRACT(YEAR  FROM t.date) = $3
     GROUP BY c.id, c.name, c.color, c.icon
     ORDER BY total DESC`,
    [userId, month, year]
  );
  return rows;
};

// ─── 12-month trend (line chart) ───────────────────────────────────────────────
export const getTrends = async (userId) => {
  const { rows } = await pool.query(
    `SELECT
       TO_CHAR(DATE_TRUNC('month', date), 'YYYY-MM') AS month,
       type,
       COALESCE(SUM(amount), 0)                       AS total
     FROM transactions
     WHERE user_id = $1
       AND date >= DATE_TRUNC('month', NOW()) - INTERVAL '11 months'
     GROUP BY DATE_TRUNC('month', date), type
     ORDER BY DATE_TRUNC('month', date) ASC`,
    [userId]
  );

  // Reshape into [ { month, income, expense, net } ]
  const map = {};
  rows.forEach(({ month, type, total }) => {
    if (!map[month]) map[month] = { month, income: 0, expense: 0 };
    map[month][type] = parseFloat(total);
  });

  return Object.values(map).map((m) => ({
    ...m,
    net: m.income - m.expense,
  }));
};

// ─── Income vs Expense monthly (bar chart) ─────────────────────────────────────
export const getIncomeVsExpense = async (userId) => {
  const { rows } = await pool.query(
    `SELECT
       TO_CHAR(DATE_TRUNC('month', date), 'YYYY-MM') AS month,
       COALESCE(SUM(CASE WHEN type='income'  THEN amount END), 0) AS income,
       COALESCE(SUM(CASE WHEN type='expense' THEN amount END), 0) AS expense
     FROM transactions
     WHERE user_id = $1
       AND date >= DATE_TRUNC('month', NOW()) - INTERVAL '11 months'
     GROUP BY DATE_TRUNC('month', date)
     ORDER BY DATE_TRUNC('month', date) ASC`,
    [userId]
  );
  return rows.map((r) => ({
    month:   r.month,
    income:  parseFloat(r.income),
    expense: parseFloat(r.expense),
    net:     parseFloat(r.income) - parseFloat(r.expense),
  }));
};

// ─── Top 5 spending categories ─────────────────────────────────────────────────
export const getTopCategories = async (userId, month, year) => {
  const { rows } = await pool.query(
    `SELECT
       c.name,
       c.color,
       c.icon,
       COALESCE(SUM(t.amount), 0) AS total,
       COUNT(t.id)::int            AS count
     FROM transactions t
     JOIN categories c ON c.id = t.category_id
     WHERE t.user_id = $1
       AND t.type = 'expense'
       AND EXTRACT(MONTH FROM t.date) = $2
       AND EXTRACT(YEAR  FROM t.date) = $3
     GROUP BY c.name, c.color, c.icon
     ORDER BY total DESC
     LIMIT 5`,
    [userId, month, year]
  );
  return rows;
};