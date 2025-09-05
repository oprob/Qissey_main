'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCartStore } from '@/hooks/use-cart-store';
import { useAuthStore } from '@/hooks/use-auth-store';
import { CheckoutOrderSummary } from '@/components/checkout/checkout-order-summary';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const checkoutSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  address1: z.string().min(1, 'Address is required'),
  address2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  province: z.string().min(1, 'State/Province is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().default('India'),
  phone: z.string().min(1, 'Phone number is required'),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export function RazorpayCheckout() {
  const { user } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCartStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: user?.email || '',
      country: 'India',
    },
  });

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => setRazorpayLoaded(true);
    script.onerror = () => {
      console.error('Failed to load Razorpay script');
      toast.error('Payment system failed to load');
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  if (items.length === 0) {
    router.push('/cart');
    return null;
  }

  const onSubmit = async (formData: CheckoutFormData) => {
    if (!razorpayLoaded) {
      toast.error('Payment system is loading. Please wait.');
      return;
    }

    if (!user) {
      toast.error('Please login to place an order');
      return;
    }

    setIsProcessing(true);

    try {
      // Prepare shipping address
      const shippingAddress = {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        address1: formData.address1,
        address2: formData.address2,
        city: formData.city,
        province: formData.province,
        postalCode: formData.postalCode,
        country: formData.country,
        phone: formData.phone,
      };

      // Prepare cart items for order
      const cartItems = items.map(item => {
        // Get price from variant first, then product, with fallback
        const itemPrice = item.product_variants?.price || item.products?.price || 100;
        
        // Get product name with fallback
        const productName = item.products?.name || `Product ${item.product_id}`;
        
        // Get variant title with fallback
        const variantTitle = item.product_variants?.title || 
          (item.product_variants?.option1 && item.product_variants?.option2 ? 
            `${item.product_variants.option1} / ${item.product_variants.option2}` : 
            'Standard');
        
        // Get SKU with fallback
        const itemSku = item.product_variants?.sku || item.products?.sku || `SKU-${item.variant_id || item.product_id}`;

        return {
          product_id: item.product_id,
          variant_id: item.variant_id,
          quantity: item.quantity,
          price: itemPrice,
          product_name: productName,
          variant_title: variantTitle,
          sku: itemSku
        };
      });

      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      const authToken = session?.access_token;
      
      console.log('Frontend auth token:', authToken ? 'Present' : 'Missing');
      console.log('Creating order with data:', {
        cartItemsCount: cartItems.length,
        totalAmount: totalPrice,
        shippingAddress: shippingAddress.firstName + ' ' + shippingAddress.lastName
      });

      // Create order
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const createOrderResponse = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          cartItems,
          shippingAddress,
          billingAddress: shippingAddress,
          totalAmount: totalPrice,
        }),
      });

      console.log('Create order response status:', createOrderResponse.status);

      if (!createOrderResponse.ok) {
        const errorData = await createOrderResponse.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Create order error:', errorData);
        throw new Error(errorData.error || 'Failed to create order');
      }

      const orderData = await createOrderResponse.json();
      console.log('Order created successfully:', orderData.order?.id);

      // Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_R7G4LHgAyExxBP',
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'Qissey',
        description: `Order #${orderData.order.order_number}`,
        order_id: orderData.order.razorpay_order_id,
        handler: async function (response: any) {
          try {
            // Verify payment
            const verifyHeaders: HeadersInit = {
              'Content-Type': 'application/json',
            };

            if (authToken) {
              verifyHeaders['Authorization'] = `Bearer ${authToken}`;
            }

            const verifyResponse = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: verifyHeaders,
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                order_id: orderData.order.id,
              }),
            });

            if (!verifyResponse.ok) {
              throw new Error('Payment verification failed');
            }

            const verifyData = await verifyResponse.json();

            if (verifyData.success) {
              await clearCart();
              toast.success('Payment successful! Order confirmed.');
              router.push(`/orders/${verifyData.order.id}`);
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            toast.error('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          contact: formData.phone,
        },
        notes: {
          address: `${formData.address1}, ${formData.city}, ${formData.province}`,
        },
        theme: {
          color: '#000000',
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
            toast.error('Payment cancelled');
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process order');
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-serif font-semibold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Shipping Information */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border border-neutral-200">
              <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">First Name</label>
                    <Input
                      {...register('firstName')}
                      className={errors.firstName ? 'border-red-500' : ''}
                      placeholder="First name"
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Last Name</label>
                    <Input
                      {...register('lastName')}
                      className={errors.lastName ? 'border-red-500' : ''}
                      placeholder="Last name"
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <Input
                    {...register('email')}
                    type="email"
                    className={errors.email ? 'border-red-500' : ''}
                    placeholder="email@example.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Phone</label>
                  <Input
                    {...register('phone')}
                    type="tel"
                    className={errors.phone ? 'border-red-500' : ''}
                    placeholder="+91 9876543210"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Address</label>
                  <Input
                    {...register('address1')}
                    className={errors.address1 ? 'border-red-500' : ''}
                    placeholder="Street address"
                  />
                  {errors.address1 && (
                    <p className="text-red-500 text-xs mt-1">{errors.address1.message}</p>
                  )}
                </div>

                <div>
                  <Input
                    {...register('address2')}
                    placeholder="Apartment, suite, etc. (optional)"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">City</label>
                    <Input
                      {...register('city')}
                      className={errors.city ? 'border-red-500' : ''}
                      placeholder="City"
                    />
                    {errors.city && (
                      <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">State</label>
                    <Input
                      {...register('province')}
                      className={errors.province ? 'border-red-500' : ''}
                      placeholder="State"
                    />
                    {errors.province && (
                      <p className="text-red-500 text-xs mt-1">{errors.province.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">PIN Code</label>
                    <Input
                      {...register('postalCode')}
                      className={errors.postalCode ? 'border-red-500' : ''}
                      placeholder="PIN Code"
                    />
                    {errors.postalCode && (
                      <p className="text-red-500 text-xs mt-1">{errors.postalCode.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Country</label>
                  <Input
                    {...register('country')}
                    disabled
                    className="bg-gray-100"
                  />
                </div>

                {/* Payment Button */}
                <div className="pt-6 border-t border-neutral-200">
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full flex items-center justify-center gap-2"
                    disabled={isProcessing || !razorpayLoaded}
                  >
                    <Lock className="h-4 w-4" />
                    {isProcessing ? 'Processing...' : `Pay ₹${totalPrice.toFixed(2)}`}
                  </Button>
                  <p className="text-xs text-neutral-500 text-center mt-2">
                    <CreditCard className="h-3 w-3 inline mr-1" />
                    Secure payment powered by Razorpay
                  </p>
                </div>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <CheckoutOrderSummary />
          </div>
        </div>
      </div>
    </div>
  );
}