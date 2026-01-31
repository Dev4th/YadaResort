-- =============================================
-- Yada Homestay - Additional Schema Updates
-- Run this after the main schema
-- =============================================

-- Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Add password column to users table (for simple auth)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password VARCHAR(255);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive'));

-- =============================================
-- PASSWORD HASHING FUNCTION
-- =============================================
CREATE OR REPLACE FUNCTION hash_password(plain_text VARCHAR)
RETURNS VARCHAR AS $$
BEGIN
    RETURN crypt(plain_text, gen_salt('bf', 8));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to verify password
CREATE OR REPLACE FUNCTION verify_password(plain_text VARCHAR, hashed_password VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN hashed_password = crypt(plain_text, hashed_password);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function for simple login (returns user if credentials match)
CREATE OR REPLACE FUNCTION simple_login(p_username VARCHAR, p_password VARCHAR)
RETURNS TABLE (
    id UUID,
    username VARCHAR,
    name VARCHAR,
    email VARCHAR,
    role VARCHAR,
    permissions TEXT[],
    status VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id, u.username, u.name, u.email, u.role, u.permissions, u.status
    FROM public.users u
    WHERE u.username = p_username 
      AND u.status = 'active'
      AND (
        -- Support both plain text (for migration) and hashed passwords
        u.password = p_password 
        OR verify_password(p_password, u.password)
      );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- SETTINGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.settings (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'main',
    data JSONB NOT NULL DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for settings" ON public.settings;
CREATE POLICY "Allow all for settings" ON public.settings FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- =============================================
-- PAYMENT_SLIPS TABLE (for storing payment proof)
-- =============================================
CREATE TABLE IF NOT EXISTS public.payment_slips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    amount DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    notes TEXT,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES public.users(id)
);

ALTER TABLE public.payment_slips ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for payment_slips" ON public.payment_slips;
CREATE POLICY "Allow all for payment_slips" ON public.payment_slips FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- =============================================
-- AUDIT LOG TABLE (for tracking changes)
-- =============================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id),
    action VARCHAR(50) NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    record_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow insert for audit_logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Allow select for audit_logs" ON public.audit_logs;
CREATE POLICY "Allow insert for audit_logs" ON public.audit_logs FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow select for audit_logs" ON public.audit_logs FOR SELECT TO authenticated USING (true);

-- =============================================
-- INSERT DEFAULT ADMIN USER (with hashed password)
-- =============================================
INSERT INTO public.users (username, name, email, phone, role, password, status, permissions) VALUES
('admin', 'ผู้ดูแลระบบ', 'admin@yadahomestay.com', '081-234-5678', 'admin', hash_password('admin123'), 'active', 
 ARRAY['dashboard_view', 'bookings_manage', 'rooms_manage', 'guests_manage', 'orders_manage', 'products_manage', 'reports_view', 'settings_manage'])
ON CONFLICT (username) DO UPDATE SET
  password = hash_password('admin123'),
  status = 'active',
  role = 'admin';

INSERT INTO public.users (username, name, email, phone, role, password, status, permissions) VALUES
('owner', 'คุณยาดา', 'owner@yadahomestay.com', '081-234-5679', 'owner', hash_password('owner123'), 'active', 
 ARRAY['dashboard_view', 'bookings_manage', 'rooms_manage', 'guests_manage', 'orders_manage', 'products_manage', 'reports_view', 'settings_manage'])
ON CONFLICT (username) DO UPDATE SET
  password = hash_password('owner123'),
  status = 'active',
  role = 'owner';

INSERT INTO public.users (username, name, email, phone, role, password, status, permissions) VALUES
('reception', 'พนักงานต้อนรับ', 'reception@yadahomestay.com', '081-234-5680', 'receptionist', hash_password('reception123'), 'active', 
 ARRAY['dashboard_view', 'bookings_manage', 'rooms_manage', 'guests_manage', 'orders_manage'])
ON CONFLICT (username) DO UPDATE SET
  password = hash_password('reception123'),
  status = 'active',
  role = 'receptionist';

-- =============================================
-- INSERT DEFAULT SETTINGS
-- =============================================
INSERT INTO public.settings (id, data) VALUES ('main', '{
  "name": "Yada Homestay",
  "nameTh": "ญาดาโฮมสเตย์",
  "phone": "081-234-5678",
  "email": "contact@yadahomestay.com",
  "address": "80 ธงชัย ต.ธงชัย อ.เมือง จ.เพชรบุรี 76000",
  "taxId": "1234567890123",
  "checkInTime": "14:00",
  "checkOutTime": "12:00",
  "bankName": "ธนาคารกสิกรไทย",
  "bankAccount": "123-4-56789-0",
  "bankAccountName": "บจก. ญาดาโฮมสเตย์",
  "promptpayId": "0812345678"
}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- IMPROVED RLS POLICIES
-- =============================================

-- Users table: Only admins can manage users, users can read their own data
DROP POLICY IF EXISTS "Allow all for users" ON public.users;
DROP POLICY IF EXISTS "Allow read for users" ON public.users;
DROP POLICY IF EXISTS "Allow update own user" ON public.users;
DROP POLICY IF EXISTS "Public can read active users for login" ON public.users;
DROP POLICY IF EXISTS "Authenticated can read all users" ON public.users;
DROP POLICY IF EXISTS "Authenticated can insert users" ON public.users;
DROP POLICY IF EXISTS "Authenticated can update users" ON public.users;

CREATE POLICY "Public can read active users for login" ON public.users
    FOR SELECT TO anon USING (status = 'active');

CREATE POLICY "Authenticated can read all users" ON public.users
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated can insert users" ON public.users
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated can update users" ON public.users
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Rooms table: Public can read, only authenticated can modify
DROP POLICY IF EXISTS "Allow all for rooms" ON public.rooms;
DROP POLICY IF EXISTS "Public can read rooms" ON public.rooms;
DROP POLICY IF EXISTS "Anyone can read rooms" ON public.rooms;
DROP POLICY IF EXISTS "Authenticated can modify rooms" ON public.rooms;

CREATE POLICY "Anyone can read rooms" ON public.rooms
    FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Authenticated can modify rooms" ON public.rooms
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Bookings table: Public can create bookings, authenticated can manage
DROP POLICY IF EXISTS "Allow all for bookings" ON public.bookings;
DROP POLICY IF EXISTS "Anyone can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Public can read own bookings by phone" ON public.bookings;
DROP POLICY IF EXISTS "Authenticated can manage bookings" ON public.bookings;

CREATE POLICY "Anyone can create bookings" ON public.bookings
    FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Public can read own bookings by phone" ON public.bookings
    FOR SELECT TO anon USING (true);

CREATE POLICY "Authenticated can manage bookings" ON public.bookings
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Products table: Hide cost_price from public
DROP POLICY IF EXISTS "Allow all for products" ON public.products;
DROP POLICY IF EXISTS "Public can read products" ON public.products;
DROP POLICY IF EXISTS "Authenticated can manage products" ON public.products;

CREATE POLICY "Authenticated can manage products" ON public.products
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
