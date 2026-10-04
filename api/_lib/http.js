'use strict';

// Shared HTTP helpers for Soter AI serverless endpoints.

function json(res, status, body, extraHeaders) {
  const headers = Object.assign(
    { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
    extraHeaders || {}
  );
  res.statusCode = status;
  Object.keys(headers).forEach((k) => res.setHeader(k, headers[k]));
  res.end(JSON.stringify(body));
}

function methodNotAllowed(res, allowed) {
  res.setHeader('Allow', allowed);
  json(res, 405, { error: 'Method not allowed' });
}

function parseCookies(req) {
  const out = {};
  const raw = (req.headers && req.headers.cookie) || '';
  raw.split(';').forEach((part) => {
    const idx = part.indexOf('=');
    if (idx === -1) return;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    if (k) out[k] = decodeURIComponent(v);
  });
  return out;
}

function readJsonBody(req, maxBytes) {
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body !== 'object' || Array.isArray(req.body)) {
      throw new BodyError('Request body must be a JSON object');
    }
    return req.body;
  }
  const raw = req.rawBody !== undefined ? req.rawBody : req.body;
  if (raw === undefined || raw === null || raw === '') {
    throw new BodyError('Missing JSON body');
  }
  const str = Buffer.isBuffer(raw) ? raw.toString('utf8') : String(raw);
  if (Buffer.byteLength(str, 'utf8') > maxBytes) {
    throw new BodyError('Request body too large');
  }
  let parsed;
  try {
    parsed = JSON.parse(str);
  } catch (e) {
    throw new BodyError('Invalid JSON body');
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new BodyError('Request body must be a JSON object');
  }
  return parsed;
}

function BodyError(message) {
  const err = new Error(message);
  err.name = 'BodyError';
  return err;
}

module.exports = { json, methodNotAllowed, parseCookies, readJsonBody, BodyError };
