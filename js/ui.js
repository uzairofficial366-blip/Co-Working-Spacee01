/* ============================================================
   ui.js — Complete Enhanced Version
   IT Artificer — Premium Coworking Space
   NEW: Preloader, Counter Animation, Sticky Header, Active Nav,
        Hero Slider, Testimonial Slider, Scroll Reveal,
        FAQ Accordion, Back-to-Top, Theme Toggle
   ============================================================ */

(function () {
  'use strict';

  /* ══════════════════════════════════════════════════════════
     0. DARK / LIGHT THEME TOGGLE
     Persists choice to localStorage as 'ita_theme'
  ══════════════════════════════════════════════════════════ */
  (function initTheme() {
    var htmlEl      = document.documentElement;
    var savedTheme  = localStorage.getItem('pdm_theme') || 'light';
    htmlEl.setAttribute('data-theme', savedTheme);

    var btn     = document.getElementById('themeToggle');
    var iconMoon = document.getElementById('iconMoon');
    var iconSun  = document.getElementById('iconSun');

    function syncIcons(theme) {
      if (!iconMoon || !iconSun) return;
      if (theme === 'light') {
        iconMoon.style.display = 'none';
        iconSun.style.display  = 'block';
      } else {
        iconMoon.style.display = 'block';
        iconSun.style.display  = 'none';
      }
    }

    syncIcons(savedTheme);

    if (btn) {
      btn.addEventListener('click', function () {
        var current = htmlEl.getAttribute('data-theme') || 'light';
        var next    = current === 'dark' ? 'light' : 'dark';
        htmlEl.setAttribute('data-theme', next);
        localStorage.setItem('pdm_theme', next);
        syncIcons(next);
        // subtle scale feedback
        btn.style.transform = 'scale(.88)';
        setTimeout(function () { btn.style.transform = ''; }, 200);
      });
    }
  })();

  /* ══════════════════════════════════════════════════════════
     1. PRELOADER
  ══════════════════════════════════════════════════════════ */
  const preloader = document.getElementById('preloader');
  if (preloader) {
    window.addEventListener('load', function () {
      setTimeout(function () {
        preloader.classList.add('hide');
        document.body.style.overflow = '';
      }, 900);
    });
    document.body.style.overflow = 'hidden';
  }



  /* ══════════════════════════════════════════════════════════
     2. STICKY HEADER — scroll class + active nav highlight
  ══════════════════════════════════════════════════════════ */
  const header = document.querySelector('.header');
  const sections = document.querySelectorAll('main section[id], main div[id]');
  const navLinks = document.querySelectorAll('.nav__list a');

  function onScroll() {
    if (!header) return;

    // Scrolled class
    if (window.scrollY > 50) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }

    // Active nav link based on scroll position
    let current = '';
    sections.forEach(sec => {
      const top = sec.offsetTop - 120;
      if (window.scrollY >= top) current = sec.getAttribute('id');
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ══════════════════════════════════════════════════════════
     3. NAV TOGGLE — mobile off-canvas
  ══════════════════════════════════════════════════════════ */
  const navToggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      const open = nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', open);
      navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      document.body.style.overflow = open ? 'hidden' : '';

      // Animate hamburger to X
      navToggle.classList.toggle('is-open', open);
    });

    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('is-open');
        navToggle.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Open menu');
        document.body.style.overflow = '';
      });
    });
  }

  /* ══════════════════════════════════════════════════════════
     4. HERO SLIDER
  ══════════════════════════════════════════════════════════ */
  const slides  = document.querySelectorAll('.hero__slide');
  const dots    = document.querySelectorAll('.hero__dot');
  const prevBtn = document.querySelector('.hero__nav--prev');
  const nextBtn = document.querySelector('.hero__nav--next');
  let heroIndex = 0;
  let heroTimer;

  function setHero(i) {
    heroIndex = (i + slides.length) % slides.length;
    slides.forEach((s, j) => s.classList.toggle('is-active', j === heroIndex));
    dots.forEach((d, j) => {
      d.classList.toggle('is-active', j === heroIndex);
      d.setAttribute('aria-selected', j === heroIndex);
    });
  }

  function resetHeroTimer() {
    clearInterval(heroTimer);
    heroTimer = setInterval(() => setHero(heroIndex + 1), 6000);
  }

  if (slides.length) {
    dots.forEach((d, i) => d.addEventListener('click', () => { setHero(i); resetHeroTimer(); }));
    if (prevBtn) prevBtn.addEventListener('click', () => { setHero(heroIndex - 1); resetHeroTimer(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { setHero(heroIndex + 1); resetHeroTimer(); });
    resetHeroTimer();
  }

  /* ══════════════════════════════════════════════════════════
     5. SCROLL REVEAL (extended — also handles left/right/scale)
  ══════════════════════════════════════════════════════════ */
  const revealSelectors = '.reveal, .reveal-left, .reveal-right, .reveal-scale';
  const revealEls = document.querySelectorAll(revealSelectors);

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        revealObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.10 });

  revealEls.forEach(el => revealObserver.observe(el));

  /* ══════════════════════════════════════════════════════════
     6. COUNTER ANIMATION — runs when stats bar enters view
  ══════════════════════════════════════════════════════════ */
  function animateCounter(el, target, suffix, duration) {
    const start    = performance.now();
    const isFloat  = target % 1 !== 0;

    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased    = 1 - Math.pow(1 - progress, 3);
      const value    = isFloat
        ? (eased * target).toFixed(1)
        : Math.round(eased * target);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const statsBar = document.querySelector('.stats-bar');
  if (statsBar) {
    const statNums = statsBar.querySelectorAll('.stat-num');
    let counted    = false;

    const statsObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !counted) {
        counted = true;
        statNums.forEach(el => {
          // Parse "640+" → target=640, suffix="+"
          const raw    = el.textContent.trim();
          const suffix = raw.replace(/[\d.]/g, '');
          const target = parseFloat(raw.replace(/[^\d.]/g, ''));
          if (!isNaN(target)) {
            el.textContent = '0' + suffix;
            animateCounter(el, target, suffix, 1800);
          }
        });
        statsObserver.disconnect();
      }
    }, { threshold: 0.4 });

    statsObserver.observe(statsBar);
  }

  /* ══════════════════════════════════════════════════════════
     7. TYPING EFFECT — on first hero eyebrow text
  ══════════════════════════════════════════════════════════ */
  const heroEyebrow = document.querySelector('.hero__slide.is-active .eyebrow');
  if (heroEyebrow) {
    const original = heroEyebrow.textContent.trim();
    heroEyebrow.textContent = '';
    let idx = 0;

    function typeNext() {
      if (idx <= original.length) {
        heroEyebrow.textContent = original.slice(0, idx);
        idx++;
        setTimeout(typeNext, 55);
      }
    }

    // Start after preloader + slide animation
    setTimeout(typeNext, 1100);
  }

  /* ══════════════════════════════════════════════════════════
     8. TESTIMONIAL SLIDER (mobile only)
  ══════════════════════════════════════════════════════════ */
  const track = document.querySelector('.testimonial-track');
  const tDots = document.querySelector('.testimonial-dots');
  const tests = document.querySelectorAll('.testimonial-track .testimonial');

  if (track && tDots && tests.length) {
    const mq = window.matchMedia('(max-width:767px)');
    let tIdx  = 0;

    function buildTDots() {
      tDots.innerHTML = '';
      if (!mq.matches) return;

      tests.forEach((_, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('aria-label', 'Testimonial ' + (i + 1));
        if (i === 0) b.classList.add('is-active');
        b.addEventListener('click', () => { tIdx = i; applyT(); });
        tDots.appendChild(b);
      });
    }

    function applyT() {
      if (mq.matches) {
        const w = track.parentElement ? track.parentElement.offsetWidth : 0;
        track.style.transform = 'translateX(' + (-tIdx * w) + 'px)';
        tDots.querySelectorAll('button').forEach((b, i) =>
          b.classList.toggle('is-active', i === tIdx));
      } else {
        track.style.transform = '';
        tIdx = 0;
      }
    }

    buildTDots();
    applyT();
    mq.addEventListener('change', () => { tIdx = 0; buildTDots(); applyT(); });
    window.addEventListener('resize', () => { if (mq.matches) applyT(); });
  }

  /* ══════════════════════════════════════════════════════════
     9. FAQ ACCORDION
  ══════════════════════════════════════════════════════════ */
  document.querySelectorAll('.faq-question').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const item   = btn.closest('.faq-item');
      const isOpen = item.classList.contains('is-open');

      document.querySelectorAll('.faq-item').forEach(function (i) {
        i.classList.remove('is-open');
        i.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
      });

      if (!isOpen) {
        item.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ══════════════════════════════════════════════════════════
     10. BACK-TO-TOP BUTTON
  ══════════════════════════════════════════════════════════ */
  const btt = document.getElementById('backToTop');
  if (btt) {
    window.addEventListener('scroll', function () {
      btt.classList.toggle('is-visible', window.scrollY > 500);
    }, { passive: true });

    btt.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ══════════════════════════════════════════════════════════
     11. SMOOTH SCROLL for all anchor links
  ══════════════════════════════════════════════════════════ */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = header ? header.offsetHeight + 16 : 80;
        const top    = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ══════════════════════════════════════════════════════════
     12. CARD TILT — subtle 3D on hover (desktop only)
  ══════════════════════════════════════════════════════════ */
  if (window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.feature-card, .price-card, .event-card').forEach(card => {
      card.addEventListener('mousemove', function (e) {
        const rect   = card.getBoundingClientRect();
        const x      = e.clientX - rect.left;
        const y      = e.clientY - rect.top;
        const cx     = rect.width  / 2;
        const cy     = rect.height / 2;
        const rotX   = ((y - cy) / cy) * -6;
        const rotY   = ((x - cx) / cx) *  6;
        card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-8px)`;
      });

      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
      });
    });
  }

  /* ══════════════════════════════════════════════════════════
     13. NAV-TOGGLE — hamburger → X animation helper
  ══════════════════════════════════════════════════════════ */
  // CSS handles the visual via .nav-toggle.is-open
  // (spans transform in responsive.css)

})();