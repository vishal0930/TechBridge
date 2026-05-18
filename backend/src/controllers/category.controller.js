// src/controllers/category.controller.js
import * as categoryModel from '../models/category.model.js';
import * as cache         from '../services/cache.service.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

const CACHE_KEY = 'categories:all';
const CACHE_TTL = 60 * 60;              // 1 hour

// ─── GET /api/categories ───────────────────────────────────────────────────────
export const getAll = async (req, res, next) => {
  try {
    const categories = await cache.getOrSet(
      CACHE_KEY,
      CACHE_TTL,
      () => categoryModel.findAll()
    );
    return successResponse(res, categories);
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/categories ──────────────────────────────────────────────────────
export const create = async (req, res, next) => {
  try {
    const { name, type, icon, color } = req.body;

    const duplicate = await categoryModel.findByNameAndType(name, type);
    if (duplicate) return errorResponse(res, 'Category with this name and type already exists', 409);

    const category = await categoryModel.create({
      name, type, icon, color,
      created_by: req.user.id,
    });

    await cache.invalidate(CACHE_KEY);
    return successResponse(res, category, 201);
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/categories/:id ─────────────────────────────────────────────────
export const update = async (req, res, next) => {
  try {
    const existing = await categoryModel.findById(req.params.id);
    if (!existing) return errorResponse(res, 'Category not found', 404);

    const category = await categoryModel.update(req.params.id, req.body);
    await cache.invalidate(CACHE_KEY);
    return successResponse(res, category);
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/categories/:id ────────────────────────────────────────────────
export const remove = async (req, res, next) => {
  try {
    const deleted = await categoryModel.remove(req.params.id);
    if (!deleted) return errorResponse(res, 'Category not found', 404);
    await cache.invalidate(CACHE_KEY);
    return successResponse(res, { message: 'Category deleted', id: deleted.id });
  } catch (err) {
    next(err);   // 409 conflict from model bubbles up to errorHandler
  }
};