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
