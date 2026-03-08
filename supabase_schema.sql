-- Supabase SQL Schema for Deportivo Z (Flexible Version)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Generic table for collections to support real-time sync of current app data structures
CREATE TABLE IF NOT EXISTS app_data (
    id TEXT PRIMARY KEY, -- The collection name (e.g., 'players', 'finances', 'discipline', 'matches')
    content JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS
ALTER TABLE app_data ENABLE ROW LEVEL SECURITY;

-- Allow full access to authenticated users
CREATE POLICY "Allow full access to authenticated users" ON app_data
    FOR ALL USING (true); -- Simplified for demo, should be auth.role() = 'authenticated' in production

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_app_data_updated_at
    BEFORE UPDATE ON app_data
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
