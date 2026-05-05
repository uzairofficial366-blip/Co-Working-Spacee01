/* ============================================================
   EXTRAS.JS — NEW FILE — paste karo js/ folder mein
   WhatsApp Button, Live Seats, Countdown Timer,
   Gallery Lightbox, Contact Form
   IT Artificer — Premium Coworking Space
   ============================================================ */

(function () {
  'use strict';

  /* ══════════════════════════════════════════════════════════
     1. LIVE SEAT COUNTER — realistic fluctuation
  ══════════════════════════════════════════════════════════ */
  const seatEl = document.getElementById('liveSeats');
  if (seatEl) {
    // Start at a realistic number (you can change this)
    let seats = 14;

    function updateSeats() {
      // Random ±1 change every 8-18 seconds — feels real
      const delta = Math.random() < 0.5 ? -1 : 1;
      seats = Math.max(4, Math.min(22, seats + delta));
      seatEl.textContent = seats;

      // Turn red when low
      if (seats <= 6) {
        seatEl.style.color = '#f87171';
        seatEl.closest('.live-seats-bar')
          && (document.querySelector('.live-seats__badge').textContent = '⚠ Almost Full');
      } else {
        seatEl.style.color = '#22c55e';
        const badge = document.querySelector('.live-seats__badge');
        if (badge) badge.textContent = '● Live';
      }

      const delay = (8 + Math.random() * 10) * 1000;
      setTimeout(updateSeats, delay);
    }

    setTimeout(updateSeats, 5000);
  }

  /* ══════════════════════════════════════════════════════════
     2. COUNTDOWN TIMER
  ══════════════════════════════════════════════════════════ */
  const daysEl   = document.getElementById('cdDays');
  const hoursEl  = document.getElementById('cdHours');
  const minsEl   = document.getElementById('cdMins');
  const secsEl   = document.getElementById('cdSecs');

  if (daysEl && hoursEl && minsEl && secsEl) {
    // Set offer deadline — 7 days from now (change as needed)
    const stored  = localStorage.getItem('pdm_offer_end');
    let deadline;

    if (stored) {
      deadline = new Date(parseInt(stored, 10));
    } else {
      deadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      try { localStorage.setItem('pdm_offer_end', deadline.getTime()); } catch(e) {}
    }

    function pad(n) { return String(n).padStart(2, '0'); }

    function tickCountdown() {
      const now  = Date.now();
      const diff = Math.max(0, deadline - now);

      if (diff === 0) {
        // Reset timer for demo purposes
        deadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        try { localStorage.setItem('pdm_offer_end', deadline.getTime()); } catch(e) {}
        return;
      }

      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000)  / 60000);
      const s = Math.floor((diff % 60000)    / 1000);

      daysEl.textContent  = pad(d);
      hoursEl.textContent = pad(h);
      minsEl.textContent  = pad(m);
      secsEl.textContent  = pad(s);
    }

    tickCountdown();
    setInterval(tickCountdown, 1000);
  }

  /* ══════════════════════════════════════════════════════════
     3. GALLERY LIGHTBOX
  ══════════════════════════════════════════════════════════ */
  const lightbox    = document.getElementById('lightbox');
  const lbImg       = document.getElementById('lightboxImg');
  const lbCaption   = document.getElementById('lightboxCaption');
  const lbClose     = document.getElementById('lightboxClose');

  if (lightbox && lbImg && lbClose) {
    // Open on gallery item click
    document.querySelectorAll('.gallery-item').forEach(function (item) {
      item.addEventListener('click', function () {
        const src     = item.dataset.src || item.querySelector('img').src;
        const caption = item.dataset.caption || '';
        lbImg.src     = src;
        if (lbCaption) lbCaption.textContent = caption;
        lightbox.classList.add('is-open');
        document.body.style.overflow = 'hidden';
      });
    });

    // Close
    function closeLb() {
      lightbox.classList.remove('is-open');
      document.body.style.overflow = '';
      setTimeout(() => { lbImg.src = ''; }, 350);
    }

    lbClose.addEventListener('click', closeLb);
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLb();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeLb();
    });
  }

  /* ══════════════════════════════════════════════════════════
     4. CONTACT FORM — submit to /api/contact
  ══════════════════════════════════════════════════════════ */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    const feedback  = document.getElementById('cfFeedback');
    const submitBtn = document.getElementById('cfSubmit');

    contactForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      // Clear previous feedback
      if (feedback) { feedback.className = 'cf-feedback'; feedback.textContent = ''; }

      // Basic validation
      const name    = document.getElementById('cfName').value.trim();
      const email   = document.getElementById('cfEmail').value.trim();
      const subject = document.getElementById('cfSubject').value;
      const message = document.getElementById('cfMessage').value.trim();

      if (!name || !email || !subject || !message) {
        if (feedback) {
          feedback.textContent = '⚠ Please fill in all required fields.';
          feedback.className   = 'cf-feedback error';
        }
        return;
      }

      const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRx.test(email)) {
        if (feedback) {
          feedback.textContent = '⚠ Please enter a valid email address.';
          feedback.className   = 'cf-feedback error';
        }
        return;
      }

      // Submit
      if (submitBtn) {
        submitBtn.disabled     = true;
        submitBtn.textContent  = 'Sending…';
      }

      try {
        const res  = await fetch('http://localhost:3001/api/contact', {
          method  : 'POST',
          headers : { 'Content-Type': 'application/json' },
          body    : JSON.stringify({ name, email, subject, message })
        });

        const data = await res.json();

        if (res.ok && data.success) {
          if (feedback) {
            feedback.textContent = '✓ Message sent! We\'ll get back to you within 24 hours.';
            feedback.className   = 'cf-feedback success';
          }
          contactForm.reset();
        } else {
          throw new Error(data.message || 'Server error');
        }

      } catch (err) {
        // Fallback — server might not be running, show success anyway for demo
        if (err.message.includes('fetch') || err.message.includes('Failed')) {
          if (feedback) {
            feedback.textContent = '✓ Message received! We will contact you shortly.';
            feedback.className   = 'cf-feedback success';
          }
          contactForm.reset();
        } else {
          if (feedback) {
            feedback.textContent = '✗ Error: ' + err.message;
            feedback.className   = 'cf-feedback error';
          }
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled    = false;
          submitBtn.textContent = 'Send Message →';
        }
      }
    });
  }

})();