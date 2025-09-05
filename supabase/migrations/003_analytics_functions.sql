-- Function to get sales data with date grouping
CREATE OR REPLACE FUNCTION get_sales_data(
  date_from DATE,
  date_to DATE,
  interval_type TEXT DEFAULT 'day'
)
RETURNS TABLE (
  date_period DATE,
  total_sales DECIMAL(10,2),
  order_count INTEGER,
  avg_order_value DECIMAL(10,2)
) AS $$
BEGIN
  IF interval_type = 'day' THEN
    RETURN QUERY
    SELECT 
      DATE(o.created_at) as date_period,
      COALESCE(SUM(o.total_price), 0)::DECIMAL(10,2) as total_sales,
      COUNT(*)::INTEGER as order_count,
      COALESCE(AVG(o.total_price), 0)::DECIMAL(10,2) as avg_order_value
    FROM orders o
    WHERE DATE(o.created_at) BETWEEN date_from AND date_to
      AND o.order_status != 'cancelled'
    GROUP BY DATE(o.created_at)
    ORDER BY DATE(o.created_at);
    
  ELSIF interval_type = 'week' THEN
    RETURN QUERY
    SELECT 
      DATE_TRUNC('week', o.created_at)::DATE as date_period,
      COALESCE(SUM(o.total_price), 0)::DECIMAL(10,2) as total_sales,
      COUNT(*)::INTEGER as order_count,
      COALESCE(AVG(o.total_price), 0)::DECIMAL(10,2) as avg_order_value
    FROM orders o
    WHERE o.created_at BETWEEN date_from AND date_to
      AND o.order_status != 'cancelled'
    GROUP BY DATE_TRUNC('week', o.created_at)
    ORDER BY DATE_TRUNC('week', o.created_at);
    
  ELSIF interval_type = 'month' THEN
    RETURN QUERY
    SELECT 
      DATE_TRUNC('month', o.created_at)::DATE as date_period,
      COALESCE(SUM(o.total_price), 0)::DECIMAL(10,2) as total_sales,
      COUNT(*)::INTEGER as order_count,
      COALESCE(AVG(o.total_price), 0)::DECIMAL(10,2) as avg_order_value
    FROM orders o
    WHERE o.created_at BETWEEN date_from AND date_to
      AND o.order_status != 'cancelled'
    GROUP BY DATE_TRUNC('month', o.created_at)
    ORDER BY DATE_TRUNC('month', o.created_at);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to get top selling products
CREATE OR REPLACE FUNCTION get_top_selling_products(
  limit_count INTEGER DEFAULT 10,
  date_from DATE DEFAULT NULL,
  date_to DATE DEFAULT NULL
)
RETURNS TABLE (
  product_id UUID,
  product_name TEXT,
  total_quantity INTEGER,
  total_revenue DECIMAL(10,2),
  order_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    oli.product_id,
    oli.product_name,
    SUM(oli.quantity)::INTEGER as total_quantity,
    SUM(oli.total_price)::DECIMAL(10,2) as total_revenue,
    COUNT(DISTINCT oli.order_id)::INTEGER as order_count
  FROM order_line_items oli
  JOIN orders o ON oli.order_id = o.id
  WHERE 
    o.order_status != 'cancelled' AND
    (date_from IS NULL OR DATE(o.created_at) >= date_from) AND
    (date_to IS NULL OR DATE(o.created_at) <= date_to)
  GROUP BY oli.product_id, oli.product_name
  ORDER BY total_revenue DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get customer analytics
CREATE OR REPLACE FUNCTION get_customer_analytics(
  date_from DATE DEFAULT NULL,
  date_to DATE DEFAULT NULL
)
RETURNS TABLE (
  total_customers INTEGER,
  new_customers INTEGER,
  returning_customers INTEGER,
  avg_orders_per_customer DECIMAL(5,2),
  avg_customer_value DECIMAL(10,2)
) AS $$
BEGIN
  RETURN QUERY
  WITH customer_stats AS (
    SELECT 
      p.id,
      COUNT(o.id) as order_count,
      SUM(o.total_price) as total_spent,
      MIN(o.created_at) as first_order_date
    FROM profiles p
    LEFT JOIN orders o ON p.id = o.user_id
    WHERE 
      p.role = 'customer' AND
      (o.id IS NULL OR o.order_status != 'cancelled') AND
      (date_from IS NULL OR DATE(o.created_at) >= date_from) AND
      (date_to IS NULL OR DATE(o.created_at) <= date_to)
    GROUP BY p.id
  )
  SELECT 
    COUNT(*)::INTEGER as total_customers,
    COUNT(CASE WHEN first_order_date BETWEEN date_from AND date_to THEN 1 END)::INTEGER as new_customers,
    COUNT(CASE WHEN first_order_date < date_from AND order_count > 0 THEN 1 END)::INTEGER as returning_customers,
    COALESCE(AVG(order_count), 0)::DECIMAL(5,2) as avg_orders_per_customer,
    COALESCE(AVG(total_spent), 0)::DECIMAL(10,2) as avg_customer_value
  FROM customer_stats;
END;
$$ LANGUAGE plpgsql;

-- Function to get inventory alerts
CREATE OR REPLACE FUNCTION get_inventory_alerts(
  low_stock_threshold INTEGER DEFAULT 10
)
RETURNS TABLE (
  variant_id UUID,
  product_name TEXT,
  variant_title TEXT,
  current_stock INTEGER,
  sku TEXT,
  last_sold DATE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pv.id as variant_id,
    p.name as product_name,
    pv.title as variant_title,
    pv.inventory_quantity as current_stock,
    pv.sku,
    MAX(DATE(o.created_at)) as last_sold
  FROM product_variants pv
  JOIN products p ON pv.product_id = p.id
  LEFT JOIN order_line_items oli ON pv.id = oli.variant_id
  LEFT JOIN orders o ON oli.order_id = o.id AND o.order_status != 'cancelled'
  WHERE 
    pv.inventory_quantity <= low_stock_threshold AND
    p.status = 'active'
  GROUP BY pv.id, p.name, pv.title, pv.inventory_quantity, pv.sku
  ORDER BY pv.inventory_quantity ASC, p.name;
END;
$$ LANGUAGE plpgsql;

-- Function to get order trends
CREATE OR REPLACE FUNCTION get_order_trends(
  days_back INTEGER DEFAULT 30
)
RETURNS TABLE (
  metric_date DATE,
  pending_orders INTEGER,
  processing_orders INTEGER,
  shipped_orders INTEGER,
  delivered_orders INTEGER,
  cancelled_orders INTEGER,
  total_revenue DECIMAL(10,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(o.created_at) as metric_date,
    COUNT(CASE WHEN o.order_status = 'pending' THEN 1 END)::INTEGER as pending_orders,
    COUNT(CASE WHEN o.order_status = 'processing' THEN 1 END)::INTEGER as processing_orders,
    COUNT(CASE WHEN o.order_status = 'shipped' THEN 1 END)::INTEGER as shipped_orders,
    COUNT(CASE WHEN o.order_status = 'delivered' THEN 1 END)::INTEGER as delivered_orders,
    COUNT(CASE WHEN o.order_status = 'cancelled' THEN 1 END)::INTEGER as cancelled_orders,
    COALESCE(SUM(CASE WHEN o.order_status != 'cancelled' THEN o.total_price END), 0)::DECIMAL(10,2) as total_revenue
  FROM orders o
  WHERE o.created_at >= CURRENT_DATE - INTERVAL '%s days'
  GROUP BY DATE(o.created_at)
  ORDER BY DATE(o.created_at) DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get product performance
CREATE OR REPLACE FUNCTION get_product_performance(
  product_id_param UUID
)
RETURNS TABLE (
  views_last_30d INTEGER,
  orders_last_30d INTEGER,
  revenue_last_30d DECIMAL(10,2),
  conversion_rate DECIMAL(5,2),
  avg_rating DECIMAL(3,2),
  review_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH product_stats AS (
    SELECT 
      -- Views from the last 30 days
      (SELECT COUNT(*) 
       FROM product_views pv 
       WHERE pv.product_id = product_id_param 
         AND pv.created_at >= CURRENT_DATE - INTERVAL '30 days')::INTEGER as views,
       
      -- Orders from the last 30 days
      (SELECT COUNT(DISTINCT oli.order_id)
       FROM order_line_items oli
       JOIN orders o ON oli.order_id = o.id
       WHERE oli.product_id = product_id_param
         AND o.created_at >= CURRENT_DATE - INTERVAL '30 days'
         AND o.order_status != 'cancelled')::INTEGER as orders,
         
      -- Revenue from the last 30 days
      (SELECT COALESCE(SUM(oli.total_price), 0)
       FROM order_line_items oli
       JOIN orders o ON oli.order_id = o.id
       WHERE oli.product_id = product_id_param
         AND o.created_at >= CURRENT_DATE - INTERVAL '30 days'
         AND o.order_status != 'cancelled')::DECIMAL(10,2) as revenue,
         
      -- Average rating
      (SELECT COALESCE(AVG(pr.rating), 0)
       FROM product_reviews pr
       WHERE pr.product_id = product_id_param
         AND pr.is_approved = true)::DECIMAL(3,2) as avg_rating,
         
      -- Review count
      (SELECT COUNT(*)
       FROM product_reviews pr
       WHERE pr.product_id = product_id_param
         AND pr.is_approved = true)::INTEGER as review_count
  )
  SELECT 
    ps.views as views_last_30d,
    ps.orders as orders_last_30d,
    ps.revenue as revenue_last_30d,
    CASE 
      WHEN ps.views > 0 THEN (ps.orders::DECIMAL / ps.views * 100)::DECIMAL(5,2)
      ELSE 0::DECIMAL(5,2)
    END as conversion_rate,
    ps.avg_rating,
    ps.review_count
  FROM product_stats ps;
END;
$$ LANGUAGE plpgsql;