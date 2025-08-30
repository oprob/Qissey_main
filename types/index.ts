import { Database } from './database';

export type Product = Database['public']['Tables']['products']['Row'] & {
  product_images: Database['public']['Tables']['product_images']['Row'][];
  product_variants: Database['public']['Tables']['product_variants']['Row'][];
};

export type Collection = Database['public']['Tables']['collections']['Row'];

export type CartItem = Database['public']['Tables']['cart_items']['Row'] & {
  products: Product;
  product_variants?: Database['public']['Tables']['product_variants']['Row'];
};

export type WishlistItem = Database['public']['Tables']['wishlist_items']['Row'] & {
  products: Product;
};

export type Order = Database['public']['Tables']['orders']['Row'];

export type UserProfile = Database['public']['Tables']['user_profiles']['Row'];

export type Address = Database['public']['Tables']['addresses']['Row'];

export interface ProductFilters {
  collections?: string[];
  priceRange?: [number, number];
  sizes?: string[];
  sortBy?: 'name' | 'price_asc' | 'price_desc' | 'created_at';
  search?: string;
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
  totalItems: number;
  totalPrice: number;
}

export interface FilterState {
  collections: string[];
  priceRange: [number, number];
  sizes: string[];
  sortBy: string;
}

export type SizeType = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';

export interface CheckoutData {
  email: string;
  shippingAddress: {
    firstName: string;
    lastName: string;
    address1: string;
    address2?: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
  billingAddress?: {
    firstName: string;
    lastName: string;
    address1: string;
    address2?: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
  paymentMethod: string;
}