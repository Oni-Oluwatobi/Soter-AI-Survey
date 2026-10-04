'use strict';

// Server-side admin session tokens.
// The password itself never leaves the server; sessions are stateless
// HMAC-signed tokens delivered in an HttpOnly cookie.

const crypto = require('crypto');

const COOKIE_NAME = 'soter_admin_session';
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

function hmacKey() {
  if (process.env.SOTER_SESSION_SECRET) {
    return crypto.createHash('sha256').update(process.env.SOTER_SESSION_SECRET).digest();
  }
  if (process.env.SOTER_ADMIN_PASSWORD) {
    return crypto
      .createHash('sha256')
      .update('soter-admin-session::' + process.env.SOTER_ADMIN_PASSWORD)
      .digest();
  }
  return null;
}

function sign(payload, key) {
  return crypto.createHmac('sha256', key).update(payload).digest('base64url');
}

function safeEqual(a, b) {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

function passwordMatches(attempt) {
  const expected = process.env.SOTER_ADMIN_PASSWORD;
  if (!expected || typeof attempt !== 'string') return false;
  const a = crypto.createHash('sha256').update(attempt).digest();
  const b = crypto.createHash('sha256').update(expected).digest();
  return crypto.timingSafeEqual(a, b);
}

function createSessionToken() {
  const key = hmacKey();
  if (!key) return null;
  const exp = Date.now() + SESSION_TTL_MS;
  const body = String(exp);
  return body + '.' + sign(body, key);
}

function verifySessionToken(token) {
  const key = hmacKey();
  if (!key || typeof token !== 'string' || token.indexOf('.') === -1) return false;
  const idx = token.lastIndexOf('.');
  const expPart = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  if (!/^\d{10,16}$/.test(expPart)) return false;
  if (!safeEqual(sig, sign(expPart, key))) return false;
  const exp = Number(expPart);
  return Number.isFinite(exp) && exp > Date.now();
}

function sessionCookie(token) {
  return (
    COOKIE_NAME + '=' + encodeURIComponent(token) +
    '; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=' + Math.floor(SESSION_TTL_MS / 1000)
  );
}

function clearSessionCookie() {
  return COOKIE_NAME + '=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0';
}

module.exports = {
  COOKIE_NAME,
  SESSION_TTL_MS,
  passwordMatches,
  createSessionToken,
  verifySessionToken,
  sessionCookie,
  clearSessionCookie
};
