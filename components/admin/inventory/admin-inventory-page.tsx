'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  AlertTriangle,
  Package,
  Plus,
  Minus,
  Edit,
  History,
  Download,
  Warehouse,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { adminInventoryQueries } from '@/lib/admin/database';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

interface InventoryItem {
  id: string;
  title: string;
  inventory_quantity: number;
  sku?: string;
  price?: number;
  products?: {
    name: string;
    slug: string;
  } | null;
}

interface InventoryAdjustment {
  variantId: string;
  currentQuantity: number;
  newQuantity: number;
  reason: string;
  notes: string;
}

interface InventoryTransaction {
  id: string;
  quantity_change: number;
  reason: string;
  notes?: string;
  created_at: string;
  profiles?: {
    first_name?: string;
    last_name?: string;
  };
}

const stockLevels = {
  out_of_stock: { label: 'Out of Stock', color: 'bg-red-100 text-red-800', min: 0, max: 0 },
  low_stock: { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-800', min: 1, max: 10 },
  in_stock: { label: 'In Stock', color: 'bg-green-100 text-green-800', min: 11, max: Infinity }
};

const adjustmentReasons = [
  'Damaged',
  'Lost',
  'Found',
  'Restock',
  'Return',
  'Quality Control',
  'Theft',
  'Other'
];

export function AdminInventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [adjustment, setAdjustment] = useState<InventoryAdjustment | null>(null);
  const [history, setHistory] = useState<InventoryTransaction[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);

  useEffect(() => {
    loadInventory();
  }, []);

  useEffect(() => {
    filterInventory();
  }, [inventory, searchQuery, stockFilter]);

  const loadInventory = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await adminInventoryQueries.getInventoryOverview();
      if (error) throw error;

      setInventory((data || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        inventory_quantity: item.inventory_quantity,
        sku: item.sku,
        price: item.price,
        products: Array.isArray(item.products) ? item.products[0] : item.products
      })));
    } catch (error) {
      console.error('Error loading inventory:', error);
      toast.error('Failed to load inventory');
    } finally {
      setIsLoading(false);
    }
  };

  const filterInventory = () => {
    let filtered = [...inventory];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.products?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Stock level filter
    if (stockFilter) {
      const level = stockLevels[stockFilter as keyof typeof stockLevels];
      if (level) {
        filtered = filtered.filter(item => 
          item.inventory_quantity >= level.min && item.inventory_quantity <= level.max
        );
      }
    }

    setFilteredInventory(filtered);
  };

  const getStockLevel = (quantity: number) => {
    if (quantity === 0) return stockLevels.out_of_stock;
    if (quantity <= 10) return stockLevels.low_stock;
    return stockLevels.in_stock;
  };

  const loadInventoryHistory = async (variantId: string) => {
    setIsLoadingHistory(true);
    try {
      const { data, error } = await adminInventoryQueries.getInventoryHistory(variantId);
      if (error) throw error;

      setHistory(data || []);
    } catch (error) {
      console.error('Error loading inventory history:', error);
      toast.error('Failed to load inventory history');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleAdjustment = async () => {
    if (!adjustment) return;

    try {
      await adminInventoryQueries.updateInventory(
        adjustment.variantId,
        adjustment.newQuantity,
        adjustment.reason,
        adjustment.notes
      );

      // Update local state
      setInventory(prev => prev.map(item =>
        item.id === adjustment.variantId
          ? { ...item, inventory_quantity: adjustment.newQuantity }
          : item
      ));

      setShowAdjustmentModal(false);
      setAdjustment(null);
      toast.success('Inventory updated successfully');

      // Reload history if item is selected
      if (selectedItem?.id === adjustment.variantId) {
        loadInventoryHistory(adjustment.variantId);
      }
    } catch (error) {
      console.error('Error updating inventory:', error);
      toast.error('Failed to update inventory');
    }
  };

  const openAdjustmentModal = (item: InventoryItem) => {
    setAdjustment({
      variantId: item.id,
      currentQuantity: item.inventory_quantity,
      newQuantity: item.inventory_quantity,
      reason: 'Restock',
      notes: ''
    });
    setShowAdjustmentModal(true);
  };

  const getTotalInventoryValue = () => {
    return inventory.reduce((sum, item) => {
      const price = item.price || 0;
      return sum + (price * item.inventory_quantity);
    }, 0);
  };

  const getInventoryStats = () => {
    const outOfStock = inventory.filter(item => item.inventory_quantity === 0).length;
    const lowStock = inventory.filter(item => item.inventory_quantity > 0 && item.inventory_quantity <= 10).length;
    const inStock = inventory.filter(item => item.inventory_quantity > 10).length;
    const totalItems = inventory.reduce((sum, item) => sum + item.inventory_quantity, 0);

    return { outOfStock, lowStock, inStock, totalItems };
  };

  const stats = getInventoryStats();

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-serif font-semibold">Inventory Management</h1>
              <p className="text-neutral-600">Track and manage product inventory</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Inventory
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600 mb-1">Total Items</p>
                  <p className="text-2xl font-semibold">{stats.totalItems}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Warehouse className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600 mb-1">Inventory Value</p>
                  <p className="text-2xl font-semibold">{formatCurrency(getTotalInventoryValue())}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600 mb-1">Low Stock</p>
                  <p className="text-2xl font-semibold">{stats.lowStock}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600 mb-1">Out of Stock</p>
                  <p className="text-2xl font-semibold">{stats.outOfStock}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <Input
                    placeholder="Search products, SKUs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <select
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value)}
                  className="px-3 py-2 border border-neutral-200 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="">All Stock Levels</option>
                  <option value="out_of_stock">Out of Stock</option>
                  <option value="low_stock">Low Stock</option>
                  <option value="in_stock">In Stock</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="text-left p-4 font-medium">Product</th>
                    <th className="text-left p-4 font-medium">SKU</th>
                    <th className="text-left p-4 font-medium">Stock Level</th>
                    <th className="text-left p-4 font-medium">Quantity</th>
                    <th className="text-left p-4 font-medium">Value</th>
                    <th className="text-left p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    Array.from({ length: 10 }).map((_, i) => (
                      <tr key={i} className="border-b border-neutral-100">
                        <td className="p-4">
                          <div className="space-y-1">
                            <div className="w-48 h-4 bg-neutral-200 rounded animate-pulse" />
                            <div className="w-32 h-3 bg-neutral-200 rounded animate-pulse" />
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="w-20 h-4 bg-neutral-200 rounded animate-pulse" />
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
                          <div className="w-32 h-8 bg-neutral-200 rounded animate-pulse" />
                        </td>
                      </tr>
                    ))
                  ) : filteredInventory.length > 0 ? (
                    filteredInventory.map((item, index) => {
                      const stockLevel = getStockLevel(item.inventory_quantity);
                      const itemValue = (item.price || 0) * item.inventory_quantity;
                      
                      return (
                        <motion.tr
                          key={item.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b border-neutral-100 hover:bg-neutral-50"
                        >
                          <td className="p-4">
                            <div>
                              <p className="font-medium text-sm">{item.products?.name}</p>
                              <p className="text-xs text-neutral-500">{item.title}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="text-sm text-neutral-600">{item.sku || 'N/A'}</span>
                          </td>
                          <td className="p-4">
                            <Badge className={stockLevel.color}>
                              {stockLevel.label}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <span className="font-medium">{item.inventory_quantity}</span>
                          </td>
                          <td className="p-4">
                            <span className="font-medium">{formatCurrency(itemValue)}</span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openAdjustmentModal(item)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedItem(item);
                                  loadInventoryHistory(item.id);
                                }}
                              >
                                <History className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-12 text-center">
                        <Package className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No inventory found</h3>
                        <p className="text-neutral-600">
                          {searchQuery || stockFilter
                            ? 'Try adjusting your search or filters'
                            : 'Inventory items will appear here'
                          }
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Adjustment Modal */}
      {showAdjustmentModal && adjustment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg max-w-md w-full"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-serif font-semibold">Adjust Inventory</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowAdjustmentModal(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Current Quantity</label>
                  <div className="px-3 py-2 bg-neutral-100 rounded-md text-sm">
                    {adjustment.currentQuantity}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">New Quantity</label>
                  <Input
                    type="number"
                    min="0"
                    value={adjustment.newQuantity}
                    onChange={(e) => setAdjustment(prev => prev ? {
                      ...prev,
                      newQuantity: parseInt(e.target.value) || 0
                    } : null)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Reason</label>
                  <select
                    value={adjustment.reason}
                    onChange={(e) => setAdjustment(prev => prev ? {
                      ...prev,
                      reason: e.target.value
                    } : null)}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    {adjustmentReasons.map(reason => (
                      <option key={reason} value={reason}>{reason}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
                  <textarea
                    value={adjustment.notes}
                    onChange={(e) => setAdjustment(prev => prev ? {
                      ...prev,
                      notes: e.target.value
                    } : null)}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black resize-none"
                    rows={3}
                    placeholder="Additional notes about this adjustment"
                  />
                </div>

                <div className="bg-neutral-50 p-3 rounded-lg">
                  <p className="text-sm font-medium">
                    Change: {adjustment.newQuantity - adjustment.currentQuantity > 0 ? '+' : ''}
                    {adjustment.newQuantity - adjustment.currentQuantity}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowAdjustmentModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAdjustment}
                  className="flex-1"
                  disabled={adjustment.newQuantity === adjustment.currentQuantity}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Update Inventory
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* History Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden"
          >
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-serif font-semibold">Inventory History</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedItem(null)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <p className="text-neutral-600 mt-1">
                {selectedItem.products?.name} - {selectedItem.title}
              </p>
            </div>

            <div className="p-6 overflow-y-auto max-h-96">
              {isLoadingHistory ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                </div>
              ) : history.length > 0 ? (
                <div className="space-y-4">
                  {history.map((transaction) => (
                    <div key={transaction.id} className="flex items-start gap-3 p-3 border border-neutral-200 rounded-lg">
                      <div className={`p-2 rounded-full ${
                        transaction.quantity_change > 0 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {transaction.quantity_change > 0 ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">
                            {transaction.quantity_change > 0 ? '+' : ''}
                            {transaction.quantity_change}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {transaction.reason}
                          </Badge>
                        </div>
                        {transaction.notes && (
                          <p className="text-sm text-neutral-600 mb-1">{transaction.notes}</p>
                        )}
                        <p className="text-xs text-neutral-500">
                          {new Date(transaction.created_at).toLocaleDateString()} at{' '}
                          {new Date(transaction.created_at).toLocaleTimeString()}
                          {transaction.profiles && (
                            <> by {transaction.profiles.first_name} {transaction.profiles.last_name}</>
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <History className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                  <p className="text-neutral-600">No inventory history found</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}