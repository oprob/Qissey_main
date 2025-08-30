-- Sample data for Rare Rabbit E-commerce

-- Insert Collections
INSERT INTO collections (name, slug, description, image_url, is_featured, sort_order) VALUES
('New Arrivals', 'new-arrivals', 'Discover the latest trends and styles in our newest collection.', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop', true, 1),
('Premium Collection', 'premium', 'Luxury pieces crafted with meticulous attention to detail and premium materials.', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&h=400&fit=crop', true, 2),
('Men''s Essentials', 'mens-essentials', 'Timeless pieces every modern man needs in his wardrobe.', 'https://images.unsplash.com/photo-1488161628813-04466f872be2?w=600&h=400&fit=crop', true, 3),
('Women''s Collection', 'womens-collection', 'Elegant and sophisticated pieces for the modern woman.', 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&h=400&fit=crop', true, 4),
('Accessories', 'accessories', 'Complete your look with our curated selection of premium accessories.', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=400&fit=crop', true, 5),
('Early Access', 'early-access', 'Exclusive preview of upcoming collections for registered members.', 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&h=400&fit=crop', false, 6);

-- Insert Products
INSERT INTO products (name, slug, description, short_description, price, compare_at_price, sku, status, inventory_quantity, is_featured) VALUES
('Premium Cotton Shirt', 'premium-cotton-shirt', 'A sophisticated cotton shirt crafted from the finest materials with modern tailoring that ensures a perfect fit. Features include mother-of-pearl buttons, French seams, and a subtle texture that elevates any outfit.', 'Premium cotton, modern fit', 2999.00, NULL, 'PCS001', 'active', 50, true),
('Classic Denim Jacket', 'classic-denim-jacket', 'Timeless denim jacket with vintage appeal and modern comfort. Made from premium denim with careful distressing and copper rivets for authentic style.', 'Classic denim, vintage styling', 4999.00, 5999.00, 'CDJ001', 'active', 30, true),
('Minimalist Watch', 'minimalist-watch', 'Elegant timepiece with clean design philosophy. Features Swiss movement, sapphire crystal, and genuine leather strap for the discerning individual.', 'Swiss movement, leather strap', 8999.00, NULL, 'MW001', 'active', 25, true),
('Luxury Handbag', 'luxury-handbag', 'Handcrafted leather handbag with premium hardware and meticulous attention to detail. Perfect for both professional and casual settings.', 'Genuine leather, premium hardware', 12999.00, NULL, 'LH001', 'active', 15, true),
('Cashmere Sweater', 'cashmere-sweater', 'Ultra-soft cashmere sweater that provides warmth without bulk. Perfect for layering or wearing alone in sophisticated settings.', '100% cashmere, lightweight', 6999.00, 7999.00, 'CS001', 'active', 40, true),
('Silk Scarf', 'silk-scarf', 'Luxurious silk scarf with hand-rolled edges and exclusive print. A versatile accessory that adds elegance to any outfit.', 'Pure silk, hand-rolled edges', 1999.00, NULL, 'SS001', 'active', 60, false),
('Leather Boots', 'leather-boots', 'Premium leather boots crafted by master artisans. Features Goodyear welt construction for durability and comfort.', 'Full grain leather, Goodyear welt', 9999.00, NULL, 'LB001', 'active', 35, true),
('Wool Coat', 'wool-coat', 'Elegant wool coat with timeless silhouette. Perfect for the discerning professional who values both style and warmth.', 'Virgin wool, tailored fit', 15999.00, 18999.00, 'WC001', 'active', 20, true);

-- Insert Product Images
INSERT INTO product_images (product_id, url, alt_text, sort_order) VALUES
((SELECT id FROM products WHERE slug = 'premium-cotton-shirt'), 'https://images.unsplash.com/photo-1564859228273-274232fdb516?w=600&h=600&fit=crop', 'Premium Cotton Shirt - Front View', 0),
((SELECT id FROM products WHERE slug = 'premium-cotton-shirt'), 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=600&fit=crop', 'Premium Cotton Shirt - Detail View', 1),
((SELECT id FROM products WHERE slug = 'classic-denim-jacket'), 'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=600&h=600&fit=crop', 'Classic Denim Jacket - Front View', 0),
((SELECT id FROM products WHERE slug = 'classic-denim-jacket'), 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=600&fit=crop', 'Classic Denim Jacket - Back View', 1),
((SELECT id FROM products WHERE slug = 'minimalist-watch'), 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop', 'Minimalist Watch - Product Shot', 0),
((SELECT id FROM products WHERE slug = 'minimalist-watch'), 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=600&h=600&fit=crop', 'Minimalist Watch - Lifestyle Shot', 1),
((SELECT id FROM products WHERE slug = 'luxury-handbag'), 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop', 'Luxury Handbag - Main View', 0),
((SELECT id FROM products WHERE slug = 'luxury-handbag'), 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop', 'Luxury Handbag - Detail View', 1),
((SELECT id FROM products WHERE slug = 'cashmere-sweater'), 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&h=600&fit=crop', 'Cashmere Sweater - Front View', 0),
((SELECT id FROM products WHERE slug = 'silk-scarf'), 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&h=600&fit=crop', 'Silk Scarf - Product Shot', 0),
((SELECT id FROM products WHERE slug = 'leather-boots'), 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=600&fit=crop', 'Leather Boots - Product Shot', 0),
((SELECT id FROM products WHERE slug = 'wool-coat'), 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=600&fit=crop', 'Wool Coat - Front View', 0);

-- Insert Product Variants
INSERT INTO product_variants (product_id, title, option1, sku, inventory_quantity) VALUES
((SELECT id FROM products WHERE slug = 'premium-cotton-shirt'), 'Small', 'S', 'PCS001-S', 15),
((SELECT id FROM products WHERE slug = 'premium-cotton-shirt'), 'Medium', 'M', 'PCS001-M', 20),
((SELECT id FROM products WHERE slug = 'premium-cotton-shirt'), 'Large', 'L', 'PCS001-L', 10),
((SELECT id FROM products WHERE slug = 'premium-cotton-shirt'), 'Extra Large', 'XL', 'PCS001-XL', 5),
((SELECT id FROM products WHERE slug = 'classic-denim-jacket'), 'Small', 'S', 'CDJ001-S', 8),
((SELECT id FROM products WHERE slug = 'classic-denim-jacket'), 'Medium', 'M', 'CDJ001-M', 12),
((SELECT id FROM products WHERE slug = 'classic-denim-jacket'), 'Large', 'L', 'CDJ001-L', 7),
((SELECT id FROM products WHERE slug = 'classic-denim-jacket'), 'Extra Large', 'XL', 'CDJ001-XL', 3),
((SELECT id FROM products WHERE slug = 'minimalist-watch'), 'One Size', 'OS', 'MW001-OS', 25),
((SELECT id FROM products WHERE slug = 'luxury-handbag'), 'One Size', 'OS', 'LH001-OS', 15),
((SELECT id FROM products WHERE slug = 'cashmere-sweater'), 'Small', 'S', 'CS001-S', 12),
((SELECT id FROM products WHERE slug = 'cashmere-sweater'), 'Medium', 'M', 'CS001-M', 15),
((SELECT id FROM products WHERE slug = 'cashmere-sweater'), 'Large', 'L', 'CS001-L', 10),
((SELECT id FROM products WHERE slug = 'cashmere-sweater'), 'Extra Large', 'XL', 'CS001-XL', 3),
((SELECT id FROM products WHERE slug = 'silk-scarf'), 'One Size', 'OS', 'SS001-OS', 60),
((SELECT id FROM products WHERE slug = 'leather-boots'), '8', '8', 'LB001-8', 5),
((SELECT id FROM products WHERE slug = 'leather-boots'), '9', '9', 'LB001-9', 8),
((SELECT id FROM products WHERE slug = 'leather-boots'), '10', '10', 'LB001-10', 10),
((SELECT id FROM products WHERE slug = 'leather-boots'), '11', '11', 'LB001-11', 8),
((SELECT id FROM products WHERE slug = 'leather-boots'), '12', '12', 'LB001-12', 4),
((SELECT id FROM products WHERE slug = 'wool-coat'), 'Medium', 'M', 'WC001-M', 8),
((SELECT id FROM products WHERE slug = 'wool-coat'), 'Large', 'L', 'WC001-L', 7),
((SELECT id FROM products WHERE slug = 'wool-coat'), 'Extra Large', 'XL', 'WC001-XL', 5);

-- Insert Tags
INSERT INTO tags (name, slug) VALUES
('New Arrival', 'new-arrival'),
('Premium', 'premium'),
('Cotton', 'cotton'),
('Denim', 'denim'),
('Luxury', 'luxury'),
('Minimalist', 'minimalist'),
('Cashmere', 'cashmere'),
('Silk', 'silk'),
('Leather', 'leather'),
('Wool', 'wool'),
('Formal', 'formal'),
('Casual', 'casual'),
('Accessories', 'accessories'),
('Timepiece', 'timepiece'),
('Bag', 'bag'),
('Footwear', 'footwear'),
('Outerwear', 'outerwear');

-- Insert Product Tags relationships
INSERT INTO product_tags (product_id, tag_id) VALUES
((SELECT id FROM products WHERE slug = 'premium-cotton-shirt'), (SELECT id FROM tags WHERE slug = 'premium')),
((SELECT id FROM products WHERE slug = 'premium-cotton-shirt'), (SELECT id FROM tags WHERE slug = 'cotton')),
((SELECT id FROM products WHERE slug = 'premium-cotton-shirt'), (SELECT id FROM tags WHERE slug = 'formal')),
((SELECT id FROM products WHERE slug = 'classic-denim-jacket'), (SELECT id FROM tags WHERE slug = 'denim')),
((SELECT id FROM products WHERE slug = 'classic-denim-jacket'), (SELECT id FROM tags WHERE slug = 'casual')),
((SELECT id FROM products WHERE slug = 'classic-denim-jacket'), (SELECT id FROM tags WHERE slug = 'outerwear')),
((SELECT id FROM products WHERE slug = 'minimalist-watch'), (SELECT id FROM tags WHERE slug = 'minimalist')),
((SELECT id FROM products WHERE slug = 'minimalist-watch'), (SELECT id FROM tags WHERE slug = 'luxury')),
((SELECT id FROM products WHERE slug = 'minimalist-watch'), (SELECT id FROM tags WHERE slug = 'accessories')),
((SELECT id FROM products WHERE slug = 'minimalist-watch'), (SELECT id FROM tags WHERE slug = 'timepiece')),
((SELECT id FROM products WHERE slug = 'luxury-handbag'), (SELECT id FROM tags WHERE slug = 'luxury')),
((SELECT id FROM products WHERE slug = 'luxury-handbag'), (SELECT id FROM tags WHERE slug = 'leather')),
((SELECT id FROM products WHERE slug = 'luxury-handbag'), (SELECT id FROM tags WHERE slug = 'accessories')),
((SELECT id FROM products WHERE slug = 'luxury-handbag'), (SELECT id FROM tags WHERE slug = 'bag')),
((SELECT id FROM products WHERE slug = 'cashmere-sweater'), (SELECT id FROM tags WHERE slug = 'premium')),
((SELECT id FROM products WHERE slug = 'cashmere-sweater'), (SELECT id FROM tags WHERE slug = 'cashmere')),
((SELECT id FROM products WHERE slug = 'silk-scarf'), (SELECT id FROM tags WHERE slug = 'silk')),
((SELECT id FROM products WHERE slug = 'silk-scarf'), (SELECT id FROM tags WHERE slug = 'accessories')),
((SELECT id FROM products WHERE slug = 'leather-boots'), (SELECT id FROM tags WHERE slug = 'leather')),
((SELECT id FROM products WHERE slug = 'leather-boots'), (SELECT id FROM tags WHERE slug = 'footwear')),
((SELECT id FROM products WHERE slug = 'leather-boots'), (SELECT id FROM tags WHERE slug = 'premium')),
((SELECT id FROM products WHERE slug = 'wool-coat'), (SELECT id FROM tags WHERE slug = 'wool')),
((SELECT id FROM products WHERE slug = 'wool-coat'), (SELECT id FROM tags WHERE slug = 'luxury')),
((SELECT id FROM products WHERE slug = 'wool-coat'), (SELECT id FROM tags WHERE slug = 'outerwear'));

-- Insert Collection Products relationships
INSERT INTO collection_products (collection_id, product_id, sort_order) VALUES
((SELECT id FROM collections WHERE slug = 'new-arrivals'), (SELECT id FROM products WHERE slug = 'premium-cotton-shirt'), 1),
((SELECT id FROM collections WHERE slug = 'new-arrivals'), (SELECT id FROM products WHERE slug = 'cashmere-sweater'), 2),
((SELECT id FROM collections WHERE slug = 'new-arrivals'), (SELECT id FROM products WHERE slug = 'silk-scarf'), 3),
((SELECT id FROM collections WHERE slug = 'premium'), (SELECT id FROM products WHERE slug = 'luxury-handbag'), 1),
((SELECT id FROM collections WHERE slug = 'premium'), (SELECT id FROM products WHERE slug = 'minimalist-watch'), 2),
((SELECT id FROM collections WHERE slug = 'premium'), (SELECT id FROM products WHERE slug = 'wool-coat'), 3),
((SELECT id FROM collections WHERE slug = 'premium'), (SELECT id FROM products WHERE slug = 'leather-boots'), 4),
((SELECT id FROM collections WHERE slug = 'mens-essentials'), (SELECT id FROM products WHERE slug = 'premium-cotton-shirt'), 1),
((SELECT id FROM collections WHERE slug = 'mens-essentials'), (SELECT id FROM products WHERE slug = 'classic-denim-jacket'), 2),
((SELECT id FROM collections WHERE slug = 'mens-essentials'), (SELECT id FROM products WHERE slug = 'minimalist-watch'), 3),
((SELECT id FROM collections WHERE slug = 'mens-essentials'), (SELECT id FROM products WHERE slug = 'leather-boots'), 4),
((SELECT id FROM collections WHERE slug = 'womens-collection'), (SELECT id FROM products WHERE slug = 'luxury-handbag'), 1),
((SELECT id FROM collections WHERE slug = 'womens-collection'), (SELECT id FROM products WHERE slug = 'cashmere-sweater'), 2),
((SELECT id FROM collections WHERE slug = 'womens-collection'), (SELECT id FROM products WHERE slug = 'silk-scarf'), 3),
((SELECT id FROM collections WHERE slug = 'womens-collection'), (SELECT id FROM products WHERE slug = 'wool-coat'), 4),
((SELECT id FROM collections WHERE slug = 'accessories'), (SELECT id FROM products WHERE slug = 'minimalist-watch'), 1),
((SELECT id FROM collections WHERE slug = 'accessories'), (SELECT id FROM products WHERE slug = 'luxury-handbag'), 2),
((SELECT id FROM collections WHERE slug = 'accessories'), (SELECT id FROM products WHERE slug = 'silk-scarf'), 3),
((SELECT id FROM collections WHERE slug = 'early-access'), (SELECT id FROM products WHERE slug = 'wool-coat'), 1),
((SELECT id FROM collections WHERE slug = 'early-access'), (SELECT id FROM products WHERE slug = 'leather-boots'), 2);