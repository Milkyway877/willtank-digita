-- Create role_status enum type if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role_status') THEN
        CREATE TYPE role_status AS ENUM ('pending', 'verified', 'declined');
    END IF;
END
$$;

-- Update the users table with additional fields
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS last_check_in TIMESTAMP,
ADD COLUMN IF NOT EXISTS next_check_in_due TIMESTAMP,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Create beneficiaries table
CREATE TABLE IF NOT EXISTS beneficiaries (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  phone TEXT,
  verification_code TEXT,
  verification_code_expiry TIMESTAMP,
  status role_status DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create executors table
CREATE TABLE IF NOT EXISTS executors (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  phone TEXT,
  verification_code TEXT,
  verification_code_expiry TIMESTAMP,
  status role_status DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create death_verifiers table
CREATE TABLE IF NOT EXISTS death_verifiers (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  phone TEXT,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create check_in_responses table
CREATE TABLE IF NOT EXISTS check_in_responses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  responder_email TEXT NOT NULL,
  responder_type TEXT NOT NULL,
  response_date TIMESTAMP DEFAULT NOW() NOT NULL,
  is_alive BOOLEAN NOT NULL
);

-- Create death_verification_otps table
CREATE TABLE IF NOT EXISTS death_verification_otps (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  verifier_id INTEGER NOT NULL REFERENCES death_verifiers(id),
  otp TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  is_used BOOLEAN DEFAULT FALSE NOT NULL,
  used_at TIMESTAMP
);

-- Create will_templates table
CREATE TABLE IF NOT EXISTS will_templates (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  template_content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create wills table
CREATE TABLE IF NOT EXISTS wills (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  template_id INTEGER REFERENCES will_templates(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'draft' NOT NULL,
  last_updated TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  video_recording_url TEXT,
  is_released BOOLEAN DEFAULT FALSE
);

-- Create will_documents table
CREATE TABLE IF NOT EXISTS will_documents (
  id SERIAL PRIMARY KEY,
  will_id INTEGER NOT NULL REFERENCES wills(id),
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  upload_date TIMESTAMP DEFAULT NOW(),
  file_url TEXT NOT NULL
);

-- Create indexes for faster lookup
CREATE INDEX IF NOT EXISTS idx_beneficiaries_user_id ON beneficiaries(user_id);
CREATE INDEX IF NOT EXISTS idx_executors_user_id ON executors(user_id);
CREATE INDEX IF NOT EXISTS idx_death_verifiers_user_id ON death_verifiers(user_id);
CREATE INDEX IF NOT EXISTS idx_wills_user_id ON wills(user_id);
CREATE INDEX IF NOT EXISTS idx_will_documents_will_id ON will_documents(will_id);