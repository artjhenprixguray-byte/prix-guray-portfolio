/* Progressive enhancement: content stays visible without animation support. */
(() => {
  const pref = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!Element.prototype.animate || pref.matches) return;
  const running = new Set();
  const enter = (el, delay = 0, dist = 14) => {
    if (!el || el.contains(document.activeElement)) return;
    const a = el.animate(
      [{ opacity: 0, transform: `translateY(${dist}px)` }, { opacity: 1, transform: 'translateY(0)' }],
      { duration: 600, delay, easing: 'cubic-bezier(.22, 1, .36, 1)', fill: 'backwards' });
    running.add(a);
    a.onfinish = a.oncancel = () => running.delete(a);
  };
  // Hero entrance
  enter(document.querySelector('.copy h1'), 0, 12);
  enter(document.querySelector('.portrait'), 100, 16);
  // Reveal each block once as it scrolls into view
  let io;
  if ('IntersectionObserver' in window) {
    io = new IntersectionObserver(entries => entries.forEach(e => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      enter(e.target);
    }), { threshold: 0, rootMargin: '0px 0px -24px 0px' });
    document.querySelectorAll(
      '.split > div:first-child, .services > div, .tabs, .panel, .about > *, ' +
      '.timeline li, .tools, iframe, .contact .grid > *'
    ).forEach(el => io.observe(el));
  }
  // Reduced-motion changes apply immediately
  pref.addEventListener('change', e => {
    if (!e.matches) return;
    if (io) io.disconnect();
    running.forEach(a => a.cancel());
    running.clear();
  });
  // Keyboard users never wait for a reveal to finish
  document.addEventListener('focusin', e => running.forEach(a => {
    if (a.effect.target.contains(e.target)) a.cancel();
  }));
})();
