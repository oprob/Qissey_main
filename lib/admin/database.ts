import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

type Tables = Database['public']['Tables'];
type Product = Tables['products']['Row'];
type ProductInsert = Tables['products']['Insert'];
type ProductUpdate = Tables['products']['Update'];
// type Category = Tables['categories']['Row']; // Disabled - table doesn't exist
type Order = Tables['orders']['Row'];
// type OrderWithItems = Order & {
//   order_line_items: Tables['order_line_items']['Row'][];
// };

// Products
export const adminProductQueries = {
  // Get all products with pagination
  async getProducts(page = 1, limit = 20, filters?: {
    search?: string;
    category?: string;
    status?: string;
  }) {
    let query = supabase
      .from('products')
      .select(`
        *,
        product_images(url, alt_text, sort_order),
        product_variants(id, title, price, inventory_quantity, option1, option2)
      `)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (filters?.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }


    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    return query;
  },

  // Get single product with all relations
  async getProduct(id: string) {
    return supabase
      .from('products')
      .select(`
        *,
        product_images(id, url, alt_text, sort_order),
        product_variants(
          id, title, option1, option2, option3, 
          price, compare_at_price, inventory_quantity, sku
        )
      `)
      .eq('id', id)
      .single();
  },

  // Create new product via API
  async createProduct(product: ProductInsert) {
    try {
      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(product),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { 
          data: null, 
          error: { message: errorData.error || `Create failed: ${response.status}` }
        };
      }

      const result = await response.json();
      return { data: result.data, error: null };

    } catch (error: any) {
      console.error('Error creating product:', error);
      return { 
        data: null, 
        error: { message: error.message || 'Failed to create product' }
      };
    }
  },

  // Update product via API
  async updateProduct(id: string, updates: ProductUpdate) {
    try {
      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ id, ...updates }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { 
          data: null, 
          error: { message: errorData.error || `Update failed: ${response.status}` }
        };
      }

      const result = await response.json();
      return { data: result.data, error: null };

    } catch (error: any) {
      console.error('Error updating product:', error);
      return { 
        data: null, 
        error: { message: error.message || 'Failed to update product' }
      };
    }
  },

  // Delete product
  async deleteProduct(id: string) {
    return supabase
      .from('products')
      .delete()
      .eq('id', id);
  },

  // Bulk update product status
  async bulkUpdateStatus(ids: string[], status: string) {
    return supabase
      .from('products')
      .update({ status })
      .in('id', ids);
  },

  // Get low stock products
  async getLowStockProducts(threshold = 10) {
    return supabase
      .from('product_variants')
      .select(`
        *,
        products(name, slug)
      `)
      .lt('inventory_quantity', threshold)
      .order('inventory_quantity', { ascending: true });
  },

  // Save product variants via API route
  async saveProductVariants(productId: string, variants: any[]) {
    try {
      console.log('saveProductVariants called with:', { productId, variants });
      
      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/admin/save-product-variants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ productId, variants }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { 
          data: null, 
          error: { message: errorData.error || `Save failed: ${response.status}` }
        };
      }

      const result = await response.json();
      return { data: result.data, error: null };

    } catch (error: any) {
      console.error('saveProductVariants error:', error);
      return { 
        data: null, 
        error: { message: error.message || 'Failed to save variants' }
      };
    }
  },

  // Save product images via API route
  async saveProductImages(productId: string, images: any[]) {
    try {
      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/admin/save-product-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ productId, images }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { 
          data: null, 
          error: { message: errorData.error || `Save failed: ${response.status}` }
        };
      }

      const result = await response.json();
      return { data: result.data, error: null };

    } catch (error: any) {
      console.error('saveProductImages error:', error);
      return { 
        data: null, 
        error: { message: error.message || 'Failed to save images' }
      };
    }
  }
};

// Categories - Commented out as categories table doesn't exist yet
// export const adminCategoryQueries = {
//   async getCategories() {
//     return supabase
//       .from('categories')
//       .select('*')
//       .order('sort_order', { ascending: true });
//   },

//   async createCategory(category: Tables['categories']['Insert']) {
//     return supabase
//       .from('categories')
//       .insert(category)
//       .select()
//       .single();
//   },

//   async updateCategory(id: string, updates: Tables['categories']['Update']) {
//     return supabase
//       .from('categories')
//       .update(updates)
//       .eq('id', id)
//       .select()
//       .single();
//   },

//   async deleteCategory(id: string) {
//     return supabase
//       .from('categories')
//       .delete()
//       .eq('id', id);
//   }
// };

// Orders
export const adminOrderQueries = {
  // Get orders with pagination and filters
  async getOrders(page = 1, limit = 20, filters?: {
    status?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    let query = supabase
      .from('orders')
      .select(`
        *,
        profiles(first_name, last_name, email),
        order_line_items(
          id, product_name, variant_title, quantity, price, total_price
        )
      `)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (filters?.status) {
      query = query.eq('order_status', filters.status);
    }

    if (filters?.search) {
      query = query.or(`order_number.ilike.%${filters.search}%`);
    }

    if (filters?.dateFrom) {
      query = query.gte('created_at', filters.dateFrom);
    }

    if (filters?.dateTo) {
      query = query.lte('created_at', filters.dateTo);
    }

    return query;
  },

  // Get single order with full details
  async getOrder(id: string) {
    return supabase
      .from('orders')
      .select(`
        *,
        profiles(first_name, last_name, phone)
      `)
      .eq('id', id)
      .single();
  },

  // Update order status
  async updateOrderStatus(id: string, status: string) {
    return supabase
      .from('orders')
      .update({ 
        order_status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
  },

  // Get order analytics
  async getOrderAnalytics(dateFrom?: string, dateTo?: string) {
    let query = supabase
      .from('orders')
      .select('total_price, status, created_at');

    if (dateFrom) query = query.gte('created_at', dateFrom);
    if (dateTo) query = query.lte('created_at', dateTo);

    return query;
  }
};

// Users/Customers
export const adminUserQueries = {
  async getUsers(page = 1, limit = 20, search?: string) {
    let query = supabase
      .from('profiles')
      .select(`
        *,
        orders(count)
      `)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    return query;
  },

  async getUserDetails(id: string) {
    return supabase
      .from('profiles')
      .select(`
        *,
        orders(
          id, order_number, total_price, status, created_at
        ),
        addresses(*),
        cart_items(count),
        wishlist_items(count)
      `)
      .eq('id', id)
      .single();
  },

  async updateUserRole(id: string, role: string) {
    return supabase
      .from('profiles')
      .update({ role })
      .eq('id', id)
      .select()
      .single();
  }
};

// Analytics
export const adminAnalyticsQueries = {
  // Dashboard metrics
  async getDashboardMetrics(dateFrom?: string, dateTo?: string) {
    // Total revenue
    let revenueQuery = supabase
      .from('orders')
      .select('total_price')
      .eq('status', 'delivered');

    if (dateFrom) revenueQuery = revenueQuery.gte('created_at', dateFrom);
    if (dateTo) revenueQuery = revenueQuery.lte('created_at', dateTo);

    // Order count
    let orderQuery = supabase
      .from('orders')
      .select('id', { count: 'exact' });

    if (dateFrom) orderQuery = orderQuery.gte('created_at', dateFrom);
    if (dateTo) orderQuery = orderQuery.lte('created_at', dateTo);

    // Customer count
    const customerQuery = supabase
      .from('profiles')
      .select('id', { count: 'exact' })
      .eq('role', 'customer');

    // Product count
    const productQuery = supabase
      .from('products')
      .select('id', { count: 'exact' })
      .eq('status', 'active');

    const [revenue, orders, customers, products] = await Promise.all([
      revenueQuery,
      orderQuery,
      customerQuery,
      productQuery
    ]);

    return {
      revenue: revenue.data?.reduce((sum, order) => sum + Number(order.total_price), 0) || 0,
      orders: orders.count || 0,
      customers: customers.count || 0,
      products: products.count || 0
    };
  },

  // Sales over time
  async getSalesData(dateFrom: string, dateTo: string, interval: 'day' | 'week' | 'month' = 'day') {
    return supabase.rpc('get_sales_data', {
      date_from: dateFrom,
      date_to: dateTo,
      interval_type: interval
    });
  },

  // Top selling products
  async getTopProducts(limit = 10) {
    return supabase.rpc('get_top_selling_products', { limit_count: limit });
  },

  // Recent activity
  async getRecentActivity(limit = 20) {
    const [orders, products, users] = await Promise.all([
      supabase
        .from('orders')
        .select('id, order_number, total_price, created_at, profiles(first_name, last_name)')
        .order('created_at', { ascending: false })
        .limit(5),
      
      supabase
        .from('products')
        .select('id, name, created_at')
        .order('created_at', { ascending: false })
        .limit(5),
      
      supabase
        .from('profiles')
        .select('id, first_name, last_name, created_at')
        .eq('role', 'customer')
        .order('created_at', { ascending: false })
        .limit(5)
    ]);

    return {
      orders: orders.data || [],
      products: products.data || [],
      users: users.data || []
    };
  }
};

// Inventory
export const adminInventoryQueries = {
  async getInventoryOverview() {
    return supabase
      .from('product_variants')
      .select(`
        id, title, inventory_quantity, sku,
        products(name, slug)
      `)
      .order('inventory_quantity', { ascending: true });
  },

  async updateInventory(variantId: string, quantity: number, reason: string, notes?: string) {
    // Get current quantity
    const { data: variant } = await supabase
      .from('product_variants')
      .select('inventory_quantity')
      .eq('id', variantId)
      .single();

    if (!variant) throw new Error('Variant not found');

    const quantityChange = quantity - variant.inventory_quantity;

    // Update variant quantity
    const { error: updateError } = await supabase
      .from('product_variants')
      .update({ inventory_quantity: quantity })
      .eq('id', variantId);

    if (updateError) throw updateError;

    // Record transaction
    const { error: transactionError } = await supabase
      .from('inventory_transactions')
      .insert({
        variant_id: variantId,
        quantity_change: quantityChange,
        reason,
        notes
      });

    if (transactionError) throw transactionError;

    return { success: true };
  },

  async getInventoryHistory(variantId: string, limit = 50) {
    return supabase
      .from('inventory_transactions')
      .select(`
        *,
        profiles(first_name, last_name)
      `)
      .eq('variant_id', variantId)
      .order('created_at', { ascending: false })
      .limit(limit);
  }
};