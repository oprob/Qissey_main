-- Insert sample categories
INSERT INTO categories (id, name, slug, description, image_url, sort_order) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Dresses', 'dresses', 'Elegant dresses for every occasion', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=600&fit=crop', 1),
  ('550e8400-e29b-41d4-a716-446655440002', 'Tops & Blouses', 'tops-blouses', 'Sophisticated tops and blouses', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=600&fit=crop', 2),
  ('550e8400-e29b-41d4-a716-446655440003', 'Bottoms', 'bottoms', 'Premium pants, skirts, and bottoms', 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=600&fit=crop', 3),
  ('550e8400-e29b-41d4-a716-446655440004', 'Outerwear', 'outerwear', 'Blazers, coats, and jackets', 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=600&fit=crop', 4),
  ('550e8400-e29b-41d4-a716-446655440005', 'Evening Wear', 'evening-wear', 'Glamorous evening and formal wear', 'https://images.unsplash.com/photo-1566479179817-6ee2bf17b08c?w=400&h=600&fit=crop', 5),
  ('550e8400-e29b-41d4-a716-446655440006', 'Accessories', 'accessories', 'Handbags, jewelry, and accessories', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=600&fit=crop', 6);

-- Insert sample products
INSERT INTO products (id, name, slug, description, short_description, price, compare_at_price, sku, status, is_featured, category_id, vendor, tags) VALUES
  ('660e8400-e29b-41d4-a716-446655440001', 'Classic Cotton Shirt', 'classic-cotton-shirt', 'A timeless cotton shirt crafted from premium materials. Perfect for both casual and professional settings with its versatile design and comfortable fit.', 'Premium cotton shirt for versatile styling', 89.99, 129.99, 'QIS-SHIRT-001', 'active', true, '550e8400-e29b-41d4-a716-446655440002', 'Qissey', ARRAY['cotton', 'classic', 'versatile']),
  
  ('660e8400-e29b-41d4-a716-446655440002', 'Elegant Blazer', 'elegant-blazer', 'Sophisticated blazer tailored to perfection. Made from high-quality fabric with attention to detail in every stitch. Ideal for business meetings and formal occasions.', 'Tailored blazer for professional elegance', 199.99, 299.99, 'QIS-BLAZER-001', 'active', true, '550e8400-e29b-41d4-a716-446655440004', 'Qissey', ARRAY['blazer', 'professional', 'elegant']),
  
  ('660e8400-e29b-41d4-a716-446655440003', 'Designer Handbag', 'designer-handbag', 'Luxury handbag crafted from genuine leather. Features multiple compartments and elegant hardware. The perfect accessory for the modern woman.', 'Luxury leather handbag with elegant design', 299.99, NULL, 'QIS-BAG-001', 'active', true, '550e8400-e29b-41d4-a716-446655440006', 'Qissey', ARRAY['leather', 'luxury', 'handbag']),
  
  ('660e8400-e29b-41d4-a716-446655440004', 'Premium Jeans', 'premium-jeans', 'High-quality denim jeans with a perfect fit. Made from sustainable materials with a comfortable stretch. Available in multiple washes and sizes.', 'Sustainable premium denim jeans', 129.99, NULL, 'QIS-JEANS-001', 'active', false, '550e8400-e29b-41d4-a716-446655440003', 'Qissey', ARRAY['denim', 'sustainable', 'comfort']),
  
  ('660e8400-e29b-41d4-a716-446655440005', 'Silk Evening Dress', 'silk-evening-dress', 'Glamorous silk evening dress perfect for special occasions. Features an elegant silhouette and luxurious finish. Dry clean only.', 'Luxurious silk dress for evening events', 449.99, 599.99, 'QIS-DRESS-001', 'active', true, '550e8400-e29b-41d4-a716-446655440005', 'Qissey', ARRAY['silk', 'evening', 'luxury']),
  
  ('660e8400-e29b-41d4-a716-446655440006', 'Cashmere Scarf', 'cashmere-scarf', 'Ultra-soft cashmere scarf in various colors. Perfect for adding a touch of luxury to any outfit. Lightweight yet warm.', 'Ultra-soft cashmere scarf', 79.99, 99.99, 'QIS-SCARF-001', 'active', false, '550e8400-e29b-41d4-a716-446655440006', 'Qissey', ARRAY['cashmere', 'luxury', 'soft']);

-- Insert product images
INSERT INTO product_images (product_id, url, alt_text, sort_order) VALUES
  ('660e8400-e29b-41d4-a716-446655440001', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=800&fit=crop', 'Classic Cotton Shirt - Front View', 1),
  ('660e8400-e29b-41d4-a716-446655440001', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=800&fit=crop', 'Classic Cotton Shirt - Side View', 2),
  
  ('660e8400-e29b-41d4-a716-446655440002', 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&h=800&fit=crop', 'Elegant Blazer - Front View', 1),
  ('660e8400-e29b-41d4-a716-446655440002', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=800&fit=crop', 'Elegant Blazer - Model View', 2),
  
  ('660e8400-e29b-41d4-a716-446655440003', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=800&fit=crop', 'Designer Handbag - Main View', 1),
  ('660e8400-e29b-41d4-a716-446655440003', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=800&fit=crop', 'Designer Handbag - Detail View', 2),
  
  ('660e8400-e29b-41d4-a716-446655440004', 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=800&fit=crop', 'Premium Jeans - Front View', 1),
  
  ('660e8400-e29b-41d4-a716-446655440005', 'https://images.unsplash.com/photo-1566479179817-6ee2bf17b08c?w=600&h=800&fit=crop', 'Silk Evening Dress - Main View', 1),
  ('660e8400-e29b-41d4-a716-446655440005', 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&h=800&fit=crop', 'Silk Evening Dress - Detail View', 2),
  
  ('660e8400-e29b-41d4-a716-446655440006', 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600&h=800&fit=crop', 'Cashmere Scarf - Main View', 1);

-- Insert product variants
INSERT INTO product_variants (id, product_id, title, option1, option2, sku, price, inventory_quantity) VALUES
  -- Classic Cotton Shirt variants
  ('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'S / White', 'S', 'White', 'QIS-SHIRT-001-S-WHITE', 89.99, 15),
  ('770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', 'M / White', 'M', 'White', 'QIS-SHIRT-001-M-WHITE', 89.99, 20),
  ('770e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440001', 'L / White', 'L', 'White', 'QIS-SHIRT-001-L-WHITE', 89.99, 18),
  ('770e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440001', 'S / Blue', 'S', 'Blue', 'QIS-SHIRT-001-S-BLUE', 89.99, 10),
  ('770e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440001', 'M / Blue', 'M', 'Blue', 'QIS-SHIRT-001-M-BLUE', 89.99, 12),
  ('770e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440001', 'L / Blue', 'L', 'Blue', 'QIS-SHIRT-001-L-BLUE', 89.99, 8),
  
  -- Elegant Blazer variants
  ('770e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440002', 'S / Navy', 'S', 'Navy', 'QIS-BLAZER-001-S-NAVY', 199.99, 5),
  ('770e8400-e29b-41d4-a716-446655440008', '660e8400-e29b-41d4-a716-446655440002', 'M / Navy', 'M', 'Navy', 'QIS-BLAZER-001-M-NAVY', 199.99, 8),
  ('770e8400-e29b-41d4-a716-446655440009', '660e8400-e29b-41d4-a716-446655440002', 'L / Navy', 'L', 'Navy', 'QIS-BLAZER-001-L-NAVY', 199.99, 6),
  ('770e8400-e29b-41d4-a716-446655440010', '660e8400-e29b-41d4-a716-446655440002', 'S / Black', 'S', 'Black', 'QIS-BLAZER-001-S-BLACK', 199.99, 4),
  ('770e8400-e29b-41d4-a716-446655440011', '660e8400-e29b-41d4-a716-446655440002', 'M / Black', 'M', 'Black', 'QIS-BLAZER-001-M-BLACK', 199.99, 7),
  ('770e8400-e29b-41d4-a716-446655440012', '660e8400-e29b-41d4-a716-446655440002', 'L / Black', 'L', 'Black', 'QIS-BLAZER-001-L-BLACK', 199.99, 3),
  
  -- Designer Handbag (one size)
  ('770e8400-e29b-41d4-a716-446655440013', '660e8400-e29b-41d4-a716-446655440003', 'One Size / Black', 'One Size', 'Black', 'QIS-BAG-001-OS-BLACK', 299.99, 12),
  ('770e8400-e29b-41d4-a716-446655440014', '660e8400-e29b-41d4-a716-446655440003', 'One Size / Brown', 'One Size', 'Brown', 'QIS-BAG-001-OS-BROWN', 299.99, 8),
  
  -- Premium Jeans variants
  ('770e8400-e29b-41d4-a716-446655440015', '660e8400-e29b-41d4-a716-446655440004', '28 / Dark Blue', '28', 'Dark Blue', 'QIS-JEANS-001-28-DARK', 129.99, 10),
  ('770e8400-e29b-41d4-a716-446655440016', '660e8400-e29b-41d4-a716-446655440004', '30 / Dark Blue', '30', 'Dark Blue', 'QIS-JEANS-001-30-DARK', 129.99, 15),
  ('770e8400-e29b-41d4-a716-446655440017', '660e8400-e29b-41d4-a716-446655440004', '32 / Dark Blue', '32', 'Dark Blue', 'QIS-JEANS-001-32-DARK', 129.99, 18),
  ('770e8400-e29b-41d4-a716-446655440018', '660e8400-e29b-41d4-a716-446655440004', '34 / Dark Blue', '34', 'Dark Blue', 'QIS-JEANS-001-34-DARK', 129.99, 12),
  
  -- Silk Evening Dress variants
  ('770e8400-e29b-41d4-a716-446655440019', '660e8400-e29b-41d4-a716-446655440005', 'XS / Black', 'XS', 'Black', 'QIS-DRESS-001-XS-BLACK', 449.99, 3),
  ('770e8400-e29b-41d4-a716-446655440020', '660e8400-e29b-41d4-a716-446655440005', 'S / Black', 'S', 'Black', 'QIS-DRESS-001-S-BLACK', 449.99, 5),
  ('770e8400-e29b-41d4-a716-446655440021', '660e8400-e29b-41d4-a716-446655440005', 'M / Black', 'M', 'Black', 'QIS-DRESS-001-M-BLACK', 449.99, 4),
  ('770e8400-e29b-41d4-a716-446655440022', '660e8400-e29b-41d4-a716-446655440005', 'L / Black', 'L', 'Black', 'QIS-DRESS-001-L-BLACK', 449.99, 2),
  
  -- Cashmere Scarf variants
  ('770e8400-e29b-41d4-a716-446655440023', '660e8400-e29b-41d4-a716-446655440006', 'One Size / Beige', 'One Size', 'Beige', 'QIS-SCARF-001-OS-BEIGE', 79.99, 20),
  ('770e8400-e29b-41d4-a716-446655440024', '660e8400-e29b-41d4-a716-446655440006', 'One Size / Gray', 'One Size', 'Gray', 'QIS-SCARF-001-OS-GRAY', 79.99, 15),
  ('770e8400-e29b-41d4-a716-446655440025', '660e8400-e29b-41d4-a716-446655440006', 'One Size / Navy', 'One Size', 'Navy', 'QIS-SCARF-001-OS-NAVY', 79.99, 18);

-- Function to generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'ORD-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(FLOOR(RANDOM() * 9999 + 1)::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Insert sample discount codes
INSERT INTO discounts (code, type, value, minimum_order_amount, usage_limit, starts_at, ends_at) VALUES
  ('WELCOME10', 'percentage', 10, 50, 100, NOW() - INTERVAL '1 day', NOW() + INTERVAL '30 days'),
  ('SAVE50', 'fixed_amount', 50, 200, 50, NOW() - INTERVAL '1 day', NOW() + INTERVAL '7 days'),
  ('FREESHIP', 'free_shipping', 0, 100, 200, NOW() - INTERVAL '1 day', NOW() + INTERVAL '60 days');