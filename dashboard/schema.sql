-- ============================================================
-- TikTok Agency SaaS Platform - PostgreSQL Schema
-- Algerian Market (6000 DZD)
-- ============================================================

-- 0. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- 1. TABLES
-- ============================================================

-- 1.1 profiles
CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT,
  email         TEXT,
  phone         TEXT,
  role          TEXT NOT NULL DEFAULT 'support' CHECK (role IN ('admin', 'support')),
  avatar_url    TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1.2 customers
CREATE TABLE customers (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name     TEXT,
  email         TEXT,
  phone         TEXT,
  country       TEXT DEFAULT 'Algeria',
  city          TEXT,
  total_orders  INT NOT NULL DEFAULT 0,
  total_spent   DECIMAL NOT NULL DEFAULT 0,
  status        TEXT NOT NULL DEFAULT 'lead' CHECK (status IN ('active', 'blocked', 'lead')),
  tags          TEXT[] DEFAULT '{}',
  notes         TEXT DEFAULT '',
  last_activity TIMESTAMPTZ,
  source        TEXT DEFAULT 'direct' CHECK (source IN ('direct', 'tiktok', 'facebook', 'referral')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1.3 products
CREATE TABLE products (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  description     TEXT DEFAULT '',
  price           DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  warranty_months INT NOT NULL DEFAULT 6,
  images          TEXT[] DEFAULT '{}',
  video_url       TEXT,
  features        JSONB DEFAULT '[]'::jsonb,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  is_featured     BOOLEAN NOT NULL DEFAULT false,
  sort_order      INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1.4 orders
CREATE TABLE orders (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id       UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  product_id        UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  order_number      TEXT NOT NULL,
  customer_name     TEXT NOT NULL,
  email             TEXT,
  phone             TEXT,
  country           TEXT DEFAULT 'Algeria',
  amount            DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
  payment_method    TEXT NOT NULL CHECK (payment_method IN ('baridimob', 'ccp', 'bank')),
  payment_proof_url TEXT,
  status            TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'delivered', 'archived')),
  warranty_end      DATE,
  admin_notes       TEXT DEFAULT '',
  assigned_to       UUID REFERENCES profiles(id) ON DELETE SET NULL,
  delivery_date     TIMESTAMPTZ,
  notes             TEXT DEFAULT '',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1.5 order_timeline
CREATE TABLE order_timeline (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id      UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  action        TEXT NOT NULL,
  description   TEXT DEFAULT '',
  performed_by  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1.6 reviews
CREATE TABLE reviews (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name   TEXT NOT NULL,
  customer_city   TEXT,
  customer_avatar TEXT,
  rating          INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text     TEXT DEFAULT '',
  is_approved     BOOLEAN NOT NULL DEFAULT false,
  is_pinned       BOOLEAN NOT NULL DEFAULT false,
  order_number    TEXT,
  is_verified     BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1.7 faq
CREATE TABLE faq (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question    TEXT NOT NULL,
  answer      TEXT NOT NULL,
  sort_order  INT NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  category    TEXT DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1.8 landing_content
CREATE TABLE landing_content (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section    TEXT NOT NULL UNIQUE CHECK (section IN ('hero', 'features', 'trust', 'cta', 'footer', 'seo')),
  content    JSONB NOT NULL,
  is_active  BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1.9 coupons
CREATE TABLE coupons (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code            TEXT NOT NULL UNIQUE,
  discount_type   TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value  DECIMAL NOT NULL CHECK (discount_value > 0),
  max_uses        INT NOT NULL DEFAULT 0 CHECK (max_uses >= 0),
  used_count      INT NOT NULL DEFAULT 0 CHECK (used_count >= 0),
  expires_at      TIMESTAMPTZ,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1.10 analytics_events
CREATE TABLE analytics_events (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type    TEXT NOT NULL CHECK (event_type IN ('page_view', 'order_submitted', 'video_play', 'cta_click', 'whatsapp_click', 'payment_uploaded')),
  session_id    TEXT,
  page_url      TEXT,
  metadata      JSONB DEFAULT '{}'::jsonb,
  customer_id   UUID REFERENCES customers(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1.11 notifications
CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type        TEXT NOT NULL CHECK (type IN ('new_order', 'new_customer', 'payment_uploaded', 'support', 'order_approved', 'order_rejected')),
  title       TEXT NOT NULL,
  body        TEXT DEFAULT '',
  data        JSONB DEFAULT '{}'::jsonb,
  is_read     BOOLEAN NOT NULL DEFAULT false,
  for_user    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1.12 support_tickets
CREATE TABLE support_tickets (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id   UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  subject       TEXT NOT NULL,
  description   TEXT DEFAULT '',
  status        TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'pending', 'resolved', 'closed')),
  priority      TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_to   UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1.13 ticket_replies
CREATE TABLE ticket_replies (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id     UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_type   TEXT NOT NULL CHECK (sender_type IN ('customer', 'admin')),
  sender_name   TEXT NOT NULL,
  message       TEXT NOT NULL,
  attachments   TEXT[] DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1.14 media_library
CREATE TABLE media_library (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_name   TEXT NOT NULL,
  file_type   TEXT NOT NULL,
  file_size   INT NOT NULL,
  url         TEXT NOT NULL,
  bucket      TEXT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  alt_text    TEXT DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1.15 activity_logs
CREATE TABLE activity_logs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_type    TEXT NOT NULL CHECK (actor_type IN ('admin', 'system', 'customer')),
  actor_id      UUID,
  action        TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id   TEXT,
  details       JSONB DEFAULT '{}'::jsonb,
  ip_address    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1.16 settings (single row enforced via FK to a constant UUID)
CREATE TABLE settings (
  id                    UUID PRIMARY KEY DEFAULT '00000000-0000-0000-0000-000000000001',
  company_name          TEXT DEFAULT 'My Agency',
  logo_url              TEXT,
  phone                 TEXT,
  whatsapp              TEXT,
  email                 TEXT,
  address               TEXT,
  social_links          JSONB DEFAULT '{}'::jsonb,
  seo_meta              JSONB DEFAULT '{}'::jsonb,
  google_analytics_id   TEXT,
  facebook_pixel_id     TEXT,
  tiktok_pixel_id       TEXT,
  smtp_config           JSONB DEFAULT '{}'::jsonb,
  payment_accounts      JSONB DEFAULT '{}'::jsonb,
  warranty_duration_days INT NOT NULL DEFAULT 180,
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT settings_single_row CHECK (id = '00000000-0000-0000-0000-000000000001')
);

-- ============================================================
-- 2. INDEXES
-- ============================================================

CREATE INDEX idx_orders_customer_status_created ON orders(customer_id, status, created_at DESC);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE UNIQUE INDEX idx_orders_order_number_unique ON orders(LOWER(order_number));

CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_phone ON customers(phone);

CREATE INDEX idx_analytics_events_type_created ON analytics_events(event_type, created_at DESC);
CREATE INDEX idx_analytics_events_created ON analytics_events(created_at DESC);

CREATE INDEX idx_notifications_user_read_created ON notifications(for_user, is_read, created_at DESC);

CREATE INDEX idx_support_tickets_customer_status ON support_tickets(customer_id, status);

CREATE INDEX idx_activity_logs_created_actor ON activity_logs(created_at DESC, actor_type);

-- Additional performance indexes
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_is_active ON products(is_active, is_featured);
CREATE INDEX idx_customers_status ON customers(status);
CREATE INDEX idx_reviews_is_approved ON reviews(is_approved, is_pinned);
CREATE INDEX idx_order_timeline_order ON order_timeline(order_id, created_at DESC);
CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_ticket_replies_ticket ON ticket_replies(ticket_id, created_at);
CREATE INDEX idx_media_library_uploaded_by ON media_library(uploaded_by);

-- Full-text search indexes
CREATE INDEX idx_products_name_trgm ON products USING gin (name gin_trgm_ops);
CREATE INDEX idx_customers_name_trgm ON customers USING gin (full_name gin_trgm_ops);

-- ============================================================
-- 3. AUTO-UPDATE updated_at TRIGGER (shared function)
-- ============================================================

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER set_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON faq FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON landing_content FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON support_tickets FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ============================================================
-- 4. FUNCTIONS
-- ============================================================

-- 4.1 get_dashboard_stats
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS TABLE (
  revenue_total    DECIMAL,
  orders_total     BIGINT,
  customers_total  BIGINT,
  conversion_rate  DECIMAL,
  today_orders     BIGINT,
  today_revenue    DECIMAL,
  pending_orders   BIGINT
) LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE
  v_revenue_total   DECIMAL;
  v_orders_total    BIGINT;
  v_customers_total BIGINT;
  v_today_orders    BIGINT;
  v_today_revenue   DECIMAL;
  v_pending_orders  BIGINT;
  v_total_visits    BIGINT;
BEGIN
  SELECT COALESCE(SUM(amount), 0) INTO v_revenue_total FROM orders WHERE status IN ('approved', 'delivered');
  SELECT COUNT(*) INTO v_orders_total FROM orders;
  SELECT COUNT(*) INTO v_customers_total FROM customers;
  SELECT COUNT(*) INTO v_today_orders FROM orders WHERE created_at::date = CURRENT_DATE;
  SELECT COALESCE(SUM(amount), 0) INTO v_today_revenue FROM orders WHERE created_at::date = CURRENT_DATE AND status IN ('approved', 'delivered');
  SELECT COUNT(*) INTO v_pending_orders FROM orders WHERE status = 'pending';
  SELECT COUNT(*) INTO v_total_visits FROM analytics_events WHERE event_type = 'page_view';

  RETURN QUERY
  SELECT
    v_revenue_total,
    v_orders_total,
    v_customers_total,
    CASE WHEN v_total_visits > 0 THEN ROUND((v_orders_total::DECIMAL / v_total_visits) * 100, 2) ELSE 0 END,
    v_today_orders,
    v_today_revenue,
    v_pending_orders;
END;
$$;

-- 4.2 get_monthly_revenue
CREATE OR REPLACE FUNCTION get_monthly_revenue(p_year INT DEFAULT EXTRACT(YEAR FROM CURRENT_DATE))
RETURNS TABLE (month INT, revenue DECIMAL, orders_count BIGINT) LANGUAGE plpgsql STABLE AS $$
BEGIN
  RETURN QUERY
  SELECT
    EXTRACT(MONTH FROM o.created_at)::INT AS month,
    COALESCE(SUM(o.amount), 0) AS revenue,
    COUNT(*)::BIGINT AS orders_count
  FROM orders o
  WHERE o.status IN ('approved', 'delivered')
    AND EXTRACT(YEAR FROM o.created_at) = p_year
  GROUP BY month
  ORDER BY month;
END;
$$;

-- 4.3 get_top_products
CREATE OR REPLACE FUNCTION get_top_products(p_limit INT DEFAULT 5)
RETURNS TABLE (
  product_id    UUID,
  product_name  TEXT,
  total_sold    BIGINT,
  total_revenue DECIMAL
) LANGUAGE plpgsql STABLE AS $$
BEGIN
  RETURN QUERY
  SELECT
    o.product_id,
    p.name AS product_name,
    COUNT(*)::BIGINT AS total_sold,
    COALESCE(SUM(o.amount), 0) AS total_revenue
  FROM orders o
  JOIN products p ON p.id = o.product_id
  WHERE o.status IN ('approved', 'delivered')
  GROUP BY o.product_id, p.name
  ORDER BY total_sold DESC
  LIMIT p_limit;
END;
$$;

-- 4.4 increment_coupon_usage
CREATE OR REPLACE FUNCTION increment_coupon_usage(coupon_code TEXT)
RETURNS BOOLEAN LANGUAGE plpgsql AS $$
DECLARE
  v_coupon coupons%ROWTYPE;
BEGIN
  SELECT * INTO v_coupon FROM coupons WHERE code = coupon_code FOR UPDATE;
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  IF v_coupon.is_active = false THEN
    RETURN false;
  END IF;
  IF v_coupon.expires_at IS NOT NULL AND v_coupon.expires_at < NOW() THEN
    RETURN false;
  END IF;
  IF v_coupon.max_uses > 0 AND v_coupon.used_count >= v_coupon.max_uses THEN
    RETURN false;
  END IF;

  UPDATE coupons SET used_count = used_count + 1 WHERE code = coupon_code;
  RETURN true;
END;
$$;

-- 4.5 generate_order_number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE
  year_prefix TEXT;
  next_seq INT;
BEGIN
  year_prefix := TO_CHAR(CURRENT_DATE, 'YYYY');
  SELECT COALESCE(MAX(SUBSTRING(order_number FROM '\d+$')::INT), 0) + 1
    INTO next_seq
    FROM orders
    WHERE order_number LIKE 'ORD-' || year_prefix || '-%';
  RETURN 'ORD-' || year_prefix || '-' || LPAD(next_seq::TEXT, 4, '0');
END;
$$;

-- ============================================================
-- 5. TRIGGERS
-- ============================================================

-- 5.1 Auto-generate order_number before insert
CREATE OR REPLACE FUNCTION trigger_set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := generate_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_number BEFORE INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION trigger_set_order_number();

-- 5.2 Update customer totals on new order
CREATE OR REPLACE FUNCTION trigger_update_customer_totals()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE customers
  SET
    total_orders = total_orders + 1,
    total_spent  = total_spent + NEW.amount,
    status       = CASE WHEN status = 'lead' THEN 'active' ELSE status END,
    last_activity = NOW()
  WHERE id = NEW.customer_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_customer_totals AFTER INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION trigger_update_customer_totals();

-- 5.3 Create notification on new order
CREATE OR REPLACE FUNCTION trigger_new_order_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (type, title, body, data, for_user)
  VALUES (
    'new_order',
    'New Order #' || NEW.order_number,
    'Order from ' || NEW.customer_name || ' - ' || NEW.amount || ' DZD',
    jsonb_build_object('order_id', NEW.id, 'order_number', NEW.order_number, 'amount', NEW.amount),
    NULL
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER new_order_notification AFTER INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION trigger_new_order_notification();

-- 5.4 Create activity_log on new order
CREATE OR REPLACE FUNCTION trigger_new_order_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO activity_logs (actor_type, actor_id, action, resource_type, resource_id, details)
  VALUES (
    'system',
    NULL,
    'order_created',
    'order',
    NEW.id::TEXT,
    jsonb_build_object('order_number', NEW.order_number, 'amount', NEW.amount, 'customer_name', NEW.customer_name)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER new_order_activity AFTER INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION trigger_new_order_activity();

-- 5.5 Create notification on new customer
CREATE OR REPLACE FUNCTION trigger_new_customer_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (type, title, body, data, for_user)
  VALUES (
    'new_customer',
    'New Customer',
    NEW.full_name || ' just registered',
    jsonb_build_object('customer_id', NEW.id, 'customer_name', NEW.full_name),
    NULL
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER new_customer_notification AFTER INSERT ON customers
  FOR EACH ROW EXECUTE FUNCTION trigger_new_customer_notification();

-- 5.6 Auto-insert order_timeline on status change
CREATE OR REPLACE FUNCTION trigger_order_timeline_status()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO order_timeline (order_id, action, description, performed_by)
    VALUES (
      NEW.id,
      'status_changed',
      'Status changed from ' || COALESCE(OLD.status, 'none') || ' to ' || NEW.status,
      NEW.assigned_to
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER order_timeline_status AFTER UPDATE ON orders
  FOR EACH ROW WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION trigger_order_timeline_status();

-- 5.7 Set warranty_end on approved orders
CREATE OR REPLACE FUNCTION trigger_set_warranty_end()
RETURNS TRIGGER AS $$
DECLARE
  v_warranty_days INT;
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status = 'pending') THEN
    SELECT COALESCE(warranty_duration_days, 180) INTO v_warranty_days FROM settings LIMIT 1;
    NEW.warranty_end := CURRENT_DATE + v_warranty_days;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_warranty_end BEFORE UPDATE ON orders
  FOR EACH ROW WHEN (NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status = 'pending'))
  EXECUTE FUNCTION trigger_set_warranty_end();

-- 5.8 Order notification on payment_uploaded
CREATE OR REPLACE FUNCTION trigger_payment_uploaded_notification()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.payment_proof_url IS NOT NULL AND (OLD.payment_proof_url IS NULL OR OLD.payment_proof_url = '') THEN
    INSERT INTO notifications (type, title, body, data, for_user)
    VALUES (
      'payment_uploaded',
      'Payment Uploaded',
      'Payment proof uploaded for order #' || NEW.order_number,
      jsonb_build_object('order_id', NEW.id, 'order_number', NEW.order_number),
      NULL
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payment_uploaded_notification AFTER UPDATE ON orders
  FOR EACH ROW WHEN (NEW.payment_proof_url IS NOT NULL AND (OLD.payment_proof_url IS NULL OR OLD.payment_proof_url = ''))
  EXECUTE FUNCTION trigger_payment_uploaded_notification();

-- 5.9 Order approval/rejection notification
CREATE OR REPLACE FUNCTION trigger_order_status_notification()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IN ('approved', 'rejected') AND OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO notifications (type, title, body, data, for_user)
    VALUES (
      CASE WHEN NEW.status = 'approved' THEN 'order_approved' ELSE 'order_rejected' END,
      CASE WHEN NEW.status = 'approved' THEN 'Order Approved' ELSE 'Order Rejected' END,
      'Order #' || NEW.order_number || ' has been ' || NEW.status,
      jsonb_build_object('order_id', NEW.id, 'order_number', NEW.order_number, 'status', NEW.status),
      NULL
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER order_status_notification AFTER UPDATE ON orders
  FOR EACH ROW WHEN (NEW.status IN ('approved', 'rejected') AND OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION trigger_order_status_notification();

-- ============================================================
-- 6. ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq ENABLE ROW LEVEL SECURITY;
ALTER TABLE landing_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Helper: admin check
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
      AND role = 'admin'
      AND is_active = true
  );
$$;

-- Helper: authenticated check
CREATE OR REPLACE FUNCTION is_authenticated()
RETURNS BOOLEAN LANGUAGE sql STABLE AS $$
  SELECT auth.role() = 'authenticated';
$$;

-- 6.1 profiles
CREATE POLICY profiles_own_read ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY profiles_admin_all ON profiles
  FOR ALL USING (is_admin());

-- 6.2 orders
CREATE POLICY orders_auth_all ON orders
  FOR ALL USING (is_authenticated());

-- 6.3 customers
CREATE POLICY customers_auth_all ON customers
  FOR ALL USING (is_authenticated());

-- 6.4 products
CREATE POLICY products_public_read ON products
  FOR SELECT USING (true);

CREATE POLICY products_admin_write ON products
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY products_admin_update ON products
  FOR UPDATE USING (is_admin());

CREATE POLICY products_admin_delete ON products
  FOR DELETE USING (is_admin());

-- 6.5 landing_content
CREATE POLICY landing_content_public_read ON landing_content
  FOR SELECT USING (true);

CREATE POLICY landing_content_admin_write ON landing_content
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY landing_content_admin_update ON landing_content
  FOR UPDATE USING (is_admin());

CREATE POLICY landing_content_admin_delete ON landing_content
  FOR DELETE USING (is_admin());

-- 6.6 reviews
CREATE POLICY reviews_public_read ON reviews
  FOR SELECT USING (true);

CREATE POLICY reviews_admin_all ON reviews
  FOR ALL USING (is_admin());

-- 6.7 faq
CREATE POLICY faq_public_read ON faq
  FOR SELECT USING (true);

CREATE POLICY faq_admin_all ON faq
  FOR ALL USING (is_admin());

-- 6.8 analytics_events
CREATE POLICY analytics_events_anon_insert ON analytics_events
  FOR INSERT WITH CHECK (auth.role() = 'anon' OR auth.role() = 'authenticated');

CREATE POLICY analytics_events_admin_read ON analytics_events
  FOR SELECT USING (is_admin());

-- 6.9 notifications
CREATE POLICY notifications_own_read ON notifications
  FOR SELECT USING (for_user IS NULL OR for_user = auth.uid() OR is_admin());

CREATE POLICY notifications_own_update ON notifications
  FOR UPDATE USING (for_user = auth.uid() OR is_admin());

CREATE POLICY notifications_admin_all ON notifications
  FOR ALL USING (is_admin());

-- 6.10 support_tickets
CREATE POLICY support_tickets_admin_all ON support_tickets
  FOR ALL USING (is_admin());

-- 6.11 ticket_replies
CREATE POLICY ticket_replies_admin_all ON ticket_replies
  FOR ALL USING (is_admin());

-- 6.12 media_library
CREATE POLICY media_library_admin_all ON media_library
  FOR ALL USING (is_admin());

-- 6.13 activity_logs
CREATE POLICY activity_logs_admin_read ON activity_logs
  FOR SELECT USING (is_admin());

-- 6.14 coupons
CREATE POLICY coupons_admin_all ON coupons
  FOR ALL USING (is_admin());

-- 6.15 order_timeline
CREATE POLICY order_timeline_auth_read ON order_timeline
  FOR SELECT USING (is_authenticated());

-- 6.16 settings
CREATE POLICY settings_public_read ON settings
  FOR SELECT USING (true);

CREATE POLICY settings_admin_write ON settings
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY settings_admin_update ON settings
  FOR UPDATE USING (is_admin());

CREATE POLICY settings_admin_delete ON settings
  FOR DELETE USING (is_admin());

-- ============================================================
-- 7. REALTIME (Supabase)
-- ============================================================

ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE analytics_events;
ALTER PUBLICATION supabase_realtime ADD TABLE customers;

-- ============================================================
-- 8. SEED DATA
-- ============================================================

-- Insert default settings row
INSERT INTO settings (id, company_name, phone, whatsapp, email, address)
VALUES ('00000000-0000-0000-0000-000000000001', 'My Agency', '0555000000', '0555000000', 'contact@agency.dz', 'Algeria')
ON CONFLICT (id) DO NOTHING;
