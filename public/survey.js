// Soter AI Parent Voice Study — one-question-at-a-time survey engine
// Sequence, validation, transitions, history, draft persistence, submission

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
  const anonymousInput = document.getElementById('anonymous');
  const toggleCaption = document.getElementById('toggle-caption');

  const DRAFT_KEY = 'soter-survey-draft';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const items = Array.from(flow.querySelectorAll('.flow-item'));
  const sectionCards = items.filter((el) => el.dataset.flow === 'section');

  let currentQid = null;
  let busy = false;
  let submitting = false;

  const surveyData = {
    role: '',
    childrenCount: '',
    communication: '',
    communicationBarriers: '',
    childOpeningUpExperience: '',
    experienceStory: '',
    whatHelped: '',
    desiredSupport: '',
    adviceToOtherParents: '',
    anonymous: true,
    participantName: '',
    participantEmail: '',
    submittedAt: new Date().toISOString(),
    surveyVersion: '1.0'
  };

  function getSequence() {
    return items.filter(
      (el) => el.dataset.when !== 'not-anonymous' || !anonymousInput.checked
    );
  }

  function indexOfQid(seq, qid) {
    return seq.findIndex((el) => el.dataset.qid === qid);
  }

  function currentElement() {
    const seq = getSequence();
    const idx = indexOfQid(seq, currentQid);
    return idx === -1 ? null : seq[idx];
  }

  function headingOf(el) {
    return el.querySelector('.question-text, .section-title');
  }

  function clearError() {
    navError.hidden = true;
    navError.textContent = '';
    flow.querySelectorAll('[aria-invalid="true"]').forEach((el) => {
      el.removeAttribute('aria-invalid');
    });
  }

  function checkQuestion(el) {
    if (el.dataset.flow !== 'question' || el.dataset.required !== 'true') return null;

    const radio = el.querySelector('input[type="radio"]');
    if (radio && !el.querySelector(`input[name="${CSS.escape(radio.name)}"]:checked`)) {
      return { message: el.dataset.error, control: radio };
    }

    const checkbox = el.querySelector('.form-checkbox input');
    if (checkbox && !checkbox.checked) {
      return { message: el.dataset.error, control: checkbox };
    }

    const field = el.querySelector('.form-textarea, .form-input');
    if (field && !field.value.trim()) {
      return { message: el.dataset.error, control: field };
    }

    return null;
  }

  function reportError(err) {
    clearError();
    navError.textContent = err.message;
    navError.hidden = false;
    err.control.setAttribute('aria-invalid', 'true');
    err.control.focus({ preventScroll: false });
  }

  function updateChrome(el) {
    const seq = getSequence();
    const idx = indexOfQid(seq, el.dataset.qid);
    const questions = seq.filter((x) => x.dataset.flow === 'question');
    const isQuestion = el.dataset.flow === 'question';

    statusSection.textContent = el.dataset.section;

    let countText;
    if (isQuestion) {
      const n = questions.indexOf(el) + 1;
      countText = `Question ${n} of ${questions.length}`;
    } else {
      const s = sectionCards.findIndex((x) => x.dataset.section === el.dataset.section) + 1;
      countText = `Section ${s} of ${sectionCards.length}`;
    }
    statusCount.textContent = countText;

    let answered = 0;
    for (let i = 0; i < idx; i++) {
      if (seq[i].dataset.flow === 'question') answered++;
    }
    const pct = questions.length ? Math.round((answered / questions.length) * 100) : 0;
    progressFill.style.width = pct + '%';
    progressEl.setAttribute('aria-valuenow', String(pct));
    progressEl.setAttribute('aria-valuetext', `${countText}, ${pct}% complete`);

    const isFirst = idx === 0;
    const isLast = idx === seq.length - 1;
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
    const seq = getSequence();
    const idx = indexOfQid(seq, currentQid);
    if (idx === -1) return;
    const el = seq[idx];

    if (el.dataset.flow === 'question') {
      const err = checkQuestion(el);
      if (err) {
        reportError(err);
        return;
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
    const isAnonymous = anonymousInput.checked;
    toggleCaption.textContent = isAnonymous
      ? 'Submit anonymously'
      : 'Submit with my name and email';
    if (isAnonymous) {
      document.getElementById('participant-name').value = '';
      document.getElementById('participant-email').value = '';
    }
  }

  function saveDraft() {
    try {
      const data = {};
      flow.querySelectorAll('input, textarea').forEach((el) => {
        if (el.type === 'radio') {
          if (el.checked) data[el.name] = el.value;
        } else if (el.type === 'checkbox') {
          data[el.id || el.name] = el.checked;
        } else {
          data[el.id || el.name] = el.value;
        }
      });
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(data));
    } catch (e) {
      /* storage unavailable */
    }
  }

  function restoreDraft() {
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      flow.querySelectorAll('input, textarea').forEach((el) => {
        const key = el.type === 'radio' ? el.name : el.id || el.name;
        if (!(key in data)) return;
        const value = data[key];
        if (el.type === 'radio') {
          el.checked = value === el.value;
        } else if (el.type === 'checkbox') {
          el.checked = Boolean(value);
        } else {
          el.value = value;
        }
      });
    } catch (e) {
      /* storage unavailable */
    }
  }

  function collectData() {
    surveyData.role = document.querySelector('input[name="role"]:checked')?.value || '';
    surveyData.childrenCount = document.querySelector('input[name="children"]:checked')?.value || '';
    surveyData.communication = document.querySelector('input[name="comm-describe"]:checked')?.value || '';
    surveyData.communicationBarriers = document.getElementById('comm-barriers')?.value.trim() || '';
    surveyData.childOpeningUpExperience = document.querySelector('input[name="child-opening-up"]:checked')?.value || '';
    surveyData.experienceStory = document.getElementById('experience-story')?.value.trim() || '';
    surveyData.whatHelped = document.getElementById('what-helped')?.value.trim() || '';
    surveyData.desiredSupport = document.getElementById('desired-support')?.value.trim() || '';
    surveyData.adviceToOtherParents = document.getElementById('advice')?.value.trim() || '';
    surveyData.anonymous = anonymousInput.checked;
    surveyData.participantName = anonymousInput.checked
      ? null
      : document.getElementById('participant-name')?.value.trim() || null;
    surveyData.participantEmail = anonymousInput.checked
      ? null
      : document.getElementById('participant-email')?.value.trim() || null;
    surveyData.submittedAt = new Date().toISOString();
    return surveyData;
  }

  async function submitSurvey() {
    if (submitting) return;

    const seq = getSequence();
    for (const el of seq) {
      const err = checkQuestion(el);
      if (err) {
        goTo(el.dataset.qid, {
          push: false,
          onShown: () => reportError(err)
        });
        return;
      }
    }

    const data = collectData();
    submitting = true;
    btnNext.disabled = true;
    btnBack.disabled = true;
    btnNext.textContent = 'Submitting…';

    try {
      await submitToFirestore(data);
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

  // Submit to Firestore — replace with the Firebase SDK call (see firebase/config.js)
  async function submitToFirestore(data) {
    await new Promise((resolve) => setTimeout(resolve, 900));
    // Example real integration:
    //   const { addDoc, collection } = await import('https://www.gstatic.com/firebasejs/10.x/firebase-firestore.js');
    //   await addDoc(collection(db, 'parentSurveyResponses'), data);
    console.log('Parent Voice Study response submitted:', data);
    return true;
  }

  function setupEvents() {
    btnNext.addEventListener('click', goNext);
    btnBack.addEventListener('click', goBack);

    flow.addEventListener('input', (e) => {
      if (e.target.getAttribute('aria-invalid') === 'true') {
        e.target.removeAttribute('aria-invalid');
        clearError();
      }
      saveDraft();
    });

    flow.addEventListener('change', (e) => {
      if (e.target === anonymousInput) {
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
        const moved = goTo(qid, { push: false });
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

  function resolveStartQid(requested, seq) {
    if (requested && indexOfQid(seq, requested) !== -1) return requested;
    if (requested) {
      const reqPos = items.findIndex((el) => el.dataset.qid === requested);
      for (let i = reqPos - 1; i >= 0; i--) {
        if (seq.includes(items[i])) return items[i].dataset.qid;
      }
    }
    return seq[0].dataset.qid;
  }

  function init() {
    restoreDraft();
    syncAnonymous();

    const params = new URLSearchParams(location.search);
    const seq = getSequence();
    const startQid = resolveStartQid(params.get('q'), seq);
    const startEl = seq[indexOfQid(seq, startQid)];

    items.forEach((el) => el.classList.remove('is-active'));
    startEl.classList.add('is-active');
    currentQid = startQid;
    updateChrome(startEl);

    try {
      window.history.replaceState({ qid: startQid }, '', `${location.pathname}?q=${startQid}`);
    } catch (e) {
      /* file:// or restricted context */
    }

    setupEvents();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
