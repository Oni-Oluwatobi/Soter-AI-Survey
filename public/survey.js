// Soter AI Parent Voice Study — Survey page
// Handles step navigation, privacy toggle, validation, and Firebase submission

(() => {
  'use strict';

  const steps = Array.from(document.querySelectorAll('.step'));
  const submitBtn = document.getElementById('submit-btn');
  const anonymousInput = document.getElementById('anonymous');
  const nameEmailFields = document.getElementById('name-email-fields');
  const toggleCaption = document.getElementById('toggle-caption');
  const consentInput = document.getElementById('consent');

  let currentStep = 0;
  const stepCount = steps.length;

  let surveyData = {
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

  function init() {
    showStep(currentStep);
    setupEventListeners();
  }

  function showStep(stepIndex) {
    currentStep = stepIndex;
    steps.forEach((step, index) => {
      const isActive = index === stepIndex;
      step.hidden = !isActive;
      step.classList.toggle('active', isActive);
    });
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  function setupEventListeners() {
    document.querySelectorAll('.btn-next').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (validateStep(currentStep) && currentStep < stepCount - 1) {
          showStep(currentStep + 1);
        }
      });
    });

    document.querySelectorAll('.btn-back').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentStep > 0) {
          showStep(currentStep - 1);
        }
      });
    });

    if (submitBtn) {
      submitBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (validateStep(currentStep)) {
          submitSurvey();
        }
      });
    }

    // Privacy toggle: anonymous on by default
    if (anonymousInput) {
      anonymousInput.addEventListener('change', () => {
        const isAnonymous = anonymousInput.checked;
        nameEmailFields.hidden = isAnonymous;
        toggleCaption.textContent = isAnonymous
          ? 'Submit anonymously'
          : 'Submit with my name and email';
        surveyData.anonymous = isAnonymous;
        if (isAnonymous) {
          document.getElementById('participant-name').value = '';
          document.getElementById('participant-email').value = '';
        }
      });
      anonymousInput.dispatchEvent(new Event('change'));
    }

    // Keyboard navigation between steps
    document.addEventListener('keydown', (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'TEXTAREA' || tag === 'INPUT') return;
      if (e.key === 'ArrowLeft' && currentStep > 0) {
        e.preventDefault();
        showStep(currentStep - 1);
      }
      if (e.key === 'ArrowRight' && currentStep < stepCount - 1) {
        e.preventDefault();
        if (validateStep(currentStep)) {
          showStep(currentStep + 1);
        }
      }
    });
  }

  function clearErrors(step) {
    step.querySelectorAll('.form-error').forEach((el) => el.remove());
    step.querySelectorAll('.form-input, .form-textarea').forEach((el) => {
      el.style.borderColor = '';
    });
    step.querySelectorAll('.form-radio-group').forEach((el) => {
      el.style.outline = '';
    });
  }

  function showError(target, message) {
    const hint = document.createElement('p');
    hint.className = 'form-hint form-error';
    hint.textContent = message;
    const group = target.closest?.('.form-group') || target.parentNode;
    group.appendChild(hint);
  }

  function validateStep(stepIndex) {
    const step = steps[stepIndex];
    clearErrors(step);
    let isValid = true;

    switch (stepIndex) {
      case 0: {
        const role = step.querySelector('input[name="role"]:checked');
        const children = step.querySelector('input[name="children"]:checked');
        if (!role) {
          showError(step.querySelector('#role-label')?.nextElementSibling || step, 'Please select your role.');
          isValid = false;
        }
        if (!children) {
          showError(step.querySelector('#children-label')?.nextElementSibling || step, 'Please select the number of children.');
          isValid = false;
        }
        break;
      }
      case 1: {
        const comm = step.querySelector('input[name="comm-describe"]:checked');
        const barriers = step.querySelector('#comm-barriers');
        if (!comm) {
          showError(step.querySelector('#comm-label')?.nextElementSibling || step, 'Please describe communication.');
          isValid = false;
        }
        if (barriers && !barriers.value.trim()) {
          barriers.style.borderColor = 'var(--teal-waters)';
          showError(barriers, 'Please share what makes conversation difficult.');
          isValid = false;
        }
        break;
      }
      case 2: {
        const childOpening = step.querySelector('input[name="child-opening-up"]:checked');
        const experience = step.querySelector('#experience-story');
        if (!childOpening) {
          showError(step.querySelector('#opening-label')?.nextElementSibling || step, 'Please indicate if this has happened.');
          isValid = false;
        }
        if (experience && !experience.value.trim()) {
          experience.style.borderColor = 'var(--teal-waters)';
          showError(experience, 'Please share your experience.');
          isValid = false;
        }
        break;
      }
      case 3: {
        ['what-helped', 'desired-support', 'advice'].forEach((id) => {
          const field = document.getElementById(id);
          if (field && !field.value.trim()) {
            field.style.borderColor = 'var(--teal-waters)';
            showError(field, 'Please share your response before continuing.');
            isValid = false;
          }
        });
        break;
      }
      case 4: {
        if (!consentInput.checked) {
          showError(document.getElementById('consent-group'), 'Please confirm you understand before submitting.');
          isValid = false;
        }
        break;
      }
    }

    if (!isValid) {
      step.querySelector('.form-error')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    return isValid;
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
    surveyData.anonymous = anonymousInput?.checked ?? true;
    surveyData.participantName = anonymousInput?.checked ? null : document.getElementById('participant-name')?.value.trim() || null;
    surveyData.participantEmail = anonymousInput?.checked ? null : document.getElementById('participant-email')?.value.trim() || null;
    surveyData.submittedAt = new Date().toISOString();
    return surveyData;
  }

  async function submitSurvey() {
    const data = collectData();

    if (!data.role || !data.childrenCount || !data.communication) {
      showStep(0);
      validateStep(0);
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    try {
      await submitToFirestore(data);
      window.location.href = 'thank-you.html';
    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit response →';
      const hint = document.createElement('p');
      hint.className = 'form-hint form-error';
      hint.textContent = 'Something went wrong submitting your response. Please try again.';
      submitBtn.closest('.step-actions')?.appendChild(hint);
    }
  }

  // Submit to Firestore — replace with the Firebase SDK call (see firebase/config.js)
  async function submitToFirestore(data) {
    // Simulated network request
    await new Promise((resolve) => setTimeout(resolve, 900));
    // Example real integration:
    //   const { addDoc, collection } = await import('https://www.gstatic.com/firebasejs/10.x/firebase-firestore.js');
    //   await addDoc(collection(db, 'parentSurveyResponses'), data);
    console.log('Parent Voice Study response submitted:', data);
    return true;
  }

  document.addEventListener('DOMContentLoaded', init);
})();
