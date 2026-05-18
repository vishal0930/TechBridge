// src/services/auth.service.js
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

const SALT_ROUNDS = 12;

// ─── Password ──────────────────────────────────────────────────────────────────
export const hashPassword = async (plain) => {
  return await bcrypt.hash(plain, SALT_ROUNDS);
};

export const comparePassword = async (plain, hashed) => {
  return await bcrypt.compare(plain, hashed);
};

// ─── Access Token (15 min) ─────────────────────────────────────────────────────
export const signAccessToken = (payload) => {
  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
  });
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, config.JWT_SECRET);
};

// ─── Refresh Token (7 days) ────────────────────────────────────────────────────
export const signRefreshToken = (payload) => {
  return jwt.sign(payload, config.JWT_REFRESH_SECRET, {
    expiresIn: config.JWT_REFRESH_EXPIRES_IN,
  });
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, config.JWT_REFRESH_SECRET);
};

// ─── Cookie Config ─────────────────────────────────────────────────────────────
export const refreshCookieOptions = {
  httpOnly: true,
  secure: config.NODE_ENV === 'production',
  sameSite: 'Strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,   // 7 days in ms
};