// Soter AI — Landing page: splash screen only

(() => {
  'use strict';

  const splashScreen = document.querySelector('.splash-screen');
  if (!splashScreen) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const splashDuration = prefersReducedMotion ? 500 : 2000;

  const hideSplash = () => splashScreen.classList.add('hidden');

  setTimeout(hideSplash, splashDuration);

  // Let visitors skip the splash with a click, key, or scroll
  splashScreen.addEventListener('click', hideSplash);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') hideSplash();
  });
  window.addEventListener('wheel', hideSplash, { passive: true, once: true });
  window.addEventListener('touchmove', hideSplash, { passive: true, once: true });
})();

// Landing page: authentication gate — the user must choose email sign-in,
// phone sign-in, or anonymous BEFORE entering the survey.
(() => {
  'use strict';

  const AUTH_KEY = 'soter-auth';
  const $ = (id) => document.getElementById(id);
  const choices = $('auth-choices');
  const emailForm = $('email-form');
  const phoneForm = $('phone-form');
  const nameForm = $('name-form');
  const beginBtn = $('btn-begin');
  const otpBlock = $('otp-block');

  let pendingAuth = null;
  let confirmPhone = null;

  function readSession() {
    try { return JSON.parse(sessionStorage.getItem(AUTH_KEY)); } catch (e) { return null; }
  }

  function show(el) { if (el) el.hidden = false; }
  function hide(el) { if (el) el.hidden = true; }

  function showChoices() {
    show(choices);
    hide(emailForm);
    hide(phoneForm);
    hide(nameForm);
    hide(beginBtn);
  }

  function showBegin() {
    hide(choices);
    hide(emailForm);
    hide(phoneForm);
    hide(nameForm);
    show(beginBtn);
  }

  function finish(summary) {
    const session = {
      mode: summary.mode,
      uid: summary.uid || null,
      email: summary.email || '',
      phone: summary.phone || '',
      name: summary.name || ''
    };
    try { sessionStorage.setItem(AUTH_KEY, JSON.stringify(session)); } catch (e) { /* storage unavailable */ }
    showBegin();
  }

  function afterAuth(summary) {
    // Ask for a name only if one is not already available.
    if (!summary.name) {
      pendingAuth = summary;
      hide(choices);
      hide(emailForm);
      hide(phoneForm);
      show(nameForm);
      $('auth-name').focus();
      return;
    }
    finish(summary);
  }

  function friendlyAuthError(err) {
    const code = (err && err.code) || '';
    if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
      return 'Email or password is incorrect.';
    }
    if (code === 'auth/too-many-requests') return 'Too many attempts. Please try again later.';
    if (code === 'auth/invalid-phone-number') return 'Please enter a valid phone number including country code.';
    if (code === 'auth/invalid-verification-code') return 'That verification code is not valid.';
    if (code === 'auth/network-request-failed') return 'Network error. Please check your connection and try again.';
    return (err && err.message) ? err.message : 'Sign-in failed. Please try again.';
  }

  function showError(el, err) {
    el.textContent = friendlyAuthError(err);
    el.hidden = false;
  }

  const existing = readSession();
  if (existing && existing.mode === 'anonymous') {
    window.location.replace('expect.html');
    return;
  }
  if (existing && (existing.mode === 'email' || existing.mode === 'phone')) {
    showBegin();
  } else {
    showChoices();
  }

  $('btn-email-signin').addEventListener('click', () => {
    hide(choices);
    show(emailForm);
    $('auth-email').focus();
  });

  $('btn-phone-signin').addEventListener('click', () => {
    hide(choices);
    show(phoneForm);
    $('auth-phone').focus();
  });

  document.querySelectorAll('.auth-back').forEach((btn) => {
    btn.addEventListener('click', showChoices);
  });

  emailForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errEl = $('email-error');
    errEl.hidden = true;
    try {
      const summary = await window.SoterFirebase.signInEmail(
        $('auth-email').value.trim(),
        $('auth-password').value
      );
      afterAuth(Object.assign({ mode: 'email' }, summary));
    } catch (err) {
      showError(errEl, err);
    }
  });

  phoneForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errEl = $('phone-error');
    errEl.hidden = true;
    try {
      confirmPhone = await window.SoterFirebase.startPhoneSignIn($('auth-phone').value.trim());
      show(otpBlock);
      $('auth-otp').focus();
    } catch (err) {
      showError(errEl, err);
    }
  });

  $('btn-verify-code').addEventListener('click', async () => {
    const errEl = $('phone-error');
    errEl.hidden = true;
    if (!confirmPhone) return;
    try {
      const summary = await confirmPhone($('auth-otp').value.trim());
      afterAuth(Object.assign({ mode: 'phone' }, summary));
    } catch (err) {
      showError(errEl, err);
    }
  });

  nameForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('auth-name').value.trim();
    const errEl = $('name-error');
    if (!name) {
      errEl.textContent = 'Please enter your name.';
      errEl.hidden = false;
      return;
    }
    errEl.hidden = true;
    finish(Object.assign({}, pendingAuth, { name }));
  });

  $('btn-anonymous').addEventListener('click', () => {
    finish({ mode: 'anonymous', uid: null, email: '', phone: '', name: '' });
    window.location.href = 'expect.html';
  });
})();
