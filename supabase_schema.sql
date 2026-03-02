-- Supabase SQL Schema for Deportivo Z

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: players
CREATE TABLE players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    name VARCHAR(255) NOT NULL,
    photo_url TEXT,
    position VARCHAR(50), -- e.g., 'GK', 'CB', 'CM', 'ST'
    number INTEGER,
    passes INTEGER DEFAULT 0,
    goals INTEGER DEFAULT 0,
    assists INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE
);

-- Table: payments
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    payment_type VARCHAR(50) NOT NULL, -- 'registration' or 'referee'
    amount DECIMAL(10, 2) NOT NULL,
    payment_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed'
    notes TEXT
);

-- Table: cards (Disciplinary)
CREATE TABLE cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    card_type VARCHAR(20) NOT NULL, -- 'yellow' or 'red'
    match_date DATE NOT NULL,
    description TEXT
);

-- RLS (Row Level Security) Policies
-- Assuming only authenticated admins can access this data

ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

-- Allow read/write access to authenticated users only
CREATE POLICY "Allow full access to authenticated users for players" ON players
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow full access to authenticated users for payments" ON payments
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow full access to authenticated users for cards" ON cards
    FOR ALL USING (auth.role() = 'authenticated');
