-- Migration 001: Extensions and Enums
-- Run this in Supabase SQL Editor

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS moddatetime;

-- Enums
CREATE TYPE tile_category AS ENUM ('GLOSSY', 'FLOOR', 'MATT', 'SATIN', 'WOODEN', 'ELEVATION', 'OTHER');
CREATE TYPE gst_slab AS ENUM ('5', '12', '18', '28');
CREATE TYPE payment_status AS ENUM ('paid', 'partial', 'unpaid');
CREATE TYPE payment_mode AS ENUM ('cash', 'upi', 'bank_transfer', 'credit', 'cheque');
CREATE TYPE customer_type AS ENUM ('retail', 'contractor', 'builder', 'dealer');
CREATE TYPE order_status AS ENUM ('ordered', 'partially_received', 'fully_received', 'cancelled');
CREATE TYPE stock_op_type AS ENUM ('stock_in', 'stock_out', 'adjustment', 'transfer', 'return');

-- Business Profile (singleton)
CREATE TABLE business_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name TEXT NOT NULL,
  gstin TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  state_code TEXT,
  phone TEXT,
  email TEXT,
  logo_url TEXT,
  invoice_prefix TEXT NOT NULL DEFAULT 'TM',
  invoice_sequence BIGINT NOT NULL DEFAULT 0,
  financial_year_start DATE,
  terms_and_conditions TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON business_profile
  FOR EACH ROW EXECUTE PROCEDURE moddatetime(updated_at);
