-- schema.sql
-- Run this in your Supabase SQL Editor

-- 1. Packaging Items
CREATE TABLE packaging_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sku_internal TEXT UNIQUE,
  unit TEXT DEFAULT 'un',
  current_stock NUMERIC DEFAULT 0,
  minimum_stock NUMERIC DEFAULT 10,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Product Packaging Rules (Composition)
CREATE TABLE product_packaging_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  packaging_item_id UUID REFERENCES packaging_items(id) ON DELETE CASCADE,
  quantity_used NUMERIC NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  woo_order_id TEXT UNIQUE NOT NULL,
  order_number TEXT,
  status TEXT DEFAULT 'processing',
  processed_at TIMESTAMPTZ,
  raw_payload JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Order Items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_sku TEXT,
  product_name TEXT,
  quantity NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Packaging Movements (Log of all stock changes)
CREATE TABLE packaging_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  packaging_item_id UUID REFERENCES packaging_items(id) ON DELETE CASCADE,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('in', 'out', 'adjustment')),
  quantity NUMERIC NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('order', 'manual', 'system')),
  source_id TEXT, -- e.g., woo order id or manual user id
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Webhook Events (Auditing)
CREATE TABLE webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT DEFAULT 'woocommerce',
  event_type TEXT NOT NULL,
  external_id TEXT,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  processing_error TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. App Settings
CREATE TABLE app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Automatic Updated_At Triggers
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_packaging_items_updated_at BEFORE UPDATE ON packaging_items FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER set_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
