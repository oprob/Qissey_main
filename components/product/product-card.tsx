'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/hooks/use-cart-store';
import { useWishlistStore } from '@/hooks/use-wishlist-store';
import { useAuthStore } from '@/hooks/use-auth-store';
import { Product } from '@/types';
import { cn } from '@/utils/cn';

interface ProductCardProps {
  product: Product;
  className?: string;
  showQuickAdd?: boolean;
}

export function ProductCard({ product, className, showQuickAdd = true }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const { addItem } = useCartStore();
  const { toggleWishlistItem, isInWishlist } = useWishlistStore();
  const { user } = useAuthStore();

  const primaryImage = product.product_images?.[0];
  const secondaryImage = product.product_images?.[1];
  const defaultVariant = product.product_variants?.[0];

  const isOnSale = product.compare_at_price && product.compare_at_price > product.price;
  const discountPercentage = isOnSale && product.compare_at_price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0;

  const isWishlisted = user ? isInWishlist(product.id) : false;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (defaultVariant) {
      addItem({
        product_id: product.id,
        variant_id: defaultVariant.id,
        quantity: 1,
      });
    }
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (user) {
      toggleWishlistItem(product.id);
    } else {
      // Redirect to login or show auth modal
      window.location.href = '/auth/login';
    }
  };

  return (
    <motion.div
      className={cn('group relative', className)}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden rounded-lg bg-neutral-100">
          {/* Main Product Image */}
          {primaryImage && (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt_text || product.name}
              fill
              className={cn(
                'object-cover transition-all duration-500',
                isHovered && secondaryImage ? 'opacity-0' : 'opacity-100',
                imageLoaded ? 'blur-0' : 'blur-sm'
              )}
              onLoad={() => setImageLoaded(true)}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          )}

          {/* Secondary Image for Hover Effect */}
          {secondaryImage && (
            <Image
              src={secondaryImage.url}
              alt={secondaryImage.alt_text || product.name}
              fill
              className={cn(
                'object-cover transition-all duration-500',
                isHovered ? 'opacity-100' : 'opacity-0'
              )}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          )}

          {/* Sale Badge */}
          {isOnSale && (
            <Badge
              variant="destructive"
              className="absolute top-2 left-2 z-10"
            >
              -{discountPercentage}%
            </Badge>
          )}

          {/* Wishlist Button */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'absolute top-2 right-2 z-10 bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-200',
              isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            )}
            onClick={handleWishlistToggle}
          >
            <Heart
              className={cn(
                'h-4 w-4 transition-colors',
                isWishlisted ? 'fill-red-500 text-red-500' : 'text-neutral-600'
              )}
            />
          </Button>

          {/* Quick Add Button */}
          {showQuickAdd && defaultVariant && (
            <Button
              className={cn(
                'absolute bottom-2 left-2 right-2 z-10 transition-all duration-200',
                isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
              )}
              onClick={handleQuickAdd}
            >
              <ShoppingBag className="h-4 w-4 mr-2" />
              Quick Add
            </Button>
          )}

          {/* Out of Stock Overlay */}
          {product.status === 'out_of_stock' && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-20">
              <Badge variant="secondary">Out of Stock</Badge>
            </div>
          )}
        </div>

        {/* Product Information */}
        <div className="pt-4 space-y-2">
          <h3 className="font-medium text-black group-hover:text-neutral-700 transition-colors line-clamp-2">
            {product.name}
          </h3>
          
          {product.short_description && (
            <p className="text-sm text-neutral-600 line-clamp-1">
              {product.short_description}
            </p>
          )}

          <div className="flex items-center gap-2">
            <span className="font-semibold text-black">
              ₹{product.price.toLocaleString()}
            </span>
            {isOnSale && product.compare_at_price && (
              <span className="text-sm text-neutral-500 line-through">
                ₹{product.compare_at_price.toLocaleString()}
              </span>
            )}
          </div>

          {/* Available Sizes */}
          {product.product_variants && product.product_variants.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              {product.product_variants.slice(0, 5).map((variant) => (
                <Badge
                  key={variant.id}
                  variant="outline"
                  className="text-xs px-2 py-1"
                >
                  {variant.option1}
                </Badge>
              ))}
              {product.product_variants.length > 5 && (
                <span className="text-xs text-neutral-500">
                  +{product.product_variants.length - 5} more
                </span>
              )}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}