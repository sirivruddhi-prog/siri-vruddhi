const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const COOKIE_NAME = 'admin_token';
const TOKEN_TTL = '7d';

function getJwtSecret() {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) {
    throw new Error('ADMIN_JWT_SECRET is not configured.');
  }
  return secret;
}

function isAdminConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD && process.env.ADMIN_JWT_SECRET);
}

function verifyPassword(password) {
  const expected = process.env.ADMIN_PASSWORD || '';
  if (!expected || typeof password !== 'string') {
    return false;
  }

  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  if (a.length !== b.length) {
    return false;
  }

  return crypto.timingSafeEqual(a, b);
}

function signAdminToken() {
  return jwt.sign({ role: 'admin' }, getJwtSecret(), { expiresIn: TOKEN_TTL });
}

function verifyAdminToken(token) {
  try {
    const payload = jwt.verify(token, getJwtSecret());
    if (payload.role !== 'admin') {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

function getTokenFromRequest(req) {
  return req.cookies?.[COOKIE_NAME] || null;
}

function setAuthCookie(res, token) {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });
}

function clearAuthCookie(res) {
  const isProduction = process.env.NODE_ENV === 'production';
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    path: '/',
  });
}

function requireAdmin(req, res, next) {
  if (!isAdminConfigured()) {
    return res.status(503).json({ error: 'Admin login is not configured on the server.' });
  }

  const token = getTokenFromRequest(req);
  if (!token) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  const payload = verifyAdminToken(token);
  if (!payload) {
    clearAuthCookie(res);
    return res.status(401).json({ error: 'Session expired. Please sign in again.' });
  }

  req.admin = payload;
  return next();
}

module.exports = {
  COOKIE_NAME,
  isAdminConfigured,
  verifyPassword,
  signAdminToken,
  verifyAdminToken,
  getTokenFromRequest,
  setAuthCookie,
  clearAuthCookie,
  requireAdmin,
};
