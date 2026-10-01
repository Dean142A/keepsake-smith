-- =========================================================
-- The Keepsake Smith — Database Schema (PostgreSQL / MySQL)
-- 100% Native Next.js Architecture Spec
-- =========================================================

-- Enable UUID extension if using PostgreSQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255),
  price DECIMAL(12, 2) NOT NULL,
  category VARCHAR(100) REFERENCES categories(name) ON UPDATE CASCADE ON DELETE SET NULL,
  image TEXT NOT NULL,
  allows_customization BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(50) PRIMARY KEY,
  purchaser_name VARCHAR(255) NOT NULL,
  purchaser_email VARCHAR(255) NOT NULL,
  recipient_type VARCHAR(20) DEFAULT 'self', -- 'self' or 'gift'
  recipient_name VARCHAR(255),
  recipient_email VARCHAR(255),
  fulfillment_type VARCHAR(30) DEFAULT 'physical_card', -- 'physical_card' or 'digital_only'
  status VARCHAR(30) DEFAULT 'in_production', -- 'pending', 'in_production', 'ready', 'delivered'
  total_amount DECIMAL(12, 2) NOT NULL,
  access_code VARCHAR(20) UNIQUE NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  custom_message TEXT,
  custom_photo TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. ACCESS CODES TABLE (Security & Rate Limiting)
CREATE TABLE IF NOT EXISTS access_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id VARCHAR(50) REFERENCES orders(id) ON DELETE CASCADE,
  code VARCHAR(20) UNIQUE NOT NULL,
  package_id UUID,
  failed_attempts INT DEFAULT 0,
  locked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. TEMPLATES TABLE (Unity WebGL Shared Reusable Scene Templates)
CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  build_path TEXT NOT NULL,
  version VARCHAR(50) DEFAULT '1.0.0',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. PACKAGES TABLE (3D Personalization Data Linked to Access Code)
CREATE TABLE IF NOT EXISTS packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES templates(id) ON DELETE SET NULL,
  order_id VARCHAR(50) REFERENCES orders(id) ON DELETE CASCADE,
  build_path TEXT NOT NULL,
  personalization_data JSONB DEFAULT '{}'::jsonb,
  status VARCHAR(30) DEFAULT 'in_production', -- 'in_production', 'ready'
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_orders_access_code ON orders(access_code);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_access_codes_code ON access_codes(code);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
