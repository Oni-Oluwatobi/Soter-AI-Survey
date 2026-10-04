'use strict';

// Admin logout — clears the HttpOnly session cookie.

const { json, methodNotAllowed } = require('../_lib/http');
const { clearSessionCookie } = require('../_lib/session');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, 'POST');
  res.setHeader('Set-Cookie', clearSessionCookie());
  return json(res, 200, { ok: true });
};
