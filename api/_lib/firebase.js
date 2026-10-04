'use strict';

// Firebase Admin SDK — Realtime Database access (server-side only).
// Credentials come exclusively from environment variables; never from client code.

const { initializeApp, cert, getApps, deleteApp } = require('firebase-admin/app');
const { getDatabase } = require('firebase-admin/database');

const DEFAULT_DB_URL = 'https://soter-ai-default-rtdb.firebaseio.com';

function ConfigError(message) {
  const err = new Error(message);
  err.name = 'ConfigError';
  return err;
}

function parseServiceAccount(raw) {
  if (!raw) return null;
  let text = String(raw).trim();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch (e) {
    try {
      const decoded = Buffer.from(text, 'base64').toString('utf8');
      json = JSON.parse(decoded);
    } catch (e2) {
      throw ConfigError('FIREBASE_SERVICE_ACCOUNT is not valid JSON or base64 JSON');
    }
  }
  if (!json || !json.project_id || !json.client_email || !json.private_key) {
    throw ConfigError('FIREBASE_SERVICE_ACCOUNT is missing required service-account fields');
  }
  json.private_key = String(json.private_key).replace(/\\n/g, '\n');
  return json;
}

function getDb() {
  const sa = parseServiceAccount(process.env.FIREBASE_SERVICE_ACCOUNT);
  if (!sa) {
    throw ConfigError('Firebase service account not configured');
  }
  const databaseURL = process.env.FIREBASE_DATABASE_URL || DEFAULT_DB_URL;

  let app = getApps()[0];
  if (!app) {
    app = initializeApp({
      credential: cert(sa),
      databaseURL: databaseURL
    });
  } else if (app.options.databaseURL !== databaseURL) {
    // Different URL configured than the cached app — recreate.
    deleteApp(app);
    app = initializeApp({ credential: cert(sa), databaseURL: databaseURL });
  }
  return getDatabase(app);
}

module.exports = { getDb, ConfigError, DEFAULT_DB_URL };
