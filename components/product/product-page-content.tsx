'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Share2, ChevronLeft, ChevronRight, Plus, Minus, ShoppingBag, Star, Ruler } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/hooks/use-cart-store';
import { useWishlistStore } from '@/hooks/use-wishlist-store';
import { CustomSizeModal, type CustomMeasurements } from './custom-size-modal';
import { cn } from '@/utils/cn';

interface ProductPageContentProps {
  product: {
    id: string;
    name: string;
    price: number;
    sale_price?: number | null;
    description: string;
    details: string[];
    images: string[];
    variants: Array<{
      id: string;
      size: string;
      color: string;
      stock: number;
    }>;
    category: string;
    collection: string;
  };
}

const reviews = [
  {
    id: 1,
    author: 'Sarah M.',
    rating: 5,
    comment: 'Absolutely love this piece! The quality is exceptional and the fit is perfect.',
    date: '2024-01-15'
  },
  {
    id: 2,
    author: 'Michael R.',
    rating: 4,
    comment: 'Great quality shirt, very comfortable to wear. Would definitely recommend.',
    date: '2024-01-10'
  },
  {
    id: 3,
    author: 'Emma L.',
    rating: 5,
    comment: 'Perfect addition to my wardrobe. The fabric feels premium and the cut is flattering.',
    date: '2024-01-05'
  }
];

export function ProductPageContent({ product }: ProductPageContentProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [showCustomSizeModal, setShowCustomSizeModal] = useState(false);
  const [customMeasurements, setCustomMeasurements] = useState<CustomMeasurements | null>(null);
  const [isCustomFit, setIsCustomFit] = useState(false);

  const { addItem } = useCartStore();
  const { items: wishlistItems, addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlistStore();

  const isInWishlist = wishlistItems.some(item => item.product_id === product.id);
  const availableSizes = Array.from(new Set(product.variants.map(v => v.size)));
  const availableColors = Array.from(new Set(product.variants.map(v => v.color)));

  const selectedVariant = product.variants.find(v => 
    v.size === selectedSize && v.color === selectedColor
  );

  const isOutOfStock = selectedVariant?.stock === 0;
  const canAddToCart = selectedSize && selectedColor && quantity > 0 && !isOutOfStock;

  useEffect(() => {
    if (availableSizes.length > 0 && !selectedSize) {
      setSelectedSize(availableSizes[0]);
    }
    if (availableColors.length > 0 && !selectedColor) {
      setSelectedColor(availableColors[0]);
    }
  }, [availableSizes, availableColors, selectedSize, selectedColor]);

  const handleAddToCart = () => {
    if (!canAddToCart || !selectedVariant) return;

    addItem({
      product_id: product.id,
      variant_id: selectedVariant.id,
      quantity
    });
  };

  const handleWishlistToggle = () => {
    if (isInWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(`wishlist-${product.id}`);
    }
  };

  const handleCustomSizeSubmit = (measurements: CustomMeasurements) => {
    setCustomMeasurements(measurements);
    setIsCustomFit(true);
    setSelectedSize('Custom Fit');
  };

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const previousImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  const currentPrice = product.sale_price ?? product.price;
  const discountPercentage = product.sale_price 
    ? Math.round(((product.price - product.sale_price) / product.price) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center space-x-2 text-sm text-neutral-600">
          <Link href="/" className="hover:text-black transition-colors">Home</Link>
          <span>/</span>
          <Link href="/collections/men" className="hover:text-black transition-colors">{product.collection}</Link>
          <span>/</span>
          <span className="text-black">{product.name}</span>
        </nav>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square overflow-hidden rounded-lg bg-neutral-100">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedImageIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="relative w-full h-full"
                >
                  <Image
                    src={product.images[selectedImageIndex]}
                    alt={product.name}
                    fill
                    className="object-cover"
                    priority
                  />
                </motion.div>
              </AnimatePresence>

              {/* Image Navigation */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={previousImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-colors"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={cn(
                      'relative aspect-square overflow-hidden rounded-md bg-neutral-100 border-2 transition-colors',
                      index === selectedImageIndex ? 'border-black' : 'border-transparent'
                    )}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} view ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-8">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl lg:text-4xl font-serif font-semibold mb-2">
                    {product.name}
                  </h1>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "h-4 w-4",
                              i < 4 ? "text-yellow-400 fill-current" : "text-neutral-300"
                            )}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-neutral-600">(4.8) • 24 reviews</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleWishlistToggle}
                    className={cn(
                      "transition-colors",
                      isInWishlist ? "text-red-500" : "text-neutral-400"
                    )}
                  >
                    <Heart className={cn("h-5 w-5", isInWishlist && "fill-current")} />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl font-semibold">
                  ${currentPrice.toFixed(2)}
                </span>
                {product.sale_price && (
                  <>
                    <span className="text-xl text-neutral-500 line-through">
                      ${product.price.toFixed(2)}
                    </span>
                    <Badge variant="destructive" className="text-xs">
                      -{discountPercentage}%
                    </Badge>
                  </>
                )}
              </div>

              {/* Size Selection */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium">Size</label>
                  <button className="text-sm text-neutral-600 underline hover:text-black">
                    Size Guide
                  </button>
                </div>
                
                {/* Custom Fit Toggle */}
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Ruler className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">
                        Perfect Fit Guarantee
                      </span>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
                        New
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCustomSizeModal(true)}
                      className="text-blue-700 border-blue-300 hover:bg-blue-100"
                    >
                      Get Custom Fit
                    </Button>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">
                    Provide your measurements for a perfectly tailored fit
                  </p>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {/* Custom Fit Option */}
                  {isCustomFit && (
                    <button
                      onClick={() => setSelectedSize('Custom Fit')}
                      className={cn(
                        'py-3 px-2 text-sm border rounded-md transition-colors col-span-2',
                        selectedSize === 'Custom Fit'
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-blue-50 text-blue-700 border-blue-300 hover:border-blue-400'
                      )}
                    >
                      ✨ Custom Fit
                    </button>
                  )}
                  
                  {availableSizes.map((size) => {
                    const sizeVariants = product.variants.filter(v => v.size === size);
                    const isAvailable = sizeVariants.some(v => v.stock > 0);
                    
                    return (
                      <button
                        key={size}
                        onClick={() => {
                          if (isAvailable) {
                            setSelectedSize(size);
                            setIsCustomFit(false);
                          }
                        }}
                        disabled={!isAvailable}
                        className={cn(
                          'py-3 px-4 text-sm border rounded-md transition-colors',
                          selectedSize === size && !isCustomFit
                            ? 'bg-black text-white border-black'
                            : isAvailable
                            ? 'bg-white text-neutral-700 border-neutral-300 hover:border-neutral-400'
                            : 'bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed'
                        )}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
                
                {/* Custom Fit Details */}
                {isCustomFit && customMeasurements && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex items-center gap-2 mb-2">
                      <Ruler className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">
                        Custom measurements saved
                      </span>
                    </div>
                    <p className="text-xs text-green-700">
                      Your garment will be tailored to your exact measurements. 
                      Additional 7-10 days for production.
                    </p>
                  </div>
                )}
              </div>

              {/* Color Selection */}
              <div className="mb-6">
                <label className="text-sm font-medium mb-3 block">Color: {selectedColor}</label>
                <div className="flex gap-3">
                  {availableColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={cn(
                        'w-8 h-8 rounded-full border-2 transition-colors',
                        selectedColor === color ? 'border-black' : 'border-neutral-300',
                        color === 'White' && 'bg-white',
                        color === 'Blue' && 'bg-blue-600',
                        color === 'Black' && 'bg-black'
                      )}
                    />
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="mb-8">
                <label className="text-sm font-medium mb-3 block">Quantity</label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-neutral-300 rounded-md">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 hover:bg-neutral-50 transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-4 py-2 border-x border-neutral-300 min-w-[60px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      disabled={selectedVariant && quantity >= selectedVariant.stock}
                      className="p-2 hover:bg-neutral-50 transition-colors disabled:opacity-50"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  {selectedVariant && (
                    <span className="text-sm text-neutral-600">
                      {selectedVariant.stock} in stock
                    </span>
                  )}
                </div>
              </div>

              {/* Add to Cart */}
              <div className="flex gap-4 mb-8">
                <Button
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={!canAddToCart}
                  className="flex-1"
                >
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                </Button>
              </div>

              {/* Stock Status */}
              {selectedVariant && (
                <div className="mb-8">
                  {selectedVariant.stock <= 5 && selectedVariant.stock > 0 && (
                    <p className="text-sm text-orange-600">
                      Only {selectedVariant.stock} left in stock!
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Product Tabs */}
            <div>
              <div className="border-b border-neutral-200 mb-6">
                <nav className="flex space-x-8">
                  {['description', 'details', 'reviews'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={cn(
                        'py-2 border-b-2 font-medium text-sm capitalize transition-colors',
                        activeTab === tab
                          ? 'border-black text-black'
                          : 'border-transparent text-neutral-600 hover:text-black'
                      )}
                    >
                      {tab}
                    </button>
                  ))}
                </nav>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeTab === 'description' && (
                    <div className="prose prose-neutral max-w-none">
                      <p className="text-neutral-700 leading-relaxed">{product.description}</p>
                    </div>
                  )}

                  {activeTab === 'details' && (
                    <div>
                      <ul className="space-y-2">
                        {product.details.map((detail, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0" />
                            <span className="text-neutral-700">{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {activeTab === 'reviews' && (
                    <div className="space-y-6">
                      {reviews.map((review) => (
                        <div key={review.id} className="border-b border-neutral-200 pb-6 last:border-b-0">
                          <div className="flex items-start gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="font-medium">{review.author}</span>
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={cn(
                                        "h-4 w-4",
                                        i < review.rating ? "text-yellow-400 fill-current" : "text-neutral-300"
                                      )}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm text-neutral-500">
                                  {new Date(review.date).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-neutral-700">{review.comment}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
      
      {/* Custom Size Modal */}
      <CustomSizeModal
        isOpen={showCustomSizeModal}
        onClose={() => setShowCustomSizeModal(false)}
        onSubmit={handleCustomSizeSubmit}
        productType={product.category.toLowerCase()}
      />
    </div>
  );
}