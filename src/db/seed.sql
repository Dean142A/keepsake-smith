-- =========================================================
-- The Keepsake Smith — Initial Database Seed Script
-- =========================================================

-- 1. SEED CATEGORIES
INSERT INTO categories (id, name, slug, description) VALUES
  ('cat-1', 'CARDS', 'cards', 'Handwritten luxury card boxes with linen texture finishes'),
  ('cat-2', 'FLOWERS', 'flowers', 'Artisan fresh floral bundles & arrangements'),
  ('cat-3', 'CHOCOLATES', 'chocolates', 'Handcrafted cocoa bean artisan confectioneries'),
  ('cat-4', 'JEWELRY', 'jewelry', 'Gold & sterling silver commemorative keepsake pieces')
ON CONFLICT (name) DO NOTHING;

-- 2. SEED PRODUCTS
INSERT INTO products (id, title, subtitle, price, category, image, allows_customization) VALUES
  ('prod-1', 'Handwritten Cards', 'linen texture finish', 30000, 'CARDS', 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=800&auto=format&fit=crop', true),
  ('prod-2', 'Handwritten Cards + Black Envelope', 'matte black wax seal', 30000, 'CARDS', 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?q=80&w=800&auto=format&fit=crop', true),
  ('prod-3', 'Fresh Flower Bundle FLW-23', 'white lilies & eucalyptus', 15000, 'FLOWERS', 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?q=80&w=800&auto=format&fit=crop', false),
  ('prod-4', 'Artisan Chocolates', 'dark cocoa truffles', 9000, 'CHOCOLATES', 'https://images.unsplash.com/photo-1548907040-4baa42d10919?q=80&w=800&auto=format&fit=crop', false)
ON CONFLICT (id) DO NOTHING;

-- 3. SEED ORDERS
INSERT INTO orders (id, purchaser_name, purchaser_email, recipient_type, recipient_name, recipient_email, fulfillment_type, status, total_amount, access_code, items, custom_message) VALUES
  (
    'ORD-1001',
    'Jane Forster',
    'jane@example.com',
    'gift',
    'Alexander Forster',
    'alexander@example.com',
    'physical_card',
    'in_production',
    38500.00,
    'KPSK-892F-37A1',
    '[{"title": "Handwritten Cards (Physical Box)", "price": 30000, "quantity": 1}, {"title": "Custom 3D Experience Package", "price": 8500, "quantity": 1}]'::jsonb,
    'Happy Anniversary my love! Forever & always.'
  ),
  (
    'ORD-1002',
    'David Kalu',
    'david.kalu@gmail.com',
    'self',
    NULL,
    NULL,
    'digital_only',
    'ready',
    15000.00,
    'KPSK-491M-902B',
    '[{"title": "Digital 3D Maquette Experience", "price": 15000, "quantity": 1}]'::jsonb,
    'Celebrating another landmark milestone.'
  ),
  (
    'ORD-1003',
    'Sophia Bennett',
    'sophia.bennett@luxury.co',
    'gift',
    'Oliver Bennett',
    'oliver@luxury.co',
    'physical_card',
    'in_production',
    54000.00,
    'KPSK-772A-119P',
    '[{"title": "Handwritten Cards + Black Envelope", "price": 30000, "quantity": 1}, {"title": "Fresh Flower Bundle FLW-23", "price": 15000, "quantity": 1}, {"title": "Artisan Chocolates", "price": 9000, "quantity": 1}]'::jsonb,
    'With warmest appreciation and affection.'
  ),
  (
    'ORD-1004',
    'Emeka Nwosu',
    'emeka.n@techfirm.ng',
    'gift',
    'Chidinma Nwosu',
    'chidinma.n@techfirm.ng',
    'digital_only',
    'delivered',
    25000.00,
    'KPSK-302R-884X',
    '[{"title": "Virtual Memorial & Keepsake 3D WebGL", "price": 25000, "quantity": 1}]'::jsonb,
    'Always remembered, forever cherished.'
  )
ON CONFLICT (id) DO NOTHING;

-- 4. SEED ACCESS CODES
INSERT INTO access_codes (order_id, code, failed_attempts) VALUES
  ('ORD-1001', 'KPSK-892F-37A1', 0),
  ('ORD-1002', 'KPSK-491M-902B', 0),
  ('ORD-1003', 'KPSK-772A-119P', 0),
  ('ORD-1004', 'KPSK-302R-884X', 0)
ON CONFLICT (code) DO NOTHING;

-- 5. SEED TEMPLATES
INSERT INTO templates (name, build_path, version) VALUES
  ('Anniversary Luxury Scene v1', 'https://packages.thekeepsakesmith.com/builds/anniversary-v1/', '1.0.0'),
  ('Memorial & Celebration 3D Scene v1', 'https://packages.thekeepsakesmith.com/builds/memorial-v1/', '1.0.0')
ON CONFLICT DO NOTHING;
