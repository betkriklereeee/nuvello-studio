-- Ball in Your Court: track who needs to act on each project
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS bic_status text NOT NULL DEFAULT 'admin',
  ADD COLUMN IF NOT EXISTS bic_message text,
  ADD COLUMN IF NOT EXISTS bic_updated_at timestamptz;
