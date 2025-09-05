-- Add custom sizing support to products table
ALTER TABLE products 
ADD COLUMN has_custom_sizing BOOLEAN DEFAULT false,
ADD COLUMN size_guide_url TEXT,
ADD COLUMN size_chart_image_url TEXT;

-- Add size-related columns to product_variants
ALTER TABLE product_variants 
ADD COLUMN size_category TEXT, -- e.g., 'S', 'M', 'L', 'XL' or custom measurements
ADD COLUMN measurements JSONB; -- Store custom measurements like chest, waist, length, etc.

-- Create size_guides table for reusable size charts
CREATE TABLE size_guides (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    size_chart_url TEXT,
    measurements_schema JSONB, -- Define what measurements are needed (chest, waist, etc.)
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert some default size guides
INSERT INTO size_guides (name, description, measurements_schema) VALUES 
(
    'Standard Clothing Sizes',
    'Standard sizing for shirts, pants, and dresses',
    '{
        "chest": {"label": "Chest", "unit": "inches", "required": true},
        "waist": {"label": "Waist", "unit": "inches", "required": true},
        "length": {"label": "Length", "unit": "inches", "required": false},
        "shoulder": {"label": "Shoulder Width", "unit": "inches", "required": false}
    }'::jsonb
),
(
    'Shoe Sizes',
    'Standard shoe sizing',
    '{
        "length": {"label": "Foot Length", "unit": "cm", "required": true},
        "width": {"label": "Foot Width", "unit": "cm", "required": false}
    }'::jsonb
),
(
    'Ring Sizes',
    'Ring sizing guide',
    '{
        "diameter": {"label": "Ring Diameter", "unit": "mm", "required": true},
        "circumference": {"label": "Finger Circumference", "unit": "mm", "required": false}
    }'::jsonb
);

-- Create custom_size_requests table for when customers request custom sizing
CREATE TABLE custom_size_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
    customer_measurements JSONB NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'in_production', 'completed', 'cancelled')),
    notes TEXT,
    estimated_delivery DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_products_has_custom_sizing ON products(has_custom_sizing);
CREATE INDEX idx_size_guides_category_id ON size_guides(category_id);
CREATE INDEX idx_custom_size_requests_order_id ON custom_size_requests(order_id);
CREATE INDEX idx_custom_size_requests_status ON custom_size_requests(status);