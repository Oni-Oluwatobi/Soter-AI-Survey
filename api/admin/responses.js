'use strict';

// Protected admin endpoint — returns all Family Voices Study responses.
// Requires a valid admin session cookie; the Realtime Database is read
// server-side with the Admin SDK (the public cannot read /responses at all).
// Handles both the current schema (isAnonymous/respondentType/name/email)
// and older records that may use legacy field names or lack identity fields.

const { json, methodNotAllowed, parseCookies } = require('../_lib/http');
const { COOKIE_NAME, verifySessionToken } = require('../_lib/session');
const { getDb, ConfigError } = require('../_lib/firebase');

function str(v) {
  return typeof v === 'string' && v.length ? v : null;
}

function normalizeRecord(id, raw) {
  const r = raw && typeof raw === 'object' ? raw : {};
  const respondentType = str(r.respondentType) || str(r.role) || null;
  const name = str(r.name) || str(r.participantName) || null;
  const email = str(r.email) || str(r.participantEmail) || null;
  let isAnonymous = null;
  if (typeof r.isAnonymous === 'boolean') isAnonymous = r.isAnonymous;
  else if (typeof r.anonymous === 'boolean') isAnonymous = r.anonymous;
  if (isAnonymous === null) isAnonymous = !name && !email;
  return {
    responseId: id,
    respondentType: respondentType,
    ageGroup: str(r.ageGroup),
    answers: r.answers && typeof r.answers === 'object' && !Array.isArray(r.answers) ? r.answers : {},
    isAnonymous: isAnonymous,
    name: isAnonymous ? null : name,
    email: isAnonymous ? null : email,
    submittedAt: typeof r.submittedAt === 'number' || typeof r.submittedAt === 'string' ? r.submittedAt : null,
    surveyVersion: str(r.surveyVersion)
  };
}

async function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, 'GET');

  const cookies = parseCookies(req);
  const token = cookies[COOKIE_NAME];
  if (!token || !verifySessionToken(token)) {
    return json(res, 401, { error: 'Unauthorized' });
  }

  try {
    const db = getDb();
    const snap = await db.ref('responses').once('value');
    const val = snap.val() || {};
    const responses = Object.keys(val).map((id) => normalizeRecord(id, val[id]));
    responses.sort((a, b) => (b.submittedAt || 0) - (a.submittedAt || 0));
    return json(res, 200, { ok: true, count: responses.length, responses: responses });
  } catch (e) {
    if (e.name === 'ConfigError') {
      return json(res, 503, { error: 'Database is not configured yet' });
    }
    console.error('responses fetch failed:', e && e.message ? e.message : e);
    return json(res, 500, { error: 'Failed to load responses' });
  }
}

module.exports = handler;
module.exports.normalizeRecord = normalizeRecord;
