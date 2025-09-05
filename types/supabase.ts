export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          first_name?: string
          last_name?: string
          phone?: string
          role: 'customer' | 'admin' | 'super_admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          first_name?: string
          last_name?: string
          phone?: string
          role?: 'customer' | 'admin' | 'super_admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          last_name?: string
          phone?: string
          role?: 'customer' | 'admin' | 'super_admin'
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description?: string
          image_url?: string
          parent_id?: string
          sort_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string
          image_url?: string
          parent_id?: string
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string
          image_url?: string
          parent_id?: string
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          slug: string
          description?: string
          short_description?: string
          price: number
          compare_at_price?: number
          cost_price?: number
          sku?: string
          barcode?: string
          weight?: number
          status: 'active' | 'draft' | 'archived'
          is_featured: boolean
          has_custom_sizing: boolean
          size_guide_url?: string
          size_chart_image_url?: string
          category_id?: string
          vendor?: string
          tags?: string[]
          meta_title?: string
          meta_description?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string
          short_description?: string
          price: number
          compare_at_price?: number
          cost_price?: number
          sku?: string
          barcode?: string
          weight?: number
          status?: 'active' | 'draft' | 'archived'
          is_featured?: boolean
          has_custom_sizing?: boolean
          size_guide_url?: string
          size_chart_image_url?: string
          category_id?: string
          vendor?: string
          tags?: string[]
          meta_title?: string
          meta_description?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string
          short_description?: string
          price?: number
          compare_at_price?: number
          cost_price?: number
          sku?: string
          barcode?: string
          weight?: number
          status?: 'active' | 'draft' | 'archived'
          is_featured?: boolean
          has_custom_sizing?: boolean
          size_guide_url?: string
          size_chart_image_url?: string
          category_id?: string
          vendor?: string
          tags?: string[]
          meta_title?: string
          meta_description?: string
          created_at?: string
          updated_at?: string
        }
      }
      product_variants: {
        Row: {
          id: string
          product_id: string
          title: string
          option1?: string
          option2?: string
          option3?: string
          sku?: string
          price?: number
          compare_at_price?: number
          cost_price?: number
          inventory_quantity: number
          inventory_policy: string
          requires_shipping: boolean
          weight?: number
          size_category?: string
          measurements?: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          title: string
          option1?: string
          option2?: string
          option3?: string
          sku?: string
          price?: number
          compare_at_price?: number
          cost_price?: number
          inventory_quantity?: number
          inventory_policy?: string
          requires_shipping?: boolean
          weight?: number
          size_category?: string
          measurements?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          title?: string
          option1?: string
          option2?: string
          option3?: string
          sku?: string
          price?: number
          compare_at_price?: number
          cost_price?: number
          inventory_quantity?: number
          inventory_policy?: string
          requires_shipping?: boolean
          weight?: number
          size_category?: string
          measurements?: Json
          created_at?: string
          updated_at?: string
        }
      }
      product_images: {
        Row: {
          id: string
          product_id: string
          url: string
          alt_text?: string
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          url: string
          alt_text?: string
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          url?: string
          alt_text?: string
          sort_order?: number
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          order_number: string
          user_id?: string
          email: string
          phone?: string
          order_status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
          subtotal_price: number
          tax_price: number
          shipping_price: number
          total_price: number
          currency: string
          billing_first_name?: string
          billing_last_name?: string
          billing_address1?: string
          billing_address2?: string
          billing_city?: string
          billing_province?: string
          billing_country?: string
          billing_zip?: string
          shipping_first_name?: string
          shipping_last_name?: string
          shipping_address1?: string
          shipping_address2?: string
          shipping_city?: string
          shipping_province?: string
          shipping_country?: string
          shipping_zip?: string
          notes?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_number: string
          user_id?: string
          email: string
          phone?: string
          order_status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
          subtotal_price: number
          tax_price?: number
          shipping_price?: number
          total_price: number
          currency?: string
          billing_first_name?: string
          billing_last_name?: string
          billing_address1?: string
          billing_address2?: string
          billing_city?: string
          billing_province?: string
          billing_country?: string
          billing_zip?: string
          shipping_first_name?: string
          shipping_last_name?: string
          shipping_address1?: string
          shipping_address2?: string
          shipping_city?: string
          shipping_province?: string
          shipping_country?: string
          shipping_zip?: string
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_number?: string
          user_id?: string
          email?: string
          phone?: string
          order_status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
          subtotal_price?: number
          tax_price?: number
          shipping_price?: number
          total_price?: number
          currency?: string
          billing_first_name?: string
          billing_last_name?: string
          billing_address1?: string
          billing_address2?: string
          billing_city?: string
          billing_province?: string
          billing_country?: string
          billing_zip?: string
          shipping_first_name?: string
          shipping_last_name?: string
          shipping_address1?: string
          shipping_address2?: string
          shipping_city?: string
          shipping_province?: string
          shipping_country?: string
          shipping_zip?: string
          notes?: string
          created_at?: string
          updated_at?: string
        }
      }
      order_line_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          variant_id?: string
          quantity: number
          price: number
          total_price: number
          product_name: string
          variant_title?: string
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          variant_id?: string
          quantity: number
          price: number
          total_price: number
          product_name: string
          variant_title?: string
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          variant_id?: string
          quantity?: number
          price?: number
          total_price?: number
          product_name?: string
          variant_title?: string
          created_at?: string
        }
      }
      inventory_transactions: {
        Row: {
          id: string
          variant_id: string
          quantity_change: number
          reason: string
          reference_id?: string
          notes?: string
          created_at: string
        }
        Insert: {
          id?: string
          variant_id: string
          quantity_change: number
          reason: string
          reference_id?: string
          notes?: string
          created_at?: string
        }
        Update: {
          id?: string
          variant_id?: string
          quantity_change?: number
          reason?: string
          reference_id?: string
          notes?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'customer' | 'admin' | 'super_admin'
      order_status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
      payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
      product_status: 'active' | 'draft' | 'archived'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}