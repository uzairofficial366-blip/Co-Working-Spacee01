/* ============================================================
   registration.js — Student Registration Modal
   IT Artificer — Premium Coworking Space
   Connects to Express + PostgreSQL backend
   ============================================================ */

(function () {

  /* ── BACKEND URL — make sure node server.js is running ── */
  const API_BASE = 'http://localhost:3001';

  /* ── DOM ── */
  const overlay   = document.getElementById('regOverlay');
  const closeBtn  = document.getElementById('regClose');
  const nextBtn   = document.getElementById('regNext');
  const backBtn   = document.getElementById('regBack');
  const doneBtn   = document.getElementById('regDone');
  const successEl = document.getElementById('regSuccess');
  const footerEl  = document.getElementById('regFooter');

  let currentPage = 1;
  const TOTAL_PAGES = 4;

  /* ── SHOW INLINE ERROR (no browser alert popups) ── */
  function showError(msg) {
    // Remove any existing error banner
    const old = document.getElementById('reg-submit-error');
    if (old) old.remove();

    const banner = document.createElement('div');
    banner.id = 'reg-submit-error';
    banner.style.cssText = `
      background: rgba(239,68,68,.08);
      border: 1px solid rgba(239,68,68,.2);
      color: #EF4444;
      padding: 12px 16px;
      border-radius: 12px;
      font-size: .85rem;
      margin-bottom: 16px;
      line-height: 1.5;
    `;
    banner.textContent = msg;

    // Insert above the footer buttons
    const body = document.querySelector('.reg-modal__body');
    if (body) body.insertAdjacentElement('afterend', banner);
  }

  function clearError() {
    const old = document.getElementById('reg-submit-error');
    if (old) old.remove();
  }


  /* ── OPEN / CLOSE ── */
  function openModal() {
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    goToPage(1);
  }

  function closeModal() {
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
    clearError();
  }

  ['openStudentReg', 'openStudentReg2'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', openModal);
  });

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
  if (doneBtn) doneBtn.addEventListener('click', () => { closeModal(); resetForm(); });


  /* ── PAGE NAVIGATION ── */
  function goToPage(n) {
    currentPage = n;
    clearError();

    document.querySelectorAll('.reg-page').forEach(p => p.classList.remove('is-active'));
    const pg = document.getElementById('reg-page-' + n);
    if (pg) pg.classList.add('is-active');

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

    backBtn.style.visibility = n === 1 ? 'hidden' : 'visible';
    nextBtn.disabled = false;
    nextBtn.innerHTML = n === TOTAL_PAGES ? 'Submit Application ✓' : 'Continue →';

    if (n === 4) populateReview();
  }

  nextBtn.addEventListener('click', () => {
    if (!validatePage(currentPage)) return;
    if (currentPage < TOTAL_PAGES) {
      goToPage(currentPage + 1);
    } else {
      submitForm();
    }
  });

  backBtn.addEventListener('click', () => {
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
      check('field-firstName', 'firstName', v => v.length > 0);
      check('field-lastName',  'lastName',  v => v.length > 0);
      check('field-email',     'regEmail',  v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v));
      check('field-phone',     'regPhone',  v => v.length >= 7);
      check('field-dob',       'regDob',    v => v.length > 0);
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
    const days = [...document.querySelectorAll('.day-chk:checked')].map(c => c.value).join(', ') || '—';
    const planInput = document.querySelector('input[name="regPlan"]:checked');
    const plan = planInput ? planInput.value : '—';

    const items = [
      ['Full Name',     (document.getElementById('firstName').value + ' ' + document.getElementById('lastName').value).trim() || '—'],
      ['Email',          document.getElementById('regEmail').value      || '—'],
      ['Phone',          document.getElementById('regPhone').value      || '—'],
      ['Date of Birth',  document.getElementById('regDob').value        || '—'],
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
      `<div style="padding:6px 0;border-bottom:1px solid #E5E7EB">
        <span style="color:var(--muted);font-size:.78rem;display:block;margin-bottom:2px;">${k}</span>
        <span style="color:var(--white);font-weight:600;">${v}</span>
      </div>`
    ).join('');
  }


  /* ── SUBMIT ── */
  async function submitForm() {
    clearError();

    const planInput    = document.querySelector('input[name="regPlan"]:checked');
    const preferredDays = [...document.querySelectorAll('.day-chk:checked')].map(c => c.value);

    const payload = {
      firstName      : document.getElementById('firstName').value.trim(),
      lastName       : document.getElementById('lastName').value.trim(),
      email          : document.getElementById('regEmail').value.trim(),
      phone          : document.getElementById('regPhone').value.trim(),
      dateOfBirth    : document.getElementById('regDob').value,
      university     : document.getElementById('regUniversity').value.trim(),
      studentId      : document.getElementById('regStudentId').value.trim(),
      degree         : document.getElementById('regDegree').value,
      semester       : document.getElementById('regSemester').value,
      fieldOfStudy   : document.getElementById('regField').value,
      graduationYear : document.getElementById('regGradYear').value || null,
      plan           : planInput ? planInput.value : 'standard',
      startDate      : document.getElementById('regStartDate').value,
      duration       : document.getElementById('regDuration').value,
      preferredDays,
      goals          : document.getElementById('regGoals').value.trim() || null,
    };

    console.log('📤 Sending payload:', payload);

    // Loading state
    nextBtn.disabled    = true;
    nextBtn.textContent = 'Submitting…';

    try {
      const response = await fetch(`${API_BASE}/api/register`, {
        method  : 'POST',
        headers : { 'Content-Type': 'application/json' },
        body    : JSON.stringify(payload),
      });

      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error('Server returned an invalid response. Is the server running?');
      }

      console.log('📥 Server response:', response.status, data);

      if (response.ok && data.success) {
        // ✅ SUCCESS
        document.getElementById('regRef').textContent = 'REF #' + data.refNumber;
        document.querySelectorAll('.reg-page').forEach(p => p.classList.remove('is-active'));
        document.querySelectorAll('.reg-steps').forEach(s => s.style.display = 'none');
        successEl.classList.add('is-visible');
        footerEl.style.display = 'none';

      } else if (response.status === 409) {
        showError('⚠️ ' + (data.message || 'This email is already registered.'));
        nextBtn.disabled    = false;
        nextBtn.textContent = 'Submit Application ✓';

      } else if (response.status === 422) {
        // Validation error from server — show which fields failed
        const msgs = data.errors ? data.errors.map(e => e.msg).join(' • ') : data.message;
        showError('Validation error: ' + msgs);
        nextBtn.disabled    = false;
        nextBtn.textContent = 'Submit Application ✓';

      } else {
        showError('Server error: ' + (data.message || 'Please try again.'));
        nextBtn.disabled    = false;
        nextBtn.textContent = 'Submit Application ✓';
      }

    } catch (err) {
      console.error('❌ Fetch error:', err);

      // Friendly message based on error type
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError') || err.message.includes('ECONNREFUSED')) {
        showError('Cannot connect to the server. Make sure "node server.js" is running in your terminal on port 3001.');
      } else {
        showError('Error: ' + err.message);
      }

      nextBtn.disabled    = false;
      nextBtn.textContent = 'Submit Application ✓';
    }
  }


  /* ── RESET ── */
  function resetForm() {
    document.querySelectorAll('.reg-input, .reg-select, .reg-textarea').forEach(el => el.value = '');
    document.querySelectorAll('.day-chk').forEach(c => c.checked = false);
    document.getElementById('agreeTerms').checked = false;
    document.querySelectorAll('.reg-field').forEach(f => f.classList.remove('has-error'));
    document.querySelectorAll('.reg-input, .reg-select').forEach(el => el.classList.remove('error'));
    successEl.classList.remove('is-visible');
    document.querySelectorAll('.reg-steps').forEach(s => s.style.display = '');
    footerEl.style.display = '';
    nextBtn.disabled = false;
    clearError();
    goToPage(1);
  }

})();
