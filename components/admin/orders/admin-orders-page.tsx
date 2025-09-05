'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  Eye,
  Edit,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { adminOrderQueries } from '@/lib/admin/database';
import { formatCurrency, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Order {
  id: string;
  order_number: string;
  email: string;
  total_price: number;
  order_status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  created_at: string;
  shipping_first_name?: string;
  shipping_last_name?: string;
  shipping_city?: string;
  order_line_items?: {
    id: string;
    product_name: string;
    quantity: number;
    price: number;
  }[];
  profiles?: {
    first_name?: string;
    last_name?: string;
    email: string;
  };
}

const statusConfig = {
  pending: {
    label: 'Pending',
    icon: Clock,
    color: 'bg-yellow-100 text-yellow-800',
    actions: ['process', 'cancel']
  },
  processing: {
    label: 'Processing',
    icon: Package,
    color: 'bg-blue-100 text-blue-800',
    actions: ['ship', 'cancel']
  },
  shipped: {
    label: 'Shipped',
    icon: Truck,
    color: 'bg-purple-100 text-purple-800',
    actions: ['deliver']
  },
  delivered: {
    label: 'Delivered',
    icon: CheckCircle,
    color: 'bg-green-100 text-green-800',
    actions: []
  },
  cancelled: {
    label: 'Cancelled',
    icon: XCircle,
    color: 'bg-red-100 text-red-800',
    actions: []
  }
};

const paymentStatusConfig = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  paid: { label: 'Paid', color: 'bg-green-100 text-green-800' },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-800' },
  refunded: { label: 'Refunded', color: 'bg-purple-100 text-purple-800' }
};

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadOrders();
  }, [currentPage, searchQuery, selectedStatus, dateFilter]);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await adminOrderQueries.getOrders(
        currentPage,
        20,
        {
          status: selectedStatus,
          search: searchQuery,
          dateFrom: dateFilter ? new Date(dateFilter).toISOString() : undefined
        }
      );

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await adminOrderQueries.updateOrderStatus(orderId, newStatus);
      if (error) throw error;

      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, order_status: newStatus as any }
          : order
      ));

      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const getStatusActions = (order: Order) => {
    const config = statusConfig[order.order_status];
    return config.actions.map(action => {
      switch (action) {
        case 'process':
          return {
            label: 'Mark as Processing',
            onClick: () => handleStatusUpdate(order.id, 'processing'),
            variant: 'default' as const
          };
        case 'ship':
          return {
            label: 'Mark as Shipped',
            onClick: () => handleStatusUpdate(order.id, 'shipped'),
            variant: 'default' as const
          };
        case 'deliver':
          return {
            label: 'Mark as Delivered',
            onClick: () => handleStatusUpdate(order.id, 'delivered'),
            variant: 'default' as const
          };
        case 'cancel':
          return {
            label: 'Cancel Order',
            onClick: () => handleStatusUpdate(order.id, 'cancelled'),
            variant: 'destructive' as const
          };
        default:
          return null;
      }
    }).filter(Boolean);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-serif font-semibold">Order Management</h1>
              <p className="text-neutral-600">Track and manage customer orders</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Orders
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
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <Input
                    placeholder="Search by order number, customer email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 border border-neutral-200 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-3 py-2 border border-neutral-200 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="text-left p-4 font-medium">Order</th>
                    <th className="text-left p-4 font-medium">Customer</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-left p-4 font-medium">Payment</th>
                    <th className="text-left p-4 font-medium">Total</th>
                    <th className="text-left p-4 font-medium">Date</th>
                    <th className="text-left p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b border-neutral-100">
                        <td className="p-4">
                          <div className="space-y-1">
                            <div className="w-24 h-4 bg-neutral-200 rounded animate-pulse" />
                            <div className="w-16 h-3 bg-neutral-200 rounded animate-pulse" />
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            <div className="w-32 h-4 bg-neutral-200 rounded animate-pulse" />
                            <div className="w-40 h-3 bg-neutral-200 rounded animate-pulse" />
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="w-16 h-6 bg-neutral-200 rounded animate-pulse" />
                        </td>
                        <td className="p-4">
                          <div className="w-16 h-6 bg-neutral-200 rounded animate-pulse" />
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
                  ) : orders.length > 0 ? (
                    orders.map((order, index) => {
                      const orderStatusConfig = statusConfig[order.order_status];
                      const paymentConfig = paymentStatusConfig[order.payment_status];
                      const StatusIcon = orderStatusConfig.icon;
                      
                      return (
                        <motion.tr
                          key={order.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b border-neutral-100 hover:bg-neutral-50 cursor-pointer"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <td className="p-4">
                            <div>
                              <p className="font-medium text-sm">{order.order_number}</p>
                              <p className="text-xs text-neutral-500">
                                {order.order_line_items?.length || 0} item(s)
                              </p>
                            </div>
                          </td>
                          <td className="p-4">
                            <div>
                              <p className="font-medium text-sm">
                                {order.profiles?.first_name} {order.profiles?.last_name}
                              </p>
                              <p className="text-xs text-neutral-500">{order.email}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge className={orderStatusConfig.color}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {orderStatusConfig.label}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <Badge className={paymentConfig.color}>
                              {paymentConfig.label}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <span className="font-medium">
                              {formatCurrency(order.total_price)}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="text-sm text-neutral-600">
                              {formatDate(order.created_at)}
                            </span>
                          </td>
                          <td className="p-4" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSelectedOrder(order)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {getStatusActions(order).map((action, i) => 
                                action ? (
                                  <Button
                                    key={i}
                                    variant={action.variant}
                                    size="sm"
                                    onClick={action.onClick}
                                    className="text-xs px-2 py-1"
                                  >
                                    {action.label}
                                  </Button>
                                ) : null
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-12 text-center">
                        <Package className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No orders found</h3>
                        <p className="text-neutral-600">
                          {searchQuery || selectedStatus || dateFilter
                            ? 'Try adjusting your search or filters'
                            : 'Orders will appear here as customers make purchases'
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

        {/* Pagination */}
        {orders.length >= 20 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-neutral-600">
              Showing {(currentPage - 1) * 20 + 1} to {Math.min(currentPage * 20, orders.length)} results
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
                disabled={orders.length < 20}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-serif font-semibold">
                  Order {selectedOrder.order_number}
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedOrder(null)}
                >
                  <XCircle className="h-5 w-5" />
                </Button>
              </div>

              {/* Order Status */}
              <div className="mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <Badge className={statusConfig[selectedOrder.order_status].color}>
                    {statusConfig[selectedOrder.order_status].label}
                  </Badge>
                  <Badge className={paymentStatusConfig[selectedOrder.payment_status].color}>
                    {paymentStatusConfig[selectedOrder.payment_status].label}
                  </Badge>
                </div>
                
                {/* Status Actions */}
                <div className="flex gap-2 flex-wrap">
                  {getStatusActions(selectedOrder).map((action, i) => 
                    action ? (
                      <Button
                        key={i}
                        variant={action.variant}
                        size="sm"
                        onClick={() => {
                          action.onClick();
                          setSelectedOrder(null);
                        }}
                      >
                        {action.label}
                      </Button>
                    ) : null
                  )}
                </div>
              </div>

              {/* Customer Info */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Customer Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-neutral-400" />
                    <span>{selectedOrder.email}</span>
                  </div>
                  {selectedOrder.shipping_first_name && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-neutral-400" />
                      <span>
                        {selectedOrder.shipping_first_name} {selectedOrder.shipping_last_name}, {selectedOrder.shipping_city}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Order Items</h3>
                <div className="space-y-3">
                  {selectedOrder.order_line_items?.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-3 border border-neutral-200 rounded-lg">
                      <div>
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-sm text-neutral-600">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(item.price * item.quantity)}</p>
                        <p className="text-sm text-neutral-600">{formatCurrency(item.price)} each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="border-t border-neutral-200 pt-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(selectedOrder.total_price)}</span>
                </div>
                <p className="text-sm text-neutral-600 mt-1">
                  Ordered on {formatDate(selectedOrder.created_at)}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}