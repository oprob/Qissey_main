'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  AlertCircle,
  Eye,
  Plus,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { adminAnalyticsQueries, adminProductQueries, adminOrderQueries } from '@/lib/admin/database';
import { formatCurrency, formatNumber } from '@/lib/utils';
import Link from 'next/link';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

interface DashboardMetrics {
  revenue: number;
  orders: number;
  customers: number;
  products: number;
  revenueChange?: number;
  ordersChange?: number;
  customersChange?: number;
}

interface RecentActivity {
  orders: any[];
  products: any[];
  users: any[];
}

export function AdminDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    revenue: 0,
    orders: 0,
    customers: 0,
    products: 0
  });
  const [salesData, setSalesData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity>({
    orders: [],
    products: [],
    users: []
  });
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7d');

  useEffect(() => {
    loadDashboardData();
  }, [dateRange]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const dateFrom = getDateFrom(dateRange);
      const dateTo = new Date().toISOString();

      const [metricsData, activityData, lowStockData] = await Promise.all([
        adminAnalyticsQueries.getDashboardMetrics(dateFrom, dateTo),
        adminAnalyticsQueries.getRecentActivity(),
        adminProductQueries.getLowStockProducts(10)
      ]);

      setMetrics(metricsData);
      setRecentActivity(activityData);
      setLowStockProducts(lowStockData.data || []);

      // Mock sales data for now - replace with real data
      setSalesData([
        { name: 'Mon', sales: 4000, orders: 24 },
        { name: 'Tue', sales: 3000, orders: 18 },
        { name: 'Wed', sales: 2000, orders: 12 },
        { name: 'Thu', sales: 2780, orders: 16 },
        { name: 'Fri', sales: 1890, orders: 11 },
        { name: 'Sat', sales: 2390, orders: 14 },
        { name: 'Sun', sales: 3490, orders: 20 }
      ]);

      // Mock top products
      setTopProducts([
        { name: 'Classic Cotton Shirt', sales: 142, revenue: 12758 },
        { name: 'Elegant Blazer', sales: 98, revenue: 19602 },
        { name: 'Designer Handbag', sales: 64, revenue: 19194 },
        { name: 'Premium Jeans', sales: 58, revenue: 7534 },
        { name: 'Silk Evening Dress', sales: 32, revenue: 14400 }
      ]);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDateFrom = (range: string): string => {
    const now = new Date();
    switch (range) {
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
      default:
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    }
  };

  const metricCards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(metrics.revenue),
      change: metrics.revenueChange || 12.5,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Total Orders',
      value: formatNumber(metrics.orders),
      change: metrics.ordersChange || 8.2,
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Total Customers',
      value: formatNumber(metrics.customers),
      change: metrics.customersChange || 5.7,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Active Products',
      value: formatNumber(metrics.products),
      change: 2.1,
      icon: Package,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading admin dashboard...</p>
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
            <div>
              <h1 className="text-2xl font-serif font-semibold">Admin Dashboard</h1>
              <p className="text-neutral-600">Welcome back! Here's what's happening with your store.</p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border border-neutral-200 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
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

      <div className="p-6 space-y-6">
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metricCards.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <motion.div
                key={metric.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-neutral-600 mb-1">{metric.title}</p>
                        <p className="text-2xl font-semibold">{metric.value}</p>
                        <div className="flex items-center mt-2">
                          {metric.change > 0 ? (
                            <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                          )}
                          <span className={`text-sm ${metric.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {Math.abs(metric.change)}%
                          </span>
                          <span className="text-sm text-neutral-500 ml-1">vs last period</span>
                        </div>
                      </div>
                      <div className={`p-3 rounded-full ${metric.bgColor}`}>
                        <Icon className={`h-6 w-6 ${metric.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Sales Overview</CardTitle>
              <CardDescription>Daily sales and order count</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value, name) => [
                    name === 'sales' ? formatCurrency(Number(value)) : value,
                    name === 'sales' ? 'Sales' : 'Orders'
                  ]} />
                  <Line type="monotone" dataKey="sales" stroke="#8884d8" strokeWidth={2} />
                  <Line type="monotone" dataKey="orders" stroke="#82ca9d" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle>Top Products</CardTitle>
              <CardDescription>Best performing products this period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={product.name} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-neutral-600">{product.sales} sold</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(product.revenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Low Stock */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest customer orders</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/orders">
                  <Eye className="h-4 w-4 mr-2" />
                  View All
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.orders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg">
                    <div>
                      <p className="font-medium">{order.order_number}</p>
                      <p className="text-sm text-neutral-600">
                        {order.profiles?.first_name} {order.profiles?.last_name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(order.total_price)}</p>
                      <p className="text-xs text-neutral-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Low Stock Alert */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  Low Stock Alert
                </CardTitle>
                <CardDescription>Products running low on inventory</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/inventory">
                  <Eye className="h-4 w-4 mr-2" />
                  Manage
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lowStockProducts.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div>
                      <p className="font-medium">{item.products?.name}</p>
                      <p className="text-sm text-neutral-600">{item.title}</p>
                    </div>
                    <Badge variant="destructive">
                      {item.inventory_quantity} left
                    </Badge>
                  </div>
                ))}
                {lowStockProducts.length === 0 && (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
                    <p className="text-neutral-600">All products are well stocked!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button variant="outline" className="h-16 flex-col" asChild>
                <Link href="/admin/products/new">
                  <Package className="h-6 w-6 mb-2" />
                  Add Product
                </Link>
              </Button>
              <Button variant="outline" className="h-16 flex-col" asChild>
                <Link href="/admin/orders">
                  <ShoppingCart className="h-6 w-6 mb-2" />
                  View Orders
                </Link>
              </Button>
              <Button variant="outline" className="h-16 flex-col" asChild>
                <Link href="/admin/customers">
                  <Users className="h-6 w-6 mb-2" />
                  Manage Customers
                </Link>
              </Button>
              <Button variant="outline" className="h-16 flex-col" asChild>
                <Link href="/admin/inventory">
                  <AlertCircle className="h-6 w-6 mb-2" />
                  Check Inventory
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}