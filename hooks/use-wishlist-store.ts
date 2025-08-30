'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import { WishlistItem, Product } from '@/types';

interface WishlistStore {
  items: WishlistItem[];
  isLoading: boolean;
  
  // Actions
  addItem: (productId: string) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  toggleWishlistItem: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  fetchWishlist: () => Promise<void>;
  clearWishlist: () => Promise<void>;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,

      addItem: async (productId: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          // Handle guest wishlist (localStorage only)
          const currentItems = get().items;
          const exists = currentItems.some(item => item.product_id === productId);
          
          if (!exists) {
            const newItem: WishlistItem = {
              id: crypto.randomUUID(),
              user_id: '',
              product_id: productId,
              created_at: new Date().toISOString(),
              products: {} as Product, // This would need to be fetched
            };
            set({ items: [...currentItems, newItem] });
          }
          return;
        }

        set({ isLoading: true });

        try {
          const { error } = await supabase
            .from('wishlist_items')
            .insert({
              user_id: user.id,
              product_id: productId,
            });

          if (error && error.code !== '23505') { // Ignore duplicate key error
            throw error;
          }

          await get().fetchWishlist();
        } catch (error) {
          console.error('Error adding item to wishlist:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      removeItem: async (productId: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          const currentItems = get().items.filter(item => item.product_id !== productId);
          set({ items: currentItems });
          return;
        }

        set({ isLoading: true });

        try {
          const { error } = await supabase
            .from('wishlist_items')
            .delete()
            .eq('user_id', user.id)
            .eq('product_id', productId);

          if (error) throw error;

          const currentItems = get().items.filter(item => item.product_id !== productId);
          set({ items: currentItems });
        } catch (error) {
          console.error('Error removing item from wishlist:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      toggleWishlistItem: async (productId: string) => {
        const isInWishlist = get().isInWishlist(productId);
        
        if (isInWishlist) {
          await get().removeItem(productId);
        } else {
          await get().addItem(productId);
        }
      },

      isInWishlist: (productId: string) => {
        return get().items.some(item => item.product_id === productId);
      },

      fetchWishlist: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) return;

        set({ isLoading: true });

        try {
          const { data, error } = await supabase
            .from('wishlist_items')
            .select(`
              *,
              products:product_id (
                *,
                product_images (*)
              )
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (error) throw error;

          set({ items: data || [] });
        } catch (error) {
          console.error('Error fetching wishlist:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      clearWishlist: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          set({ items: [] });
          return;
        }

        set({ isLoading: true });

        try {
          const { error } = await supabase
            .from('wishlist_items')
            .delete()
            .eq('user_id', user.id);

          if (error) throw error;

          set({ items: [] });
        } catch (error) {
          console.error('Error clearing wishlist:', error);
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'wishlist-storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
);