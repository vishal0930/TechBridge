// src/controllers/auth.controller.js
import * as userModel   from '../models/user.model.js';
import * as authService from '../services/auth.service.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

// ─── POST /api/auth/register ───────────────────────────────────────────────────
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existing = await userModel.findUserByEmail(email);
    if (existing) return errorResponse(res, 'Email already registered', 409);

    const hashedPassword = await authService.hashPassword(password);
    const user = await userModel.createUser({ name, email, hashedPassword });

    const accessToken  = authService.signAccessToken({ id: user.id, role: user.role, email: user.email });
    const refreshToken = authService.signRefreshToken({ id: user.id });

    res.cookie('refreshToken', refreshToken, authService.refreshCookieOptions);
    return successResponse(res, { user, accessToken }, 201);
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/auth/login ──────────────────────────────────────────────────────
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findUserByEmail(email);
    if (!user) return errorResponse(res, 'Invalid credentials', 401);

    const match = await authService.comparePassword(password, user.password);
    if (!match) return errorResponse(res, 'Invalid credentials', 401);

    const accessToken  = authService.signAccessToken({ id: user.id, role: user.role, email: user.email });
    const refreshToken = authService.signRefreshToken({ id: user.id });

    res.cookie('refreshToken', refreshToken, authService.refreshCookieOptions);

    const { password: _, ...safeUser } = user;   // strip password from response
    return successResponse(res, { user: safeUser, accessToken });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/auth/refresh ────────────────────────────────────────────────────
export const refresh = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return errorResponse(res, 'No refresh token', 401);

    const decoded = authService.verifyRefreshToken(token);
    const user = await userModel.findUserById(decoded.id);
    if (!user) return errorResponse(res, 'User not found', 401);

    const accessToken  = authService.signAccessToken({ id: user.id, role: user.role, email: user.email });
    const refreshToken = authService.signRefreshToken({ id: user.id });

    res.cookie('refreshToken', refreshToken, authService.refreshCookieOptions);
    return successResponse(res, { accessToken });
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return errorResponse(res, 'Invalid or expired refresh token', 401);
    }
    next(err);
  }
};

// ─── POST /api/auth/logout ─────────────────────────────────────────────────────
export const logout = (req, res) => {
  res.clearCookie('refreshToken');
  return successResponse(res, { message: 'Logged out successfully' });
};

// ─── GET /api/auth/me ──────────────────────────────────────────────────────────
export const me = async (req, res, next) => {
  try {
    const user = await userModel.findUserById(req.user.id);
    if (!user) return errorResponse(res, 'User not found', 404);
    return successResponse(res, { user });
  } catch (err) {
    next(err);
  }
};