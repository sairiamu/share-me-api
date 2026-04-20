-- Migration: Create users and notes tables for Supabase PostgreSQL
-- This migration creates the complete schema for the share-me API
-- Run this script in Supabase SQL Editor

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(50) NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(15) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- ============================================
-- 2. NOTES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notes (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR(50),
  uploaded_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (uploaded_by) REFERENCES users(email) ON DELETE CASCADE
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_notes_uploaded_by ON notes(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_notes_id ON notes(id);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at);
CREATE INDEX IF NOT EXISTS idx_notes_uploaded_by_created_at ON notes(uploaded_by, created_at DESC);

-- ============================================
-- 3. AUDIT LOG TABLE (optional but recommended)
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_email VARCHAR(255),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INTEGER,
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for audit queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_email ON audit_logs(user_email);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- ============================================
-- 4. ENABLE ROW LEVEL SECURITY (RLS) - Optional
-- ============================================
-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own record
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid()::text = email OR auth.uid() IS NULL);

-- Enable RLS on notes table
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own notes
CREATE POLICY "Users can view their own notes" ON notes
  FOR SELECT USING (uploaded_by = auth.uid()::text OR auth.uid() IS NULL);

-- Policy: Users can only delete their own notes
CREATE POLICY "Users can delete their own notes" ON notes
  FOR DELETE USING (uploaded_by = auth.uid()::text);

-- Policy: Users can only insert notes as themselves
CREATE POLICY "Users can insert their own notes" ON notes
  FOR INSERT WITH CHECK (uploaded_by = auth.uid()::text);

-- ============================================
-- 5. HELPER FUNCTIONS
-- ============================================
-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for notes table
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 6. VIEWS FOR COMMON QUERIES
-- ============================================
-- View: User notes with summary
CREATE OR REPLACE VIEW user_notes_summary AS
SELECT 
  n.id,
  n.title,
  n.file_url,
  n.file_type,
  n.uploaded_by,
  u.name as uploader_name,
  n.created_at,
  n.updated_at
FROM notes n
LEFT JOIN users u ON n.uploaded_by = u.email
ORDER BY n.created_at DESC;

-- View: User statistics
CREATE OR REPLACE VIEW user_stats AS
SELECT 
  u.id,
  u.email,
  u.name,
  COUNT(n.id) as total_notes,
  MAX(n.created_at) as last_note_date,
  u.created_at as user_created_at
FROM users u
LEFT JOIN notes n ON u.email = n.uploaded_by
GROUP BY u.id, u.email, u.name, u.created_at;



