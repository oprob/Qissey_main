'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import { CartItem, Product } from '@/types';

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  isLoading: boolean;
  totalItems: number;
  totalPrice: number;
  
  // Actions
  addItem: (item: { product_id: string; variant_id?: string; quantity: number }) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  openCart: () => void;
  closeCart: () => void;
  fetchCart: () => Promise<void>;
  
  // Computed values
  calculateTotals: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      isLoading: false,
      totalItems: 0,
      totalPrice: 0,

      addItem: async (item) => {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          // Handle guest cart (localStorage only for now)
          const currentItems = get().items;
          const existingItemIndex = currentItems.findIndex(
            (cartItem) => 
              cartItem.product_id === item.product_id && 
              cartItem.variant_id === item.variant_id
          );

          if (existingItemIndex >= 0) {
            const updatedItems = [...currentItems];
            updatedItems[existingItemIndex].quantity += item.quantity;
            set({ items: updatedItems });
          } else {
            // For guest users, we'll need to mock the full cart item structure
            const newItem: CartItem = {
              id: crypto.randomUUID(),
              user_id: '',
              product_id: item.product_id,
              variant_id: item.variant_id || null,
              quantity: item.quantity,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              products: {} as Product, // This would need to be fetched
              product_variants: item.variant_id ? undefined : undefined,
            };
            set({ items: [...currentItems, newItem] });
          }
          
          get().calculateTotals();
          return;
        }

        set({ isLoading: true });

        try {
          // Check if item already exists in cart
          const { data: existingItem } = await supabase
            .from('cart_items')
            .select('*')
            .eq('user_id', user.id)
            .eq('product_id', item.product_id)
            .eq('variant_id', item.variant_id || null)
            .single();

          if (existingItem) {
            // Update quantity
            const { error } = await supabase
              .from('cart_items')
              .update({ quantity: existingItem.quantity + item.quantity })
              .eq('id', existingItem.id);

            if (error) throw error;
          } else {
            // Add new item
            const { error } = await supabase
              .from('cart_items')
              .insert({
                user_id: user.id,
                product_id: item.product_id,
                variant_id: item.variant_id || null,
                quantity: item.quantity,
              });

            if (error) throw error;
          }

          // Refresh cart
          await get().fetchCart();
        } catch (error) {
          console.error('Error adding item to cart:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      removeItem: async (itemId) => {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          const currentItems = get().items.filter(item => item.id !== itemId);
          set({ items: currentItems });
          get().calculateTotals();
          return;
        }

        set({ isLoading: true });

        try {
          const { error } = await supabase
            .from('cart_items')
            .delete()
            .eq('id', itemId)
            .eq('user_id', user.id);

          if (error) throw error;

          const currentItems = get().items.filter(item => item.id !== itemId);
          set({ items: currentItems });
          get().calculateTotals();
        } catch (error) {
          console.error('Error removing item from cart:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      updateQuantity: async (itemId, quantity) => {
        if (quantity <= 0) {
          await get().removeItem(itemId);
          return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          const currentItems = get().items.map(item =>
            item.id === itemId ? { ...item, quantity } : item
          );
          set({ items: currentItems });
          get().calculateTotals();
          return;
        }

        set({ isLoading: true });

        try {
          const { error } = await supabase
            .from('cart_items')
            .update({ quantity })
            .eq('id', itemId)
            .eq('user_id', user.id);

          if (error) throw error;

          const currentItems = get().items.map(item =>
            item.id === itemId ? { ...item, quantity } : item
          );
          set({ items: currentItems });
          get().calculateTotals();
        } catch (error) {
          console.error('Error updating cart item quantity:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      clearCart: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          set({ items: [], totalItems: 0, totalPrice: 0 });
          return;
        }

        set({ isLoading: true });

        try {
          const { error } = await supabase
            .from('cart_items')
            .delete()
            .eq('user_id', user.id);

          if (error) throw error;

          set({ items: [], totalItems: 0, totalPrice: 0 });
        } catch (error) {
          console.error('Error clearing cart:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      fetchCart: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          get().calculateTotals();
          return;
        }

        set({ isLoading: true });

        try {
          const { data, error } = await supabase
            .from('cart_items')
            .select(`
              *,
              products:product_id (
                *,
                product_images (*)
              ),
              product_variants:variant_id (*)
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (error) throw error;

          set({ items: data || [] });
          get().calculateTotals();
        } catch (error) {
          console.error('Error fetching cart:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      calculateTotals: () => {
        const { items } = get();
        const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = items.reduce((sum, item) => {
          const price = item.product_variants?.price || item.products?.price || 0;
          return sum + (price * item.quantity);
        }, 0);

        set({ totalItems, totalPrice });
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
);