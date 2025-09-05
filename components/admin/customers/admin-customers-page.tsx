'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  Eye,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  ShoppingBag,
  User,
  Shield,
  ShieldCheck,
  Download,
  MoreHorizontal,
  Ban,
  UserCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { adminUserQueries } from '@/lib/admin/database';
import { formatCurrency, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Customer {
  id: string;
  first_name?: string;
  last_name?: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin' | 'super_admin';
  created_at: string;
  avatar_url?: string;
  orders?: { count: number }[];
  totalSpent?: number;
  lastOrderDate?: string;
}

interface CustomerDetail {
  id: string;
  first_name?: string;
  last_name?: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin' | 'super_admin';
  created_at: string;
  avatar_url?: string;
  orders?: {
    id: string;
    order_number: string;
    total_price: number;
    order_status: string;
    created_at: string;
  }[];
  addresses?: {
    id: string;
    first_name: string;
    last_name: string;
    address1: string;
    city: string;
    country: string;
  }[];
  cart_items?: { count: number }[];
  wishlist_items?: { count: number }[];
}

const roleColors = {
  customer: 'bg-green-100 text-green-800',
  admin: 'bg-blue-100 text-blue-800',
  super_admin: 'bg-purple-100 text-purple-800'
};

const roleIcons = {
  customer: User,
  admin: Shield,
  super_admin: ShieldCheck
};

export function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadCustomers();
  }, [currentPage, searchQuery, roleFilter]);

  const loadCustomers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await adminUserQueries.getUsers(
        currentPage,
        20,
        searchQuery
      );

      if (error) throw error;
      
      // Filter by role if specified
      let filteredData = data || [];
      if (roleFilter) {
        filteredData = filteredData.filter(user => user.role === roleFilter);
      }

      setCustomers(filteredData);
    } catch (error) {
      console.error('Error loading customers:', error);
      toast.error('Failed to load customers');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCustomerDetails = async (customerId: string) => {
    setIsLoadingDetails(true);
    try {
      const { data, error } = await adminUserQueries.getUserDetails(customerId);
      if (error) throw error;
      
      setSelectedCustomer(data as CustomerDetail);
    } catch (error) {
      console.error('Error loading customer details:', error);
      toast.error('Failed to load customer details');
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleRoleUpdate = async (customerId: string, newRole: string) => {
    try {
      const { error } = await adminUserQueries.updateUserRole(customerId, newRole);
      if (error) throw error;

      // Update local state
      setCustomers(prev => prev.map(customer => 
        customer.id === customerId 
          ? { ...customer, role: newRole as any }
          : customer
      ));

      if (selectedCustomer?.id === customerId) {
        setSelectedCustomer(prev => prev ? { ...prev, role: newRole as any } : null);
      }

      toast.success(`Customer role updated to ${newRole}`);
    } catch (error) {
      console.error('Error updating customer role:', error);
      toast.error('Failed to update customer role');
    }
  };

  const getCustomerStats = (customer: Customer) => {
    const orderCount = customer.orders?.[0]?.count || 0;
    const totalSpent = customer.totalSpent || 0;
    
    return { orderCount, totalSpent };
  };

  const getFullName = (customer: Customer) => {
    return [customer.first_name, customer.last_name].filter(Boolean).join(' ') || 'No Name';
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-serif font-semibold">Customer Management</h1>
              <p className="text-neutral-600">View and manage customer accounts</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Customers
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
                    placeholder="Search customers by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-2 border border-neutral-200 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="">All Roles</option>
                  <option value="customer">Customers</option>
                  <option value="admin">Admins</option>
                  <option value="super_admin">Super Admins</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customers Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="text-left p-4 font-medium">Customer</th>
                    <th className="text-left p-4 font-medium">Role</th>
                    <th className="text-left p-4 font-medium">Orders</th>
                    <th className="text-left p-4 font-medium">Total Spent</th>
                    <th className="text-left p-4 font-medium">Joined</th>
                    <th className="text-left p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b border-neutral-100">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-neutral-200 rounded-full animate-pulse" />
                            <div className="space-y-1">
                              <div className="w-32 h-4 bg-neutral-200 rounded animate-pulse" />
                              <div className="w-40 h-3 bg-neutral-200 rounded animate-pulse" />
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="w-16 h-6 bg-neutral-200 rounded animate-pulse" />
                        </td>
                        <td className="p-4">
                          <div className="w-8 h-4 bg-neutral-200 rounded animate-pulse" />
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
                  ) : customers.length > 0 ? (
                    customers.map((customer, index) => {
                      const { orderCount, totalSpent } = getCustomerStats(customer);
                      const RoleIcon = roleIcons[customer.role];
                      
                      return (
                        <motion.tr
                          key={customer.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b border-neutral-100 hover:bg-neutral-50 cursor-pointer"
                          onClick={() => loadCustomerDetails(customer.id)}
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center">
                                {customer.avatar_url ? (
                                  <img
                                    src={customer.avatar_url}
                                    alt={getFullName(customer)}
                                    className="w-10 h-10 rounded-full object-cover"
                                  />
                                ) : (
                                  <User className="h-4 w-4 text-neutral-400" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-sm">{getFullName(customer)}</p>
                                <p className="text-xs text-neutral-500">{customer.email}</p>
                                {customer.phone && (
                                  <p className="text-xs text-neutral-500">{customer.phone}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge className={roleColors[customer.role]}>
                              <RoleIcon className="h-3 w-3 mr-1" />
                              {customer.role.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1">
                              <ShoppingBag className="h-4 w-4 text-neutral-400" />
                              <span className="font-medium">{orderCount}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="font-medium">{formatCurrency(totalSpent)}</span>
                          </td>
                          <td className="p-4">
                            <span className="text-sm text-neutral-600">
                              {formatDate(customer.created_at)}
                            </span>
                          </td>
                          <td className="p-4" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => loadCustomerDetails(customer.id)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {customer.role !== 'super_admin' && (
                                <div className="flex gap-1">
                                  {customer.role === 'customer' ? (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleRoleUpdate(customer.id, 'admin')}
                                    >
                                      <Shield className="h-3 w-3 mr-1" />
                                      Make Admin
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleRoleUpdate(customer.id, 'customer')}
                                    >
                                      <User className="h-3 w-3 mr-1" />
                                      Make Customer
                                    </Button>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-12 text-center">
                        <User className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No customers found</h3>
                        <p className="text-neutral-600">
                          {searchQuery || roleFilter
                            ? 'Try adjusting your search or filters'
                            : 'Customers will appear here as they sign up'
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
        {customers.length >= 20 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-neutral-600">
              Showing {(currentPage - 1) * 20 + 1} to {Math.min(currentPage * 20, customers.length)} results
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
                disabled={customers.length < 20}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-serif font-semibold">Customer Details</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedCustomer(null)}
                >
                  <Eye className="h-5 w-5" />
                </Button>
              </div>

              {isLoadingDetails ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Customer Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center">
                            {selectedCustomer.avatar_url ? (
                              <img
                                src={selectedCustomer.avatar_url}
                                alt={getFullName(selectedCustomer as Customer)}
                                className="w-16 h-16 rounded-full object-cover"
                              />
                            ) : (
                              <User className="h-8 w-8 text-neutral-400" />
                            )}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold">{getFullName(selectedCustomer as Customer)}</h3>
                            <Badge className={roleColors[selectedCustomer.role]}>
                              {selectedCustomer.role.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>

                        <div className="space-y-3 text-sm">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-neutral-400" />
                            <span>{selectedCustomer.email}</span>
                          </div>
                          {selectedCustomer.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-neutral-400" />
                              <span>{selectedCustomer.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-neutral-400" />
                            <span>Joined {formatDate(selectedCustomer.created_at)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <h4 className="font-semibold mb-4">Account Summary</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 bg-neutral-50 rounded-lg">
                            <ShoppingBag className="h-6 w-6 text-neutral-400 mx-auto mb-2" />
                            <p className="text-lg font-semibold">{selectedCustomer.orders?.length || 0}</p>
                            <p className="text-xs text-neutral-600">Total Orders</p>
                          </div>
                          <div className="text-center p-3 bg-neutral-50 rounded-lg">
                            <DollarSign className="h-6 w-6 text-neutral-400 mx-auto mb-2" />
                            <p className="text-lg font-semibold">
                              {formatCurrency(selectedCustomer.orders?.reduce((sum, order) => sum + Number(order.total_price), 0) || 0)}
                            </p>
                            <p className="text-xs text-neutral-600">Total Spent</p>
                          </div>
                          <div className="text-center p-3 bg-neutral-50 rounded-lg">
                            <ShoppingBag className="h-6 w-6 text-neutral-400 mx-auto mb-2" />
                            <p className="text-lg font-semibold">{selectedCustomer.cart_items?.[0]?.count || 0}</p>
                            <p className="text-xs text-neutral-600">Cart Items</p>
                          </div>
                          <div className="text-center p-3 bg-neutral-50 rounded-lg">
                            <User className="h-6 w-6 text-neutral-400 mx-auto mb-2" />
                            <p className="text-lg font-semibold">{selectedCustomer.wishlist_items?.[0]?.count || 0}</p>
                            <p className="text-xs text-neutral-600">Wishlist Items</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Addresses */}
                  {selectedCustomer.addresses && selectedCustomer.addresses.length > 0 && (
                    <Card>
                      <CardContent className="p-6">
                        <h4 className="font-semibold mb-4">Addresses</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {selectedCustomer.addresses.map((address) => (
                            <div key={address.id} className="p-4 border border-neutral-200 rounded-lg">
                              <div className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 text-neutral-400 mt-1" />
                                <div className="text-sm">
                                  <p className="font-medium">{address.first_name} {address.last_name}</p>
                                  <p>{address.address1}</p>
                                  <p>{address.city}, {address.country}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Recent Orders */}
                  {selectedCustomer.orders && selectedCustomer.orders.length > 0 && (
                    <Card>
                      <CardContent className="p-6">
                        <h4 className="font-semibold mb-4">Recent Orders</h4>
                        <div className="space-y-3">
                          {selectedCustomer.orders.slice(0, 5).map((order) => (
                            <div key={order.id} className="flex justify-between items-center p-3 border border-neutral-200 rounded-lg">
                              <div>
                                <p className="font-medium">{order.order_number}</p>
                                <p className="text-sm text-neutral-600">
                                  {formatDate(order.created_at)} • {order.order_status}
                                </p>
                              </div>
                              <p className="font-semibold">{formatCurrency(order.total_price)}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t border-neutral-200">
                    {selectedCustomer.role !== 'super_admin' && (
                      <>
                        {selectedCustomer.role === 'customer' ? (
                          <Button
                            onClick={() => {
                              handleRoleUpdate(selectedCustomer.id, 'admin');
                              setSelectedCustomer(prev => prev ? { ...prev, role: 'admin' } : null);
                            }}
                          >
                            <Shield className="h-4 w-4 mr-2" />
                            Make Admin
                          </Button>
                        ) : (
                          <Button
                            onClick={() => {
                              handleRoleUpdate(selectedCustomer.id, 'customer');
                              setSelectedCustomer(prev => prev ? { ...prev, role: 'customer' } : null);
                            }}
                          >
                            <User className="h-4 w-4 mr-2" />
                            Make Customer
                          </Button>
                        )}
                      </>
                    )}
                    <Button variant="outline">
                      <Mail className="h-4 w-4 mr-2" />
                      Send Email
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}