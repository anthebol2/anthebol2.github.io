/* Alternate the two marks gently while visible; click also switches them. */
(function () {
  'use strict';
  var button = document.querySelector('.education-logo-switch');
  if (!button) return;
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var timer = null;
  var visible = !('IntersectionObserver' in window);
  function switchLogo() {
    button.setAttribute('aria-pressed', String(button.getAttribute('aria-pressed') !== 'true'));
  }
  function updateTimer() {
    clearInterval(timer);
    timer = null;
    if (visible && !document.hidden && !reducedMotion.matches) {
      timer = setInterval(switchLogo, 4000);
    }
  }
  button.addEventListener('click', function () {
    switchLogo();
    updateTimer();
  });
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      updateTimer();
    }, { threshold:0.25 });
    observer.observe(button);
  }
  document.addEventListener('visibilitychange', updateTimer);
  if (reducedMotion.addEventListener) reducedMotion.addEventListener('change', updateTimer);
  else reducedMotion.addListener(updateTimer);
  updateTimer();
})();
