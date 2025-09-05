'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  XCircle, 
  ArrowLeft,
  Calendar,
  Filter,
  Search,
  Eye,
  Download,
  RefreshCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/hooks/use-auth-store';
import { cn } from '@/utils/cn';

// Mock order data
const mockOrders = [
  {
    id: 'ORD-2024-001',
    orderNumber: 'ORD-2024-001',
    date: '2024-01-25',
    status: 'delivered',
    total: 299.99,
    shipping: {
      address: '123 Main St, New York, NY 10001',
      method: 'Standard Shipping'
    },
    items: [
      {
        id: '1',
        name: 'Premium Cotton Blazer',
        image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=200&h=300&fit=crop',
        price: 199.99,
        quantity: 1,
        size: 'M',
        color: 'Navy'
      },
      {
        id: '2',
        name: 'Silk Tie',
        image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=200&h=300&fit=crop',
        price: 59.99,
        quantity: 1,
        size: 'One Size',
        color: 'Navy'
      }
    ],
    tracking: {
      number: 'TRK123456789',
      url: 'https://tracking.example.com/TRK123456789'
    }
  },
  {
    id: 'ORD-2024-002',
    orderNumber: 'ORD-2024-002',
    date: '2024-01-20',
    status: 'shipped',
    total: 159.99,
    shipping: {
      address: '123 Main St, New York, NY 10001',
      method: 'Express Shipping'
    },
    items: [
      {
        id: '3',
        name: 'Classic Cotton Shirt',
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=300&fit=crop',
        price: 89.99,
        quantity: 1,
        size: 'L',
        color: 'White'
      }
    ],
    tracking: {
      number: 'TRK987654321',
      url: 'https://tracking.example.com/TRK987654321'
    }
  },
  {
    id: 'ORD-2024-003',
    orderNumber: 'ORD-2024-003',
    date: '2024-01-15',
    status: 'processing',
    total: 249.99,
    shipping: {
      address: '123 Main St, New York, NY 10001',
      method: 'Standard Shipping'
    },
    items: [
      {
        id: '4',
        name: 'Designer Handbag',
        image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=200&h=300&fit=crop',
        price: 249.99,
        quantity: 1,
        size: 'One Size',
        color: 'Black'
      }
    ]
  },
  {
    id: 'ORD-2024-004',
    orderNumber: 'ORD-2024-004',
    date: '2024-01-10',
    status: 'cancelled',
    total: 89.99,
    shipping: {
      address: '123 Main St, New York, NY 10001',
      method: 'Standard Shipping'
    },
    items: [
      {
        id: '5',
        name: 'Premium Jeans',
        image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=200&h=300&fit=crop',
        price: 89.99,
        quantity: 1,
        size: '32',
        color: 'Dark Blue'
      }
    ]
  }
];

const statusConfig = {
  processing: {
    label: 'Processing',
    icon: Package,
    color: 'bg-yellow-100 text-yellow-800',
    description: 'Your order is being prepared'
  },
  shipped: {
    label: 'Shipped',
    icon: Truck,
    color: 'bg-blue-100 text-blue-800',
    description: 'Your order is on its way'
  },
  delivered: {
    label: 'Delivered',
    icon: CheckCircle,
    color: 'bg-green-100 text-green-800',
    description: 'Your order has been delivered'
  },
  cancelled: {
    label: 'Cancelled',
    icon: XCircle,
    color: 'bg-red-100 text-red-800',
    description: 'This order was cancelled'
  }
};

export function OrderHistoryContent() {
  const [orders] = useState(mockOrders);
  const [filteredOrders, setFilteredOrders] = useState(mockOrders);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<typeof mockOrders[0] | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    let filtered = [...orders];

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.items.some(item => 
          item.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(order => order.status === selectedStatus);
    }

    setFilteredOrders(filtered);
  }, [orders, searchQuery, selectedStatus]);

  const getStatusCount = (status: string) => {
    if (status === 'all') return orders.length;
    return orders.filter(order => order.status === status).length;
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <Package className="h-16 w-16 text-neutral-300 mx-auto mb-6" />
          <h1 className="text-2xl font-serif font-semibold mb-4">
            Sign In to View Orders
          </h1>
          <p className="text-neutral-600 mb-8">
            You need to be signed in to view your order history.
          </p>
          <Button asChild>
            <Link href="/auth/login">Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <section className="bg-white border-b border-neutral-200">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <Link 
                href="/account" 
                className="text-sm text-neutral-600 hover:text-black flex items-center gap-1 mb-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Account
              </Link>
              <h1 className="text-2xl font-serif font-semibold">Order History</h1>
              <p className="text-neutral-600">
                Track and manage all your orders in one place
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <RefreshCcw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Filters and Search */}
        <div className="bg-white border border-neutral-200 rounded-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  type="text"
                  placeholder="Search orders or products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex gap-2 flex-wrap">
              {[
                { key: 'all', label: 'All' },
                { key: 'processing', label: 'Processing' },
                { key: 'shipped', label: 'Shipped' },
                { key: 'delivered', label: 'Delivered' },
                { key: 'cancelled', label: 'Cancelled' }
              ].map(status => (
                <Button
                  key={status.key}
                  variant={selectedStatus === status.key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedStatus(status.key)}
                  className="whitespace-nowrap"
                >
                  {status.label} ({getStatusCount(status.key)})
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length > 0 ? (
          <div className="space-y-6">
            {filteredOrders.map((order, index) => {
              const config = statusConfig[order.status as keyof typeof statusConfig];
              const StatusIcon = config.icon;
              
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white border border-neutral-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Order Header */}
                  <div className="p-6 border-b border-neutral-200">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <StatusIcon className="h-6 w-6 text-neutral-400" />
                        <div>
                          <h3 className="font-semibold text-lg">{order.orderNumber}</h3>
                          <div className="flex items-center gap-4 text-sm text-neutral-600">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(order.date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                            <span>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                            <span>${order.total.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Badge className={cn('font-medium', config.color)}>
                          {config.label}
                        </Badge>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        {order.status === 'shipped' && order.tracking && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={order.tracking.url} target="_blank" rel="noopener noreferrer">
                              <Truck className="h-4 w-4 mr-2" />
                              Track
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="p-6">
                    <div className="flex gap-4 overflow-x-auto">
                      {order.items.slice(0, 4).map((item, itemIndex) => (
                        <div key={item.id} className="flex-shrink-0">
                          <div className="flex items-center gap-3">
                            <div className="w-16 h-16 bg-neutral-100 rounded-md overflow-hidden">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-sm truncate w-32">
                                {item.name}
                              </p>
                              <p className="text-xs text-neutral-600">
                                {item.size} • {item.color}
                              </p>
                              <p className="text-sm font-semibold">
                                ${item.price} × {item.quantity}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                      {order.items.length > 4 && (
                        <div className="flex items-center px-4 text-sm text-neutral-600">
                          +{order.items.length - 4} more item{order.items.length - 4 !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white border border-neutral-200 rounded-lg p-12 text-center">
            <Package className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {searchQuery || selectedStatus !== 'all' ? 'No matching orders' : 'No orders yet'}
            </h3>
            <p className="text-neutral-600 mb-6">
              {searchQuery || selectedStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'You haven\'t placed any orders yet. Start shopping to see your order history.'
              }
            </p>
            {(!searchQuery && selectedStatus === 'all') && (
              <Button asChild>
                <Link href="/collections/new-arrivals">
                  Start Shopping
                </Link>
              </Button>
            )}
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
                  Order {selectedOrder.orderNumber}
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
                <Badge className={cn('font-medium', statusConfig[selectedOrder.status as keyof typeof statusConfig].color)}>
                  {statusConfig[selectedOrder.status as keyof typeof statusConfig].label}
                </Badge>
                <p className="text-sm text-neutral-600 mt-1">
                  {statusConfig[selectedOrder.status as keyof typeof statusConfig].description}
                </p>
              </div>

              {/* Order Items */}
              <div className="space-y-4 mb-6">
                <h3 className="font-semibold">Items Ordered</h3>
                {selectedOrder.items.map(item => (
                  <div key={item.id} className="flex gap-4 p-4 border border-neutral-200 rounded-lg">
                    <div className="w-20 h-20 bg-neutral-100 rounded-md overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-neutral-600">
                        Size: {item.size} • Color: {item.color}
                      </p>
                      <p className="text-sm">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${item.price}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="border-t border-neutral-200 pt-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total</span>
                  <span>${selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Shipping Info */}
              <div className="mt-6 pt-6 border-t border-neutral-200">
                <h3 className="font-semibold mb-3">Shipping Information</h3>
                <p className="text-sm text-neutral-600">
                  {selectedOrder.shipping.address}
                </p>
                <p className="text-sm text-neutral-600">
                  {selectedOrder.shipping.method}
                </p>
                {selectedOrder.tracking && (
                  <div className="mt-3">
                    <p className="text-sm font-medium">
                      Tracking: {selectedOrder.tracking.number}
                    </p>
                    <Button variant="outline" size="sm" className="mt-2" asChild>
                      <a href={selectedOrder.tracking.url} target="_blank" rel="noopener noreferrer">
                        Track Package
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}