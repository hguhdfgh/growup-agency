-- Fix: RLS stack depth limit exceeded on orders/customers
-- Run this in Supabase SQL Editor

-- 1. Drop the problematic is_authenticated helper
DROP FUNCTION IF EXISTS is_authenticated CASCADE;

-- 2. Recreate with SECURITY DEFINER to bypass RLS recursion
CREATE OR REPLACE FUNCTION is_authenticated()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT auth.role() = 'authenticated';
$$;

-- 3. Recreate orders policy using the fixed helper
DROP POLICY IF EXISTS orders_auth_all ON orders;
CREATE POLICY orders_auth_all ON orders
  FOR ALL USING (is_authenticated());

-- 4. Add explicit anon insert policy for landing page
CREATE POLICY orders_anon_insert ON orders
  FOR INSERT WITH CHECK (auth.role() = 'anon');

-- 5. Fix customers policy same way
DROP POLICY IF EXISTS customers_auth_all ON customers;
CREATE POLICY customers_auth_all ON customers
  FOR ALL USING (is_authenticated());

CREATE POLICY customers_anon_insert ON customers
  FOR INSERT WITH CHECK (auth.role() = 'anon');

-- 6. Increase max_stack_depth (requires superuser - run separately)
-- ALTER DATABASE postgres SET max_stack_depth = '4096kB';
