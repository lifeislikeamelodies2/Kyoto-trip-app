// Mobile Safari stability: use normal page navigation for internal app links.
// app.js already writes correct href values, so we allow the browser to load
// ?page= / ?spot= / ?food= URLs normally instead of replacing the entire DOM
// in-place. This also releases page-specific timers/listeners between screens.
(() => {
  'use strict';

  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const link = target.closest('a[data-route]');
    if (!link) return;

    // Do not cancel the browser's default link action. We only prevent the
    // older SPA click handler in app.js from running for this click.
    event.stopImmediatePropagation();
  }, true);
})();
