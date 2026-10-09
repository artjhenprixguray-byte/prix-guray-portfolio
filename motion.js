/* Progressive enhancement: content remains visible without animation support. */
(() => {
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!Element.prototype.animate) return;

  const running = new Set();
  let observer;
  const enter = (element, delay = 0, distance = 14) => {
    if (preference.matches || element.contains(document.activeElement)) return;
    const animation = element.animate([
      { opacity: 0, transform: `translateY(${distance}px)` },
      { opacity: 1, transform: 'translateY(0)' }
    ], { duration: 600, delay, easing: 'cubic-bezier(.22, 1, .36, 1)', fill: 'backwards' });
    running.add(animation);
    const release = () => running.delete(animation);
    animation.onfinish = release;
    animation.oncancel = release;
  };

  if (!preference.matches) {
    enter(document.querySelector('.hero-copy h1'), 0, 12);
    enter(document.querySelector('.hero-visual'), 100, 16);
    // A single understated flourish for the existing bronze monogram.
    const monogram = document.querySelector('.hero-card-footer b');
    const accent = monogram.animate([
      { opacity: .65 }, { opacity: 1 }
    ], { duration: 1000, delay: 300, easing: 'ease-out' });
    running.add(accent);
    accent.onfinish = accent.oncancel = () => running.delete(accent);

    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          observer.unobserve(entry.target);
          enter(entry.target);
        });
      }, { threshold: 0, rootMargin: '0px 0px -24px 0px' });
      document.querySelectorAll(
        '.promise-row article, .stats > div, .section-heading, #services .service-grid article, ' +
        '.work-sidecopy, .work-tabs, .work-panels, .meet-copy, .meet-gallery, ' +
        '.experience-intro, .experience-timeline article, .tool-strip, .booking-intro, .contact-card'
      ).forEach(element => observer.observe(element));
    }
  }

  // Preference changes take effect immediately, including in-flight entrances.
  preference.addEventListener('change', event => {
    if (!event.matches) return;
    observer?.disconnect();
    running.forEach(animation => animation.cancel());
    running.clear();
  });
  // Keyboard navigation never has to wait for a reveal to finish.
  document.addEventListener('focusin', event => {
    running.forEach(animation => {
      if (animation.effect.target.contains(event.target)) animation.cancel();
    });
  });
})();
