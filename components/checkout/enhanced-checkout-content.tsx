'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  CreditCard, 
  Truck, 
  Shield, 
  Lock,
  User,
  MapPin,
  Package,
  Star,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/hooks/use-cart-store';
import { useAuthStore } from '@/hooks/use-auth-store';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';

const steps = [
  { id: 1, name: 'Information', icon: User },
  { id: 2, name: 'Shipping', icon: Truck },
  { id: 3, name: 'Payment', icon: CreditCard },
  { id: 4, name: 'Review', icon: Package },
];

const paymentMethods = [
  { id: 'card', name: 'Credit/Debit Card', icon: CreditCard, description: 'Visa, MasterCard, American Express' },
  { id: 'upi', name: 'UPI', icon: Shield, description: 'PhonePe, Google Pay, Paytm' },
  { id: 'netbanking', name: 'Net Banking', icon: Lock, description: 'All major banks supported' },
  { id: 'cod', name: 'Cash on Delivery', icon: Package, description: 'Pay when you receive' },
];

const shippingMethods = [
  { id: 'standard', name: 'Standard Shipping', description: '5-7 business days', price: 0, icon: Truck },
  { id: 'express', name: 'Express Shipping', description: '2-3 business days', price: 199, icon: Package },
  { id: 'overnight', name: 'Overnight', description: 'Next business day', price: 499, icon: Star },
];

export function EnhancedCheckoutContent() {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    // Contact info
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    
    // Shipping address
    address1: '',
    address2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    
    // Shipping method
    shippingMethod: 'standard',
    
    // Payment
    paymentMethod: 'card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: '',
  });

  const router = useRouter();
  const { items, totalPrice, clearCart } = useCartStore();
  const { user } = useAuthStore();

  // Auto-fill user data if logged in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        email: user.email || '',
        // Add other user profile data if available
      }));
    }
  }, [user]);

  const selectedShipping = shippingMethods.find(method => method.id === formData.shippingMethod);
  const shippingCost = selectedShipping?.price || 0;
  const totalWithShipping = totalPrice + shippingCost;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (stepNumber: number): boolean => {
    switch (stepNumber) {
      case 1: // Information
        return !!(formData.email && formData.firstName && formData.lastName);
      case 2: // Shipping
        return !!(formData.address1 && formData.city && formData.state && formData.zipCode);
      case 3: // Payment
        if (formData.paymentMethod === 'cod') return true;
        return !!(formData.cardNumber && formData.expiryDate && formData.cvv && formData.nameOnCard);
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCompletedSteps(prev => [...prev, currentStep]);
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setIsProcessing(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Clear cart and redirect to success page
      clearCart();
      toast.success('Order placed successfully!');
      router.push('/orders?success=true');
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Package className="h-16 w-16 text-neutral-300 mx-auto mb-6" />
        <h2 className="text-xl font-semibold mb-4">Your cart is empty</h2>
        <Button onClick={() => router.push('/collections/new-arrivals')}>
          Continue Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Progress Header */}
      <div className="bg-white border-b border-neutral-200 sticky top-16 z-40">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-green-600" />
              <span className="text-sm text-neutral-600">Secure Checkout</span>
            </div>
          </div>

          {/* Step Progress */}
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-8">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = completedSteps.includes(step.id);
                const isCurrent = currentStep === step.id;
                
                return (
                  <div key={step.id} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          'flex items-center justify-center w-12 h-12 rounded-full border-2 transition-colors',
                          isCompleted
                            ? 'bg-green-500 border-green-500 text-white'
                            : isCurrent
                            ? 'bg-black border-black text-white'
                            : 'bg-white border-neutral-300 text-neutral-400'
                        )}
                      >
                        {isCompleted ? (
                          <Check className="h-5 w-5" />
                        ) : (
                          <Icon className="h-5 w-5" />
                        )}
                      </div>
                      <span
                        className={cn(
                          'text-xs font-medium mt-2 transition-colors',
                          isCompleted || isCurrent ? 'text-black' : 'text-neutral-400'
                        )}
                      >
                        {step.name}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={cn(
                          'w-16 h-px mx-4 transition-colors',
                          isCompleted ? 'bg-green-500' : 'bg-neutral-300'
                        )}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Step 1: Contact Information */}
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-xl font-serif font-semibold mb-2">Contact Information</h2>
                        <p className="text-neutral-600">We'll use this to send you order updates.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Email *</label>
                          <Input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            placeholder="john@example.com"
                            className="w-full"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Phone</label>
                          <Input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            placeholder="+91 9876543210"
                            className="w-full"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">First Name *</label>
                          <Input
                            type="text"
                            value={formData.firstName}
                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                            placeholder="John"
                            className="w-full"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Last Name *</label>
                          <Input
                            type="text"
                            value={formData.lastName}
                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                            placeholder="Doe"
                            className="w-full"
                            required
                          />
                        </div>
                      </div>

                      {!user && (
                        <div className="bg-neutral-50 rounded-lg p-4">
                          <p className="text-sm text-neutral-600">
                            Want to save your information for faster checkout next time?{' '}
                            <Button variant="link" className="p-0 h-auto" onClick={() => router.push('/auth/register')}>
                              Create an account
                            </Button>
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 2: Shipping Address */}
                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-xl font-serif font-semibold mb-2">Shipping Address</h2>
                        <p className="text-neutral-600">Where should we deliver your order?</p>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Address Line 1 *</label>
                          <Input
                            type="text"
                            value={formData.address1}
                            onChange={(e) => handleInputChange('address1', e.target.value)}
                            placeholder="123 Main Street"
                            className="w-full"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Address Line 2</label>
                          <Input
                            type="text"
                            value={formData.address2}
                            onChange={(e) => handleInputChange('address2', e.target.value)}
                            placeholder="Apartment, suite, etc."
                            className="w-full"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">City *</label>
                            <Input
                              type="text"
                              value={formData.city}
                              onChange={(e) => handleInputChange('city', e.target.value)}
                              placeholder="Mumbai"
                              className="w-full"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">State *</label>
                            <Input
                              type="text"
                              value={formData.state}
                              onChange={(e) => handleInputChange('state', e.target.value)}
                              placeholder="Maharashtra"
                              className="w-full"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">ZIP Code *</label>
                            <Input
                              type="text"
                              value={formData.zipCode}
                              onChange={(e) => handleInputChange('zipCode', e.target.value)}
                              placeholder="400001"
                              className="w-full"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-4">Shipping Method</h3>
                        <div className="space-y-3">
                          {shippingMethods.map(method => {
                            const Icon = method.icon;
                            return (
                              <div
                                key={method.id}
                                className={cn(
                                  'border rounded-lg p-4 cursor-pointer transition-colors',
                                  formData.shippingMethod === method.id
                                    ? 'border-black bg-black/5'
                                    : 'border-neutral-200 hover:border-neutral-300'
                                )}
                                onClick={() => handleInputChange('shippingMethod', method.id)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <input
                                      type="radio"
                                      name="shipping"
                                      checked={formData.shippingMethod === method.id}
                                      onChange={() => handleInputChange('shippingMethod', method.id)}
                                      className="w-4 h-4"
                                    />
                                    <Icon className="h-5 w-5 text-neutral-600" />
                                    <div>
                                      <p className="font-medium">{method.name}</p>
                                      <p className="text-sm text-neutral-600">{method.description}</p>
                                    </div>
                                  </div>
                                  <span className="font-semibold">
                                    {method.price === 0 ? 'Free' : `₹${method.price}`}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Payment */}
                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-xl font-serif font-semibold mb-2">Payment Method</h2>
                        <p className="text-neutral-600">Choose how you'd like to pay for your order.</p>
                      </div>

                      <div className="space-y-3">
                        {paymentMethods.map(method => {
                          const Icon = method.icon;
                          return (
                            <div
                              key={method.id}
                              className={cn(
                                'border rounded-lg p-4 cursor-pointer transition-colors',
                                formData.paymentMethod === method.id
                                  ? 'border-black bg-black/5'
                                  : 'border-neutral-200 hover:border-neutral-300'
                              )}
                              onClick={() => handleInputChange('paymentMethod', method.id)}
                            >
                              <div className="flex items-center gap-3">
                                <input
                                  type="radio"
                                  name="payment"
                                  checked={formData.paymentMethod === method.id}
                                  onChange={() => handleInputChange('paymentMethod', method.id)}
                                  className="w-4 h-4"
                                />
                                <Icon className="h-5 w-5 text-neutral-600" />
                                <div>
                                  <p className="font-medium">{method.name}</p>
                                  <p className="text-sm text-neutral-600">{method.description}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {formData.paymentMethod === 'card' && (
                        <div className="mt-6 space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Name on Card *</label>
                            <Input
                              type="text"
                              value={formData.nameOnCard}
                              onChange={(e) => handleInputChange('nameOnCard', e.target.value)}
                              placeholder="John Doe"
                              className="w-full"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Card Number *</label>
                            <Input
                              type="text"
                              value={formData.cardNumber}
                              onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                              placeholder="1234 5678 9012 3456"
                              className="w-full"
                              required
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Expiry Date *</label>
                              <Input
                                type="text"
                                value={formData.expiryDate}
                                onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                                placeholder="MM/YY"
                                className="w-full"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">CVV *</label>
                              <Input
                                type="text"
                                value={formData.cvv}
                                onChange={(e) => handleInputChange('cvv', e.target.value)}
                                placeholder="123"
                                className="w-full"
                                required
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-blue-800">
                          <Shield className="h-4 w-4" />
                          <span className="text-sm font-medium">Secure Payment</span>
                        </div>
                        <p className="text-sm text-blue-700 mt-1">
                          Your payment information is encrypted and secure.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Review */}
                  {currentStep === 4 && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-xl font-serif font-semibold mb-2">Review Your Order</h2>
                        <p className="text-neutral-600">Please review your order before placing it.</p>
                      </div>

                      {/* Order Items */}
                      <div>
                        <h3 className="font-semibold mb-4">Order Items</h3>
                        <div className="space-y-4">
                          {items.map(item => (
                            <div key={item.id} className="flex gap-4 p-4 border border-neutral-200 rounded-lg">
                              <div className="w-16 h-16 bg-neutral-100 rounded-md overflow-hidden">
                                {item.products?.product_images?.[0] && (
                                  <img
                                    src={item.products.product_images[0].url}
                                    alt={item.products.name}
                                    className="w-full h-full object-cover"
                                  />
                                )}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium">{item.products?.name}</h4>
                                <p className="text-sm text-neutral-600">
                                  Size: {item.product_variants?.option1} • Qty: {item.quantity}
                                </p>
                                <p className="font-semibold">₹{((item.product_variants?.price || item.products?.price || 0) * item.quantity).toLocaleString()}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Summary Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-neutral-50 rounded-lg p-4">
                          <h4 className="font-semibold mb-2">Contact</h4>
                          <p className="text-sm text-neutral-600">{formData.email}</p>
                          <p className="text-sm text-neutral-600">{formData.firstName} {formData.lastName}</p>
                        </div>

                        <div className="bg-neutral-50 rounded-lg p-4">
                          <h4 className="font-semibold mb-2">Shipping</h4>
                          <p className="text-sm text-neutral-600">{formData.address1}</p>
                          <p className="text-sm text-neutral-600">{formData.city}, {formData.state} {formData.zipCode}</p>
                        </div>

                        <div className="bg-neutral-50 rounded-lg p-4">
                          <h4 className="font-semibold mb-2">Payment</h4>
                          <p className="text-sm text-neutral-600">
                            {paymentMethods.find(p => p.id === formData.paymentMethod)?.name}
                          </p>
                          <p className="text-sm text-neutral-600">
                            {selectedShipping?.name}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-neutral-200">
                {currentStep > 1 ? (
                  <Button variant="outline" onClick={prevStep}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                ) : (
                  <div />
                )}

                {currentStep < steps.length ? (
                  <Button onClick={nextStep}>
                    Continue
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button 
                    onClick={handleSubmit} 
                    disabled={isProcessing}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isProcessing ? 'Processing...' : 'Place Order'}
                    {!isProcessing && <ArrowRight className="h-4 w-4 ml-2" />}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-neutral-200 p-6 sticky top-32">
              <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span>Subtotal ({items.length} items)</span>
                  <span>₹{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping ({selectedShipping?.name})</span>
                  <span>{shippingCost === 0 ? 'Free' : `₹${shippingCost.toLocaleString()}`}</span>
                </div>
                <div className="flex justify-between text-sm text-neutral-600">
                  <span>Tax</span>
                  <span>Calculated at checkout</span>
                </div>
                <hr className="border-neutral-200" />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>₹{totalWithShipping.toLocaleString()}</span>
                </div>
              </div>

              <div className="text-xs text-neutral-600 space-y-2">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>Secure SSL encryption</span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  <span>Free returns within 30 days</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  <span>Free shipping on orders over ₹999</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}