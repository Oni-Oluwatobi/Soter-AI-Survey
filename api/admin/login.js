'use strict';

// Admin login — password verification happens ONLY here, server-side.
// The password is compared against the SOTER_ADMIN_PASSWORD environment
// variable and is never sent to or stored in the browser.

const { json, methodNotAllowed, readJsonBody, BodyError } = require('../_lib/http');
const {
  passwordMatches,
  createSessionToken,
  sessionCookie
} = require('../_lib/session');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, 'POST');

  if (!process.env.SOTER_ADMIN_PASSWORD) {
    return json(res, 503, { error: 'Admin access is not configured yet' });
  }

  let body;
  try {
    body = readJsonBody(req, 16 * 1024);
  } catch (e) {
    if (e.name === 'BodyError') return json(res, 400, { error: e.message });
    throw e;
  }

  const password = typeof body.password === 'string' ? body.password : '';
  if (!password || password.length > 512 || !passwordMatches(password)) {
    return json(res, 401, { error: 'Incorrect password' });
  }

  const token = createSessionToken();
  if (!token) {
    return json(res, 503, { error: 'Admin access is not configured yet' });
  }

  res.setHeader('Set-Cookie', sessionCookie(token));
  return json(res, 200, { ok: true });
};
