'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Package,
  DollarSign,
  TrendingUp,
  TrendingDown,
  MoreHorizontal,
  Download,
  Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { adminProductQueries } from '@/lib/admin/database';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compare_at_price?: number;
  status: 'active' | 'draft' | 'archived';
  is_featured: boolean;
  created_at: string;
  categories?: { name: string; slug: string };
  product_images?: { url: string; alt_text?: string }[];
  product_variants?: {
    id: string;
    inventory_quantity: number;
    price: number;
  }[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

const statusColors = {
  active: 'bg-green-100 text-green-800',
  draft: 'bg-yellow-100 text-yellow-800',
  archived: 'bg-red-100 text-red-800'
};

export function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, [currentPage, searchQuery, selectedCategory, selectedStatus]);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await adminProductQueries.getProducts(
        currentPage,
        20,
        {
          search: searchQuery,
          category: selectedCategory,
          status: selectedStatus
        }
      );

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      // const { data } = await adminCategoryQueries.getCategories(); // Disabled - no categories table
      // setCategories(data || []); // Disabled
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await adminProductQueries.deleteProduct(productId);
      if (error) throw error;

      setProducts(prev => prev.filter(p => p.id !== productId));
      toast.success('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const handleBulkStatusUpdate = async (status: string) => {
    if (selectedProducts.length === 0) return;

    try {
      const { error } = await adminProductQueries.bulkUpdateStatus(selectedProducts, status);
      if (error) throw error;

      // Update local state
      setProducts(prev => prev.map(p => 
        selectedProducts.includes(p.id) ? { ...p, status: status as any } : p
      ));
      setSelectedProducts([]);
      toast.success(`Updated ${selectedProducts.length} products`);
    } catch (error) {
      console.error('Error updating products:', error);
      toast.error('Failed to update products');
    }
  };

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const selectAllProducts = () => {
    setSelectedProducts(
      selectedProducts.length === products.length 
        ? [] 
        : products.map(p => p.id)
    );
  };

  const getTotalInventory = (product: Product) => {
    return product.product_variants?.reduce((sum, variant) => sum + variant.inventory_quantity, 0) || 0;
  };

  const getLowestPrice = (product: Product) => {
    if (!product.product_variants?.length) return product.price;
    return Math.min(...product.product_variants.map(v => v.price));
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-serif font-semibold">Product Management</h1>
              <p className="text-neutral-600">Manage your product catalog</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
              <Button asChild>
                <Link href="/admin/products/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-3">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-neutral-200 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 border border-neutral-200 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>

                <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedProducts.length > 0 && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600">
                  {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} selected
                </span>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleBulkStatusUpdate('active')}>
                    Make Active
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleBulkStatusUpdate('draft')}>
                    Make Draft
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleBulkStatusUpdate('archived')}>
                    Archive
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Products Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="text-left p-4">
                      <input
                        type="checkbox"
                        checked={selectedProducts.length === products.length && products.length > 0}
                        onChange={selectAllProducts}
                        className="rounded border-neutral-300"
                      />
                    </th>
                    <th className="text-left p-4 font-medium">Product</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-left p-4 font-medium">Inventory</th>
                    <th className="text-left p-4 font-medium">Price</th>
                    <th className="text-left p-4 font-medium">Category</th>
                    <th className="text-left p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b border-neutral-100">
                        <td className="p-4">
                          <div className="w-4 h-4 bg-neutral-200 rounded animate-pulse" />
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-neutral-200 rounded animate-pulse" />
                            <div className="space-y-1">
                              <div className="w-32 h-4 bg-neutral-200 rounded animate-pulse" />
                              <div className="w-20 h-3 bg-neutral-200 rounded animate-pulse" />
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="w-16 h-6 bg-neutral-200 rounded animate-pulse" />
                        </td>
                        <td className="p-4">
                          <div className="w-12 h-4 bg-neutral-200 rounded animate-pulse" />
                        </td>
                        <td className="p-4">
                          <div className="w-16 h-4 bg-neutral-200 rounded animate-pulse" />
                        </td>
                        <td className="p-4">
                          <div className="w-20 h-4 bg-neutral-200 rounded animate-pulse" />
                        </td>
                        <td className="p-4">
                          <div className="w-24 h-8 bg-neutral-200 rounded animate-pulse" />
                        </td>
                      </tr>
                    ))
                  ) : products.length > 0 ? (
                    products.map((product, index) => (
                      <motion.tr
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-neutral-100 hover:bg-neutral-50"
                      >
                        <td className="p-4">
                          <input
                            type="checkbox"
                            checked={selectedProducts.includes(product.id)}
                            onChange={() => toggleProductSelection(product.id)}
                            className="rounded border-neutral-300"
                          />
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-neutral-100 rounded overflow-hidden">
                              {product.product_images?.[0] ? (
                                <img
                                  src={product.product_images[0].url}
                                  alt={product.product_images[0].alt_text || product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="h-4 w-4 text-neutral-400" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{product.name}</p>
                              <p className="text-xs text-neutral-500">{product.slug}</p>
                              {product.is_featured && (
                                <Badge variant="secondary" className="mt-1 text-xs">Featured</Badge>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge className={statusColors[product.status]}>
                            {product.status}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <span className="text-sm font-medium">
                            {getTotalInventory(product)}
                          </span>
                        </td>
                        <td className="p-4">
                          <div>
                            <span className="font-medium">
                              {formatCurrency(getLowestPrice(product))}
                            </span>
                            {product.compare_at_price && product.compare_at_price > product.price && (
                              <div className="text-xs text-neutral-500 line-through">
                                {formatCurrency(product.compare_at_price)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-sm text-neutral-600">
                            {product.categories?.name || 'Uncategorized'}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" asChild>
                              <Link href={`/products/${product.slug}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button variant="ghost" size="icon" asChild>
                              <Link href={`/admin/products/${product.id}/edit`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-12 text-center">
                        <Package className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No products found</h3>
                        <p className="text-neutral-600 mb-6">
                          {searchQuery || selectedCategory || selectedStatus
                            ? 'Try adjusting your search or filters'
                            : 'Get started by adding your first product'
                          }
                        </p>
                        <Button asChild>
                          <Link href="/admin/products/new">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Product
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Pagination */}
        {products.length >= 20 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-neutral-600">
              Showing {(currentPage - 1) * 20 + 1} to {Math.min(currentPage * 20, products.length)} results
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={products.length < 20}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}