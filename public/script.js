// Soter AI Parent Voice Study — Survey JavaScript
// Handles step navigation, privacy toggle, validation, and Firebase submission

(() => {
  'use strict';

  // DOM Elements
  const steps = document.querySelectorAll('.step');
  const progressSteps = document.querySelectorAll('.step-progress');
  const submitBtn = document.getElementById('submit-btn');
  const anonymousInput = document.getElementById('anonymous');
  const nameEmailFields = document.getElementById('name-email-fields');
  const toggleCaption = document.getElementById('toggle-caption');
  const consentInput = document.getElementById('consent');
  const confirmation = document.querySelector('.confirmation');
  const confirmationClose = confirmation.querySelector('.confirmation .btn-secondary');
  const splashScreen = document.querySelector('.splash-screen');
  const skipLink = document.querySelector('.skip-link');

  // Survey state
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
    anonymous: false,
    participantName: '',
    participantEmail: '',
    submittedAt: new Date().toISOString(),
    surveyVersion: '1.0'
  };

  // Initialize
  function init() {
    setupSplashScreen();
    showStep(currentStep);
    setupEventListeners();
  }

  // Splash screen initialization and transition
  function setupSplashScreen() {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Splash screen intro animation duration
    const splashDuration = prefersReducedMotion ? 500 : 2000;

    // Hide splash screen after duration
    setTimeout(() => {
      splashScreen.classList.add('hidden');
      // Show skip link after splash
      if (skipLink) {
        skipLink.style.opacity = '1';
        skipLink.style.transform = 'translateX(0)';
      }
    }, splashDuration);

    // Allow user to skip splash screen
    if (skipLink) {
      skipLink.addEventListener('click', (e) => {
        e.preventDefault();
        splashScreen.classList.add('hidden');
      });
    }
  }

  // Show specific step
  function showStep(stepIndex) {
    // Hide all steps
    steps.forEach((step, index) => {
      step.hidden = true;
    });
    // Show current step
    if (steps[stepIndex]) {
      steps[stepIndex].hidden = false;
      steps[stepIndex].classList.add('active');
    }
    updateProgress(stepIndex);
  }

  // Update progress indicator
  function updateProgress(stepIndex) {
    progressSteps.forEach((progress, index) => {
      if (index < stepIndex + 1) {
        progress.classList.add('active');
      } else {
        progress.classList.remove('active');
      }
    });
  }

  // Setup event listeners
  function setupEventListeners() {
    // Begin Survey button
    const beginBtn = document.getElementById('begin-survey');
    if (beginBtn) {
      beginBtn.addEventListener('click', () => {
        currentStep = 0;
        showStep(0);
        document.getElementById('step-01').scrollIntoView({ behavior: 'smooth' });
      });
    }

    // Next step buttons
    document.querySelectorAll('.btn-next').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (validateStep(currentStep)) {
          currentStep++;
          showStep(currentStep);
          document.querySelector('.step.active')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });

    // Back buttons
    document.querySelectorAll('.btn-back').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentStep > 0) {
          currentStep--;
          showStep(currentStep);
          document.querySelector('.step.active')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });

    // Submit button (step 05)
    if (submitBtn) {
      submitBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (validateStep(currentStep) && consentInput.checked) {
          submitSurvey();
        }
      });
    }

    // Privacy toggle
    if (anonymousInput) {
      anonymousInput.addEventListener('change', function() {
        if (this.checked) {
          toggleCaption.textContent = 'Submit anonymously';
          nameEmailFields.hidden = true;
          surveyData.anonymous = true;
          surveyData.participantName = null;
          surveyData.participantEmail = null;
        }
      });
    }

    // Name/Email fields visibility based on toggle
    if (anonymousInput) {
      anonymousInput.dispatchEvent(new Event('change'));
    }

    // Consent validation
    if (consentInput) {
      consentInput.addEventListener('change', function() {
        submitBtn.disabled = !this.checked;
      });
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeConfirmation();
      }
      if (e.key === 'ArrowLeft' && currentStep > 0) {
        e.preventDefault();
        currentStep--;
        showStep(currentStep);
      }
      if (e.key === 'ArrowRight' && currentStep < stepCount - 1) {
        e.preventDefault();
        if (validateStep(currentStep)) {
          currentStep++;
          showStep(currentStep);
        }
      }
    });
  }

  // Validate current step
  function validateStep(stepIndex) {
    let isValid = true;
    const step = steps[stepIndex];
    
    // Clear previous errors
    step.querySelectorAll('.form-input, .form-textarea').forEach(el => {
      el.style.borderColor = '';
    });
    step.querySelectorAll('.form-hint').forEach(el => {
      el.style.display = 'none';
    });

    switch (stepIndex) {
      case 0: // Step 01: About You
        const role = step.querySelector('input[name="role"]:checked');
        const children = step.querySelector('input[name="children"]:checked');
        if (!role) { showError(step.querySelector('input[name="role"]'), 'Please select your role.'); isValid = false; }
        if (!children) { showError(step.querySelector('input[name="children"]'), 'Please select the number of children.'); isValid = false; }
        break;

      case 1: // Step 02: Communication
        const comm = step.querySelector('input[name="comm-describe"]:checked');
        if (!comm) { showError(step.querySelector('input[name="comm-describe"]'), 'Please describe communication.'); isValid = false; }
        const barriers = step.querySelector('#comm-barriers');
        if (barriers && !barriers.value.trim()) { showError(barriers, 'Please share what makes conversation difficult.'); isValid = false; }
        break;

      case 2: // Step 03: Experience
        const childOpening = step.querySelector('input[name="child-opening-up"]:checked');
        if (!childOpening) { showError(step.querySelector('input[name="child-opening-up"]'), 'Please indicate if this has happened.'); isValid = false; }
        const experience = step.querySelector('#experience-story');
        if (experience && !experience.value.trim()) { showError(experience, 'Please share your experience.'); isValid = false; }
        break;

      case 3: // Step 04: What Helps
        const helped = step.querySelector('#what-helped');
        if (helped && !helped.value.trim()) { showError(helped, 'Please share what helped.'); isValid = false; }
        const desired = step.querySelector('#desired-support');
        if (desired && !desired.value.trim()) { showError(desired, 'Please share what support is needed.'); isValid = false; }
        const advice = step.querySelector('#advice');
        if (advice && !advice.value.trim()) { showError(advice, 'Please share your advice.'); isValid = false; }
        break;

      case 4: // Step 05: Privacy
        // Handled by consent check
        break;
    }

    return isValid;
  }

  // Show error
  function showError(input, message) {
    input.style.borderColor = '#E74C3C';
    const hint = document.createElement('p');
    hint.className = 'form-hint';
    hint.style.color = '#E74C3C';
    hint.style.fontSize = '12px';
    hint.style.marginTop = '4px';
    hint.textContent = message;
    input.parentNode.appendChild(hint);
  }

  // Submit survey to Firebase
  function submitSurvey() {
    // Collect data from all steps
    // Re-read current step data
    const currentStepEl = steps[currentStep];
    
    // Role
    surveyData.role = document.querySelector('input[name="role"]:checked')?.value || '';
    surveyData.childrenCount = document.querySelector('input[name="children"]:checked')?.value || '';
    
    // Communication
    surveyData.communication = document.querySelector('input[name="comm-describe"]:checked')?.value || '';
    const barriers = document.getElementById('comm-barriers');
    surveyData.communicationBarriers = barriers ? barriers.value.trim() : '';
    
    // Experience
    const childOpening = document.querySelector('input[name="child-opening-up"]:checked')?.value || '';
    surveyData.childOpeningUpExperience = childOpening;
    const experience = document.getElementById('experience-story');
    surveyData.experienceStory = experience ? experience.value.trim() : '';
    
    // What Helps
    const whatHelped = document.getElementById('what-helped');
    surveyData.whatHelped = whatHelped ? whatHelped.value.trim() : '';
    const desiredSupport = document.getElementById('desired-support');
    surveyData.desiredSupport = desiredSupport ? desiredSupport.value.trim() : '';
    const advice = document.getElementById('advice');
    surveyData.adviceToOtherParents = advice ? advice.value.trim() : '';
    
    // Privacy
    surveyData.anonymous = anonymousInput?.checked;
    surveyData.participantName = document.getElementById('participant-name')?.value.trim() || null;
    surveyData.participantEmail = document.getElementById('participant-email')?.value.trim() || null;

    // Final data validation
    if (!surveyData.role || !surveyData.childrenCount || !surveyData.communication) {
      alert('Please complete all required fields.');
      return;
    }

    // Submit to Firestore
    submitToFirestore(surveyData);
  }

  // Submit to Firestore (simulated)
  async function submitToFirestore(data) {
    // Show submission in progress UI
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    // In a real implementation, use Firebase SDK
    // For now, simulate and show confirmation
    setTimeout(() => {
      showConfirmation();
    }, 1000);
  }

  // Show confirmation modal
  function showConfirmation() {
    steps.forEach(step => { step.hidden = true; });
    confirmation.hidden = false;
    confirmation.classList.add('visible');
  }

  // Close confirmation
  function closeConfirmation() {
    confirmation.hidden = true;
    confirmation.classList.remove('visible');
    // Reset to start
    currentStep = 0;
    showStep(currentStep);
  }

  // Close button in confirmation — robust selector
  const closeButtons = confirmation.querySelectorAll('.confirmation-container .btn-secondary');
  closeButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeConfirmation();
    });
  });

  // Close confirmation on overlay click
  if (confirmation) {
    confirmation.addEventListener('click', (e) => {
      if (e.target === confirmation || e.target.closest('.confirmation-container') === null) {
        closeConfirmation();
      }
    });
  }

  // Initialize on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', init);
})();