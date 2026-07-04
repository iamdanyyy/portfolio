/* Emmanuel Amdany — portfolio
   Small, dependency-free: mobile nav, scroll-spy, reveal-on-scroll. */

(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---- Mobile navigation ---- */
  var head = document.getElementById('site-head');
  var toggle = head.querySelector('.nav-toggle');
  var menu = document.getElementById('site-menu');

  function closeMenu() {
    head.removeAttribute('data-open');
    toggle.setAttribute('aria-expanded', 'false');
  }

  toggle.addEventListener('click', function () {
    var open = head.hasAttribute('data-open');
    if (open) {
      closeMenu();
    } else {
      head.setAttribute('data-open', '');
      toggle.setAttribute('aria-expanded', 'true');
    }
  });

  menu.addEventListener('click', function (e) {
    if (e.target.closest('a')) closeMenu();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && head.hasAttribute('data-open')) {
      closeMenu();
      toggle.focus();
    }
  });

  /* ---- Scroll-spy: mark the nav link of the section in view ---- */
  var spyLinks = Array.prototype.slice.call(document.querySelectorAll('[data-spy]'));
  var sections = spyLinks
    .map(function (link) {
      return document.querySelector(link.getAttribute('href'));
    })
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    var setCurrent = function (id) {
      spyLinks.forEach(function (link) {
        if (link.getAttribute('href') === '#' + id) {
          link.setAttribute('aria-current', 'true');
        } else {
          link.removeAttribute('aria-current');
        }
      });
    };

    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) setCurrent(entry.target.id);
        });
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---- Nairobi clock in the footer ---- */
  var timeEl = document.getElementById('local-time');
  if (timeEl && window.Intl && Intl.DateTimeFormat) {
    var fmt = new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Africa/Nairobi'
    });
    var tick = function () { timeEl.textContent = fmt.format(new Date()); };
    tick();
    setInterval(tick, 30000);
  }

  /* ---- Pointer-tracked specular highlight on glass bubbles ---- */
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && !reducedMotion.matches) {
    var glassSelector =
      '.glass, .site-nav, .btn, .hero-photo, .stack-row, .project, .socials a, .foot-grid';
    document.addEventListener('pointermove', function (e) {
      var el = e.target && e.target.closest ? e.target.closest(glassSelector) : null;
      if (!el) return;
      var rect = el.getBoundingClientRect();
      el.style.setProperty('--mx', (e.clientX - rect.left) + 'px');
      el.style.setProperty('--my', (e.clientY - rect.top) + 'px');
    }, { passive: true });
  }

  /* ---- Reveal on scroll ---- */
  var revealables = document.querySelectorAll('.reveal');

  if (reducedMotion.matches || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }

  var revealAll = function () {
    revealables.forEach(function (el) { el.classList.add('is-visible'); });
  };

  var observerFired = false;
  var revealer = new IntersectionObserver(
    function (entries) {
      observerFired = true;
      var batch = entries.filter(function (entry) { return entry.isIntersecting; });
      batch.forEach(function (entry, i) {
        /* stagger items that enter together, capped so fast scrolling
           can't push reveals absurdly late */
        entry.target.style.transitionDelay = Math.min(i * 70, 420) + 'ms';
        entry.target.classList.add('is-visible');
        revealer.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.05 }
  );

  revealables.forEach(function (el) { revealer.observe(el); });

  /* Watchdog: a healthy observer always delivers an initial batch of entries.
     If none arrive (broken/blocked observer), un-hide everything so content
     can never be permanently invisible. */
  setTimeout(function () {
    if (!observerFired) {
      revealer.disconnect();
      revealAll();
    }
  }, 1500);
})();
