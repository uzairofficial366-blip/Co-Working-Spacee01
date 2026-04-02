/* ============================================================
   registration.js — Student Registration Modal Logic
   IT Artificer — Premium Coworking Space
   ============================================================ */

(function () {

  /* ── DOM REFERENCES ── */
  const overlay   = document.getElementById('regOverlay');
  const closeBtn  = document.getElementById('regClose');
  const nextBtn   = document.getElementById('regNext');
  const backBtn   = document.getElementById('regBack');
  const doneBtn   = document.getElementById('regDone');
  const successEl = document.getElementById('regSuccess');
  const footerEl  = document.getElementById('regFooter');

  let currentPage = 1;
  const TOTAL_PAGES = 4;


  /* ── OPEN / CLOSE ── */
  function openModal() {
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    goToPage(1);
  }

  function closeModal() {
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  // Trigger buttons (section CTA + card CTA)
  ['openStudentReg', 'openStudentReg2'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', openModal);
  });

  closeBtn.addEventListener('click', closeModal);

  // Close on backdrop click
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeModal();
  });

  // Close on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
  });

  // Done button after successful submission
  if (doneBtn) {
    doneBtn.addEventListener('click', function () {
      closeModal();
      resetForm();
    });
  }


  /* ── PAGE NAVIGATION ── */
  function goToPage(n) {
    currentPage = n;

    // Show the correct page
    document.querySelectorAll('.reg-page').forEach(p => p.classList.remove('is-active'));
    const pg = document.getElementById('reg-page-' + n);
    if (pg) pg.classList.add('is-active');

    // Update step indicators
    for (let i = 1; i <= TOTAL_PAGES; i++) {
      const ind = document.getElementById('step-ind-' + i);
      if (!ind) continue;
      ind.classList.remove('active', 'done');
      const numEl = ind.querySelector('.reg-step__num');

      if (i < n) {
        ind.classList.add('done');
        numEl.textContent = '✓';
      } else if (i === n) {
        ind.classList.add('active');
        numEl.textContent = i;
      } else {
        numEl.textContent = i;
      }
    }

    // Back button visibility
    backBtn.style.visibility = n === 1 ? 'hidden' : 'visible';

    // Next button label
    if (n === TOTAL_PAGES) {
      nextBtn.textContent = 'Submit Application ✓';
    } else {
      nextBtn.innerHTML = 'Continue →';
    }

    // Populate review summary on last page
    if (n === 4) populateReview();
  }

  nextBtn.addEventListener('click', function () {
    if (!validatePage(currentPage)) return;
    if (currentPage < TOTAL_PAGES) {
      goToPage(currentPage + 1);
    } else {
      submitForm();
    }
  });

  backBtn.addEventListener('click', function () {
    if (currentPage > 1) goToPage(currentPage - 1);
  });


  /* ── VALIDATION ── */
  function validatePage(n) {
    let ok = true;

    function check(fieldId, inputId, testFn) {
      const field = document.getElementById(fieldId);
      const input = document.getElementById(inputId);
      if (!field || !input) return;
      const valid = testFn(input.value.trim());
      field.classList.toggle('has-error', !valid);
      input.classList.toggle('error', !valid);
      if (!valid) ok = false;
    }

    if (n === 1) {
      check('field-firstName', 'firstName',  v => v.length > 0);
      check('field-lastName',  'lastName',   v => v.length > 0);
      check('field-email',     'regEmail',   v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v));
      check('field-phone',     'regPhone',   v => v.length >= 7);
      check('field-dob',       'regDob',     v => v.length > 0);
    }

    if (n === 2) {
      check('field-university', 'regUniversity', v => v.length > 0);
      check('field-studentId',  'regStudentId',  v => v.length > 0);
      check('field-degree',     'regDegree',     v => v.length > 0);
      check('field-semester',   'regSemester',   v => v.length > 0);
      check('field-field',      'regField',      v => v.length > 0);
    }

    if (n === 3) {
      check('field-startDate', 'regStartDate', v => v.length > 0);
      check('field-duration',  'regDuration',  v => v.length > 0);

      const anyDay = document.querySelectorAll('.day-chk:checked').length > 0;
      document.getElementById('daysError').style.display = anyDay ? 'none' : 'block';
      if (!anyDay) ok = false;
    }

    if (n === 4) {
      const agreed = document.getElementById('agreeTerms').checked;
      document.getElementById('agreeError').style.display = agreed ? 'none' : 'block';
      if (!agreed) ok = false;
    }

    return ok;
  }


  /* ── REVIEW SUMMARY ── */
  function populateReview() {
    const days = [...document.querySelectorAll('.day-chk:checked')]
      .map(c => c.value).join(', ') || '—';
    const planInput = document.querySelector('input[name="regPlan"]:checked');
    const plan = planInput ? planInput.value : '—';

    const items = [
      ['Full Name',     ((document.getElementById('firstName').value || '') + ' ' + (document.getElementById('lastName').value || '')).trim() || '—'],
      ['Email',          document.getElementById('regEmail').value     || '—'],
      ['Phone',          document.getElementById('regPhone').value     || '—'],
      ['Date of Birth',  document.getElementById('regDob').value       || '—'],
      ['University',     document.getElementById('regUniversity').value || '—'],
      ['Student ID',     document.getElementById('regStudentId').value  || '—'],
      ['Degree',         document.getElementById('regDegree').value     || '—'],
      ['Semester',       document.getElementById('regSemester').value   || '—'],
      ['Field',          document.getElementById('regField').value      || '—'],
      ['Selected Plan',  plan.charAt(0).toUpperCase() + plan.slice(1)],
      ['Start Date',     document.getElementById('regStartDate').value  || '—'],
      ['Duration',       document.getElementById('regDuration').value   || '—'],
      ['Preferred Days', days],
    ];

    document.getElementById('reviewContent').innerHTML = items.map(([k, v]) =>
      `<div style="padding:6px 0;border-bottom:1px solid rgba(59,130,246,.1)">
         <span style="color:var(--muted);font-size:.78rem;display:block;margin-bottom:2px;">${k}</span>
         <span style="color:var(--white);font-weight:600;">${v}</span>
       </div>`
    ).join('');
  }


  /* ── SUBMIT ── */
  function submitForm() {
    const ref = 'ITA-' + Math.floor(100000 + Math.random() * 900000);
    document.getElementById('regRef').textContent = 'REF #' + ref;

    // Hide form pages and steps, show success screen
    document.querySelectorAll('.reg-page').forEach(p => p.classList.remove('is-active'));
    document.querySelectorAll('.reg-steps').forEach(s => s.style.display = 'none');
    successEl.classList.add('is-visible');
    footerEl.style.display = 'none';
  }


  /* ── RESET ── */
  function resetForm() {
    document.querySelectorAll('.reg-input, .reg-select, .reg-textarea')
      .forEach(el => el.value = '');
    document.querySelectorAll('.day-chk')
      .forEach(c => c.checked = false);

    document.getElementById('agreeTerms').checked = false;
    document.querySelectorAll('.reg-field').forEach(f => f.classList.remove('has-error'));
    document.querySelectorAll('.reg-input, .reg-select').forEach(el => el.classList.remove('error'));

    successEl.classList.remove('is-visible');
    document.querySelectorAll('.reg-steps').forEach(s => s.style.display = '');
    footerEl.style.display = '';

    goToPage(1);
  }

})();
