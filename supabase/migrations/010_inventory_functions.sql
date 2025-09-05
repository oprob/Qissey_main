-- Function to update inventory when an order is placed
CREATE OR REPLACE FUNCTION update_inventory(variant_id UUID, quantity_change INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE product_variants 
  SET inventory_quantity = inventory_quantity + quantity_change,
      updated_at = NOW()
  WHERE id = variant_id;
  
  -- Log the inventory transaction
  INSERT INTO inventory_transactions (
    variant_id, 
    quantity_change, 
    reason, 
    notes, 
    created_at
  ) VALUES (
    variant_id, 
    quantity_change, 
    CASE 
      WHEN quantity_change < 0 THEN 'sale'
      ELSE 'restock'
    END,
    'Automated inventory update',
    NOW()
  );
END;
$$ LANGUAGE plpgsql;

-- Function to generate unique order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    new_order_number TEXT;
    counter INTEGER := 1;
BEGIN
    LOOP
        -- Generate order number: ORD-YYYYMMDD-NNNN
        new_order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(counter::TEXT, 4, '0');
        
        -- Check if this order number already exists
        EXIT WHEN NOT EXISTS (
            SELECT 1 FROM orders WHERE order_number = new_order_number
        );
        
        counter := counter + 1;
    END LOOP;
    
    RETURN new_order_number;
END;
$$ LANGUAGE plpgsql;