// Firebase — Soter AI Family Voices Study
// Web SDK configuration (public by design — database rules and server-side
// authorization protect the actual survey data).

window.FIREBASE_CONFIG = {
  apiKey: 'AIzaSyB2sfwO3itJSlFKrwzwVevUrJcs2uynFUc',
  authDomain: 'soter-ai.firebaseapp.com',
  databaseURL: 'https://soter-ai-default-rtdb.firebaseio.com',
  projectId: 'soter-ai',
  storageBucket: 'soter-ai.firebasestorage.app',
  messagingSenderId: '370580307152',
  appId: '1:370580307152:web:cb746ef93ef8438ddcf2d5',
  measurementId: 'G-K5CPNSDZ09'
};

window.SoterFirebase = (function () {
  'use strict';

  var SDK = 'https://www.gstatic.com/firebasejs/10.12.2';
  var ready = null;
  var authReady = null;
  var clockOffset = 0;
  var dbTries = 0;
  var authTries = 0;

  // Dynamic imports are cached by URL — including failed imports. If an
  // import fails (e.g. the network was briefly down), a retry with the same
  // URL would replay the cached failure forever. On retries, bust the URL so
  // the module is actually fetched again.
  function sdkUrl(name, n) {
    return SDK + '/' + name + (n > 1 ? '?retry=' + Date.now() : '');
  }

  function isDev() {
    return /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  }

  function loadAuth() {
    if (!authReady) {
      authTries += 1;
      authReady = Promise.all([
        import(sdkUrl('firebase-app.js', authTries)),
        import(sdkUrl('firebase-auth.js', authTries))
      ]).then(function (mods) {
        var appMod = mods[0];
        var app = appMod.getApps().length
          ? appMod.getApps()[0]
          : appMod.initializeApp(window.FIREBASE_CONFIG);
        return { auth: mods[1].getAuth(app), authMod: mods[1] };
      }).catch(function (err) {
        authReady = null;
        throw err;
      });
    }
    return authReady;
  }

  function authSummary(user) {
    return {
      uid: user.uid,
      email: user.email || '',
      phone: user.phoneNumber || '',
      name: user.displayName || ''
    };
  }

  // Email sign-in (Firebase Auth, existing soter-ai project).
  function signInEmail(email, password) {
    return loadAuth().then(function (p) {
      return p.authMod.signInWithEmailAndPassword(p.auth, email, password)
        .then(function (cred) { return authSummary(cred.user); });
    });
  }

  // Email account creation (Firebase createUserWithEmailAndPassword).
  function createAccount(email, password) {
    return loadAuth().then(function (p) {
      return p.authMod.createUserWithEmailAndPassword(p.auth, email, password)
        .then(function (cred) { return authSummary(cred.user); });
    });
  }

  // Save the collected name to the Firebase Auth profile so future
  // sign-ins already have it (no re-asking).
  function setDisplayName(name) {
    return loadAuth().then(function (p) {
      var user = p.auth.currentUser;
      if (!user) return null;
      return p.authMod.updateProfile(user, { displayName: name }).then(function () {
        return authSummary(user);
      });
    });
  }

  // Phone sign-in: sends an SMS code, returns a confirm(code) function.
  function startPhoneSignIn(phoneNumber) {
    return loadAuth().then(function (p) {
      var verifier = new p.authMod.RecaptchaVerifier(p.auth, 'auth-recaptcha', { size: 'invisible' });
      return p.authMod.signInWithPhoneNumber(p.auth, phoneNumber, verifier)
        .then(function (confirmation) {
          return function (code) {
            return confirmation.confirm(code).then(function (cred) { return authSummary(cred.user); });
          };
        });
    });
  }

  function load() {
    if (!ready) {
      dbTries += 1;
      ready = Promise.all([
        import(sdkUrl('firebase-app.js', dbTries)),
        import(sdkUrl('firebase-database.js', dbTries))
      ]).then(function (mods) {
        var appMod = mods[0];
        var dbMod = mods[1];
        var app = appMod.getApps().length
          ? appMod.getApps()[0]
          : appMod.initializeApp(window.FIREBASE_CONFIG);
        var db = dbMod.getDatabase(app);
        // Server clock sync (spec §19): canonical SDK listener on the public
        // .info endpoint — works regardless of database rules, silent fallback
        // to the local clock if the offset has not arrived yet.
        try {
          dbMod.onValue(dbMod.ref(db, '.info/serverTimeOffset'), function (snap) {
            var v = snap.val();
            if (typeof v === 'number') clockOffset = v;
          });
        } catch (e) { /* keep local clock */ }
        return {
          db: db,
          ref: dbMod.ref,
          push: dbMod.push,
          set: dbMod.set
        };
      }).catch(function (err) {
        ready = null;
        throw err;
      });
    }
    return ready;
  }

  function submit(payload) {
    var data = {};
    Object.keys(payload).forEach(function (k) { data[k] = payload[k]; });
    data.submittedAt = new Date(Date.now() + clockOffset).toISOString();
    return load().then(function (f) {
      var entry = f.push(f.ref(f.db, 'responses'));
      return f.set(entry, data).then(function () {
        if (isDev()) console.log('[soter] firebase write confirmed: ' + entry.key);
        return { responseId: entry.key };
      });
    }).catch(function (err) {
      if (isDev()) console.warn('[soter] firebase write failed: ' + (err && err.message ? err.message : err));
      throw err;
    });
  }

  return {
    submit: submit,
    signInEmail: signInEmail,
    createAccount: createAccount,
    setDisplayName: setDisplayName,
    startPhoneSignIn: startPhoneSignIn
  };
})();
