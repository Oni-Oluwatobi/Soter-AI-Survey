// Soter AI — Family Voices Study admin dashboard
// Talks only to the server-side API (/api/admin/*); the browser never
// touches Firebase directly. All dynamic content is rendered via textContent
// so responses are never injected as markup.

(function () {
  'use strict';

  var loginView = document.getElementById('login-view');
  var dashboardView = document.getElementById('dashboard-view');
  var loginForm = document.getElementById('login-form');
  var loginError = document.getElementById('login-error');
  var loginBtn = document.getElementById('login-btn');
  var passwordInput = document.getElementById('admin-password');
  var logoutBtn = document.getElementById('logout-btn');
  var refreshBtn = document.getElementById('refresh-btn');
  var loadError = document.getElementById('load-error');
  var searchInput = document.getElementById('search-input');
  var filterRole = document.getElementById('filter-role');
  var filterAnon = document.getElementById('filter-anon');
  var sortOrder = document.getElementById('sort-order');
  var resultCount = document.getElementById('result-count');
  var tbody = document.getElementById('responses-body');
  var overlay = document.getElementById('detail-overlay');
  var detailClose = document.getElementById('detail-close');
  var detailMeta = document.getElementById('detail-meta');
  var detailAnswers = document.getElementById('detail-answers');

  var responses = [];
  var questionIndex = null;

  // Accept current and legacy response shapes defensively (older records may
  // be missing identity fields entirely).
  function normalize(r) {
    r = r && typeof r === 'object' ? r : {};
    var name = str(r.name) || str(r.participantName);
    var email = str(r.email) || str(r.participantEmail);
    var isAnonymous = null;
    if (typeof r.isAnonymous === 'boolean') isAnonymous = r.isAnonymous;
    else if (typeof r.anonymous === 'boolean') isAnonymous = r.anonymous;
    if (isAnonymous === null) isAnonymous = !name && !email;
    return {
      responseId: str(r.responseId),
      respondentType: str(r.respondentType) || str(r.role),
      ageGroup: str(r.ageGroup),
      answers: r.answers && typeof r.answers === 'object' && !Array.isArray(r.answers) ? r.answers : {},
      isAnonymous: isAnonymous,
      name: isAnonymous ? null : name,
      email: isAnonymous ? null : email,
      submittedAt: typeof r.submittedAt === 'number' || typeof r.submittedAt === 'string' ? r.submittedAt : null,
      surveyVersion: str(r.surveyVersion)
    };
  }

  function str(v) {
    return typeof v === 'string' && v.length ? v : null;
  }

  // ---- Question index from SURVEY_MODEL ----
  function buildQuestionIndex() {
    var index = {};
    var model = window.SURVEY_MODEL || {};
    var groups = ['privacyAdult', 'privacyChild', 'parent', 'guardian',
      'child_8_10', 'child_11_13', 'child_14_16', 'child_17_18'];
    groups.forEach(function (g) {
      var items = model[g];
      if (!Array.isArray(items)) return;
      items.forEach(function (item) {
        if (item && item.qid && !index[item.qid]) index[item.qid] = item;
      });
    });
    return index;
  }

  function questionFor(qid) {
    if (!questionIndex) questionIndex = buildQuestionIndex();
    return questionIndex[qid] || null;
  }

  function questionLabel(qid) {
    var q = questionFor(qid);
    if (!q) return qid;
    if (q.type === 'consent') return q.consentLabel || q.label || qid;
    if (q.type === 'section') return q.title || q.qid;
    return q.label || q.title || qid;
  }

  function optionLabel(qid, value) {
    var q = questionFor(qid);
    if (q && Array.isArray(q.options)) {
      for (var i = 0; i < q.options.length; i++) {
        if (q.options[i].value === value) return q.options[i].label || value;
      }
    }
    return value;
  }

  // ---- Helpers ----
  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = String(text);
    return node;
  }

  function show(node) { node.hidden = false; }
  function hide(node) { node.hidden = true; }

  function formatDate(ts) {
    if (!ts) return '—';
    try {
      return new Date(ts).toLocaleString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch (e) { return '—'; }
  }

  function typeLabel(type) {
    if (type === 'parent') return 'Parent';
    if (type === 'guardian') return 'Guardian';
    if (type === 'child') return 'Child / Young Person';
    return type || '—';
  }

  function request(path, options) {
    return fetch(path, options).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (data) {
        return { status: res.status, data: data };
      });
    });
  }

  // ---- Views ----
  function showLogin(message) {
    hide(dashboardView);
    show(loginView);
    if (message) {
      loginError.textContent = message;
      show(loginError);
    } else {
      loginError.textContent = '';
      hide(loginError);
    }
    passwordInput.value = '';
    passwordInput.focus();
  }

  function showDashboard() {
    hide(loginView);
    show(dashboardView);
    loadError.textContent = '';
    hide(loadError);
  }

  function setLoadError(message) {
    loadError.textContent = message;
    show(loadError);
  }

  // ---- Data loading ----
  function loadResponses() {
    return request('/api/admin/responses').then(function (r) {
      if (r.status === 401) {
        showLogin('');
        return;
      }
      if (r.status === 200 && Array.isArray(r.data.responses)) {
        responses = r.data.responses.map(normalize);
        renderAll();
        return;
      }
      showDashboard();
      setLoadError(r.data && r.data.error
        ? r.data.error
        : 'Could not load responses (' + r.status + ').');
      renderAll();
    }).catch(function () {
      showDashboard();
      setLoadError('Could not reach the server. Please check your connection and try again.');
      renderAll();
    });
  }

  // ---- Stats ----
  function renderStats() {
    var counts = { parent: 0, guardian: 0, child: 0, anon: 0, identified: 0 };
    responses.forEach(function (r) {
      if (counts[r.respondentType] !== undefined) counts[r.respondentType]++;
      if (r.isAnonymous) counts.anon++;
      else counts.identified++;
    });
    document.getElementById('stat-total').textContent = responses.length;
    document.getElementById('stat-identified').textContent = counts.identified;
    document.getElementById('stat-anon').textContent = counts.anon;
    document.getElementById('stat-parent').textContent = counts.parent;
    document.getElementById('stat-guardian').textContent = counts.guardian;
    document.getElementById('stat-child').textContent = counts.child;
  }

  // ---- Filtering / sorting ----
  function searchableText(r) {
    var parts = [r.respondentType, r.ageGroup, r.name, r.email];
    Object.keys(r.answers).forEach(function (qid) {
      var v = r.answers[qid];
      if (typeof v === 'string') parts.push(v);
      else if (typeof v === 'boolean') parts.push(String(v));
      else if (Array.isArray(v)) parts.push(v.join(' '));
    });
    return parts.filter(Boolean).join(' ').toLowerCase();
  }

  function visibleResponses() {
    var term = (searchInput.value || '').trim().toLowerCase();
    var role = filterRole.value;
    var anon = filterAnon.value;
    var list = responses.filter(function (r) {
      if (role && r.respondentType !== role) return false;
      if (anon === 'anon' && !r.isAnonymous) return false;
      if (anon === 'named' && r.isAnonymous) return false;
      if (term && searchableText(r).indexOf(term) === -1) return false;
      return true;
    });
    list.sort(function (a, b) {
      var av = a.submittedAt || 0;
      var bv = b.submittedAt || 0;
      return sortOrder.value === 'oldest' ? av - bv : bv - av;
    });
    return list;
  }

  // ---- Table ----
  function renderTable() {
    var list = visibleResponses();
    tbody.textContent = '';
    resultCount.textContent = list.length === responses.length
      ? list.length + ' response' + (list.length === 1 ? '' : 's')
      : list.length + ' of ' + responses.length + ' responses';

    if (!list.length) {
      var tr0 = document.createElement('tr');
      var td0 = el('td', 'table-empty', responses.length ? 'No responses match your filters.' : 'No responses yet.');
      td0.colSpan = 6;
      tr0.appendChild(td0);
      tbody.appendChild(tr0);
      return;
    }

    list.forEach(function (r) {
      var tr = document.createElement('tr');

      var tdDate = el('td', 'date-cell', formatDate(r.submittedAt));

      var tdType = document.createElement('td');
      tdType.appendChild(el('span', r.respondentType === 'child' ? 'badge badge-child' : 'badge', typeLabel(r.respondentType)));

      var tdName = el('td', 'cell-truncate');
      if (r.isAnonymous) {
        tdName.appendChild(el('span', 'cell-muted', 'Anonymous respondent'));
      } else {
        tdName.textContent = r.name || '—';
        if (r.name) tdName.title = r.name;
      }

      var tdEmail = el('td', 'cell-truncate');
      if (r.isAnonymous || !r.email) {
        tdEmail.appendChild(el('span', 'cell-muted', '—'));
      } else {
        tdEmail.textContent = r.email;
        tdEmail.title = r.email;
      }

      var tdStatus = document.createElement('td');
      tdStatus.appendChild(el('span', r.isAnonymous ? 'badge badge-anon' : 'badge', r.isAnonymous ? 'Anonymous' : 'Identified'));

      var tdOpen = document.createElement('td');
      var openBtn = el('button', 'btn btn-secondary row-open', 'Open');
      openBtn.type = 'button';
      openBtn.setAttribute('aria-label', 'Open response submitted ' + formatDate(r.submittedAt));
      openBtn.addEventListener('click', function () { openDetail(r); });
      tdOpen.appendChild(openBtn);

      [tdDate, tdType, tdName, tdEmail, tdStatus, tdOpen].forEach(function (td) { tr.appendChild(td); });
      tbody.appendChild(tr);
    });
  }

  // ---- Detail panel ----
  function metaRow(dl, label, value) {
    if (value === null || value === undefined || value === '') return;
    var dt = el('dt', '', label);
    var dd = el('dd', '', value);
    dl.appendChild(dt);
    dl.appendChild(dd);
  }

  function renderAnswerValue(qid, value) {
    if (typeof value === 'boolean') {
      return el('p', 'answer-value', value ? 'Confirmed' : 'Not confirmed');
    }
    if (Array.isArray(value)) {
      var ul = document.createElement('ul');
      value.forEach(function (v) {
        ul.appendChild(el('li', '', optionLabel(qid, v)));
      });
      return ul;
    }
    return el('p', 'answer-value', optionLabel(qid, value));
  }

  function openDetail(r) {
    detailMeta.textContent = '';
    metaRow(detailMeta, 'Submitted', formatDate(r.submittedAt));
    metaRow(detailMeta, 'Respondent type', typeLabel(r.respondentType));
    metaRow(detailMeta, 'Age group', r.ageGroup ? r.ageGroup + ' years' : '—');
    if (r.isAnonymous) {
      metaRow(detailMeta, 'Identity', 'Anonymous respondent');
    } else {
      metaRow(detailMeta, 'Name', r.name || '—');
      metaRow(detailMeta, 'Email', r.email || '—');
    }
    metaRow(detailMeta, 'Status', r.isAnonymous ? 'Anonymous' : 'Identified');
    metaRow(detailMeta, 'Survey version', r.surveyVersion || '—');
    metaRow(detailMeta, 'Response ID', r.responseId);

    detailAnswers.textContent = '';
    var qids = Object.keys(r.answers);
    if (!qids.length) {
      detailAnswers.appendChild(el('p', 'answer-value', 'No answers recorded.'));
    }
    qids.forEach(function (qid) {
      var block = el('div', 'answer-block');
      block.appendChild(el('p', 'answer-question', questionLabel(qid)));
      block.appendChild(renderAnswerValue(qid, r.answers[qid]));
      detailAnswers.appendChild(block);
    });

    show(overlay);
    detailClose.focus();
  }

  function closeDetail() {
    hide(overlay);
    detailMeta.textContent = '';
    detailAnswers.textContent = '';
  }

  function renderAll() {
    renderStats();
    renderTable();
  }

  // ---- Events ----
  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var password = passwordInput.value;
    loginError.textContent = '';
    hide(loginError);
    if (!password) {
      loginError.textContent = 'Enter the admin password.';
      show(loginError);
      return;
    }
    loginBtn.disabled = true;
    loginBtn.textContent = 'Signing in…';
    request('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: password })
    }).then(function (r) {
      loginBtn.disabled = false;
      loginBtn.textContent = 'Sign in';
      if (r.status === 200) {
        showDashboard();
        return loadResponses();
      }
      var message = (r.data && r.data.error) ? r.data.error : 'Sign in failed. Please try again.';
      loginError.textContent = message;
      show(loginError);
      passwordInput.select();
    }).catch(function () {
      loginBtn.disabled = false;
      loginBtn.textContent = 'Sign in';
      loginError.textContent = 'Could not reach the server. Please try again.';
      show(loginError);
    });
  });

  logoutBtn.addEventListener('click', function () {
    request('/api/admin/logout', { method: 'POST' })
      .catch(function () { /* cookie cleared server-side if reachable */ })
      .then(function () { showLogin(''); });
  });

  refreshBtn.addEventListener('click', function () {
    loadError.textContent = '';
    hide(loadError);
    refreshBtn.disabled = true;
    refreshBtn.textContent = 'Refreshing…';
    loadResponses().then(function () {
      refreshBtn.disabled = false;
      refreshBtn.textContent = 'Refresh';
    });
  });

  [searchInput, filterRole, filterAnon, sortOrder].forEach(function (node) {
    node.addEventListener('input', renderTable);
    node.addEventListener('change', renderTable);
  });

  detailClose.addEventListener('click', closeDetail);
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeDetail();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !overlay.hidden) closeDetail();
  });

  // ---- Boot: is there a valid session? ----
  questionIndex = buildQuestionIndex();
  loadResponses();
})();
