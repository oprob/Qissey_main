'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/hooks/use-cart-store';

export function CartPageContent() {
  const { 
    items, 
    isLoading, 
    totalItems, 
    totalPrice, 
    removeItem, 
    updateQuantity 
  } = useCartStore();

  const [removingItem, setRemovingItem] = useState<string | null>(null);

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setRemovingItem(itemId);
      setTimeout(() => {
        removeItem(itemId);
        setRemovingItem(null);
      }, 150);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleRemoveItem = (itemId: string) => {
    setRemovingItem(itemId);
    setTimeout(() => {
      removeItem(itemId);
      setRemovingItem(null);
    }, 150);
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <ShoppingBag className="h-24 w-24 text-neutral-300 mx-auto mb-6" />
          <h1 className="text-2xl font-serif font-semibold mb-4">
            Your cart is empty
          </h1>
          <p className="text-neutral-600 mb-8">
            Looks like you haven't added anything to your cart yet. 
            Start shopping to fill it up!
          </p>
          <Button asChild size="lg">
            <Link href="/collections/all">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Continue Shopping
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-serif font-semibold mb-2">
          Shopping Cart ({totalItems} {totalItems === 1 ? 'item' : 'items'})
        </h1>
        <Link 
          href="/collections/all" 
          className="text-sm text-neutral-600 hover:text-black flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Continue Shopping
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="space-y-6">
            {items.map((item) => {
              const product = item.products;
              const variant = item.product_variants;
              const image = product?.product_images?.[0];
              const price = variant?.price || product?.price || 0;
              const isRemoving = removingItem === item.id;

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 1, scale: 1 }}
                  animate={{ 
                    opacity: isRemoving ? 0 : 1, 
                    scale: isRemoving ? 0.95 : 1 
                  }}
                  transition={{ duration: 0.15 }}
                  className="bg-white border border-neutral-200 rounded-lg p-6"
                >
                  <div className="flex gap-6">
                    {/* Product Image */}
                    <div className="relative w-32 h-32 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0">
                      {image && (
                        <Image
                          src={image.url}
                          alt={image.alt_text || product?.name || ''}
                          fill
                          className="object-cover"
                          sizes="128px"
                        />
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-medium text-lg mb-1">
                            {product?.name}
                          </h3>
                          
                          {variant && (
                            <p className="text-sm text-neutral-600 mb-2">
                              Size: {variant.option1}
                            </p>
                          )}

                          <p className="font-semibold text-lg">
                            ₹{price.toLocaleString()}
                          </p>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={isLoading || isRemoving}
                          className="text-neutral-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            disabled={isLoading || isRemoving}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          
                          <span className="font-medium min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            disabled={isLoading || isRemoving}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="text-right">
                          <p className="font-semibold text-lg">
                            ₹{(price * item.quantity).toLocaleString()}
                          </p>
                          <p className="text-sm text-neutral-600">
                            ₹{price.toLocaleString()} each
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6 sticky top-6">
            <h2 className="text-lg font-semibold mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span>Subtotal ({totalItems} items)</span>
                <span>₹{totalPrice.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
              
              <div className="flex justify-between text-sm text-neutral-600">
                <span>Estimated Tax</span>
                <span>Calculated at checkout</span>
              </div>
              
              <hr className="border-neutral-200" />
              
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>₹{totalPrice.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-3">
              <Button className="w-full" size="lg" asChild>
                <Link href="/checkout">
                  Proceed to Checkout
                </Link>
              </Button>
              
              <Button variant="outline" className="w-full" asChild>
                <Link href="/collections/all">
                  Continue Shopping
                </Link>
              </Button>
            </div>

            {/* Shipping Info */}
            <div className="mt-6 pt-6 border-t border-neutral-200 text-sm text-neutral-600">
              <h3 className="font-medium text-black mb-2">Free Shipping</h3>
              <p>On all orders above ₹999</p>
              
              <h3 className="font-medium text-black mt-4 mb-2">Secure Checkout</h3>
              <p>Your payment information is safe and secure</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}