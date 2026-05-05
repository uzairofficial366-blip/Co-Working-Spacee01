-- ============================================================
-- schema.sql — IT Artificer Database  (UPDATED)
-- Run this to create / update tables
-- NEW: contact_messages table added
-- ============================================================

-- 1. Create database (run separately as superuser)
-- CREATE DATABASE it_artificer;
-- \c it_artificer

-- 2. ENUM types
DO $$ BEGIN
  CREATE TYPE plan_type   AS ENUM ('basic', 'standard', 'premium');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE status_type AS ENUM ('pending', 'approved', 'rejected', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 3. Student registrations table
CREATE TABLE IF NOT EXISTS student_registrations (
  id               SERIAL PRIMARY KEY,
  ref_number       VARCHAR(20)  NOT NULL UNIQUE,
  first_name       VARCHAR(60)  NOT NULL,
  last_name        VARCHAR(60)  NOT NULL,
  email            VARCHAR(120) NOT NULL UNIQUE,
  phone            VARCHAR(20)  NOT NULL,
  date_of_birth    DATE         NOT NULL,
  university       VARCHAR(120) NOT NULL,
  student_id       VARCHAR(40)  NOT NULL,
  degree           VARCHAR(80)  NOT NULL,
  semester         VARCHAR(30)  NOT NULL,
  field_of_study   VARCHAR(80)  NOT NULL,
  graduation_year  SMALLINT     DEFAULT NULL,
  plan             plan_type    NOT NULL DEFAULT 'standard',
  start_date       DATE         NOT NULL,
  duration         VARCHAR(40)  NOT NULL,
  preferred_days   VARCHAR(100) NOT NULL,
  goals            TEXT         DEFAULT NULL,
  status           status_type  NOT NULL DEFAULT 'pending',
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- 4. Contact messages table  ← NEW
CREATE TABLE IF NOT EXISTS contact_messages (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(120) NOT NULL,
  subject    VARCHAR(200) NOT NULL,
  message    TEXT         NOT NULL,
  status     VARCHAR(20)  NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- 5. Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_student_updated_at ON student_registrations;
CREATE TRIGGER trg_student_updated_at
  BEFORE UPDATE ON student_registrations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 6. Indexes
CREATE INDEX IF NOT EXISTS idx_email      ON student_registrations (email);
CREATE INDEX IF NOT EXISTS idx_status     ON student_registrations (status);
CREATE INDEX IF NOT EXISTS idx_created_at ON student_registrations (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_plan       ON student_registrations (plan);
CREATE INDEX IF NOT EXISTS idx_contact_email ON contact_messages (email);
CREATE INDEX IF NOT EXISTS idx_contact_status ON contact_messages (status);

-- ============================================================
-- VERIFY:
-- SELECT COUNT(*) FROM student_registrations;
-- SELECT COUNT(*) FROM contact_messages;
-- ============================================================