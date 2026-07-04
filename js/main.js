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

  /* ---- Circuit-web background (hero & contact canvases) ---- */
  (function () {
    var canvases = document.querySelectorAll('canvas.circuit');
    if (!canvases.length || !window.requestAnimationFrame) return;

    var schemeQuery = window.matchMedia('(prefers-color-scheme: dark)');

    function cssColor(name, fallback) {
      var v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
      var hex = (v || fallback).replace('#', '');
      if (hex.length === 3) {
        hex = hex.charAt(0) + hex.charAt(0) + hex.charAt(1) + hex.charAt(1) + hex.charAt(2) + hex.charAt(2);
      }
      var n = parseInt(hex, 16);
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    }

    canvases.forEach(function (canvas) {
      var ctx = canvas.getContext('2d');
      if (!ctx) return;

      var LINK = 150;
      var nodes = [];
      var pulses = [];
      var w = 0;
      var h = 0;
      var raf = null;
      var inView = true;
      var ink = [23, 22, 20];
      var accent = [125, 97, 21];

      function rgba(c, a) {
        return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')';
      }

      function readPalette() {
        ink = cssColor('--ink', '#171614');
        accent = cssColor('--accent', '#7d6115');
      }

      function seed() {
        nodes = [];
        var count = Math.min(60, Math.max(18, Math.round((w * h) / 26000)));
        for (var i = 0; i < count; i++) {
          nodes.push({
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3
          });
        }
        pulses = [];
      }

      function resize() {
        var rect = canvas.getBoundingClientRect();
        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        w = rect.width;
        h = rect.height;
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        seed();
      }

      function spawnPulse() {
        for (var tries = 0; tries < 8; tries++) {
          var a = nodes[(Math.random() * nodes.length) | 0];
          var b = nodes[(Math.random() * nodes.length) | 0];
          if (a === b) continue;
          var dx = a.x - b.x;
          var dy = a.y - b.y;
          if (dx * dx + dy * dy < LINK * LINK) {
            pulses.push({ a: a, b: b, t: 0 });
            return;
          }
        }
      }

      function render(animate) {
        ctx.clearRect(0, 0, w, h);

        if (animate) {
          for (var i = 0; i < nodes.length; i++) {
            var n = nodes[i];
            n.x += n.vx;
            n.y += n.vy;
            if (n.x < 0 || n.x > w) n.vx = -n.vx;
            if (n.y < 0 || n.y > h) n.vy = -n.vy;
          }
        }

        for (var i2 = 0; i2 < nodes.length; i2++) {
          for (var j = i2 + 1; j < nodes.length; j++) {
            var dx = nodes[i2].x - nodes[j].x;
            var dy = nodes[i2].y - nodes[j].y;
            var d2 = dx * dx + dy * dy;
            if (d2 < LINK * LINK) {
              var alpha = (1 - Math.sqrt(d2) / LINK) * 0.16;
              ctx.strokeStyle = rgba(ink, alpha);
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(nodes[i2].x, nodes[i2].y);
              ctx.lineTo(nodes[j].x, nodes[j].y);
              ctx.stroke();
            }
          }
        }

        /* square nodes for the circuit feel */
        ctx.fillStyle = rgba(ink, 0.35);
        for (var k = 0; k < nodes.length; k++) {
          ctx.fillRect(nodes[k].x - 1.25, nodes[k].y - 1.25, 2.5, 2.5);
        }

        if (animate) {
          if (pulses.length < 4 && Math.random() < 0.02) spawnPulse();
          for (var p = pulses.length - 1; p >= 0; p--) {
            var pu = pulses[p];
            pu.t += 0.015;
            if (pu.t >= 1) {
              pulses.splice(p, 1);
              continue;
            }
            var px = pu.a.x + (pu.b.x - pu.a.x) * pu.t;
            var py = pu.a.y + (pu.b.y - pu.a.y) * pu.t;
            ctx.fillStyle = rgba(accent, 0.25);
            ctx.beginPath();
            ctx.arc(px, py, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = rgba(accent, 0.9);
            ctx.beginPath();
            ctx.arc(px, py, 1.6, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      function loop() {
        raf = null;
        if (!inView || document.hidden || reducedMotion.matches) return;
        render(true);
        raf = requestAnimationFrame(loop);
      }

      function wake() {
        if (reducedMotion.matches) {
          render(false);
        } else if (!raf && inView && !document.hidden) {
          raf = requestAnimationFrame(loop);
        }
      }

      readPalette();
      resize();
      wake();

      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
          inView = entries[0].isIntersecting;
          wake();
        }).observe(canvas);
      }
      document.addEventListener('visibilitychange', wake);
      window.addEventListener('resize', function () {
        resize();
        if (reducedMotion.matches) render(false);
      });
      var onScheme = function () {
        readPalette();
        if (reducedMotion.matches) render(false);
      };
      if (schemeQuery.addEventListener) schemeQuery.addEventListener('change', onScheme);
    });
  })();

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
