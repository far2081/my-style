-- ==============================================================================
-- STYLEMIRA AI — PRODUCTION DATABASE SCHEMA & SUPABASE BACKEND
-- ==============================================================================
-- Luxury Pakistani Haute Couture & AI Virtual Fashion Platform
-- Architecture: Multi-tenant, Role-Based Access Control, Row Level Security (RLS)
-- Storage Buckets: public-products, private-customer-assets
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. APP SETTINGS & CONFIGURATION
-- ==============================================================================
CREATE TABLE IF NOT EXISTS app_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Essential App Settings
INSERT INTO app_settings (key, value, description, is_public) VALUES
('currency', '{"code": "PKR", "symbol": "Rs.", "rate_to_usd": 0.0036}', 'Primary currency settings', true),
('bridal_offer_threshold', '{"min_order": 150000, "reward": "FREE BRIDAL MAKEUP", "active": true}', 'Smart Bridal Reward threshold', true),
('shipping_fee', '{"standard": 500, "express": 1200, "free_above": 50000}', 'Shipping calculations', true),
('ai_provider_config', '{"image_analysis": "gemini-pro-vision", "tryon": "virtual-tryon-v2", "makeup": "glam-ai-v1", "runway": "motion-gen-v1"}', 'AI active engines', false),
('maintenance_mode', '{"enabled": false, "message": "StyleMira AI is undergoing scheduled maintenance."}', 'System status', true)
ON CONFLICT (key) DO NOTHING;

-- ==============================================================================
-- 3. PROFILES & ROLES (CUSTOMERS & ADMINS)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    preferred_colors TEXT[] DEFAULT '{}',
    preferred_events TEXT[] DEFAULT '{}',
    preferred_style TEXT,
    budget_range JSONB DEFAULT '{"min": 50000, "max": 500000}',
    saved_sizes JSONB DEFAULT '{"dress": "M", "bust": 36, "waist": 29, "hips": 39}',
    shipping_address JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    permissions TEXT[] DEFAULT '{"catalog_manage", "orders_manage", "reviews_manage", "ai_jobs_read"}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. TAXONOMY: CATEGORIES, EVENTS & COLLECTIONS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    cover_image TEXT,
    sort_order INT DEFAULT 0,
    status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    cover_image TEXT NOT NULL,
    status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS colors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    hex_code TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS fabrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS sizes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    sort_order INT DEFAULT 0
);

-- ==============================================================================
-- 5. CENTRAL DRESS LIBRARY & PRODUCTS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id TEXT UNIQUE NOT NULL, -- e.g. BR001, MH001
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT NOT NULL,
    event TEXT NOT NULL,
    occasion TEXT NOT NULL,
    dress_type TEXT NOT NULL,
    style TEXT NOT NULL,
    color TEXT NOT NULL,
    secondary_colors TEXT[] DEFAULT '{}',
    fabric TEXT NOT NULL,
    season TEXT NOT NULL,
    price NUMERIC(12, 2) NOT NULL,
    sale_price NUMERIC(12, 2),
    currency TEXT DEFAULT 'PKR',
    sizes TEXT[] NOT NULL DEFAULT '{"XS", "S", "M", "L", "XL"}',
    stock INT NOT NULL DEFAULT 10,
    in_stock BOOLEAN DEFAULT true,
    description TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    featured BOOLEAN DEFAULT false,
    trending BOOLEAN DEFAULT false,
    new_arrival BOOLEAN DEFAULT false,
    exclusive BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Draft')),
    highlights TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product Variants
CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    color TEXT NOT NULL,
    size TEXT NOT NULL,
    stock INT NOT NULL DEFAULT 5,
    sku TEXT UNIQUE,
    price_override NUMERIC(12, 2),
    availability BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product Images (Prompt 2 Image System Connected)
CREATE TABLE IF NOT EXISTS product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    image_type TEXT NOT NULL CHECK (image_type IN (
        'Front', 'Back', 'Left', 'Right', 'Full Look', 
        'Detail', 'Fabric Detail', 'Close Up', '360 Multi-View'
    )),
    storage_path TEXT NOT NULL,
    image_url TEXT NOT NULL,
    sort_order INT DEFAULT 0,
    alt_text TEXT,
    width INT,
    height INT,
    file_size INT,
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Collection to Product Mapping
CREATE TABLE IF NOT EXISTS collection_products (
    collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    sort_order INT DEFAULT 0,
    PRIMARY KEY (collection_id, product_id)
);

-- 2026 Trends
CREATE TABLE IF NOT EXISTS trends (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    image TEXT NOT NULL,
    category TEXT NOT NULL,
    season TEXT NOT NULL,
    event TEXT NOT NULL,
    status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Draft', 'Archived')),
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 6. SHOPPING: WISHLIST, CARTS & PROMOTIONS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS wishlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wishlist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wishlist_id UUID REFERENCES wishlist(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(wishlist_id, product_id)
);

CREATE TABLE IF NOT EXISTS carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cart_id UUID REFERENCES carts(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    size TEXT NOT NULL,
    color TEXT,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(cart_id, product_id, size)
);

CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_amount NUMERIC(10, 2) NOT NULL,
    minimum_order NUMERIC(12, 2) DEFAULT 0,
    maximum_discount NUMERIC(12, 2),
    eligible_events TEXT[] DEFAULT '{}',
    eligible_categories TEXT[] DEFAULT '{}',
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    usage_limit INT,
    per_user_limit INT DEFAULT 1,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    minimum_order NUMERIC(12, 2) NOT NULL,
    reward_type TEXT NOT NULL,
    reward_value TEXT NOT NULL,
    eligible_events TEXT[] DEFAULT '{}',
    eligible_categories TEXT[] DEFAULT '{}',
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 7. ORDERS, PAYMENTS & SHIPMENTS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    shipping_address JSONB NOT NULL,
    subtotal NUMERIC(12, 2) NOT NULL,
    discount NUMERIC(12, 2) DEFAULT 0,
    shipping NUMERIC(12, 2) DEFAULT 0,
    total NUMERIC(12, 2) NOT NULL,
    applied_coupon TEXT,
    applied_offer TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'confirmed', 'processing', 'packed', 
        'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'
    )),
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded', 'demo_authorized')),
    payment_provider TEXT DEFAULT 'DEMO_PROVIDER',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    size TEXT NOT NULL,
    color TEXT NOT NULL,
    price NUMERIC(12, 2) NOT NULL,
    quantity INT NOT NULL,
    image_url TEXT,
    total NUMERIC(12, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    provider TEXT NOT NULL, -- e.g. STRIPE, JAZZCASH, EASYPAISA, DEMO_GATEWAY
    transaction_reference TEXT UNIQUE,
    amount NUMERIC(12, 2) NOT NULL,
    currency TEXT DEFAULT 'PKR',
    status TEXT NOT NULL,
    is_demo BOOLEAN DEFAULT false,
    payload JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shipments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    carrier TEXT NOT NULL DEFAULT 'TCS Luxury Express',
    tracking_number TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'Order Placed',
    estimated_delivery DATE,
    shipped_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT NOT NULL,
    verified_purchase BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 8. AI ENGINE & HIGH-PERFORMANCE ASYNC JOBS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS ai_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    photo_reference TEXT,
    age INT,
    occasion TEXT,
    event TEXT,
    body_structure TEXT,
    preferred_colors TEXT[],
    dress_type TEXT,
    style TEXT,
    season TEXT,
    budget NUMERIC(12, 2),
    recommended_product_ids TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    feature TEXT NOT NULL CHECK (feature IN ('stylist', 'tryon', 'makeup', 'runway', 'dress_studio')),
    provider TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed', 'cancelled')),
    input_data JSONB NOT NULL,
    output_data JSONB DEFAULT '{}',
    error_message TEXT,
    retry_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS tryon_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    input_photo TEXT NOT NULL,
    provider TEXT NOT NULL DEFAULT 'stylemira-tryon-v2',
    provider_job_id TEXT,
    status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
    result_asset TEXT,
    error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS makeup_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    style TEXT NOT NULL,
    input_photo TEXT NOT NULL,
    provider TEXT NOT NULL DEFAULT 'glam-studio-v1',
    status TEXT NOT NULL DEFAULT 'queued',
    result_asset TEXT,
    error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS runway_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    look_reference TEXT NOT NULL,
    provider TEXT NOT NULL DEFAULT 'cinematic-runway-engine',
    status TEXT NOT NULL DEFAULT 'queued',
    result_video TEXT,
    error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS dress_studio_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    folder_category TEXT NOT NULL CHECK (folder_category IN (
        'My Designs', 'Bridal', 'Mehndi', 'Barat', 'Walima', 'Nikah', 
        'Party', 'Formal', 'Casual', 'Eid', 'Summer', 'Winter', 'Favorites'
    )),
    title TEXT NOT NULL,
    silhouette TEXT,
    fabric TEXT,
    embroidery TEXT,
    color_palette TEXT[],
    preview_url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bridal_looks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    dress_id UUID REFERENCES products(id) ON DELETE SET NULL,
    makeup_style TEXT,
    jewelry_type TEXT,
    hair_style TEXT,
    dupatta_drape TEXT,
    shoes TEXT,
    accessories TEXT[],
    preview_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 9. AUDIT & ANALYTICS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    entity_id TEXT,
    changes JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_name TEXT NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    properties JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 10. INDEXES FOR PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_products_event ON products(event);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_trending ON products(trending);
CREATE INDEX IF NOT EXISTS idx_products_new_arrival ON products(new_arrival);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_product_images_pid ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_ai_jobs_user ON ai_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_tryon_jobs_user ON tryon_jobs(user_id);

-- ==============================================================================
-- 11. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tryon_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE makeup_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE runway_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE dress_studio_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE bridal_looks ENABLE ROW LEVEL SECURITY;

-- Helpers for Role Checking
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles: Users see/edit own; Admins see all
CREATE POLICY "Users can read own profile" ON profiles
    FOR SELECT USING (auth.uid() = id OR is_admin());
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id OR is_admin());

-- Products: Everyone can read active products; Admins manage all
CREATE POLICY "Public can view active products" ON products
    FOR SELECT USING (status = 'Active' OR is_admin());
CREATE POLICY "Admins can insert products" ON products
    FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update products" ON products
    FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete products" ON products
    FOR DELETE USING (is_admin());

-- Product Images: Public can view; Admin can modify
CREATE POLICY "Public can view product images" ON product_images
    FOR SELECT USING (true);
CREATE POLICY "Admins can manage product images" ON product_images
    FOR ALL USING (is_admin());

-- Wishlist & Cart: Strictly private per user
CREATE POLICY "Users can view own wishlist" ON wishlist
    FOR SELECT USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "Users can update own wishlist" ON wishlist
    FOR ALL USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users manage own wishlist items" ON wishlist_items
    FOR ALL USING (
        EXISTS (SELECT 1 FROM wishlist WHERE wishlist.id = wishlist_items.wishlist_id AND wishlist.user_id = auth.uid()) 
        OR is_admin()
    );

CREATE POLICY "Users can view own cart" ON carts
    FOR ALL USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users manage own cart items" ON cart_items
    FOR ALL USING (
        EXISTS (SELECT 1 FROM carts WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid()) 
        OR is_admin()
    );

-- Orders: Customer can only access their own; Admin manages all
CREATE POLICY "Users can view own orders" ON orders
    FOR SELECT USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "Users can create orders" ON orders
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Admins can manage orders" ON orders
    FOR ALL USING (is_admin());

CREATE POLICY "Users can view own order items" ON order_items
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
        OR is_admin()
    );

-- AI Private Jobs & Assets: Strictly Private
CREATE POLICY "Users can view own tryon jobs" ON tryon_jobs
    FOR ALL USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users can view own makeup jobs" ON makeup_jobs
    FOR ALL USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users can view own runway jobs" ON runway_jobs
    FOR ALL USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users manage own dress studio projects" ON dress_studio_projects
    FOR ALL USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users manage own bridal looks" ON bridal_looks
    FOR ALL USING (auth.uid() = user_id OR is_admin());
