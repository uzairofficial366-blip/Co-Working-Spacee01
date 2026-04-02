/* ============================================================
   ui.js — Nav Toggle, Hero Slider, Testimonial Slider,
            Scroll Reveal, Sticky Header, FAQ Accordion
   IT Artificer — Premium Coworking Space
   ============================================================ */

(function () {

  /* ── NAV TOGGLE (mobile off-canvas) ── */
  const navToggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      const open = nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', open);
      navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      document.body.style.overflow = open ? 'hidden' : '';
    });

    // Close nav when any link is clicked
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Open menu');
        document.body.style.overflow = '';
      });
    });
  }


  /* ── HERO SLIDER ── */
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


  /* ── TESTIMONIAL SLIDER (mobile only) ── */
  const track = document.querySelector('.testimonial-track');
  const tDots = document.querySelector('.testimonial-dots');
  const tests = document.querySelectorAll('.testimonial-track .testimonial');

  if (track && tDots && tests.length) {
    const mq = window.matchMedia('(max-width:767px)');
    let tIdx = 0;

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
        tDots.querySelectorAll('button').forEach((b, i) => b.classList.toggle('is-active', i === tIdx));
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


  /* ── SCROLL REVEAL ── */
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        revealObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  revealEls.forEach(el => revealObserver.observe(el));


  /* ── STICKY HEADER — darken on scroll ── */
  const header = document.querySelector('.header');
  window.addEventListener('scroll', () => {
    if (!header) return;
    header.style.background = window.scrollY > 40
      ? 'rgba(2,11,24,.97)'
      : 'rgba(6,21,41,.82)';
  });


  /* ── FAQ ACCORDION ── */
  document.querySelectorAll('.faq-question').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const item   = btn.closest('.faq-item');
      const isOpen = item.classList.contains('is-open');

      // Close all
      document.querySelectorAll('.faq-item').forEach(function (i) {
        i.classList.remove('is-open');
        i.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
      });

      // Re-open clicked if it was closed
      if (!isOpen) {
        item.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

})();
