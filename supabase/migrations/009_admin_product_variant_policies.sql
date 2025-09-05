-- Add RLS policies for admin users to manage product variants
-- This allows admin and super_admin users to insert, update, and delete product variants

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin users can insert product variants
CREATE POLICY "Admins can insert product variants" ON product_variants
  FOR INSERT WITH CHECK (is_admin_user());

-- Admin users can update product variants
CREATE POLICY "Admins can update product variants" ON product_variants
  FOR UPDATE USING (is_admin_user());

-- Admin users can delete product variants
CREATE POLICY "Admins can delete product variants" ON product_variants
  FOR DELETE USING (is_admin_user());