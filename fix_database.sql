-- Enable RLS (if not already enabled)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 1. Policies for CATEGORIES
DROP POLICY IF EXISTS "Public categories are viewable by everyone" ON categories;
CREATE POLICY "Public categories are viewable by everyone" 
ON categories FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Admins can insert categories" ON categories;
CREATE POLICY "Admins can insert categories" 
ON categories FOR INSERT 
WITH CHECK (auth.role() = 'service_role'); -- Simplified for now, or allow authenticated users if needed

-- 2. Policies for PRODUCTS
DROP POLICY IF EXISTS "Public products are viewable by everyone" ON products;
CREATE POLICY "Public products are viewable by everyone" 
ON products FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Admins can insert products" ON products;
CREATE POLICY "Admins can insert products" 
ON products FOR INSERT 
WITH CHECK (auth.role() = 'service_role');

-- 3. Policies for USERS (Profiles)
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
CREATE POLICY "Users can insert their own profile" 
ON users FOR INSERT 
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile" 
ON users FOR SELECT 
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON users;
CREATE POLICY "Admins can view all profiles" 
ON users FOR SELECT 
USING (auth.jwt() ->> 'email' = 'admin@gmail.com'); -- Example admin check

-- 4. Seed Data: Categories (only if empty)
INSERT INTO categories (name, description, image_url)
SELECT 'Men', 'Men''s Fashion', 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Men');

INSERT INTO categories (name, description, image_url)
SELECT 'Women', 'Women''s Fashion', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Women');

INSERT INTO categories (name, description, image_url)
SELECT 'Accessories', 'Fashion Accessories', 'https://images.unsplash.com/photo-1576053139778-7e32f2ae3cfd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Accessories');

-- 5. Seed Data: Products (only if empty)
-- Check if we have categories first to link them, otherwise insert with NULL category or hardcoded ID if known.
-- For simplicity in this script, we'll try to look up the ID.

DO $$
DECLARE
  men_id uuid;
  women_id uuid;
  acc_id uuid;
BEGIN
  SELECT id INTO men_id FROM categories WHERE name = 'Men' LIMIT 1;
  SELECT id INTO women_id FROM categories WHERE name = 'Women' LIMIT 1;
  SELECT id INTO acc_id FROM categories WHERE name = 'Accessories' LIMIT 1;

  IF men_id IS NOT NULL THEN
    INSERT INTO products (name, description, price, stock, category_id, image_url)
    SELECT 'Classic White T-Shirt', 'A comfortable and versatile white t-shirt made from 100% cotton.', 29.99, 100, men_id, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Classic White T-Shirt');

    INSERT INTO products (name, description, price, stock, category_id, image_url)
    SELECT 'Denim Jacket', 'Stylish denim jacket perfect for any casual occasion.', 89.99, 50, men_id, 'https://images.unsplash.com/photo-1523205771623-e0faa4d2813d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Denim Jacket');
  END IF;

  IF women_id IS NOT NULL THEN
    INSERT INTO products (name, description, price, stock, category_id, image_url)
    SELECT 'Summer Floral Dress', 'Lightweight floral dress ideal for warm summer days.', 59.99, 75, women_id, 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Summer Floral Dress');
  END IF;
  
  IF acc_id IS NOT NULL THEN
    INSERT INTO products (name, description, price, stock, category_id, image_url)
    SELECT 'Leather Watch', 'Elegant leather watch with a minimalist design.', 129.99, 30, acc_id, 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Leather Watch');
  END IF;
END $;

-- 6. Policies for REVIEWS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view reviews" ON reviews;
CREATE POLICY "Anyone can view reviews" 
ON reviews FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert reviews" ON reviews;
CREATE POLICY "Authenticated users can insert reviews" 
ON reviews FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update their own reviews" ON reviews;
CREATE POLICY "Users can update their own reviews" 
ON reviews FOR UPDATE 
USING (true);

DROP POLICY IF EXISTS "Users can delete their own reviews" ON reviews;
CREATE POLICY "Users can delete their own reviews" 
ON reviews FOR DELETE 
USING (true);
