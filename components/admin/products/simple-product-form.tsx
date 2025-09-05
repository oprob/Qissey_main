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
  Eye,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { adminProductQueries } from '@/lib/admin/database';
import { generateSlug } from '@/lib/utils';
import toast from 'react-hot-toast';
import Link from 'next/link';

// Simplified schema without custom sizing
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
  category_id: z.string().optional(),
  vendor: z.string().optional(),
  tags: z.array(z.string()).default([]),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface Variant {
  id?: string;
  title: string;
  option1?: string;
  option2?: string;
  option3?: string;
  sku?: string;
  price: number;
  compare_at_price?: number;
  cost_price?: number;
  inventory_quantity: number;
  inventory_policy: string;
  requires_shipping: boolean;
  weight?: number;
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

export function SimpleProductForm({ mode, productId }: ProductFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [variants, setVariants] = useState<Variant[]>([{
    title: 'Default Title',
    price: 0,
    inventory_quantity: 0,
    inventory_policy: 'deny',
    requires_shipping: true
  }]);
  const [tagInput, setTagInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(mode === 'edit');
  
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
      tags: []
    }
  });

  const watchedName = watch('name');
  const watchedTags = watch('tags');

  useEffect(() => {
    loadCategories();
    if (mode === 'edit' && productId) {
      loadProduct();
    }
  }, [mode, productId]);

  // Auto-generate slug when name changes
  useEffect(() => {
    if (watchedName && mode === 'create') {
      setValue('slug', generateSlug(watchedName));
    }
  }, [watchedName, mode, setValue]);

  const loadCategories = async () => {
    try {
      // const { data } = await adminCategoryQueries.getCategories(); // Disabled - no categories table
      // setCategories(data || []);  // Disabled
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadProduct = async () => {
    if (!productId) return;
    
    setIsLoadingData(true);
    try {
      const { data: product, error } = await adminProductQueries.getProduct(productId);
      if (error) throw error;

      if (product) {
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
          category_id: product.category_id || '',
          vendor: product.vendor || '',
          tags: product.tags || [],
          meta_title: product.meta_title || '',
          meta_description: product.meta_description || '',
        });

        // Set variants
        if (product.product_variants && product.product_variants.length > 0) {
          setVariants(product.product_variants.map((v: any) => ({
            id: v.id,
            title: v.title,
            option1: v.option1,
            option2: v.option2,
            option3: v.option3,
            sku: v.sku,
            price: Number(v.price || product.price),
            compare_at_price: v.compare_at_price ? Number(v.compare_at_price) : undefined,
            cost_price: v.cost_price ? Number(v.cost_price) : undefined,
            inventory_quantity: v.inventory_quantity,
            inventory_policy: v.inventory_policy,
            requires_shipping: v.requires_shipping,
            weight: v.weight ? Number(v.weight) : undefined,
          })));
        }
      }
    } catch (error) {
      console.error('Error loading product:', error);
      toast.error('Failed to load product');
    } finally {
      setIsLoadingData(false);
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    setIsLoading(true);
    try {
      console.log('Submitting product data:', data);

      if (mode === 'create') {
        const { data: product, error } = await adminProductQueries.createProduct(data);
        if (error) {
          console.error('Database error:', error);
          throw error;
        }
        toast.success('Product created successfully');
        router.push(`/admin/products/${product.id}/edit`);
      } else if (mode === 'edit' && productId) {
        const { error } = await adminProductQueries.updateProduct(productId, data);
        if (error) {
          console.error('Database error:', error);
          throw error;
        }
        toast.success('Product updated successfully');
      }
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast.error(`Failed to save product: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const addVariant = () => {
    setVariants(prev => [...prev, {
      title: `Variant ${prev.length + 1}`,
      price: watch('price') || 0,
      inventory_quantity: 0,
      inventory_policy: 'deny',
      requires_shipping: true
    }]);
  };

  const removeVariant = (index: number) => {
    if (variants.length > 1) {
      setVariants(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateVariant = (index: number, field: keyof Variant, value: any) => {
    setVariants(prev => prev.map((variant, i) => 
      i === index ? { ...variant, [field]: value } : variant
    ));
  };

  const addTag = () => {
    if (tagInput.trim() && !watchedTags.includes(tagInput.trim())) {
      setValue('tags', [...watchedTags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setValue('tags', watchedTags.filter(tag => tag !== tagToRemove));
  };

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading product data...</p>
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
                disabled={isLoading}
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
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
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
              </CardContent>
            </Card>

            {/* Organization */}
            <Card>
              <CardHeader>
                <CardTitle>Product Organization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}