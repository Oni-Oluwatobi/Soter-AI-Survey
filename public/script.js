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

// Landing page: sign up / sign in first, then a welcome screen with the
// Begin Survey action. Three paths: create account, sign in (email or
// phone), or continue anonymously — all land on the welcome screen.
(() => {
  'use strict';

  const AUTH_KEY = 'soter-auth';
  const $ = (id) => document.getElementById(id);
  const authStage = $('auth-stage');
  const welcomeStage = $('welcome-stage');
  const welcomeSession = $('welcome-session');
  const choices = $('auth-choices');
  const emailForm = $('email-form');
  const phoneForm = $('phone-form');
  const nameForm = $('name-form');
  const otpBlock = $('otp-block');

  let pendingAuth = null;
  let confirmPhone = null;
  let emailBusy = false;
  let phoneBusy = false;
  let nameBusy = false;

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  }

  function describeSession(s) {
    if (s.mode === 'anonymous') return 'You are taking part anonymously.';
    const who = (s.name || s.email || s.phone || '').trim();
    return who ? 'Signed in as ' + who : 'Signed in';
  }

  function showWelcome(session, opts = {}) {
    welcomeSession.textContent = describeSession(session);
    show(welcomeSession);
    hide(authStage);
    show(welcomeStage);
    if (opts.focus) {
      const heading = $('welcome-heading');
      if (heading) heading.focus({ preventScroll: true });
    }
  }

  // Loading state: disables the button (no double submit), swaps the label,
  // and shows a spinner via .is-loading.
  function setBusy(btn, busy, busyLabel) {
    if (busy) {
      btn.dataset.label = btn.textContent;
      btn.disabled = true;
      btn.classList.add('is-loading');
      btn.textContent = busyLabel;
    } else {
      btn.disabled = false;
      btn.classList.remove('is-loading');
      if (btn.dataset.label) btn.textContent = btn.dataset.label;
    }
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
    showWelcome(session, { focus: true });
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
    if (code === 'auth/email-already-in-use') return 'An account with this email already exists. Use Sign In instead.';
    if (code === 'auth/weak-password') return 'Password must be at least 6 characters.';
    if (code === 'auth/invalid-email') return 'Please enter a valid email address.';
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

  function showLocalError(el, message) {
    el.textContent = message;
    el.hidden = false;
  }

  // Password visibility toggles (email + confirm fields).
  function wireToggle(btnId, inputId) {
    const btn = $(btnId);
    const input = $(inputId);
    if (!btn || !input) return;
    btn.addEventListener('click', () => {
      const revealing = input.type === 'password';
      input.type = revealing ? 'text' : 'password';
      btn.textContent = revealing ? 'Hide' : 'Show';
      btn.setAttribute('aria-label', revealing ? 'Hide password' : 'Show password');
      input.focus();
    });
  }
  wireToggle('btn-toggle-password', 'auth-password');
  wireToggle('btn-toggle-confirm', 'auth-confirm');

  const existing = readSession();
  if (
    existing &&
    (existing.mode === 'email' || existing.mode === 'phone' || existing.mode === 'anonymous')
  ) {
    showWelcome(existing);
  } else {
    showChoices();
  }

  // 'create' = account creation (with confirm password), 'signin' = existing user.
  let emailMode = 'create';

  function openEmailForm(mode) {
    emailMode = mode;
    hide(choices);
    show(emailForm);
    $('confirm-block').hidden = mode !== 'create';
    $('btn-email-submit').textContent = mode === 'create' ? 'Create account' : 'Sign in';
    $('auth-password').autocomplete = mode === 'create' ? 'new-password' : 'current-password';
    $('email-error').hidden = true;
    $('auth-email').focus();
  }

  $('btn-create-account').addEventListener('click', () => openEmailForm('create'));

  $('btn-email-signin').addEventListener('click', () => openEmailForm('signin'));

  $('btn-use-phone').addEventListener('click', () => {
    hide(choices);
    hide(emailForm);
    show(phoneForm);
    $('phone-error').hidden = true;
    $('auth-phone').focus();
  });

  document.querySelectorAll('.auth-back').forEach((btn) => {
    btn.addEventListener('click', showChoices);
  });

  emailForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (emailBusy) return;
    const errEl = $('email-error');
    errEl.hidden = true;
    const email = $('auth-email').value.trim();
    const password = $('auth-password').value;
    const submitBtn = $('btn-email-submit');

    if (!email || !EMAIL_RE.test(email)) {
      showLocalError(errEl, 'Please enter a valid email address.');
      $('auth-email').focus();
      return;
    }
    if (!password) {
      showLocalError(errEl, 'Please enter your password.');
      $('auth-password').focus();
      return;
    }
    if (emailMode === 'create') {
      const confirm = $('auth-confirm').value;
      if (password.length < 6) {
        showLocalError(errEl, 'Password must be at least 6 characters.');
        $('auth-password').focus();
        return;
      }
      if (password !== confirm) {
        showLocalError(errEl, 'Passwords do not match.');
        $('auth-confirm').focus();
        return;
      }
    }

    emailBusy = true;
    setBusy(submitBtn, true, emailMode === 'create' ? 'Creating account…' : 'Signing in…');
    try {
      let summary;
      if (emailMode === 'create') {
        summary = await window.SoterFirebase.createAccount(email, password);
      } else {
        summary = await window.SoterFirebase.signInEmail(email, password);
      }
      emailBusy = false;
      setBusy(submitBtn, false);
      afterAuth(Object.assign({ mode: 'email' }, summary));
    } catch (err) {
      emailBusy = false;
      setBusy(submitBtn, false);
      showError(errEl, err);
    }
  });

  phoneForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (phoneBusy) return;
    const errEl = $('phone-error');
    errEl.hidden = true;
    const phone = $('auth-phone').value.trim();
    if (!phone) {
      showLocalError(errEl, 'Please enter your phone number.');
      $('auth-phone').focus();
      return;
    }
    const submitBtn = $('btn-send-code');
    phoneBusy = true;
    setBusy(submitBtn, true, 'Sending…');
    try {
      confirmPhone = await window.SoterFirebase.startPhoneSignIn(phone);
      phoneBusy = false;
      setBusy(submitBtn, false);
      show(otpBlock);
      $('auth-otp').focus();
    } catch (err) {
      phoneBusy = false;
      setBusy(submitBtn, false);
      showError(errEl, err);
    }
  });

  $('btn-verify-code').addEventListener('click', async () => {
    const errEl = $('phone-error');
    errEl.hidden = true;
    if (phoneBusy || !confirmPhone) return;
    const code = $('auth-otp').value.trim();
    if (!code) {
      showLocalError(errEl, 'Please enter the verification code.');
      $('auth-otp').focus();
      return;
    }
    const verifyBtn = $('btn-verify-code');
    phoneBusy = true;
    setBusy(verifyBtn, true, 'Verifying…');
    try {
      const summary = await confirmPhone(code);
      phoneBusy = false;
      setBusy(verifyBtn, false);
      afterAuth(Object.assign({ mode: 'phone' }, summary));
    } catch (err) {
      phoneBusy = false;
      setBusy(verifyBtn, false);
      showError(errEl, err);
    }
  });

  nameForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (nameBusy) return;
    const name = $('auth-name').value.trim();
    const errEl = $('name-error');
    if (!name) {
      showLocalError(errEl, 'Please enter your name.');
      $('auth-name').focus();
      return;
    }
    errEl.hidden = true;
    nameBusy = true;
    const nameBtn = nameForm.querySelector('button[type="submit"]');
    setBusy(nameBtn, true, 'Continuing…');
    try {
      await window.SoterFirebase.setDisplayName(name);
    } catch (err) { /* profile save failed — name still kept for this session */ }
    nameBusy = false;
    setBusy(nameBtn, false);
    finish(Object.assign({}, pendingAuth, { name }));
  });

  $('btn-anonymous').addEventListener('click', () => {
    finish({ mode: 'anonymous', uid: null, email: '', phone: '', name: '' });
  });
})();
