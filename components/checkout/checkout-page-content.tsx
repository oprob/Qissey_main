'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, CreditCard, Truck, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCartStore } from '@/hooks/use-cart-store';
import { useAuthStore } from '@/hooks/use-auth-store';
import { CheckoutOrderSummary } from '@/components/checkout/checkout-order-summary';
import toast from 'react-hot-toast';

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
  phone: z.string().optional(),
  paymentMethod: z.enum(['card', 'upi', 'netbanking', 'cod']),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export function CheckoutPageContent() {
  const { user } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [guestEmail, setGuestEmail] = useState('');
  const [showGuestForm, setShowGuestForm] = useState(!user);
  
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCartStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: user?.email || '',
      country: 'India',
      paymentMethod: 'card',
    },
  });

  const selectedPaymentMethod = watch('paymentMethod');

  if (items.length === 0) {
    router.push('/cart');
    return null;
  }

  const onSubmit = async (data: CheckoutFormData) => {
    setIsProcessing(true);

    try {
      // Simulate order processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real app, you would:
      // 1. Create order in database
      // 2. Process payment
      // 3. Send confirmation email
      // 4. Update inventory
      
      await clearCart();
      toast.success('Order placed successfully!');
      router.push('/order/confirmation');
    } catch (error) {
      toast.error('Failed to process order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const steps = [
    { id: 1, name: 'Shipping', completed: currentStep > 1 },
    { id: 2, name: 'Payment', completed: currentStep > 2 },
    { id: 3, name: 'Review', completed: false },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                    step.id === currentStep
                      ? 'bg-black text-white'
                      : step.completed
                      ? 'bg-green-500 text-white'
                      : 'bg-neutral-200 text-neutral-600'
                  }`}
                >
                  {step.id}
                </div>
                <span
                  className={`ml-2 text-sm font-medium ${
                    step.id === currentStep ? 'text-black' : 'text-neutral-600'
                  }`}
                >
                  {step.name}
                </span>
                {index < steps.length - 1 && (
                  <div className="w-12 h-px bg-neutral-200 ml-4" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Contact Information */}
              <div>
                <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
                <div>
                  <Input
                    {...register('email')}
                    type="email"
                    placeholder="Email address"
                    className="w-full"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h2 className="text-lg font-semibold mb-4">Shipping Address</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Input
                      {...register('firstName')}
                      placeholder="First name"
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Input
                      {...register('lastName')}
                      placeholder="Last name"
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
                    )}
                  </div>
                  
                  <div className="md:col-span-2">
                    <Input
                      {...register('address1')}
                      placeholder="Address line 1"
                    />
                    {errors.address1 && (
                      <p className="text-red-500 text-sm mt-1">{errors.address1.message}</p>
                    )}
                  </div>
                  
                  <div className="md:col-span-2">
                    <Input
                      {...register('address2')}
                      placeholder="Address line 2 (optional)"
                    />
                  </div>
                  
                  <div>
                    <Input
                      {...register('city')}
                      placeholder="City"
                    />
                    {errors.city && (
                      <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Input
                      {...register('province')}
                      placeholder="State/Province"
                    />
                    {errors.province && (
                      <p className="text-red-500 text-sm mt-1">{errors.province.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Input
                      {...register('postalCode')}
                      placeholder="Postal code"
                    />
                    {errors.postalCode && (
                      <p className="text-red-500 text-sm mt-1">{errors.postalCode.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Input
                      {...register('phone')}
                      placeholder="Phone (optional)"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
                <div className="space-y-3">
                  {[
                    { id: 'card', name: 'Credit/Debit Card', icon: CreditCard },
                    { id: 'upi', name: 'UPI', icon: Shield },
                    { id: 'netbanking', name: 'Net Banking', icon: Lock },
                    { id: 'cod', name: 'Cash on Delivery', icon: Truck },
                  ].map((method) => {
                    const Icon = method.icon;
                    return (
                      <label
                        key={method.id}
                        className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedPaymentMethod === method.id
                            ? 'border-black bg-neutral-50'
                            : 'border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        <input
                          type="radio"
                          value={method.id}
                          {...register('paymentMethod')}
                          className="sr-only"
                        />
                        <Icon className="h-5 w-5 mr-3 text-neutral-600" />
                        <span className="font-medium">{method.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Security Notice */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-green-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      Secure Checkout
                    </p>
                    <p className="text-sm text-green-600">
                      Your payment information is encrypted and secure
                    </p>
                  </div>
                </div>
              </div>

              {/* Place Order Button */}
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Processing...
                  </div>
                ) : (
                  `Place Order - ₹${totalPrice.toLocaleString()}`
                )}
              </Button>
            </form>
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