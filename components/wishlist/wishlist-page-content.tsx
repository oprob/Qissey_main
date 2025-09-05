'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag, X, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/product/product-card';
import { useAuthStore } from '@/hooks/use-auth-store';
import { useCartStore } from '@/hooks/use-cart-store';
import { cn } from '@/utils/cn';

// Mock wishlist data
const mockWishlistItems = [
  {
    id: '1',
    name: 'Classic Cotton Shirt',
    slug: 'classic-cotton-shirt',
    price: 89.99,
    sale_price: null,
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=600&fit=crop'],
    variants: [{ size: 'M', color: 'White', stock: 10 }],
    dateAdded: '2024-01-15'
  },
  {
    id: '2',
    name: 'Elegant Blazer',
    slug: 'elegant-blazer',
    price: 199.99,
    sale_price: 149.99,
    images: ['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=600&fit=crop'],
    variants: [{ size: 'L', color: 'Navy', stock: 5 }],
    dateAdded: '2024-01-10'
  },
  {
    id: '3',
    name: 'Designer Handbag',
    slug: 'designer-handbag',
    price: 299.99,
    sale_price: null,
    images: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=600&fit=crop'],
    variants: [{ size: 'One Size', color: 'Black', stock: 3 }],
    dateAdded: '2024-01-08'
  }
];

export function WishlistPageContent() {
  const [wishlistItems, setWishlistItems] = useState(mockWishlistItems);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { user } = useAuthStore();
  const { addItem } = useCartStore();

  const removeFromWishlist = (productId: string) => {
    setWishlistItems(prev => prev.filter(item => item.id !== productId));
  };

  const moveToCart = (product: any) => {
    addItem({
      product_id: product.id,
      variant_id: product.variants[0]?.id,
      quantity: 1
    });
    removeFromWishlist(product.id);
  };

  const clearWishlist = () => {
    setWishlistItems([]);
  };

  if (!user) {
    return (
      <div className="min-h-screen">
        <section className="py-16">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-md mx-auto"
            >
              <Heart className="h-16 w-16 text-neutral-400 mx-auto mb-6" />
              <h1 className="text-2xl font-serif font-bold mb-4">Sign In to View Your Wishlist</h1>
              <p className="text-neutral-600 mb-8">
                Create an account or sign in to save your favorite items and never lose track of the pieces you love.
              </p>
              <div className="space-y-3">
                <Button asChild className="w-full">
                  <Link href="/auth/login">Sign In</Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/auth/register">Create Account</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="bg-neutral-50 py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center"
          >
            <Heart className="h-12 w-12 text-red-500 mx-auto mb-6" />
            <h1 className="text-3xl md:text-4xl font-serif font-bold mb-4">
              My Wishlist
            </h1>
            <p className="text-neutral-600">
              {wishlistItems.length > 0 
                ? `${wishlistItems.length} saved ${wishlistItems.length === 1 ? 'item' : 'items'}`
                : 'Your saved items will appear here'
              }
            </p>
          </motion.div>
        </div>
      </section>

      {/* Wishlist Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {wishlistItems.length > 0 ? (
            <>
              {/* Actions Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
                <div className="flex items-center gap-4">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    Grid View
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    List View
                  </Button>
                </div>
                
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm">
                    <Share className="h-4 w-4 mr-2" />
                    Share Wishlist
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={clearWishlist}
                  >
                    Clear All
                  </Button>
                </div>
              </div>

              {/* Products Grid/List */}
              <AnimatePresence mode="wait">
                {viewMode === 'grid' ? (
                  <motion.div
                    key="grid"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  >
                    {wishlistItems.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group relative"
                      >
                        <ProductCard product={item as any} />
                        <div className="absolute top-2 right-2 flex flex-col gap-2">
                          <Button
                            variant="destructive"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeFromWishlist(item.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="default"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => moveToCart(item)}
                          >
                            <ShoppingBag className="h-4 w-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="list"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    {wishlistItems.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-4 p-4 border border-neutral-200 rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="w-20 h-20 relative flex-shrink-0">
                          <img
                            src={item.images[0]}
                            alt={item.name}
                            className="w-full h-full object-cover rounded-md"
                          />
                        </div>
                        
                        <div className="flex-grow">
                          <h3 className="font-medium mb-1">{item.name}</h3>
                          <div className="flex items-center gap-2 mb-2">
                            {item.sale_price ? (
                              <>
                                <span className="text-lg font-semibold text-red-600">
                                  ${item.sale_price}
                                </span>
                                <span className="text-sm text-neutral-500 line-through">
                                  ${item.price}
                                </span>
                              </>
                            ) : (
                              <span className="text-lg font-semibold">
                                ${item.price}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-neutral-500">
                            Added on {new Date(item.dateAdded).toLocaleDateString()}
                          </p>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            onClick={() => moveToCart(item)}
                            className="whitespace-nowrap"
                          >
                            <ShoppingBag className="h-4 w-4 mr-2" />
                            Add to Cart
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeFromWishlist(item.id)}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Remove
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <Heart className="h-16 w-16 text-neutral-400 mx-auto mb-6" />
              <h3 className="text-xl font-semibold mb-4">Your Wishlist is Empty</h3>
              <p className="text-neutral-600 mb-8 max-w-md mx-auto">
                Start browsing our collection and save your favorite items to your wishlist.
              </p>
              <Button asChild>
                <Link href="/collections/new-arrivals">
                  Start Shopping
                </Link>
              </Button>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}