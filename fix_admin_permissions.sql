-- 1. Create a function to check if a user is an admin
-- This allows us to reuse the logic easily
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    auth.jwt() ->> 'email' IN ('admin@gmail.com', 'admin2211@gmail.com')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Update Policies for PRODUCTS
-- Allow Admins to INSERT
DROP POLICY IF EXISTS "Admins can insert products" ON products;
CREATE POLICY "Admins can insert products" 
ON products FOR INSERT 
WITH CHECK (is_admin());

-- Allow Admins to UPDATE
DROP POLICY IF EXISTS "Admins can update products" ON products;
CREATE POLICY "Admins can update products" 
ON products FOR UPDATE 
USING (is_admin());

-- Allow Admins to DELETE
DROP POLICY IF EXISTS "Admins can delete products" ON products;
CREATE POLICY "Admins can delete products" 
ON products FOR DELETE 
USING (is_admin());

-- 3. Storage for Product Images
-- Create bucket if it doesn't exist (this might fail if already exists, but that's fine)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
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
