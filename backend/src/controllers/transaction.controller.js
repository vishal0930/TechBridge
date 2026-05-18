// src/controllers/transaction.controller.js
import * as txModel   from '../models/transaction.model.js';
import * as cache     from '../services/cache.service.js';
import { getPagination, buildMeta } from '../utils/pagination.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

// ─── GET /api/transactions ─────────────────────────────────────────────────────
export const getAll = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const { rows, total } = await txModel.findAll(req.user.id, req.query, limit, offset);
    const meta = buildMeta(total, page, limit);
    return successResponse(res, rows, 200, meta);
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/transactions/:id ─────────────────────────────────────────────────
export const getOne = async (req, res, next) => {
  try {
    const tx = await txModel.findById(req.params.id, req.user.id);
    if (!tx) return errorResponse(res, 'Transaction not found', 404);
    return successResponse(res, tx);
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/transactions ────────────────────────────────────────────────────
export const create = async (req, res, next) => {
  try {
    const tx = await txModel.create(req.user.id, req.body);
    await cache.invalidateUserAnalytics(req.user.id);   // bust analytics cache
    return successResponse(res, tx, 201);
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/transactions/:id ───────────────────────────────────────────────
export const update = async (req, res, next) => {
  try {
    const tx = await txModel.update(req.params.id, req.user.id, req.body);
    if (!tx) return errorResponse(res, 'Transaction not found or not yours', 404);
    await cache.invalidateUserAnalytics(req.user.id);
    return successResponse(res, tx);
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/transactions/:id ──────────────────────────────────────────────
export const remove = async (req, res, next) => {
  try {
    const tx = await txModel.remove(req.params.id, req.user.id);
    if (!tx) return errorResponse(res, 'Transaction not found or not yours', 404);
    await cache.invalidateUserAnalytics(req.user.id);
    return successResponse(res, { message: 'Transaction deleted', id: tx.id });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/transactions/export ─────────────────────────────────────────────
export const exportCSV = async (req, res, next) => {
  try {
    const rows = await txModel.findAllForExport(req.user.id, req.query);

    const headers = ['id', 'type', 'amount', 'category', 'description', 'date', 'tags'];
    const csv = [
      headers.join(','),
      ...rows.map((r) =>
        [
          r.id,
          r.type,
          r.amount,
          r.category,
          `"${(r.description || '').replace(/"/g, '""')}"`,
          r.date,
          `"${(r.tags || []).join(';')}"`,
        ].join(',')
      ),
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
    return res.status(200).send(csv);
  } catch (err) {
    next(err);
  }
};