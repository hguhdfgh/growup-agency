-- =============================================================
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard/project/kqjdxeepusiipewwlzxs/sql/new)
-- =============================================================

-- 1. Add unique index on customers.email for upsert
CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_email_unique ON customers(email);

-- 2. Allow anonymous users to create customers from landing page
DROP POLICY IF EXISTS customers_public_insert ON customers;
CREATE POLICY customers_public_insert ON customers
  FOR INSERT WITH CHECK (true);

-- 3. Allow anonymous users to create orders from landing page
DROP POLICY IF EXISTS orders_public_insert ON orders;
CREATE POLICY orders_public_insert ON orders
  FOR INSERT WITH CHECK (true);

-- 4. Allow anonymous users to read their own created data (optional)
DROP POLICY IF EXISTS customers_public_select_own ON customers;
CREATE POLICY customers_public_select_own ON customers
  FOR SELECT USING (email = current_setting('request.jwt.claims')::json->>'email' OR auth.role() = 'authenticated');

-- =============================================================
-- 2. Create payment-proofs storage bucket
-- Run this separately in Supabase Storage:
-- 1. Go to Storage → New Bucket
-- 2. Name: payment-proofs
-- 3. Public bucket: ON
-- =============================================================
