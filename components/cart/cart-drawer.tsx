'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/hooks/use-cart-store';
import { cn } from '@/utils/cn';

export function CartDrawer() {
  const { 
    items, 
    isOpen, 
    isLoading, 
    totalItems, 
    totalPrice, 
    closeCart, 
    removeItem, 
    updateQuantity 
  } = useCartStore();

  // Prevent scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">
                Shopping Cart ({totalItems})
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={closeCart}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag className="h-16 w-16 text-neutral-300 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Your cart is empty</h3>
                  <p className="text-neutral-600 mb-6">
                    Add some items to your cart to get started.
                  </p>
                  <Button onClick={closeCart} asChild>
                    <Link href="/collections/all">Continue Shopping</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {items.map((item) => {
                    const product = item.products;
                    const variant = item.product_variants;
                    const image = product?.product_images?.[0];
                    const price = variant?.price || product?.price || 0;

                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex gap-4"
                      >
                        {/* Product Image */}
                        <div className="relative w-20 h-20 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0">
                          {image && (
                            <Image
                              src={image.url}
                              alt={image.alt_text || product?.name || ''}
                              fill
                              className="object-cover"
                              sizes="80px"
                            />
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm mb-1 truncate">
                            {product?.name}
                          </h4>
                          
                          {variant && (
                            <p className="text-xs text-neutral-600 mb-2">
                              Size: {variant.option1}
                            </p>
                          )}

                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-sm">
                              ₹{price.toLocaleString()}
                            </span>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                disabled={isLoading}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              
                              <span className="text-sm font-medium min-w-[1.5rem] text-center">
                                {item.quantity}
                              </span>
                              
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                disabled={isLoading}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>

                          {/* Remove Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-neutral-600 hover:text-red-600 mt-2 p-0 h-auto"
                            onClick={() => removeItem(item.id)}
                            disabled={isLoading}
                          >
                            Remove
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t p-6 space-y-4">
                {/* Subtotal */}
                <div className="flex items-center justify-between text-lg font-semibold">
                  <span>Subtotal</span>
                  <span>₹{totalPrice.toLocaleString()}</span>
                </div>

                <p className="text-xs text-neutral-600">
                  Shipping and taxes calculated at checkout.
                </p>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Button 
                    className="w-full" 
                    asChild
                    onClick={closeCart}
                  >
                    <Link href="/checkout">
                      Proceed to Checkout
                    </Link>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    asChild
                    onClick={closeCart}
                  >
                    <Link href="/cart">
                      View Cart
                    </Link>
                  </Button>
                </div>

                {/* Continue Shopping */}
                <Button
                  variant="ghost"
                  className="w-full text-sm"
                  onClick={closeCart}
                  asChild
                >
                  <Link href="/collections/all">
                    Continue Shopping
                  </Link>
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}