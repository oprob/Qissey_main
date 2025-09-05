'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft,
  Save,
  X,
  Plus,
  Upload,
  Package,
  Eye,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { adminProductQueries } from '@/lib/admin/database';
import { uploadProductImages, saveProductImages, deleteProductImage } from '@/lib/storage';
import { generateSlug } from '@/lib/utils';
import toast from 'react-hot-toast';
import Link from 'next/link';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  slug: z.string().min(1, 'Product slug is required'),
  description: z.string().optional(),
  short_description: z.string().optional(),
  price: z.number().min(0, 'Price must be positive'),
  compare_at_price: z.number().min(0).optional(),
  cost_price: z.number().min(0).optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  weight: z.number().min(0).optional(),
  status: z.enum(['active', 'inactive', 'out_of_stock']),
  is_featured: z.boolean(),
  has_custom_sizing: z.boolean(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

// Available options for sizes and colors
const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', '38', 'One Size'];
const AVAILABLE_COLORS = ['Black', 'White', 'Navy', 'Gray', 'Blue', 'Red', 'Green', 'Brown', 'Beige', 'Pink', 'Purple'];

interface ProductImage {
  id?: string;
  url: string;
  alt_text?: string;
  sort_order: number;
  file?: File; // For pending uploads
  uploaded?: boolean; // Track upload status
}

interface ProductFormProps {
  mode: 'create' | 'edit';
  productId?: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export function ProductForm({ mode, productId }: ProductFormProps) {
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [stockQuantities, setStockQuantities] = useState<Record<string, number>>({});
  const [images, setImages] = useState<ProductImage[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(mode === 'edit');
  const [isMounted, setIsMounted] = useState(false);
  
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
    reset
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      status: 'inactive',
      is_featured: false,
      has_custom_sizing: false,
    }
  });

  const watchedName = watch('name');
  const watchedCustomSizing = watch('has_custom_sizing');

  // Helper function to generate variants from selected sizes and colors
  const generateVariants = () => {
    if (selectedSizes.length === 0 || selectedColors.length === 0) {
      return [];
    }

    const variants = [];
    for (const size of selectedSizes) {
      for (const color of selectedColors) {
        const variantKey = `${size}-${color}`;
        variants.push({
          title: `${size} / ${color}`,
          option1: size,
          option2: color,
          sku: `${watch('sku') || watch('name')?.replace(/[^a-zA-Z0-9]/g, '') || 'PROD'}-${size}-${color.toUpperCase()}`,
          price: watch('price') || 0,
          inventory_quantity: stockQuantities[variantKey] || 0,
          inventory_policy: 'deny',
          requires_shipping: true,
        });
      }
    }
    return variants;
  };

  // Handle size selection
  const toggleSize = (size: string) => {
    setSelectedSizes(prev => {
      const newSizes = prev.includes(size) 
        ? prev.filter(s => s !== size)
        : [...prev, size];
      
      // Remove stock quantities for removed sizes
      if (!newSizes.includes(size)) {
        setStockQuantities(prev => {
          const newQuantities = { ...prev };
          selectedColors.forEach(color => {
            delete newQuantities[`${size}-${color}`];
          });
          return newQuantities;
        });
      }
      
      return newSizes;
    });
  };

  // Handle color selection
  const toggleColor = (color: string) => {
    setSelectedColors(prev => {
      const newColors = prev.includes(color) 
        ? prev.filter(c => c !== color)
        : [...prev, color];
      
      // Remove stock quantities for removed colors
      if (!newColors.includes(color)) {
        setStockQuantities(prev => {
          const newQuantities = { ...prev };
          selectedSizes.forEach(size => {
            delete newQuantities[`${size}-${color}`];
          });
          return newQuantities;
        });
      }
      
      return newColors;
    });
  };

  // Handle stock quantity change
  const updateStockQuantity = (size: string, color: string, quantity: number) => {
    const key = `${size}-${color}`;
    setStockQuantities(prev => ({
      ...prev,
      [key]: Math.max(0, quantity)
    }));
  };

  // Track mounted state to prevent state updates after unmount
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    if (isMounted) {
      // loadCategories(); // Disabled until categories table is created
      if (mode === 'edit' && productId) {
        loadProduct();
      }
    }
  }, [mode, productId, isMounted]);

  // Auto-generate slug when name changes
  useEffect(() => {
    if (isMounted && watchedName && mode === 'create') {
      setValue('slug', generateSlug(watchedName));
    }
  }, [watchedName, mode, setValue, isMounted]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      // Clean up any blob URLs to prevent memory leaks
      // Create a copy of current images to avoid stale closure
      const currentImages = images;
      currentImages.forEach(image => {
        if (image && image.url && image.url.startsWith('blob:')) {
          try {
            URL.revokeObjectURL(image.url);
          } catch (error) {
            // Ignore errors during cleanup
            console.warn('Error revoking blob URL:', error);
          }
        }
      });
    };
  }, []);

  // const loadCategories = async () => {
  //   try {
  //     const { data } = await adminCategoryQueries.getCategories();
  //     setCategories(data || []);
  //   } catch (error) {
  //     console.error('Error loading categories:', error);
  //   }
  // };

  const loadProduct = async () => {
    if (!productId || !isMounted) return;
    
    setIsLoadingData(true);
    try {
      const { data: product, error } = await adminProductQueries.getProduct(productId);
      if (error) throw error;

      if (product && isMounted) {
        // Reset form with product data
        reset({
          name: product.name,
          slug: product.slug,
          description: product.description || '',
          short_description: product.short_description || '',
          price: Number(product.price),
          compare_at_price: product.compare_at_price ? Number(product.compare_at_price) : undefined,
          cost_price: product.cost_price ? Number(product.cost_price) : undefined,
          sku: product.sku || '',
          barcode: product.barcode || '',
          weight: product.weight ? Number(product.weight) : undefined,
          status: product.status,
          is_featured: product.is_featured,
          // has_custom_sizing: product.has_custom_sizing || false,
          // size_guide_url: product.size_guide_url || '',
          // category_id: product.category_id || '',
          // vendor: product.vendor || '',
          // tags: product.tags || [],
          meta_title: product.meta_title || '',
          meta_description: product.meta_description || '',
        });

        // Extract sizes, colors, and stock quantities from existing variants
        if (product.product_variants && product.product_variants.length > 0) {
          const sizes = new Set<string>();
          const colors = new Set<string>();
          const quantities: Record<string, number> = {};
          
          product.product_variants.forEach((v: any) => {
            if (v.option1) sizes.add(v.option1);
            if (v.option2) colors.add(v.option2);
            if (v.option1 && v.option2) {
              quantities[`${v.option1}-${v.option2}`] = v.inventory_quantity || 0;
            }
          });
          
          setSelectedSizes(Array.from(sizes));
          setSelectedColors(Array.from(colors));
          setStockQuantities(quantities);
        }

        // Set images
        if (product.product_images && product.product_images.length > 0) {
          setImages(product.product_images.map((img: any) => ({
            id: img.id,
            url: img.url,
            alt_text: img.alt_text,
            sort_order: img.sort_order || 0,
            uploaded: true // Mark existing images as already uploaded
          })));
        }
      }
    } catch (error) {
      console.error('Error loading product:', error);
      if (isMounted) {
        toast.error('Failed to load product');
      }
    } finally {
      if (isMounted) {
        setIsLoadingData(false);
      }
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    if (!isMounted) return;
    
    setIsLoading(true);
    
    try {
      console.log('Form submission started with data:', data);

      // Create base product data with only essential fields first
      const baseProductData = {
        name: data.name,
        slug: data.slug,
        price: data.price,
        status: data.status,
        is_featured: data.is_featured,
      };

      // Add optional fields conditionally
      const productData: any = { ...baseProductData };
      
      if (data.description) productData.description = data.description;
      if (data.short_description) productData.short_description = data.short_description;
      if (data.compare_at_price && data.compare_at_price > 0) productData.compare_at_price = data.compare_at_price;
      if (data.cost_price && data.cost_price > 0) productData.cost_price = data.cost_price;
      if (data.sku) productData.sku = data.sku;
      if (data.barcode) productData.barcode = data.barcode;
      if (data.weight && data.weight > 0) productData.weight = data.weight;
      // if (data.category_id) productData.category_id = data.category_id;
      // if (data.vendor) productData.vendor = data.vendor;
      // if (data.tags && data.tags.length > 0) productData.tags = data.tags;
      if (data.meta_title) productData.meta_title = data.meta_title;
      if (data.meta_description) productData.meta_description = data.meta_description;

      console.log('Prepared product data:', productData);

      if (mode === 'create') {
        console.log('Creating new product...');
        const result = await adminProductQueries.createProduct(productData);
        
        if (result.error) {
          console.error('Database error during creation:', result.error);
          throw new Error(`Database error: ${result.error.message}`);
        }

        const newProduct = result.data;
        console.log('Product created successfully:', newProduct);
        
        if (isMounted) {
          toast.success('Product created successfully!');
        }
        
        // Save variants if sizes and colors are selected
        const variants = generateVariants();
        if (variants.length > 0) {
          console.log('Saving variants...', variants);
          try {
            const result = await adminProductQueries.saveProductVariants(newProduct.id, variants);
            if (result.error) {
              console.error('Error saving variants:', result.error);
              if (isMounted) {
                toast.error(`Product created but variants failed to save: ${result.error.message}`);
              }
            } else {
              console.log('Variants saved successfully');
              if (isMounted) {
                toast.success(`${variants.length} variants saved successfully`);
              }
            }
          } catch (error) {
            console.error('Error saving variants:', error);
            if (isMounted) {
              toast.error('Product created but variants failed to save');
            }
          }
        }

        // Upload and save images if any
        if (images.length > 0) {
          console.log('Uploading images to storage...');
          
          const pendingImages = images.filter(img => !img.uploaded && img.file);
          const existingImages = images.filter(img => img.uploaded || !img.file);
          
          if (pendingImages.length > 0) {
            try {
              // Upload new images to storage
              const files = pendingImages.map(img => img.file!);
              const uploadedImages = await uploadProductImages(files, newProduct.slug);
              
              // Save uploaded images to database
              await saveProductImages(newProduct.id, uploadedImages);
              
              if (isMounted) {
                toast.success(`${uploadedImages.length} images uploaded successfully`);
              }
            } catch (error) {
              console.error('Error uploading images:', error);
              if (isMounted) {
                toast.error('Product created but some images failed to upload');
              }
            }
          }
        }

        if (isMounted) {
          router.push(`/admin/products/${newProduct.id}/edit`);
        }
        
      } else if (mode === 'edit' && productId) {
        console.log('Updating existing product...');
        const result = await adminProductQueries.updateProduct(productId, productData);
        
        if (result.error) {
          console.error('Database error during update:', result.error);
          throw new Error(`Database error: ${result.error.message}`);
        }

        console.log('Product updated successfully');
        
        // Save variants if sizes and colors are selected
        const variants = generateVariants();
        if (variants.length > 0) {
          console.log('Updating variants...');
          try {
            const variantResult = await adminProductQueries.saveProductVariants(productId, variants);
            if (variantResult.error) {
              console.error('Error saving variants:', variantResult.error);
              if (isMounted) {
                toast.error('Product updated but variants failed to save');
              }
            } else {
              console.log('Variants updated successfully');
            }
          } catch (error) {
            console.error('Error saving variants:', error);
            if (isMounted) {
              toast.error('Product updated but variants failed to save');
            }
          }
        }

        // Save images if any
        if (images.length > 0) {
          console.log('Updating images...');
          try {
            const imageResult = await adminProductQueries.saveProductImages(productId, images);
            if (imageResult.error) {
              console.error('Error saving images:', imageResult.error);
              if (isMounted) {
                toast.error('Product updated but images failed to save');
              }
            } else {
              console.log('Images updated successfully');
            }
          } catch (error) {
            console.error('Error saving images:', error);
            if (isMounted) {
              toast.error('Product updated but images failed to save');
            }
          }
        }

        if (isMounted) {
          toast.success('Product updated successfully!');
        }
      }

    } catch (error: any) {
      console.error('Error in form submission:', error);
      
      if (isMounted) {
        // Show detailed error message
        let errorMessage = 'Failed to save product';
        if (error?.message) {
          errorMessage += `: ${error.message}`;
        }
        
        toast.error(errorMessage);
      }
      
      // Also log the full error for debugging
      console.error('Full error details:', {
        error,
        stack: error?.stack,
        cause: error?.cause
      });
      
    } finally {
      if (isMounted) {
        setIsLoading(false);
      }
    }
  };


  // const addTag = () => {
  //   if (tagInput.trim() && !watchedTags.includes(tagInput.trim())) {
  //     setValue('tags', [...watchedTags, tagInput.trim()]);
  //     setTagInput('');
  //   }
  // };

  // const removeTag = (tagToRemove: string) => {
  //   setValue('tags', watchedTags.filter(tag => tag !== tagToRemove));
  // };

  const handleImageUpload = async (files: FileList) => {
    if (!files.length || !isMounted) return;

    setUploadingImages(true);
    try {
      const newImages: ProductImage[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          if (isMounted) {
            toast.error(`${file.name} is not an image file`);
          }
          continue;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          if (isMounted) {
            toast.error(`${file.name} is too large. Maximum size is 5MB`);
          }
          continue;
        }

        // Create a temporary URL for preview and store the file for later upload
        const url = URL.createObjectURL(file);
        const tempId = `temp-${Date.now()}-${i}`;
        newImages.push({
          id: tempId,
          url,
          alt_text: `${watchedName || 'Product'} image ${images.length + i + 1}`,
          sort_order: images.length + i,
          file,
          uploaded: false
        });
      }

      if (isMounted) {
        setImages(prev => [...prev, ...newImages]);
        toast.success(`${newImages.length} image(s) selected for upload`);
      }
    } catch (error) {
      console.error('Error preparing images:', error);
      if (isMounted) {
        toast.error('Failed to prepare images');
      }
    } finally {
      if (isMounted) {
        setUploadingImages(false);
      }
    }
  };

  const removeImage = (index: number) => {
    if (!isMounted) return;
    
    setImages(prev => {
      if (index < 0 || index >= prev.length) {
        return prev; // Invalid index, return unchanged
      }

      const imageToRemove = prev[index];
      
      // Safely revoke object URL to prevent memory leaks
      if (imageToRemove && imageToRemove.url && imageToRemove.url.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(imageToRemove.url);
        } catch (error) {
          console.warn('Error revoking object URL:', error);
        }
      }
      
      const newImages = prev.filter((_, i) => i !== index);
      
      // Update sort order
      return newImages.map((img, i) => ({ ...img, sort_order: i }));
    });
  };

  const reorderImages = (fromIndex: number, toIndex: number) => {
    if (!isMounted) return;
    
    setImages(prev => {
      // Validate indices
      if (fromIndex < 0 || fromIndex >= prev.length || 
          toIndex < 0 || toIndex >= prev.length || 
          fromIndex === toIndex) {
        return prev;
      }

      const newImages = [...prev];
      const [removed] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, removed);
      
      // Update sort order
      return newImages.map((img, i) => ({ ...img, sort_order: i }));
    });
  };

  // Show loading state for edit mode until data is loaded
  if (isLoadingData || !isMounted) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading product data...</p>
        </div>
      </div>
    );
  }

  // Ensure we don't render the form until we have all necessary data for edit mode
  if (mode === 'edit' && productId && !watchedName) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-neutral-600">Preparing form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/admin/products">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-serif font-semibold">
                  {mode === 'create' ? 'Add Product' : 'Edit Product'}
                </h1>
                <p className="text-neutral-600">
                  {mode === 'create' 
                    ? 'Create a new product for your catalog' 
                    : 'Update product information'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {mode === 'edit' && (
                <Button variant="outline" asChild>
                  <Link href={`/products/${watch('slug')}`} target="_blank">
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Link>
                </Button>
              )}
              <Button 
                onClick={handleSubmit(onSubmit)}
                disabled={isLoading || !isDirty}
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save Product'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Product Information</CardTitle>
                <CardDescription>Basic details about your product</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Product Name *</label>
                  <Input
                    {...register('name')}
                    placeholder="Enter product name"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Product Slug</label>
                  <Input
                    {...register('slug')}
                    placeholder="product-slug"
                  />
                  {errors.slug && (
                    <p className="text-sm text-red-600 mt-1">{errors.slug.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Short Description</label>
                  <Input
                    {...register('short_description')}
                    placeholder="Brief product description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    {...register('description')}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black resize-none"
                    rows={6}
                    placeholder="Detailed product description"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
                <CardDescription>Set your product pricing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Price *</label>
                    <Input
                      type="number"
                      step="0.01"
                      {...register('price', { valueAsNumber: true })}
                      placeholder="0.00"
                    />
                    {errors.price && (
                      <p className="text-sm text-red-600 mt-1">{errors.price.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Compare at Price</label>
                    <Input
                      type="number"
                      step="0.01"
                      {...register('compare_at_price', { valueAsNumber: true })}
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Cost per Item</label>
                    <Input
                      type="number"
                      step="0.01"
                      {...register('cost_price', { valueAsNumber: true })}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Inventory */}
            <Card>
              <CardHeader>
                <CardTitle>Inventory & Shipping</CardTitle>
                <CardDescription>Track inventory and shipping details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">SKU</label>
                    <Input
                      {...register('sku')}
                      placeholder="SKU-001"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Barcode</label>
                    <Input
                      {...register('barcode')}
                      placeholder="123456789012"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Weight (kg)</label>
                    <Input
                      type="number"
                      step="0.01"
                      {...register('weight', { valueAsNumber: true })}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product Options */}
            <Card>
              <CardHeader>
                <CardTitle>Product Options</CardTitle>
                <CardDescription>Configure available sizes, colors, and custom sizing options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Custom Sizing Toggle */}
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      {...register('has_custom_sizing')}
                      className="rounded border-neutral-300"
                    />
                    <span className="text-sm font-medium">Enable Custom Sizing</span>
                  </label>
                  {watchedCustomSizing && (
                    <p className="text-xs text-neutral-600 mt-1">
                      Customers can provide their measurements for a perfect fit
                    </p>
                  )}
                </div>

                {/* Available Sizes - always show regardless of custom sizing */}
                <div>
                  <label className="block text-sm font-medium mb-3">
                    Available Sizes
                    {watchedCustomSizing && (
                      <span className="text-xs text-neutral-500 ml-2">(+ Custom sizing available)</span>
                    )}
                  </label>
                      <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                        {AVAILABLE_SIZES.map(size => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => toggleSize(size)}
                            className={`px-3 py-2 text-sm border rounded-md transition-colors ${
                              selectedSizes.includes(size)
                                ? 'bg-black text-white border-black'
                                : 'bg-white text-neutral-700 border-neutral-300 hover:border-neutral-400'
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                      {selectedSizes.length > 0 && (
                        <p className="text-xs text-neutral-600 mt-2">
                          Selected: {selectedSizes.join(', ')}
                        </p>
                      )}
                    </div>

                    {/* Available Colors */}
                    <div>
                      <label className="block text-sm font-medium mb-3">Available Colors</label>
                      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                        {AVAILABLE_COLORS.map(color => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => toggleColor(color)}
                            className={`px-3 py-2 text-sm border rounded-md transition-colors ${
                              selectedColors.includes(color)
                                ? 'bg-black text-white border-black'
                                : 'bg-white text-neutral-700 border-neutral-300 hover:border-neutral-400'
                            }`}
                          >
                            {color}
                          </button>
                        ))}
                      </div>
                      {selectedColors.length > 0 && (
                        <p className="text-xs text-neutral-600 mt-2">
                          Selected: {selectedColors.join(', ')}
                        </p>
                      )}
                    </div>

                    {/* Stock Quantities */}
                    {selectedSizes.length > 0 && selectedColors.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium mb-3">Stock Quantities</label>
                        <div className="bg-neutral-50 p-4 rounded-lg">
                          <div className="grid gap-4">
                            {selectedSizes.map(size => (
                              <div key={size} className="space-y-2">
                                <h4 className="font-medium text-sm">Size: {size}</h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                  {selectedColors.map(color => {
                                    const key = `${size}-${color}`;
                                    return (
                                      <div key={color} className="flex items-center gap-2">
                                        <span className="text-xs text-neutral-600 w-16">{color}:</span>
                                        <Input
                                          type="number"
                                          min="0"
                                          value={stockQuantities[key] || 0}
                                          onChange={(e) => updateStockQuantity(size, color, Number(e.target.value))}
                                          className="w-20 text-sm"
                                          placeholder="0"
                                        />
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
              </CardContent>
            </Card>

            {/* Show variant preview */}
            {selectedSizes.length > 0 && selectedColors.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Generated Variants Preview</CardTitle>
                  <CardDescription>
                    These variants will be created based on your selections
                    {watchedCustomSizing && <span className="text-blue-600"> (+ custom sizing available)</span>}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {generateVariants().map((variant, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 rounded-md">
                        <span className="font-medium">{variant.title}</span>
                        <div className="flex items-center gap-4 text-sm text-neutral-600">
                          <span>SKU: {variant.sku}</span>
                          <span>Stock: {variant.inventory_quantity}</span>
                          <span>Price: ${variant.price}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* SEO */}
            <Card>
              <CardHeader>
                <CardTitle>Search Engine Optimization</CardTitle>
                <CardDescription>Improve your product's search visibility</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Meta Title</label>
                  <Input
                    {...register('meta_title')}
                    placeholder="Product meta title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Meta Description</label>
                  <textarea
                    {...register('meta_description')}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black resize-none"
                    rows={3}
                    placeholder="Product meta description"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle>Product Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <select
                    {...register('status')}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="inactive">Inactive</option>
                    <option value="active">Active</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    {...register('is_featured')}
                    className="rounded border-neutral-300"
                  />
                  <span className="text-sm">Featured product</span>
                </label>

                {/* Custom sizing - disabled until custom sizing fields are added to database */}
                {/*
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    {...register('has_custom_sizing')}
                    className="rounded border-neutral-300"
                  />
                  <span className="text-sm">Custom sizing available</span>
                </label>

                {watchedCustomSizing && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Size Guide URL</label>
                    <Input
                      {...register('size_guide_url')}
                      placeholder="https://example.com/size-guide"
                    />
                    <p className="text-xs text-neutral-500 mt-1">
                      Link to your size guide or measurement instructions
                    </p>
                  </div>
                )}
                */}
              </CardContent>
            </Card>

            {/* Organization */}
            <Card>
              <CardHeader>
                <CardTitle>Product Organization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Category selector - disabled until categories table is created */}
                {/*
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    {...register('category_id')}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                */}

                {/* Vendor and Tags - disabled until added to database */}
                {/*
                <div>
                  <label className="block text-sm font-medium mb-2">Vendor</label>
                  <Input
                    {...register('vendor')}
                    placeholder="Product vendor"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tags</label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Add a tag"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    />
                    <Button type="button" onClick={addTag}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {watchedTags.map((tag, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1 px-2 py-1 bg-neutral-100 rounded text-sm"
                      >
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="text-neutral-500 hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                */}
              </CardContent>
            </Card>

            {/* Media */}
            <Card>
              <CardHeader>
                <CardTitle>Product Media</CardTitle>
                <CardDescription>Add photos of your product (Max 5MB per image)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Image Upload Area */}
                <div 
                  className="border-2 border-dashed border-neutral-200 rounded-lg p-6 hover:border-neutral-300 transition-colors"
                  onDrop={(e) => {
                    if (!isMounted) return;
                    try {
                      e.preventDefault();
                      const files = e.dataTransfer?.files;
                      if (files && files.length > 0) {
                        handleImageUpload(files);
                      }
                    } catch (error) {
                      console.warn('Drop error in upload area:', error);
                    }
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                  }}
                  onDragEnter={(e) => {
                    e.preventDefault();
                  }}
                >
                  <div className="text-center">
                    <Upload className="h-8 w-8 text-neutral-400 mx-auto mb-2" />
                    <p className="text-sm text-neutral-600 mb-2">
                      Drop images here or click to upload
                    </p>
                    <p className="text-xs text-neutral-500 mb-4">
                      Supports JPG, PNG, WebP up to 5MB each
                    </p>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => {
                        if (!isMounted || !e.target.files) return;
                        try {
                          handleImageUpload(e.target.files);
                        } catch (error) {
                          console.warn('File input error:', error);
                        }
                      }}
                      className="hidden"
                      id="image-upload"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => document.getElementById('image-upload')?.click()}
                      disabled={uploadingImages}
                    >
                      {uploadingImages ? 'Uploading...' : 'Choose Files'}
                    </Button>
                  </div>
                </div>

                {/* Image Preview Grid */}
                {images.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">Uploaded Images ({images.length})</h4>
                      <p className="text-xs text-neutral-500">Drag to reorder</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {images.map((image, index) => (
                        <div
                          key={image.id || `${image.url}-${index}`}
                          className="relative group border border-neutral-200 rounded-lg overflow-hidden bg-neutral-50"
                          draggable
                          onDragStart={(e) => {
                            if (!isMounted) return;
                            try {
                              e.dataTransfer.setData('text/plain', index.toString());
                            } catch (error) {
                              console.warn('Drag start error:', error);
                            }
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                          }}
                          onDrop={(e) => {
                            if (!isMounted) return;
                            try {
                              e.preventDefault();
                              const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
                              if (!isNaN(dragIndex) && dragIndex !== index) {
                                reorderImages(dragIndex, index);
                              }
                            } catch (error) {
                              console.warn('Drop error:', error);
                            }
                          }}
                        >
                          <div className="aspect-square">
                            <img
                              src={image.url}
                              alt={image.alt_text}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          
                          {/* Image Controls */}
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                              <Button
                                type="button"
                                size="icon"
                                variant="secondary"
                                className="h-8 w-8"
                                onClick={() => removeImage(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Primary Image Badge */}
                          {index === 0 && (
                            <div className="absolute top-2 left-2">
                              <Badge variant="default" className="text-xs">Primary</Badge>
                            </div>
                          )}

                          {/* Alt Text Input */}
                          <div className="p-2 bg-white border-t">
                            <Input
                              placeholder="Image description"
                              value={image.alt_text || ''}
                              onChange={(e) => {
                                if (!isMounted) return;
                                setImages(prev => prev.map((img, i) => 
                                  i === index ? { ...img, alt_text: e.target.value } : img
                                ));
                              }}
                              className="text-xs h-7"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {images.length > 0 && (
                      <p className="text-xs text-neutral-500">
                        The first image will be used as the primary product image.
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}