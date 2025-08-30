'use client';

import Image from 'next/image';
import { useCartStore } from '@/hooks/use-cart-store';

export function CheckoutOrderSummary() {
  const { items, totalPrice, totalItems } = useCartStore();

  const subtotal = totalPrice;
  const shipping = 0; // Free shipping
  const tax = Math.round(subtotal * 0.05); // 5% tax estimate
  const total = subtotal + shipping + tax;

  return (
    <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-6">Order Summary</h2>
      
      {/* Order Items */}
      <div className="space-y-4 mb-6">
        {items.map((item) => {
          const product = item.products;
          const variant = item.product_variants;
          const image = product?.product_images?.[0];
          const price = variant?.price || product?.price || 0;

          return (
            <div key={item.id} className="flex items-center gap-4">
              {/* Product Image */}
              <div className="relative w-16 h-16 bg-white border border-neutral-200 rounded-lg overflow-hidden flex-shrink-0">
                {image && (
                  <Image
                    src={image.url}
                    alt={image.alt_text || product?.name || ''}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                )}
                {/* Quantity Badge */}
                <div className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {item.quantity}
                </div>
              </div>

              {/* Product Details */}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">
                  {product?.name}
                </h4>
                {variant && (
                  <p className="text-xs text-neutral-600">
                    Size: {variant.option1}
                  </p>
                )}
              </div>

              {/* Price */}
              <div className="text-sm font-medium">
                ₹{(price * item.quantity).toLocaleString()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pricing Breakdown */}
      <div className="space-y-3 py-4 border-t border-neutral-200">
        <div className="flex justify-between text-sm">
          <span>Subtotal ({totalItems} items)</span>
          <span>₹{subtotal.toLocaleString()}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span>Shipping</span>
          <span className="text-green-600">Free</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span>Estimated Tax</span>
          <span>₹{tax.toLocaleString()}</span>
        </div>
      </div>

      {/* Total */}
      <div className="flex justify-between text-lg font-semibold pt-4 border-t border-neutral-200">
        <span>Total</span>
        <span>₹{total.toLocaleString()}</span>
      </div>

      {/* Shipping & Return Info */}
      <div className="mt-6 pt-6 border-t border-neutral-200 text-sm text-neutral-600 space-y-2">
        <div className="flex justify-between">
          <span>Free shipping</span>
          <span>On orders above ₹999</span>
        </div>
        <div className="flex justify-between">
          <span>Easy returns</span>
          <span>30-day policy</span>
        </div>
        <div className="flex justify-between">
          <span>Delivery time</span>
          <span>3-5 business days</span>
        </div>
      </div>
    </div>
  );
}