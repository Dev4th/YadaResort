-- =============================================
-- Yada Homestay - Supabase Database Schema
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. USERS TABLE (Staff/Admin)
-- =============================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL CHECK (role IN ('owner', 'admin', 'receptionist', 'staff')) DEFAULT 'staff',
    permissions TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 2. ROOMS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    name_th VARCHAR(100) NOT NULL,
    description TEXT,
    description_th TEXT,
    price DECIMAL(10,2) NOT NULL,
    size INTEGER, -- square meters
    capacity INTEGER DEFAULT 2,
    amenities TEXT[] DEFAULT '{}',
    images TEXT[] DEFAULT '{}',
    status VARCHAR(20) NOT NULL CHECK (status IN ('available', 'occupied', 'maintenance', 'cleaning')) DEFAULT 'available',
    bed_type VARCHAR(50),
    view VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 3. GUESTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.guests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255),
    id_card VARCHAR(20),
    nationality VARCHAR(50) DEFAULT 'Thai',
    total_visits INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 4. BOOKINGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
    guest_name VARCHAR(100) NOT NULL,
    guest_phone VARCHAR(20) NOT NULL,
    guest_email VARCHAR(255),
    guest_id_card VARCHAR(20),
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    adults INTEGER DEFAULT 1,
    children INTEGER DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled')) DEFAULT 'pending',
    payment_status VARCHAR(20) NOT NULL CHECK (payment_status IN ('pending', 'paid', 'partial', 'refunded')) DEFAULT 'pending',
    payment_method VARCHAR(20),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 5. PRODUCTS TABLE (Bar/Minibar items)
-- =============================================
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    name_th VARCHAR(100) NOT NULL,
    category VARCHAR(20) NOT NULL CHECK (category IN ('beverage', 'alcohol', 'snack', 'other')) DEFAULT 'other',
    price DECIMAL(10,2) NOT NULL,
    cost DECIMAL(10,2) DEFAULT 0,
    stock INTEGER DEFAULT 0,
    unit VARCHAR(20) DEFAULT 'ชิ้น',
    image TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 6. ORDERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    room_id UUID REFERENCES public.rooms(id) ON DELETE SET NULL,
    guest_name VARCHAR(100) NOT NULL,
    items JSONB NOT NULL DEFAULT '[]',
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    tax DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'preparing', 'ready', 'delivered', 'paid')) DEFAULT 'pending',
    payment_method VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 7. PAYMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    method VARCHAR(20) NOT NULL CHECK (method IN ('cash', 'card', 'transfer', 'qr')) DEFAULT 'cash',
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')) DEFAULT 'pending',
    reference VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES public.users(id)
);

-- =============================================
-- 8. ROOM CLEANING TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.room_cleaning (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'inspected')) DEFAULT 'pending',
    assigned_to UUID REFERENCES public.users(id),
    notes TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 9. MAINTENANCE REQUESTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.maintenance_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed')) DEFAULT 'pending',
    assigned_to UUID REFERENCES public.users(id),
    cost DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- =============================================
-- 10. INVENTORY TRANSACTIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.inventory_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('in', 'out', 'adjustment')),
    quantity INTEGER NOT NULL,
    reason TEXT,
    reference VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES public.users(id)
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_bookings_room_id ON public.bookings(room_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_check_in ON public.bookings(check_in);
CREATE INDEX IF NOT EXISTS idx_bookings_check_out ON public.bookings(check_out);
CREATE INDEX IF NOT EXISTS idx_orders_booking_id ON public.orders(booking_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_room_cleaning_room_id ON public.room_cleaning(room_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_room_id ON public.maintenance_requests(room_id);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to decrease product stock
CREATE OR REPLACE FUNCTION decrease_stock(p_product_id UUID, p_quantity INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE public.products 
    SET stock = stock - p_quantity 
    WHERE id = p_product_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get today's revenue
CREATE OR REPLACE FUNCTION get_today_revenue()
RETURNS DECIMAL AS $$
DECLARE
    revenue DECIMAL;
BEGIN
    SELECT COALESCE(SUM(amount), 0) INTO revenue
    FROM public.payments
    WHERE DATE(created_at) = CURRENT_DATE
    AND status = 'completed';
    
    RETURN revenue;
END;
$$ LANGUAGE plpgsql;

-- Function to get monthly revenue
CREATE OR REPLACE FUNCTION get_monthly_revenue()
RETURNS DECIMAL AS $$
DECLARE
    revenue DECIMAL;
BEGIN
    SELECT COALESCE(SUM(amount), 0) INTO revenue
    FROM public.payments
    WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
    AND status = 'completed';
    
    RETURN revenue;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_cleaning ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow authenticated users to read all
CREATE POLICY "Allow authenticated read" ON public.users FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read" ON public.rooms FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read" ON public.guests FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read" ON public.bookings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read" ON public.products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read" ON public.orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read" ON public.payments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read" ON public.room_cleaning FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read" ON public.maintenance_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read" ON public.inventory_transactions FOR SELECT TO authenticated USING (true);

-- RLS Policies - Allow authenticated users to insert/update/delete
CREATE POLICY "Allow authenticated write" ON public.rooms FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated write" ON public.guests FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated write" ON public.bookings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated write" ON public.products FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated write" ON public.orders FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated write" ON public.payments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated write" ON public.room_cleaning FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated write" ON public.maintenance_requests FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated write" ON public.inventory_transactions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Allow public read for rooms (for website)
CREATE POLICY "Allow public read rooms" ON public.rooms FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public read products" ON public.products FOR SELECT TO anon USING (is_active = true);

-- =============================================
-- REALTIME
-- =============================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_cleaning;

-- =============================================
-- SAMPLE DATA
-- =============================================

-- Insert sample rooms
INSERT INTO public.rooms (name, name_th, description, description_th, price, size, capacity, amenities, images, status, bed_type, view) VALUES
('Standard Room', 'ห้องสแตนดาร์ด', 'Cozy room with essential amenities', 'ห้องพักสะดวกสบายพร้อมสิ่งอำนวยความสะดวกครบครัน', 1200, 24, 2, ARRAY['WiFi', 'Air Conditioning', 'TV', 'Hot Water'], ARRAY['/images/room1.jpg'], 'available', 'Double', 'Garden'),
('Deluxe Room', 'ห้องดีลักซ์', 'Spacious room with balcony', 'ห้องกว้างขวางพร้อมระเบียง', 1800, 32, 2, ARRAY['WiFi', 'Air Conditioning', 'TV', 'Hot Water', 'Balcony', 'Mini Bar'], ARRAY['/images/room2.jpg'], 'available', 'King', 'Pool'),
('Family Suite', 'ห้องครอบครัว', 'Perfect for families with separate living area', 'เหมาะสำหรับครอบครัว มีพื้นที่นั่งเล่นแยก', 2500, 48, 4, ARRAY['WiFi', 'Air Conditioning', 'TV', 'Hot Water', 'Balcony', 'Mini Bar', 'Kitchenette'], ARRAY['/images/room3.jpg'], 'available', 'Twin + Sofa Bed', 'Mountain'),
('Pool Villa', 'พูลวิลล่า', 'Private villa with pool access', 'วิลล่าส่วนตัวพร้อมสระว่ายน้ำ', 4500, 65, 2, ARRAY['WiFi', 'Air Conditioning', 'TV', 'Hot Water', 'Private Pool', 'Full Kitchen', 'Outdoor Shower'], ARRAY['/images/room4.jpg'], 'available', 'King', 'Private Pool'),
('Superior Room', 'ห้องซูพีเรียร์', 'Upgraded room with extra space', 'ห้องพักระดับสูงขึ้น พื้นที่มากขึ้น', 1500, 28, 2, ARRAY['WiFi', 'Air Conditioning', 'TV', 'Hot Water', 'Work Desk'], ARRAY['/images/room5.jpg'], 'available', 'Queen', 'Garden');

-- Insert sample products
INSERT INTO public.products (name, name_th, category, price, cost, stock, unit, is_active) VALUES
('Coca Cola', 'โคคา-โคล่า', 'beverage', 35, 15, 50, 'ขวด', true),
('Pepsi', 'เป๊ปซี่', 'beverage', 35, 15, 50, 'ขวด', true),
('Mineral Water', 'น้ำแร่', 'beverage', 25, 8, 100, 'ขวด', true),
('Orange Juice', 'น้ำส้ม', 'beverage', 45, 20, 30, 'ขวด', true),
('Beer Chang', 'เบียร์ช้าง', 'alcohol', 70, 35, 40, 'ขวด', true),
('Beer Singha', 'เบียร์สิงห์', 'alcohol', 75, 38, 40, 'ขวด', true),
('Leo Beer', 'เบียร์ลีโอ', 'alcohol', 65, 32, 40, 'ขวด', true),
('Whisky', 'วิสกี้', 'alcohol', 150, 80, 20, 'แก้ว', true),
('Pringles', 'พริงเกิลส์', 'snack', 65, 35, 25, 'กระป๋อง', true),
('Lay''s Chips', 'เลย์', 'snack', 35, 18, 30, 'ถุง', true),
('Instant Noodles', 'มาม่า', 'snack', 20, 8, 50, 'ซอง', true),
('Chocolate Bar', 'ช็อคโกแลตแท่ง', 'snack', 45, 25, 30, 'แท่ง', true);

-- =============================================
-- CREATE AUTH USERS (Run separately in Supabase Dashboard)
-- =============================================
-- NOTE: You need to create these users in Supabase Authentication Dashboard
-- Then run the INSERT statements below with the correct user IDs

-- After creating users in Auth, insert their profiles:
-- INSERT INTO public.users (id, username, name, email, phone, role, permissions, is_active) VALUES
-- ('<owner-auth-id>', 'owner', 'คุณยาดา', 'owner@yadahomestay.com', '081-234-5678', 'owner', 
--  ARRAY['dashboard_view', 'bookings_manage', 'rooms_manage', 'guests_manage', 'orders_manage', 'products_manage', 'reports_view', 'settings_manage'], true),
-- ('<admin-auth-id>', 'admin', 'แอดมิน', 'admin@yadahomestay.com', '081-234-5679', 'admin', 
--  ARRAY['dashboard_view', 'bookings_manage', 'rooms_manage', 'guests_manage', 'orders_manage', 'products_manage', 'reports_view', 'settings_manage'], true),
-- ('<reception-auth-id>', 'reception', 'พนักงานต้อนรับ', 'reception@yadahomestay.com', '081-234-5680', 'receptionist', 
--  ARRAY['dashboard_view', 'bookings_manage', 'rooms_manage', 'guests_manage', 'orders_manage'], true);
