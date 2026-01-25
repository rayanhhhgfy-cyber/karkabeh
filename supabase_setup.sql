-- 1. Create a function to check if a user is an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    auth.jwt() ->> 'email' IN ('admin@gmail.com', 'admin2211@gmail.com')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_requests ENABLE ROW LEVEL SECURITY;

-- 3. Policies for CATEGORIES
DROP POLICY IF EXISTS "Public categories are viewable by everyone" ON categories;
CREATE POLICY "Public categories are viewable by everyone" 
ON categories FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Admins can insert categories" ON categories;
CREATE POLICY "Admins can insert categories" 
ON categories FOR INSERT 
WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can update categories" ON categories;
CREATE POLICY "Admins can update categories" 
ON categories FOR UPDATE 
USING (is_admin());

DROP POLICY IF EXISTS "Admins can delete categories" ON categories;
CREATE POLICY "Admins can delete categories" 
ON categories FOR DELETE 
USING (is_admin());

-- 4. Policies for PRODUCTS
DROP POLICY IF EXISTS "Public products are viewable by everyone" ON products;
CREATE POLICY "Public products are viewable by everyone" 
ON products FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Admins can insert products" ON products;
CREATE POLICY "Admins can insert products" 
ON products FOR INSERT 
WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can update products" ON products;
CREATE POLICY "Admins can update products" 
ON products FOR UPDATE 
USING (is_admin());

DROP POLICY IF EXISTS "Admins can delete products" ON products;
CREATE POLICY "Admins can delete products" 
ON products FOR DELETE 
USING (is_admin());

-- 5. Policies for USERS (Profiles)
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
USING (is_admin());

-- 6. Storage Policies (Bucket creation handled by script, policies here)
-- Note: 'product-images' bucket must exist.
DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
CREATE POLICY "Public can view product images"
ON storage.objects FOR SELECT
USING ( bucket_id = 'product-images' );

DROP POLICY IF EXISTS "Admins can upload product images" ON storage.objects;
CREATE POLICY "Admins can upload product images"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'product-images' AND is_admin() );

DROP POLICY IF EXISTS "Admins can update product images" ON storage.objects;
CREATE POLICY "Admins can update product images"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'product-images' AND is_admin() );

DROP POLICY IF EXISTS "Admins can delete product images" ON storage.objects;
CREATE POLICY "Admins can delete product images"
ON storage.objects FOR DELETE
USING ( bucket_id = 'product-images' AND is_admin() );

-- 7. Policies for PRODUCT REQUESTS
DROP POLICY IF EXISTS "Anyone can request a product" ON product_requests;
CREATE POLICY "Anyone can request a product" 
ON product_requests FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view product requests" ON product_requests;
CREATE POLICY "Admins can view product requests" 
ON product_requests FOR SELECT 
USING (is_admin());

DROP POLICY IF EXISTS "Admins can update product requests" ON product_requests;
CREATE POLICY "Admins can update product requests" 
ON product_requests FOR UPDATE 
USING (is_admin());
