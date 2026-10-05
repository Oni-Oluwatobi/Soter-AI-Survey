// Soter AI Family Voices Study — role-based, age-aware one-question-at-a-time survey engine
// Structured model (questions.js) → sequence builder → renderer → validation, transitions,
// history, draft persistence, submission

(() => {
  'use strict';

  const flow = document.getElementById('question-flow');
  const statusSection = document.getElementById('status-section');
  const statusCount = document.getElementById('status-count');
  const progressEl = document.getElementById('progress');
  const progressFill = document.getElementById('progress-fill');
  const navEl = document.getElementById('survey-nav');
  const btnBack = document.getElementById('btn-back');
  const btnNext = document.getElementById('btn-next');
  const navError = document.getElementById('nav-error');

  const DRAFT_KEY = 'soter-survey-draft';
  const AUTH_KEY = 'soter-auth';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function readAuthSession() {
    try {
      const raw = sessionStorage.getItem(AUTH_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  let items = [];
  let currentQid = null;
  let busy = false;
  let submitting = false;
  let renderedKey = null;

  const state = {
    role: '',
    ageGroup: null,
    answers: {},
    anonymous: false,
    participantName: '',
    participantEmail: ''
  };

  // Age group → question branch. "18+" (young adults and up who answer for
  // themselves) uses the 17–18 branch, which is written for that audience.
  const AGE_BRANCHES = {
    '8-10': 'child_8_10',
    '11-13': 'child_11_13',
    '14-16': 'child_14_16',
    '17-18': 'child_17_18',
    '18+': 'child_17_18'
  };

  function h(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function makeItemEl(item) {
    const node = document.createElement('section');
    node.className = item.type === 'section' ? 'flow-item section-card' : 'flow-item question';
    if (item.entry) node.className += ' entry-screen';
    if (item.qid === 'entry-role') node.className += ' welcome-card';
    node.dataset.flow = item.type === 'section' ? 'section' : 'question';
    node.dataset.qid = item.qid;
    node.dataset.section = item.section || '';
    if (item.entry) node.dataset.entry = 'true';
    if (item.required) node.dataset.required = 'true';
    if (item.error) node.dataset.error = item.error;
    if (item.when) node.dataset.when = item.when;
    return node;
  }

  function makeHeading(text, className, id) {
    const heading = h('h2', className, text);
    heading.tabIndex = -1;
    if (id) heading.id = id;
    return heading;
  }

  function makeHint(item) {
    if (!item.hint) return null;
    const hint = h('p', 'question-hint', item.hint);
    hint.id = item.qid + '-hint';
    return hint;
  }

  function renderSection(item) {
    const node = makeItemEl(item);
    node.appendChild(h('span', 'section-accent'));
    node.appendChild(makeHeading(item.title || item.label, 'section-title', item.qid));
    if (item.intro) node.appendChild(h('p', 'section-intro', item.intro));
    if (item.notice) {
      const wrap = h('div', 'privacy-notice');
      wrap.appendChild(h('p', null, item.notice));
      node.appendChild(wrap);
    }
    if (item.note) node.appendChild(h('p', 'survey-note', item.note));
    return node;
  }

  function renderRadio(item) {
    const node = makeItemEl(item);
    if (item.entry) node.appendChild(h('span', 'section-accent'));
    node.appendChild(makeHeading(item.label, 'question-text', item.qid));
    const hint = makeHint(item);
    if (hint) node.appendChild(hint);
    if (item.note) node.appendChild(h('p', 'survey-note', item.note));

    const controls = h('div', 'q-controls');
    if (item.cards) {
      controls.classList.add('choice-grid');
      if (item.cardsTwoCol) controls.classList.add('choice-grid-two');
    }
    controls.setAttribute('role', 'radiogroup');
    controls.setAttribute('aria-labelledby', item.qid);
    if (hint) controls.setAttribute('aria-describedby', hint.id);

    (item.options || []).forEach((opt) => {
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = item.qid;
      input.value = opt.value;
      let label;
      if (item.cards) {
        label = h('label', 'choice-card');
        label.appendChild(input);
        const body = h('span', 'choice-body');
        body.appendChild(h('span', 'choice-title', opt.title || opt.label));
        if (opt.desc) body.appendChild(h('span', 'choice-desc', opt.desc));
        label.appendChild(body);
      } else {
        label = h('label', 'form-radio');
        label.appendChild(input);
        label.appendChild(h('span', null, opt.label));
      }
      controls.appendChild(label);
    });

    node.appendChild(controls);
    return node;
  }

  function renderCheckbox(item) {
    const node = makeItemEl(item);
    node.appendChild(makeHeading(item.label, 'question-text', item.qid));
    const hint = makeHint(item);
    if (hint) node.appendChild(hint);

    const controls = h('div', 'q-controls');
    controls.setAttribute('role', 'group');
    controls.setAttribute('aria-labelledby', item.qid);
    if (hint) controls.setAttribute('aria-describedby', hint.id);

    (item.options || []).forEach((opt) => {
      const label = h('label', 'form-checkbox');
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.name = item.qid;
      input.value = opt.value;
      label.appendChild(input);
      label.appendChild(h('span', null, opt.label));
      controls.appendChild(label);
    });

    node.appendChild(controls);
    return node;
  }

  function renderTextarea(item) {
    const node = makeItemEl(item);
    const heading = h('h2', 'question-text');
    heading.tabIndex = -1;
    const label = h('label', null, item.label);
    label.htmlFor = item.qid;
    heading.appendChild(label);
    node.appendChild(heading);

    const hint = makeHint(item);
    if (hint) node.appendChild(hint);

    const controls = h('div', 'q-controls');
    const textarea = document.createElement('textarea');
    textarea.className = 'form-textarea';
    textarea.id = item.qid;
    textarea.rows = 4;
    if (item.placeholder) textarea.placeholder = item.placeholder;
    if (hint) textarea.setAttribute('aria-describedby', hint.id);
    controls.appendChild(textarea);
    node.appendChild(controls);
    return node;
  }

  function renderToggle(item) {
    const node = makeItemEl(item);
    node.appendChild(makeHeading(item.label || 'Respond anonymously', 'question-text', item.qid));

    const controls = h('div', 'q-controls');
    const row = h('div', 'toggle-row');
    const switchLabel = h('label', 'toggle-switch');
    switchLabel.setAttribute('aria-labelledby', item.qid);
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = 'anonymous';
    switchLabel.appendChild(input);
    switchLabel.appendChild(h('span', 'slider'));
    row.appendChild(switchLabel);
    row.appendChild(h('p', 'toggle-caption', 'Respond anonymously'));
    row.querySelector('.toggle-caption').id = 'toggle-caption';
    controls.appendChild(row);
    node.appendChild(controls);
    return node;
  }

  function renderContact(item) {
    const node = makeItemEl(item);
    node.appendChild(makeHeading(item.label, 'question-text', item.qid));
    const hint = makeHint(item);
    if (hint) node.appendChild(hint);

    const controls = h('div', 'q-controls contact-fields');

    const nameField = h('div', 'contact-field');
    const nameLabel = h('label', 'field-label', 'Full Name');
    nameLabel.htmlFor = 'participant-name';
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.id = 'participant-name';
    nameInput.className = 'form-input';
    nameInput.placeholder = 'Your full name';
    nameInput.autocomplete = 'name';
    if (hint) nameInput.setAttribute('aria-describedby', hint.id);
    nameField.appendChild(nameLabel);
    nameField.appendChild(nameInput);

    const emailField = h('div', 'contact-field');
    const emailLabel = h('label', 'field-label', 'Email Address');
    emailLabel.htmlFor = 'participant-email';
    const emailInput = document.createElement('input');
    emailInput.type = 'email';
    emailInput.id = 'participant-email';
    emailInput.className = 'form-input';
    emailInput.placeholder = 'you@example.com';
    emailInput.autocomplete = 'email';
    if (hint) emailInput.setAttribute('aria-describedby', hint.id);
    emailField.appendChild(emailLabel);
    emailField.appendChild(emailInput);

    controls.appendChild(nameField);
    controls.appendChild(emailField);
    node.appendChild(controls);
    return node;
  }

  function renderConsent(item) {
    const node = makeItemEl(item);
    const heading = h('h2', 'question-text', item.label || 'Consent');
    heading.tabIndex = -1;
    node.appendChild(heading);
    const hint = makeHint(item);
    if (hint) node.appendChild(hint);

    const controls = h('div', 'q-controls');
    const label = h('label', 'form-checkbox');
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.name = item.qid;
    input.id = item.qid;
    if (hint) input.setAttribute('aria-describedby', hint.id);
    label.appendChild(input);
    label.appendChild(h('span', null, item.consentLabel || item.label));
    controls.appendChild(label);
    node.appendChild(controls);
    return node;
  }

  function renderItem(item) {
    switch (item.type) {
      case 'section':
        return renderSection(item);
      case 'radio':
        return renderRadio(item);
      case 'checkbox':
        return renderCheckbox(item);
      case 'textarea':
        return renderTextarea(item);
      case 'toggle':
        return renderToggle(item);
      case 'contact':
        return renderContact(item);
      case 'consent':
        return renderConsent(item);
      default:
        return renderSection(item);
    }
  }

  function structureKey() {
    return (state.role || '') + '|' + (state.ageGroup || '');
  }

  function buildItems() {
    const model = window.SURVEY_MODEL;
    const sequence = [model.entryRole];
    if (!state.role) return sequence;
    if (state.role === 'child') {
      sequence.push(model.entryAge);
      if (state.ageGroup) {
        const branch = model[AGE_BRANCHES[state.ageGroup] || ''];
        if (branch) sequence.push(...branch, ...model.privacyChild);
      }
    } else {
      const branch = model[state.role];
      if (branch) {
        // Identity is decided on the welcome screen (email/phone/anonymous) —
        // the old end-of-survey toggle + contact step is removed.
        const privacy = model.privacyAdult.filter(
          (it) => it.qid !== 'q-anonymous' && it.qid !== 'q-contact'
        );
        sequence.push(...branch, ...privacy);
      }
    }
    return sequence;
  }

  function getSequence() {
    return items.filter(
      (node) => node.dataset.when !== 'not-anonymous' || !state.anonymous
    );
  }

  function indexOfQid(seq, qid) {
    return seq.findIndex((node) => node.dataset.qid === qid);
  }

  function currentElement() {
    const seq = getSequence();
    const idx = indexOfQid(seq, currentQid);
    return idx === -1 ? null : seq[idx];
  }

  function headingOf(node) {
    return node.querySelector('.question-text, .section-title');
  }

  function normalizeState() {
    if (state.role !== 'child') state.ageGroup = null;
  }

  function render() {
    flow.innerHTML = '';
    items = buildItems().map((item) => {
      const node = renderItem(item);
      flow.appendChild(node);
      return node;
    });
    renderedKey = structureKey();
    syncControlsFromState();

    const seq = getSequence();
    const idx = indexOfQid(seq, currentQid);
    const start = idx === -1 ? seq[0].dataset.qid : currentQid;
    currentQid = start;
    items.forEach((node) => node.classList.remove('is-active', 'is-leaving'));
    const startEl = seq[indexOfQid(seq, start)];
    if (startEl) startEl.classList.add('is-active');
  }

  function ensureStructure() {
    if (renderedKey === structureKey()) return false;
    render();
    return true;
  }

  function setActive(qid) {
    const seq = getSequence();
    const idx = indexOfQid(seq, qid);
    if (idx === -1) return false;
    currentQid = qid;
    items.forEach((node) => node.classList.remove('is-active', 'is-leaving'));
    const el = seq[idx];
    el.classList.add('is-active');
    updateChrome(el);
    return true;
  }

  function inferEntry(qid) {
    if (!qid) return null;
    if (qid.indexOf('p-') === 0) return { role: 'parent' };
    if (qid.indexOf('g-') === 0) return { role: 'guardian' };
    if (qid.indexOf('c8-') === 0) return { role: 'child', ageGroup: '8-10' };
    if (qid.indexOf('c11-') === 0) return { role: 'child', ageGroup: '11-13' };
    if (qid.indexOf('c14-') === 0) return { role: 'child', ageGroup: '14-16' };
    if (qid.indexOf('c17-') === 0) return { role: 'child', ageGroup: '17-18' };
    if (qid === 'entry-age') return { role: 'child' };
    return null;
  }

  function applyInference(inf) {
    if (inf.role) state.role = inf.role;
    if ('ageGroup' in inf) state.ageGroup = inf.ageGroup || null;
    normalizeState();
  }

  function ensureQid(qid) {
    if (!qid) return false;
    if (indexOfQid(getSequence(), qid) !== -1) return true;
    const inf = inferEntry(qid);
    if (inf) {
      applyInference(inf);
      render();
      if (indexOfQid(getSequence(), qid) !== -1) return true;
    }
    return false;
  }

  function syncControlsFromState() {
    items.forEach((node) => {
      if (node.dataset.flow === 'section') return;
      const qid = node.dataset.qid;
      let answer = state.answers[qid];
      if (answer === undefined && qid === 'entry-role' && state.role) {
        answer = state.role;
      }
      if (answer === undefined && qid === 'entry-age' && state.ageGroup) {
        answer = state.ageGroup;
      }

      node.querySelectorAll('input[type="radio"]').forEach((input) => {
        input.checked = answer === input.value;
      });

      const boxes = node.querySelectorAll(
        'input[type="checkbox"]:not(#anonymous)'
      );
      if (boxes.length) {
        if (qid === 'q-consent') {
          boxes.forEach((box) => {
            box.checked = answer === true;
          });
        } else {
          const values = Array.isArray(answer) ? answer : [];
          boxes.forEach((box) => {
            box.checked = values.indexOf(box.value) !== -1;
          });
        }
      }

      const textarea = node.querySelector('textarea');
      if (textarea) textarea.value = typeof answer === 'string' ? answer : '';

      if (qid === 'q-contact') {
        const nameInput = node.querySelector('#participant-name');
        const emailInput = node.querySelector('#participant-email');
        if (nameInput) nameInput.value = state.participantName || '';
        if (emailInput) emailInput.value = state.participantEmail || '';
      }
    });

    syncAnonymous();
  }

  function clearError() {
    navError.hidden = true;
    navError.textContent = '';
    flow.querySelectorAll('[aria-invalid="true"]').forEach((el) => {
      el.removeAttribute('aria-invalid');
    });
  }

  function checkQuestion(node) {
    if (node.dataset.flow !== 'question' || node.dataset.required !== 'true') {
      return null;
    }

    if (node.dataset.qid === 'q-contact') {
      const nameEl = node.querySelector('#participant-name');
      const emailEl = node.querySelector('#participant-email');
      const name = nameEl ? nameEl.value.trim() : '';
      const email = emailEl ? emailEl.value.trim() : '';
      if (!name) {
        return { message: 'Please enter your full name.', control: nameEl };
      }
      if (!email) {
        return { message: 'Please enter your email address.', control: emailEl };
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { message: 'Please enter a valid email address.', control: emailEl };
      }
      state.participantName = name;
      state.participantEmail = email;
      return null;
    }

    const radio = node.querySelector('input[type="radio"]');
    if (
      radio &&
      !node.querySelector(`input[name="${CSS.escape(radio.name)}"]:checked`)
    ) {
      return { message: node.dataset.error, control: radio };
    }

    const anyBox = node.querySelector('input[type="checkbox"]');
    if (anyBox) {
      const checked = node.querySelectorAll(
        'input[type="checkbox"]:checked'
      ).length;
      if (checked === 0) {
        return { message: node.dataset.error, control: anyBox };
      }
    }

    const field = node.querySelector('.form-textarea, .form-input');
    if (field && !field.value.trim()) {
      return { message: node.dataset.error, control: field };
    }

    return null;
  }

  function reportError(err) {
    clearError();
    navError.textContent = err.message;
    navError.hidden = false;
    if (err.control) {
      err.control.setAttribute('aria-invalid', 'true');
      err.control.focus({ preventScroll: false });
    }
  }

  function updateChrome(el) {
    if (!el) return;
    const seq = getSequence();
    const idx = indexOfQid(seq, el.dataset.qid);
    const isEntry = el.dataset.entry === 'true';
    const isQuestion = el.dataset.flow === 'question';

    statusSection.textContent = el.dataset.section || 'Welcome';

    const questions = seq.filter(
      (node) => node.dataset.flow === 'question' && node.dataset.entry !== 'true'
    );
    const sections = seq.filter((node) => node.dataset.flow === 'section');

    let countText;
    if (isEntry) {
      countText = 'Getting started';
    } else if (isQuestion) {
      countText = `Question ${questions.indexOf(el) + 1} of ${questions.length}`;
    } else {
      countText = `Section ${sections.indexOf(el) + 1} of ${sections.length}`;
    }
    statusCount.textContent = countText;

    let answered = 0;
    for (let i = 0; i < idx; i++) {
      const node = seq[i];
      if (node.dataset.flow === 'question' && node.dataset.entry !== 'true') {
        answered++;
      }
    }
    const pct = questions.length
      ? Math.round((answered / questions.length) * 100)
      : 0;
    progressFill.style.width = pct + '%';
    progressEl.setAttribute('aria-valuenow', String(pct));
    progressEl.setAttribute('aria-valuetext', `${countText}, ${pct}% complete`);

    const isFirst = idx === 0;
    const isLast = idx === seq.length - 1 && el.dataset.entry !== 'true';
    navEl.classList.toggle('is-first', isFirst);
    btnBack.hidden = isFirst;
    btnNext.textContent = isLast ? 'Submit Survey' : 'Continue →';
    btnNext.setAttribute(
      'aria-label',
      isLast ? 'Submit survey' : 'Continue to next question'
    );
  }

  function pushStateFor(qid) {
    try {
      window.history.pushState({ qid }, '', `${location.pathname}?q=${qid}`);
    } catch (e) {
      /* file:// or restricted context — in-page navigation still works */
    }
  }

  function goTo(qid, opts = {}) {
    const push = opts.push !== false;
    const focus = opts.focus !== false;
    const onShown = opts.onShown || null;

    const seq = getSequence();
    const nextIndex = indexOfQid(seq, qid);
    if (nextIndex === -1) return false;

    const nextEl = seq[nextIndex];
    if (nextEl.dataset.qid === currentQid) {
      updateChrome(nextEl);
      if (onShown) onShown(nextEl);
      return true;
    }

    const prevEl = currentElement();
    const reduced = reducedMotion.matches;

    const finish = () => {
      if (prevEl) prevEl.classList.remove('is-active', 'is-leaving');
      nextEl.classList.add('is-active');
      currentQid = nextEl.dataset.qid;
      updateChrome(nextEl);
      clearError();
      if (focus) {
        const heading = headingOf(nextEl);
        if (heading) heading.focus({ preventScroll: true });
      }
      window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
      if (push) pushStateFor(currentQid);
      saveDraft();
      if (onShown) onShown(nextEl);
      busy = false;
    };

    if (!prevEl || !prevEl.classList.contains('is-active') || reduced) {
      finish();
      return true;
    }

    busy = true;
    prevEl.classList.remove('is-active');
    prevEl.classList.add('is-leaving');
    window.setTimeout(finish, 140);
    return true;
  }

  function goNext() {
    if (busy || submitting) return;
    let seq = getSequence();
    let idx = indexOfQid(seq, currentQid);
    if (idx === -1) return;
    let el = seq[idx];

    if (el.dataset.flow === 'question') {
      const err = checkQuestion(el);
      if (err) {
        reportError(err);
        return;
      }
    }

    if (el.dataset.qid === 'entry-role') {
      const checked = el.querySelector('input[name="entry-role"]:checked');
      state.answers['entry-role'] = checked ? checked.value : '';
      state.role = state.answers['entry-role'];
      if (state.role !== 'child') state.ageGroup = null;
      if (ensureStructure()) {
        seq = getSequence();
        idx = indexOfQid(seq, currentQid);
      }
    } else if (el.dataset.qid === 'entry-age') {
      const checked = el.querySelector('input[name="entry-age"]:checked');
      state.answers['entry-age'] = checked ? checked.value : '';
      state.ageGroup = state.answers['entry-age'] || null;
      normalizeState();
      if (ensureStructure()) {
        seq = getSequence();
        idx = indexOfQid(seq, currentQid);
      }
    }

    if (idx >= seq.length - 1) {
      submitSurvey();
      return;
    }

    goTo(seq[idx + 1].dataset.qid);
  }

  function goBack() {
    if (busy || submitting) return;
    const seq = getSequence();
    const idx = indexOfQid(seq, currentQid);
    if (idx > 0) goTo(seq[idx - 1].dataset.qid);
  }

  function syncAnonymous() {
    const toggle = flow.querySelector('#anonymous');
    if (toggle) toggle.checked = state.anonymous;
    const caption = flow.querySelector('.toggle-caption');
    if (caption) {
      caption.textContent = state.anonymous
        ? 'Respond anonymously'
        : 'Add my name and email';
    }
    if (state.anonymous) {
      state.participantName = '';
      state.participantEmail = '';
      const name = flow.querySelector('#participant-name');
      const email = flow.querySelector('#participant-email');
      if (name) name.value = '';
      if (email) email.value = '';
    }
  }

  function captureControl(target) {
    if (!target || !target.closest) return null;
    const node = target.closest('.flow-item');
    if (!node) return null;
    const qid = node.dataset.qid;

    if (qid === 'q-anonymous') {
      state.anonymous = Boolean(target.checked);
      return 'sequence';
    }
    if (qid === 'q-contact') {
      if (target.id === 'participant-name') {
        state.participantName = target.value.trim();
      } else if (target.id === 'participant-email') {
        state.participantEmail = target.value.trim();
      }
      return null;
    }
    if (target.type === 'radio') {
      state.answers[qid] = target.value;
      return null;
    }
    if (target.type === 'checkbox') {
      if (qid === 'q-consent') {
        state.answers[qid] = target.checked;
        return null;
      }
      const boxes = node.querySelectorAll(
        `input[type="checkbox"][name="${CSS.escape(target.name)}"]`
      );
      const values = [];
      boxes.forEach((box) => {
        if (box.checked) values.push(box.value);
      });
      state.answers[qid] = values;
      return null;
    }
    if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT') {
      state.answers[qid] = target.value;
      return null;
    }
    return null;
  }

  function saveDraft() {
    try {
      sessionStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({
          role: state.role,
          ageGroup: state.ageGroup,
          currentQuestion: currentQid,
          answers: state.answers,
          anonymous: state.anonymous,
          participantName: state.participantName,
          participantEmail: state.participantEmail
        })
      );
    } catch (e) {
      /* storage unavailable */
    }
  }

  function restoreDraft() {
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (data.answers && typeof data.answers === 'object') {
        state.answers = data.answers;
      }
      if (data.role) state.role = data.role;
      else if (state.answers['entry-role']) state.role = state.answers['entry-role'];
      if (data.ageGroup) state.ageGroup = data.ageGroup;
      else if (state.answers['entry-age']) state.ageGroup = state.answers['entry-age'];
      if (typeof data.anonymous === 'boolean') state.anonymous = data.anonymous;
      state.participantName = data.participantName || '';
      state.participantEmail = data.participantEmail || '';
      if (data.currentQuestion) currentQid = data.currentQuestion;
      normalizeState();
    } catch (e) {
      /* storage unavailable */
    }
  }

  function collectPayload() {
    const seq = getSequence();
    const qids = {};
    seq.forEach((node) => {
      qids[node.dataset.qid] = true;
    });
    const answers = {};
    Object.keys(state.answers).forEach((key) => {
      if (qids[key] && key !== 'entry-role' && key !== 'entry-age') {
        answers[key] = state.answers[key];
      }
    });
    const isChild = state.role === 'child';
    const auth = readAuthSession() || {};
    const identified = auth.mode === 'email' || auth.mode === 'phone';
    const payload = {
      respondentType: state.role,
      ageGroup: isChild ? state.ageGroup : null,
      answers,
      isAnonymous: !identified,
      uid: identified && auth.uid ? String(auth.uid) : null,
      submittedAt: new Date().toISOString(),
      surveyVersion: '2.0'
    };
    if (identified) {
      payload.name = (auth.name || '').trim();
      const email = (auth.email || '').trim();
      const phone = (auth.phone || '').trim();
      if (email) payload.email = email;
      if (phone) payload.phone = phone;
    }
    return payload;
  }

  async function submitSurvey() {
    if (submitting) return;

    const seq = getSequence();
    for (const node of seq) {
      const err = checkQuestion(node);
      if (err) {
        goTo(node.dataset.qid, {
          push: false,
          onShown: () => reportError(err)
        });
        return;
      }
    }

    const data = collectPayload();
    const audit = auditPayload(data);
    if (audit.issues.length) {
      reportError({
        message:
          'Some answers could not be verified, so nothing was submitted. Please review your responses and try again.',
        control: null
      });
      return;
    }
    if (/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) {
      console.log(
        '[soter] payload validated: required ' + audit.answeredRequired + '/' + audit.expectedRequired +
        ', optional answered ' + audit.optionalAnswered + ', unexpected 0, issues 0'
      );
    }
    submitting = true;
    btnNext.disabled = true;
    btnBack.disabled = true;
    btnNext.textContent = 'Submitting…';

    try {
      await submitResponse(data);
      try {
        sessionStorage.removeItem(DRAFT_KEY);
      } catch (e) {
        /* storage unavailable */
      }
      window.location.href = 'thank-you.html';
    } catch (err) {
      submitting = false;
      btnNext.disabled = false;
      btnBack.disabled = false;
      updateChrome(currentElement());
      clearError();
      navError.textContent = 'Something went wrong submitting your response. Please try again.';
      navError.hidden = false;
    }
  }

  // Persistence completeness audit (spec §15/§16): verifies the collected
  // payload against the live sequence/DOM before anything is written.
  // Returns counts plus a list of blocking issues; issues.length must be 0.
  function auditPayload(payload) {
    const audit = {
      expectedRequired: 0,
      answeredRequired: 0,
      optionalAnswered: 0,
      missing: 0,
      unexpected: [],
      issues: []
    };
    if (!payload || typeof payload !== 'object' || !payload.answers || typeof payload.answers !== 'object') {
      audit.issues.push('payload/answers missing');
      return audit;
    }
    ['respondentType', 'isAnonymous', 'submittedAt', 'surveyVersion'].forEach((k) => {
      if (!(k in payload)) audit.issues.push('missing field: ' + k);
    });
    if (typeof payload.isAnonymous !== 'boolean') audit.issues.push('isAnonymous not boolean');
    if (typeof payload.submittedAt !== 'string') audit.issues.push('submittedAt not string');
    if (!payload.isAnonymous) {
      if (!payload.uid) audit.issues.push('missing uid for identified response');
      if (!payload.name) audit.issues.push('missing name for identified response');
      if (!payload.email && !payload.phone) audit.issues.push('missing email/phone for identified response');
    }
    const seq = getSequence();
    const expectedQids = [];
    seq.forEach((node) => {
      if (node.dataset.flow !== 'question') return;
      const qid = node.dataset.qid;
      if (qid === 'entry-role' || qid === 'entry-age' || qid === 'q-anonymous') return;
      expectedQids.push(qid);
      const required = node.dataset.required === 'true';
      if (required) audit.expectedRequired++;
      if (qid === 'q-contact') {
        if (payload.name && payload.email) {
          if (required) audit.answeredRequired++;
        } else if (required) {
          audit.issues.push('missing identity for q-contact');
        }
        return;
      }
      const has = Object.prototype.hasOwnProperty.call(payload.answers, qid);
      if (!has) {
        if (required) audit.issues.push('missing required: ' + qid);
        return;
      }
      if (required) audit.answeredRequired++;
      else audit.optionalAnswered++;
      const v = payload.answers[qid];
      const radios = node.querySelectorAll('input[type="radio"]');
      if (qid === 'q-consent') {
        if (v !== true) audit.issues.push('consent not confirmed');
      } else if (radios.length) {
        if (typeof v !== 'string') {
          audit.issues.push('type: ' + qid + ' expected string');
        } else {
          let found = false;
          radios.forEach((r) => { if (r.value === v) found = true; });
          if (!found) audit.issues.push('value out of options: ' + qid);
        }
      } else if (node.querySelectorAll('input[type="checkbox"]').length) {
        if (!Array.isArray(v) || !v.length) {
          audit.issues.push('type: ' + qid + ' expected non-empty array');
        } else {
          const opts = [];
          node.querySelectorAll('input[type="checkbox"]').forEach((b) => opts.push(b.value));
          if (new Set(v).size !== v.length) audit.issues.push('duplicate choices: ' + qid);
          v.forEach((x) => { if (opts.indexOf(x) === -1) audit.issues.push('unknown choice: ' + qid + ' -> ' + x); });
        }
      } else if (typeof v !== 'string') {
        audit.issues.push('type: ' + qid + ' expected string');
      }
    });
    audit.unexpected = Object.keys(payload.answers).filter((k) => expectedQids.indexOf(k) === -1);
    audit.unexpected.forEach((k) => audit.issues.push('unexpected answer: ' + k));
    audit.missing = audit.expectedRequired - audit.answeredRequired;
    return audit;
  }

  window.SoterPersistence = { audit: auditPayload };

  async function submitResponse(data) {
    if (!window.SoterFirebase || typeof window.SoterFirebase.submit !== 'function') {
      throw new Error('Submission service unavailable');
    }
    return window.SoterFirebase.submit(data);
  }

  function setupEvents() {
    btnNext.addEventListener('click', goNext);
    btnBack.addEventListener('click', goBack);

    flow.addEventListener('input', (e) => {
      captureControl(e.target);
      if (e.target.getAttribute('aria-invalid') === 'true') {
        e.target.removeAttribute('aria-invalid');
        clearError();
      }
      saveDraft();
    });

    flow.addEventListener('change', (e) => {
      const kind = captureControl(e.target);
      if (kind === 'sequence') {
        syncAnonymous();
        const el = currentElement();
        if (el) updateChrome(el);
      }
      clearError();
      saveDraft();
    });

    flow.addEventListener('keydown', (e) => {
      if (
        e.key === 'Enter' &&
        e.target.matches('input[type="text"], input[type="email"]')
      ) {
        e.preventDefault();
        goNext();
      }
    });

    document.addEventListener('keydown', (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'TEXTAREA' || tag === 'INPUT' || tag === 'SELECT') return;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goBack();
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        goNext();
      }
    });

    window.addEventListener('popstate', (e) => {
      const qid =
        (e.state && e.state.qid) ||
        new URLSearchParams(location.search).get('q');
      if (qid && qid !== currentQid) {
        const moved = ensureQid(qid) && goTo(qid, { push: false });
        if (!moved) {
          try {
            window.history.replaceState(
              { qid: currentQid },
              '',
              `${location.pathname}?q=${currentQid}`
            );
          } catch (err) {
            /* file:// or restricted context */
          }
        }
      }
    });
  }

  function init() {
    if (!window.SURVEY_MODEL) return;

    // The welcome screen must collect an authentication choice
    // (email / phone / anonymous) before the survey can be entered.
    const authSession = readAuthSession();
    if (
      !authSession ||
      (authSession.mode !== 'email' && authSession.mode !== 'phone' && authSession.mode !== 'anonymous')
    ) {
      window.location.replace('index.html');
      return;
    }

    restoreDraft();
    state.anonymous = authSession.mode === 'anonymous';

    const params = new URLSearchParams(location.search);
    const requested = params.get('q');
    if (requested) {
      const inf = inferEntry(requested);
      if (inf) applyInference(inf);
    }

    render();

    let startQid = currentQid;
    if (requested && indexOfQid(getSequence(), requested) !== -1) {
      startQid = requested;
    }
    if (indexOfQid(getSequence(), startQid) === -1) {
      startQid = getSequence()[0].dataset.qid;
    }
    setActive(startQid);

    try {
      window.history.replaceState(
        { qid: startQid },
        '',
        `${location.pathname}?q=${startQid}`
      );
    } catch (e) {
      /* file:// or restricted context */
    }

    setupEvents();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
