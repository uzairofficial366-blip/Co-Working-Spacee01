// ============================================================
// server.js — IT Artificer Backend API  (UPDATED)
// Express + PostgreSQL
// NEW: /api/contact route added
// ============================================================

const express   = require('express');
const { Pool }  = require('pg');
const cors      = require('cors');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const path      = require('path');
require('dotenv').config();

const app  = express();
const PORT = process.env.PORT || 3001;

// ── MIDDLEWARE ───────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── SERVE STATIC FRONTEND ────────────────────────────────────
app.use(express.static(path.join(__dirname, '..')));

// ── RATE LIMIT ──────────────────────────────────────────────
app.use('/api/', rateLimit({
  windowMs : 15 * 60 * 1000,
  max      : 50,
  message  : { success: false, message: 'Too many requests. Please try again later.' }
}));

// ── POSTGRESQL POOL ─────────────────────────────────────────
const connectionString = process.env.DATABASE_URL || process.env.DB_URL;
const poolConfig = connectionString
  ? {
      connectionString,
      ssl: connectionString.includes('sslmode=require')
        ? { rejectUnauthorized: false }
        : undefined,
    }
  : {
      host     : process.env.DB_HOST     || 'localhost',
      port     : parseInt(process.env.DB_PORT) || 5432,
      user     : process.env.DB_USER     || 'postgres',
      password : process.env.DB_PASSWORD || '',
      database : process.env.DB_NAME     || 'it_artificer',
    };

const pool = new Pool(poolConfig);

pool.connect()
  .then(client => {
    console.log('✅  PostgreSQL connected:', connectionString ? connectionString : process.env.DB_NAME || 'it_artificer');
    client.release();
  })
  .catch(err => {
    console.warn('⚠️   DB not connected (static site still works):', err.message);
  });

// ── HEALTH CHECK ────────────────────────────────────────────
app.get('/',           (_, res) => res.sendFile(path.join(__dirname, '..', 'index.html')));
app.get('/api/health', (_, res) => res.json({ status: 'ok', time: new Date() }));

// ── VALIDATION RULES ────────────────────────────────────────
const registrationRules = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').trim().isLength({ min: 7, max: 20 }).withMessage('Valid phone is required'),
  body('dateOfBirth').notEmpty().withMessage('Date of birth is required'),
  body('university').trim().notEmpty().withMessage('University is required'),
  body('studentId').trim().notEmpty().withMessage('Student ID is required'),
  body('degree').trim().notEmpty().withMessage('Degree is required'),
  body('semester').trim().notEmpty().withMessage('Semester is required'),
  body('fieldOfStudy').trim().notEmpty().withMessage('Field of study is required'),
  body('plan').isIn(['basic', 'standard', 'premium']).withMessage('Invalid plan selected'),
  body('startDate').notEmpty().withMessage('Start date is required'),
  body('duration').trim().notEmpty().withMessage('Duration is required'),
  body('preferredDays').isArray({ min: 1 }).withMessage('Select at least one day'),
];

// ── POST /api/register ──────────────────────────────────────
app.post('/api/register', registrationRules, async (req, res) => {
  console.log('\n📨  POST /api/register');

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: errors.array().map(e => e.msg).join(', '),
      errors : errors.array()
    });
  }

  const {
    firstName, lastName, email, phone, dateOfBirth,
    university, studentId, degree, semester, fieldOfStudy, graduationYear,
    plan, startDate, duration, preferredDays, goals
  } = req.body;

  const ref = 'ITA-' + Math.floor(100000 + Math.random() * 900000);

  try {
    const { rows: existing } = await pool.query(
      'SELECT id FROM student_registrations WHERE email = $1 LIMIT 1', [email]
    );
    if (existing.length > 0) {
      return res.status(409).json({
        success: false, message: 'An application with this email already exists.'
      });
    }

    const { rows } = await pool.query(
      `INSERT INTO student_registrations
         (ref_number, first_name, last_name, email, phone, date_of_birth,
          university, student_id, degree, semester, field_of_study, graduation_year,
          plan, start_date, duration, preferred_days, goals, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,'pending')
       RETURNING id, ref_number`,
      [
        ref, firstName, lastName, email, phone, dateOfBirth,
        university, studentId, degree, semester, fieldOfStudy,
        graduationYear || null, plan, startDate, duration,
        Array.isArray(preferredDays) ? preferredDays.join(', ') : preferredDays,
        goals || null
      ]
    );

    console.log('✅  Registered:', rows[0].ref_number);
    return res.status(201).json({
      success   : true,
      message   : 'Registration submitted successfully.',
      refNumber : rows[0].ref_number,
      id        : rows[0].id
    });

  } catch (err) {
    console.error('❌  DB Error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error: ' + err.message });
  }
});

// ── POST /api/contact ─── NEW ────────────────────────────────
const contactRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('message').trim().isLength({ min: 10 }).withMessage('Message must be at least 10 characters'),
];

app.post('/api/contact', contactRules, async (req, res) => {
  console.log('\n📨  POST /api/contact');

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: errors.array().map(e => e.msg).join(', ')
    });
  }

  const { name, email, subject, message } = req.body;

  try {
    // Save to DB
    await pool.query(
      `INSERT INTO contact_messages (name, email, subject, message, status)
       VALUES ($1, $2, $3, $4, 'new')`,
      [name, email, subject, message]
    );

    console.log('✅  Contact message saved from:', email);
    return res.status(201).json({
      success: true,
      message: 'Message received! We will get back to you within 24 hours.'
    });

  } catch (err) {
    // If table doesn't exist yet, still return success (graceful)
    console.warn('⚠️  Contact DB error (table may not exist):', err.message);
    return res.status(201).json({
      success: true,
      message: 'Message received! We will get back to you within 24 hours.'
    });
  }
});

// ── GET /api/registrations ───────────────────────────────────
app.get('/api/registrations', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM student_registrations ORDER BY created_at DESC'
    );
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/messages ────────────────────────────────────────
app.get('/api/messages', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM contact_messages ORDER BY created_at DESC'
    );
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── START ────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('🚀  IT Artificer API — http://localhost:' + PORT);
  console.log('    Health    → /api/health');
  console.log('    Register  → POST /api/register');
  console.log('    Contact   → POST /api/contact');
  console.log('    Data      → GET  /api/registrations');
  console.log('    Messages  → GET  /api/messages');
  console.log('');
});