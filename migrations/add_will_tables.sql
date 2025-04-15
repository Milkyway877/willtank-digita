-- Create will template enum type
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'will_template') THEN
    CREATE TYPE will_template AS ENUM ('basic', 'married', 'elder', 'business');
  END IF;
END $$;

-- Create will status enum type
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'will_status') THEN
    CREATE TYPE will_status AS ENUM ('draft', 'completed', 'locked');
  END IF;
END $$;

-- Create wills table if it doesn't exist
CREATE TABLE IF NOT EXISTS wills (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  content TEXT,
  template will_template NOT NULL DEFAULT 'basic',
  status will_status NOT NULL DEFAULT 'draft',
  data_json JSONB,
  is_complete BOOLEAN DEFAULT FALSE,
  video_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create will documents table if it doesn't exist
CREATE TABLE IF NOT EXISTS will_documents (
  id SERIAL PRIMARY KEY,
  will_id INTEGER NOT NULL REFERENCES wills(id),
  name TEXT NOT NULL,
  path TEXT NOT NULL,
  type TEXT NOT NULL,
  upload_date TIMESTAMP DEFAULT NOW(),
  size INTEGER NOT NULL
);

-- Create will contacts table if it doesn't exist
CREATE TABLE IF NOT EXISTS will_contacts (
  id SERIAL PRIMARY KEY,
  will_id INTEGER NOT NULL REFERENCES wills(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  country TEXT,
  role TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);