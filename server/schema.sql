-- ============================================================
-- Mel Keyton Campaign Database Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Volunteers table
CREATE TABLE IF NOT EXISTS volunteers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  interest TEXT,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Swag orders table 
CREATE TABLE IF NOT EXISTS swag_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  item TEXT NOT NULL,
  option TEXT,
  address TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Donations table
CREATE TABLE IF NOT EXISTS donations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT DEFAULT 'Anonymous',
  email TEXT,
  amount_cents INTEGER NOT NULL,
  stripe_session_id TEXT UNIQUE,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_volunteers_email ON volunteers(email);
CREATE INDEX IF NOT EXISTS idx_volunteers_created ON volunteers(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_swag_orders_status ON swag_orders(status);
CREATE INDEX IF NOT EXISTS idx_swag_orders_created ON swag_orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
CREATE INDEX IF NOT EXISTS idx_donations_stripe_session ON donations(stripe_session_id);

-- Enable Row Level Security (optional — service key bypasses RLS)
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE swag_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
