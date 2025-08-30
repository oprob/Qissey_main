'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Package, 
  Heart, 
  MapPin, 
  CreditCard, 
  Settings, 
  LogOut,
  Edit3,
  Plus,
  Star,
  Calendar,
  Truck,
  Save,
  Mail,
  Phone,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/hooks/use-auth-store';
import { useWishlistStore } from '@/hooks/use-wishlist-store';
import { supabase } from '@/lib/supabase';
import { cn } from '@/utils/cn';
import { toast } from 'react-hot-toast';

// Mock data types
interface MockOrder {
  id: string;
  order_number?: string;
  date: string;
  created_at?: string;
  status: string;
  total: number;
  total_price?: number;
  items?: { name: string; image: string; quantity: number; }[];
  order_line_items?: any[];
}

// Mock data - replace with real data
const mockUser = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+1 (555) 123-4567',
  joinDate: '2023-06-15',
  totalOrders: 12,
  totalSpent: 1249.99
};

const mockOrders: MockOrder[] = [
  {
    id: 'ORD-001',
    date: '2024-01-20',
    status: 'delivered',
    total: 159.99,
    items: [
      { name: 'Classic Cotton Shirt', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=300&fit=crop', quantity: 1 }
    ]
  },
  {
    id: 'ORD-002',
    date: '2024-01-15',
    status: 'shipped',
    total: 299.99,
    items: [
      { name: 'Premium Blazer', image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=200&h=300&fit=crop', quantity: 1 }
    ]
  },
  {
    id: 'ORD-003',
    date: '2024-01-10',
    status: 'processing',
    total: 89.99,
    items: [
      { name: 'Silk Scarf', image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=200&h=300&fit=crop', quantity: 1 }
    ]
  }
];

const statusColors = {
  processing: 'bg-yellow-100 text-yellow-800',
  shipped: 'bg-blue-100 text-blue-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};

const statusIcons = {
  processing: Settings,
  shipped: Truck,
  delivered: Package,
  cancelled: Package
};

export function AccountPageContent() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [orders, setOrders] = useState<MockOrder[]>(mockOrders);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    date_of_birth: ''
  });

  const { user, profile, signOut, updateProfile, fetchProfile } = useAuthStore();
  const { items: wishlistItems, fetchWishlist } = useWishlistStore();

  // Initialize profile data when profile is loaded
  useEffect(() => {
    if (profile) {
      setProfileData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone: profile.phone || '',
        date_of_birth: profile.date_of_birth || ''
      });
    }
  }, [profile]);

  // Fetch user data on component mount
  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchWishlist();
      fetchAddresses();
      fetchOrders();
    }
  }, [user, fetchProfile, fetchWishlist]);

  const fetchAddresses = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });

      if (error) throw error;
      setAddresses(data || []);
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const fetchOrders = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_line_items(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      // Keep using mock data if no real orders exist
      if (data && data.length > 0) {
        setOrders(data as MockOrder[]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const result = await updateProfile(profileData);
      
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Profile updated successfully!');
        setIsEditing(false);
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const displayName = profile 
    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || user?.email?.split('@')[0] || 'User'
    : user?.email?.split('@')[0] || 'User';

  const initials = profile
    ? `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}` || user?.email?.[0]?.toUpperCase() || 'U'
    : user?.email?.[0]?.toUpperCase() || 'U';

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'orders', label: 'Orders', icon: Package },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64">
            <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden sticky top-24">
              {/* User Info */}
              <div className="p-6 border-b border-neutral-200">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-xl font-semibold">
                    {initials}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {displayName}
                    </h3>
                    <p className="text-sm text-neutral-600">
                      {user?.email}
                    </p>
                    <p className="text-xs text-neutral-500">
                      Member since {user ? new Date(user.created_at).getFullYear() : new Date().getFullYear()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="p-2">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-3 text-left rounded-md transition-colors',
                        activeTab === tab.id
                          ? 'bg-black text-white'
                          : 'text-neutral-700 hover:bg-neutral-100'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      {tab.label}
                    </button>
                  );
                })}
                <button
                  onClick={signOut}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-md transition-colors text-red-600 hover:bg-red-50 mt-2"
                >
                  <LogOut className="h-5 w-5" />
                  Sign Out
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h1 className="text-2xl font-serif font-semibold">Account Overview</h1>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setActiveTab('settings')}
                      >
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white border border-neutral-200 rounded-lg p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                            <Package className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="text-2xl font-semibold">{orders.length}</p>
                            <p className="text-sm text-neutral-600">Total Orders</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white border border-neutral-200 rounded-lg p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                            <CreditCard className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="text-2xl font-semibold">
                              ${orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}
                            </p>
                            <p className="text-sm text-neutral-600">Total Spent</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white border border-neutral-200 rounded-lg p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                            <Heart className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="text-2xl font-semibold">{wishlistItems.length}</p>
                            <p className="text-sm text-neutral-600">Wishlist Items</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Recent Orders */}
                    <div className="bg-white border border-neutral-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold">Recent Orders</h3>
                        <Button variant="outline" size="sm" asChild>
                          <Link href="#" onClick={() => setActiveTab('orders')}>
                            View All
                          </Link>
                        </Button>
                      </div>
                      <div className="space-y-4">
                        {orders.slice(0, 3).map(order => {
                          const StatusIcon = statusIcons[order.status as keyof typeof statusIcons];
                          return (
                            <div key={order.id} className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                              <div className="flex items-center gap-4">
                                <StatusIcon className="h-5 w-5 text-neutral-400" />
                                <div>
                                  <p className="font-medium">Order {order.order_number || order.id}</p>
                                  <p className="text-sm text-neutral-600">
                                    {new Date(order.created_at || order.date).toLocaleDateString()} • {order.order_line_items?.length || order.items?.length || 0} item(s)
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold">${order.total_price || order.total}</p>
                                <Badge variant="secondary" className={statusColors[order.status as keyof typeof statusColors]}>
                                  {order.status}
                                </Badge>
                              </div>
                            </div>
                          );
                        })}
                        {orders.length === 0 && (
                          <div className="text-center py-8">
                            <Package className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
                            <p className="text-neutral-600">No orders yet</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'orders' && (
                  <div className="space-y-6">
                    <h1 className="text-2xl font-serif font-semibold">Order History</h1>
                    
                    {orders.length > 0 ? (
                      <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
                        {orders.map((order, index) => {
                          const StatusIcon = statusIcons[order.status as keyof typeof statusIcons];
                          return (
                            <div key={order.id} className={cn('p-6', index < orders.length - 1 && 'border-b border-neutral-200')}>
                              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                                <div className="flex items-center gap-4">
                                  <StatusIcon className="h-6 w-6 text-neutral-400" />
                                  <div>
                                    <h3 className="font-semibold text-lg">Order {order.order_number || order.id}</h3>
                                    <p className="text-neutral-600">
                                      Placed on {new Date(order.created_at || order.date).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4">
                                  <Badge variant="secondary" className={statusColors[order.status as keyof typeof statusColors]}>
                                    {order.status}
                                  </Badge>
                                  <Button variant="outline" size="sm">
                                    View Details
                                  </Button>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-4">
                                {/* Show order line items if available, otherwise show mock items */}
                                {order.order_line_items && order.order_line_items.length > 0 ? (
                                  order.order_line_items.map((item: any, itemIndex: number) => (
                                    <div key={itemIndex} className="flex items-center gap-3">
                                      <div className="w-16 h-16 bg-neutral-100 rounded-md flex items-center justify-center">
                                        <Package className="h-6 w-6 text-neutral-400" />
                                      </div>
                                      <div>
                                        <p className="font-medium">{item.product_name}</p>
                                        <p className="text-sm text-neutral-600">Qty: {item.quantity}</p>
                                        {item.variant_title && (
                                          <p className="text-xs text-neutral-500">{item.variant_title}</p>
                                        )}
                                      </div>
                                    </div>
                                  ))
                                ) : order.items ? (
                                  order.items.map((item: any, itemIndex: number) => (
                                    <div key={itemIndex} className="flex items-center gap-3">
                                      <div className="w-16 h-16 bg-neutral-100 rounded-md overflow-hidden">
                                        <img
                                          src={item.image}
                                          alt={item.name}
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                      <div>
                                        <p className="font-medium">{item.name}</p>
                                        <p className="text-sm text-neutral-600">Qty: {item.quantity}</p>
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <div className="flex items-center gap-3">
                                    <div className="w-16 h-16 bg-neutral-100 rounded-md flex items-center justify-center">
                                      <Package className="h-6 w-6 text-neutral-400" />
                                    </div>
                                    <div>
                                      <p className="font-medium">Order Items</p>
                                      <p className="text-sm text-neutral-600">Multiple items</p>
                                    </div>
                                  </div>
                                )}
                                <div className="ml-auto">
                                  <p className="text-lg font-semibold">${order.total_price || order.total}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="bg-white border border-neutral-200 rounded-lg p-12 text-center">
                        <Package className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
                        <p className="text-neutral-600 mb-6">
                          You haven't placed any orders yet. Start shopping to see your order history.
                        </p>
                        <Button asChild>
                          <Link href="/collections/new-arrivals">
                            Start Shopping
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'wishlist' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h1 className="text-2xl font-serif font-semibold">My Wishlist</h1>
                      {wishlistItems.length > 0 && (
                        <Button variant="outline" size="sm">
                          Share Wishlist
                        </Button>
                      )}
                    </div>
                    
                    {wishlistItems.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {wishlistItems.map((item) => (
                          <div key={item.id} className="bg-white border border-neutral-200 rounded-lg overflow-hidden group hover:shadow-md transition-shadow">
                            <div className="aspect-square bg-neutral-100 relative overflow-hidden">
                              {item.products?.product_images?.[0]?.url ? (
                                <img
                                  src={item.products.product_images[0].url}
                                  alt={item.products.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="h-12 w-12 text-neutral-400" />
                                </div>
                              )}
                              <button
                                onClick={() => item.products && useWishlistStore.getState().toggleWishlistItem(item.products.id)}
                                className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                              >
                                <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                              </button>
                            </div>
                            <div className="p-4">
                              <Link href={`/products/${item.products?.slug}`}>
                                <h3 className="font-medium mb-2 hover:text-neutral-600 transition-colors">
                                  {item.products?.name}
                                </h3>
                              </Link>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg font-semibold">
                                    ${item.products?.price}
                                  </span>
                                  {item.products?.compare_at_price && item.products.compare_at_price > item.products.price && (
                                    <span className="text-sm text-neutral-500 line-through">
                                      ${item.products.compare_at_price}
                                    </span>
                                  )}
                                </div>
                                <Button size="sm" variant="outline">
                                  Add to Cart
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Heart className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Your wishlist is empty</h3>
                        <p className="text-neutral-600 mb-6">
                          Save your favorite items to keep track of them.
                        </p>
                        <Button asChild>
                          <Link href="/collections/new-arrivals">
                            Start Shopping
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'addresses' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h1 className="text-2xl font-serif font-semibold">Addresses</h1>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Address
                      </Button>
                    </div>
                    
                    {addresses.length > 0 ? (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {addresses.map((address) => (
                          <div key={address.id} className="bg-white border border-neutral-200 rounded-lg p-6 relative">
                            {address.is_default && (
                              <Badge className="absolute top-4 right-4" variant="secondary">
                                Default
                              </Badge>
                            )}
                            <div className="flex items-start gap-3 mb-4">
                              <MapPin className="h-5 w-5 text-neutral-400 mt-1" />
                              <div className="flex-1">
                                <h3 className="font-semibold mb-1">
                                  {address.first_name} {address.last_name}
                                </h3>
                                {address.company && (
                                  <p className="text-sm text-neutral-600 mb-2">{address.company}</p>
                                )}
                                <p className="text-sm text-neutral-600">
                                  {address.address1}
                                  {address.address2 && <>, {address.address2}</>}
                                </p>
                                <p className="text-sm text-neutral-600">
                                  {address.city}, {address.province} {address.postal_code}
                                </p>
                                <p className="text-sm text-neutral-600">{address.country}</p>
                                {address.phone && (
                                  <p className="text-sm text-neutral-600 mt-2">
                                    <Phone className="h-4 w-4 inline mr-1" />
                                    {address.phone}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <Edit3 className="h-4 w-4 mr-2" />
                                Edit
                              </Button>
                              {!address.is_default && (
                                <Button variant="outline" size="sm">
                                  Set as Default
                                </Button>
                              )}
                              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                Delete
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <MapPin className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No addresses saved</h3>
                        <p className="text-neutral-600 mb-6">
                          Add a shipping address to make checkout faster.
                        </p>
                        <Button>
                          Add Address
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'payment' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h1 className="text-2xl font-serif font-semibold">Payment Methods</h1>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Payment Method
                      </Button>
                    </div>
                    
                    <div className="text-center py-12">
                      <CreditCard className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">No payment methods saved</h3>
                      <p className="text-neutral-600 mb-6">
                        Add a payment method for faster checkout.
                      </p>
                      <Button>
                        Add Payment Method
                      </Button>
                    </div>
                  </div>
                )}

                {activeTab === 'settings' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h1 className="text-2xl font-serif font-semibold">Account Settings</h1>
                      {!isEditing && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setIsEditing(true)}
                        >
                          <Edit3 className="h-4 w-4 mr-2" />
                          Edit Profile
                        </Button>
                      )}
                    </div>
                    
                    <div className="bg-white border border-neutral-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Personal Information</h3>
                        {isEditing && (
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setIsEditing(false);
                                setProfileData({
                                  first_name: profile?.first_name || '',
                                  last_name: profile?.last_name || '',
                                  phone: profile?.phone || '',
                                  date_of_birth: profile?.date_of_birth || ''
                                });
                              }}
                              disabled={isSaving}
                            >
                              Cancel
                            </Button>
                            <Button 
                              size="sm"
                              onClick={handleSaveProfile}
                              disabled={isSaving}
                            >
                              {isSaving ? (
                                <>
                                  <Settings className="h-4 w-4 mr-2 animate-spin" />
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <Save className="h-4 w-4 mr-2" />
                                  Save Changes
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">First Name</label>
                          <Input
                            type="text"
                            value={profileData.first_name}
                            onChange={(e) => setProfileData(prev => ({ ...prev, first_name: e.target.value }))}
                            placeholder="Enter first name"
                            readOnly={!isEditing}
                            className={cn(!isEditing && 'bg-neutral-50')}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Last Name</label>
                          <Input
                            type="text"
                            value={profileData.last_name}
                            onChange={(e) => setProfileData(prev => ({ ...prev, last_name: e.target.value }))}
                            placeholder="Enter last name"
                            readOnly={!isEditing}
                            className={cn(!isEditing && 'bg-neutral-50')}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Email
                            <span className="text-xs text-neutral-500 ml-2">(Cannot be changed)</span>
                          </label>
                          <div className="relative">
                            <Input
                              type="email"
                              value={user?.email || ''}
                              className="bg-neutral-50 pl-10"
                              readOnly
                            />
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Phone</label>
                          <div className="relative">
                            <Input
                              type="tel"
                              value={profileData.phone}
                              onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                              placeholder="Enter phone number"
                              className={cn(!isEditing && 'bg-neutral-50', 'pl-10')}
                              readOnly={!isEditing}
                            />
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                          </div>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium mb-2">Date of Birth</label>
                          <Input
                            type="date"
                            value={profileData.date_of_birth}
                            onChange={(e) => setProfileData(prev => ({ ...prev, date_of_birth: e.target.value }))}
                            className={cn(!isEditing && 'bg-neutral-50')}
                            readOnly={!isEditing}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-neutral-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-4">Email Preferences</h3>
                      <div className="space-y-4">
                        <label className="flex items-center">
                          <input type="checkbox" defaultChecked className="rounded border-neutral-300 text-black focus:ring-black" />
                          <span className="ml-3">Marketing emails</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" defaultChecked className="rounded border-neutral-300 text-black focus:ring-black" />
                          <span className="ml-3">Order updates</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="rounded border-neutral-300 text-black focus:ring-black" />
                          <span className="ml-3">Product recommendations</span>
                        </label>
                      </div>
                    </div>

                    <div className="bg-white border border-neutral-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Password & Security
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Current Password</label>
                          <Input
                            type="password"
                            placeholder="Enter current password"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">New Password</label>
                          <Input
                            type="password"
                            placeholder="Enter new password"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                          <Input
                            type="password"
                            placeholder="Confirm new password"
                          />
                        </div>
                        <Button>
                          Update Password
                        </Button>
                      </div>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-red-800 mb-4">Danger Zone</h3>
                      <p className="text-red-700 mb-4">
                        Once you delete your account, there is no going back. Please be certain.
                      </p>
                      <Button variant="destructive">
                        Delete Account
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}