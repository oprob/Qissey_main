-- Add product images and variants for Karan Vaghela product
-- Using the same pattern as the existing sample data

-- Add product images using Unsplash URLs (matching the sample data pattern)
INSERT INTO product_images (product_id, url, alt_text, sort_order) 
SELECT 
  p.id,
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=800&fit=crop' as url,
  'Karan Vaghela - Front View' as alt_text,
  1 as sort_order
FROM products p 
WHERE p.slug = 'karan-vaghela'
  AND NOT EXISTS (
    SELECT 1 FROM product_images pi 
    WHERE pi.product_id = p.id AND pi.sort_order = 1
  );

INSERT INTO product_images (product_id, url, alt_text, sort_order) 
SELECT 
  p.id,
  'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=800&fit=crop' as url,
  'Karan Vaghela - Side View' as alt_text,
  2 as sort_order
FROM products p 
WHERE p.slug = 'karan-vaghela'
  AND NOT EXISTS (
    SELECT 1 FROM product_images pi 
    WHERE pi.product_id = p.id AND pi.sort_order = 2
  );

-- Add product variants following the same pattern as sample data
INSERT INTO product_variants (id, product_id, title, option1, option2, sku, price, inventory_quantity) 
SELECT 
  uuid_generate_v4(),
  p.id,
  'S / Black' as title,
  'S' as option1,
  'Black' as option2,
  'KV-001-S-BLACK' as sku,
  1.00 as price,
  10 as inventory_quantity
FROM products p 
WHERE p.slug = 'karan-vaghela'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants pv 
    WHERE pv.product_id = p.id AND pv.option1 = 'S' AND pv.option2 = 'Black'
  );

INSERT INTO product_variants (id, product_id, title, option1, option2, sku, price, inventory_quantity) 
SELECT 
  uuid_generate_v4(),
  p.id,
  'M / Black' as title,
  'M' as option1,
  'Black' as option2,
  'KV-001-M-BLACK' as sku,
  1.00 as price,
  15 as inventory_quantity
FROM products p 
WHERE p.slug = 'karan-vaghela'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants pv 
    WHERE pv.product_id = p.id AND pv.option1 = 'M' AND pv.option2 = 'Black'
  );

INSERT INTO product_variants (id, product_id, title, option1, option2, sku, price, inventory_quantity) 
SELECT 
  uuid_generate_v4(),
  p.id,
  'L / Black' as title,
  'L' as option1,
  'Black' as option2,
  'KV-001-L-BLACK' as sku,
  1.00 as price,
  8 as inventory_quantity
FROM products p 
WHERE p.slug = 'karan-vaghela'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants pv 
    WHERE pv.product_id = p.id AND pv.option1 = 'L' AND pv.option2 = 'Black'
  );