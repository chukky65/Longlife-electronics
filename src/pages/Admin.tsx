import React, { useState, useEffect } from 'react';
import { Package, Users, DollarSign, AlertCircle, ShoppingBag, Truck, LayoutDashboard, Plus, Edit, Trash2, X, Image as ImageIcon, Settings as SettingsIcon, Tag, Home } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useStore } from '../store';
import { Navigate, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Product, Category } from '../types';

const CATEGORIES: Category[] = [
  'Refrigerators', 'LED & Smart TVs', 'Home Theater', 
  'Air Conditioners', 'Washing Machines', 'Water Dispensers', 'Microwaves', 'Small Appliances'
];

export const Admin = () => {
  const navigate = useNavigate();
  const { user, authLoading, toast } = useStore();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'settings' | 'promos'>('dashboard');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    original_price: '',
    category: CATEGORIES[0],
    brand: '',
    in_stock: true,
    is_new: false,
    is_popular: false,
    specs: '{}'
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [orderItemsLoading, setOrderItemsLoading] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  const [paystackKey, setPaystackKey] = useState('');
  const [paystackSecretKey, setPaystackSecretKey] = useState('');
  const [resendApiKey, setResendApiKey] = useState('');
  const [analyticsId, setAnalyticsId] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);

  const [promoCodes, setPromoCodes] = useState<any[]>([]);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoForm, setPromoForm] = useState({ code: '', discount_percent: '', discount_amount: '' });

  const [dashboardData, setDashboardData] = useState({ totalSales: 0, totalOrders: 0, chartData: [] as any[] });

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchDashboardStats();
    } else if (activeTab === 'products') {
      fetchProducts();
    } else if (activeTab === 'settings') {
      fetchSettings();
    } else if (activeTab === 'orders') {
      fetchOrders();
    } else if (activeTab === 'promos') {
      fetchPromos();
    }
  }, [activeTab]);

  const fetchDashboardStats = async () => {
    const { data: ordersData } = await supabase.from('orders').select('total, created_at').neq('status', 'cancelled');
    if (ordersData) {
      const totalSales = ordersData.reduce((sum, o) => sum + Number(o.total), 0);
      const totalOrders = ordersData.length;

      const last7Days = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }).reverse();

      const grouped = ordersData.reduce((acc: any, order) => {
        const date = new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        acc[date] = (acc[date] || 0) + Number(order.total);
        return acc;
      }, {});

      const chartData = last7Days.map(date => ({
        name: date,
        Sales: grouped[date] || 0
      }));

      setDashboardData({ totalSales, totalOrders, chartData });
    }
  };

  const fetchSettings = async () => {
    const { data } = await supabase.from('store_settings').select('*');
    if (data) {
      const publicK = data.find(s => s.id === 'paystack_public_key');
      const secretK = data.find(s => s.id === 'paystack_secret_key');
      const resendK = data.find(s => s.id === 'resend_api_key');
      const analyticsId = data.find(s => s.id === 'analytics_id');
      
      if (publicK) setPaystackKey(publicK.value || '');
      if (secretK) setPaystackSecretKey(secretK.value || '');
      if (resendK) setResendApiKey(resendK.value || '');
      if (analyticsId) setAnalyticsId(analyticsId.value || '');
    }
  };

  const fetchPromos = async () => {
    setPromoLoading(true);
    const { data, error } = await supabase.from('promo_codes').select('*').order('created_at', { ascending: false });
    if (data) setPromoCodes(data);
    setPromoLoading(false);
  };

  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    setPromoLoading(true);
    const { error } = await supabase.from('promo_codes').insert([{
      code: promoForm.code.toUpperCase(),
      discount_percent: promoForm.discount_percent ? parseFloat(promoForm.discount_percent) : null,
      discount_amount: promoForm.discount_amount ? parseFloat(promoForm.discount_amount) : null
    }]);
    if (error) {
      toast(error.message, 'error');
    } else {
      toast('Promo code created');
      setPromoForm({ code: '', discount_percent: '', discount_amount: '' });
      fetchPromos();
    }
    setPromoLoading(false);
  };

  const handleTogglePromo = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from('promo_codes').update({ is_active: !currentStatus }).eq('id', id);
    if (!error) fetchPromos();
  };

  const handleDeletePromo = async (id: string) => {
    if (!confirm('Delete promo code?')) return;
    const { error } = await supabase.from('promo_codes').delete().eq('id', id);
    if (!error) {
      toast('Promo code deleted');
      fetchPromos();
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    const { error } = await supabase.from('store_settings').upsert([
      { id: 'paystack_public_key', value: paystackKey },
      { id: 'paystack_secret_key', value: paystackSecretKey },
      { id: 'resend_api_key', value: resendApiKey },
      { id: 'analytics_id', value: analyticsId }
    ]);
    if (error) {
      toast(error.message, 'error');
    } else {
      toast('Settings saved successfully!');
    }
    setSavingSettings(false);
  };

  const fetchOrders = async () => {
    setOrdersLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      toast(error.message, 'error');
    } else if (data) {
      setOrders(data);
    }
    setOrdersLoading(false);
  };

  const handleViewOrder = async (order: any) => {
    setSelectedOrder(order);
    setIsOrderModalOpen(true);
    setOrderItemsLoading(true);
    
    const { data, error } = await supabase
      .from('order_items')
      .select(`
        *,
        products (
          name,
          image,
          price
        )
      `)
      .eq('order_id', order.id);
      
    if (error) {
      toast(error.message, 'error');
    } else if (data) {
      setOrderItems(data);
    }
    setOrderItemsLoading(false);
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);
      
    if (error) {
      toast(error.message, 'error');
    } else {
      toast(`Order status updated to ${newStatus}`);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (error) {
      toast(error.message, 'error');
    } else if (data) {
      setProducts(data as any);
    }
    setLoading(false);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      toast(error.message, 'error');
    } else {
      toast('Product deleted successfully');
      fetchProducts();
    }
  };

  const handleOpenModal = (product?: any) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price.toString(),
        original_price: product.original_price?.toString() || '',
        category: product.category,
        brand: product.brand,
        in_stock: product.in_stock,
        is_new: product.is_new,
        is_popular: product.is_popular,
        specs: JSON.stringify(product.specs || {})
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        original_price: '',
        category: CATEGORIES[0],
        brand: '',
        in_stock: true,
        is_new: false,
        is_popular: false,
        specs: '{}'
      });
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      let imageUrl = editingProduct?.image || '';

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('products').getPublicUrl(filePath);
        imageUrl = data.publicUrl;
      }

      const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      let parsedSpecs = {};
      try {
        parsedSpecs = JSON.parse(formData.specs);
      } catch (e) {
        parsedSpecs = {};
      }

      const productData = {
        name: formData.name,
        slug: editingProduct ? editingProduct.slug : slug,
        description: formData.description,
        price: parseFloat(formData.price),
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        category: formData.category,
        brand: formData.brand,
        in_stock: formData.in_stock,
        is_new: formData.is_new,
        is_popular: formData.is_popular,
        specs: parsedSpecs,
        image: imageUrl || 'https://via.placeholder.com/400'
      };

      if (editingProduct) {
        const { error } = await supabase.from('products').update(productData).eq('id', editingProduct.id);
        if (error) throw error;
        toast('Product updated successfully');
      } else {
        const { error } = await supabase.from('products').insert([productData]);
        if (error) throw error;
        toast('Product created successfully');
      }

      setIsModalOpen(false);
      fetchProducts();
    } catch (error: any) {
      toast(error.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen">
      <div className="flex h-full min-h-screen">
        {/* Admin Sidebar */}
        <div className="hidden lg:flex flex-col w-64 bg-gray-900 text-gray-300">
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-white font-bold text-xl tracking-tight uppercase">Admin Panel</h2>
            <p className="text-xs text-gray-500 mt-1">Backend Integrated</p>
          </div>
          <nav className="flex-1 py-4">
            <ul className="space-y-1">
              <li>
                <button 
                  onClick={() => setActiveTab('dashboard')}
                  className={`w-full flex items-center gap-3 px-6 py-3 font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-red-600 text-white' : 'hover:bg-gray-800 hover:text-white'}`}
                >
                  <LayoutDashboard size={20} /> Dashboard
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center gap-3 px-6 py-3 font-medium transition-colors ${activeTab === 'orders' ? 'bg-red-600 text-white' : 'hover:bg-gray-800 hover:text-white'}`}
                >
                  <ShoppingBag size={20} /> Orders
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('products')}
                  className={`w-full flex items-center gap-3 px-6 py-3 font-medium transition-colors ${activeTab === 'products' ? 'bg-red-600 text-white' : 'hover:bg-gray-800 hover:text-white'}`}
                >
                  <Package size={20} /> Products
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('promos')}
                  className={`w-full flex items-center gap-3 px-6 py-3 font-medium transition-colors ${activeTab === 'promos' ? 'bg-red-600 text-white' : 'hover:bg-gray-800 hover:text-white'}`}
                >
                  <Tag size={20} /> Promo Codes
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center gap-3 px-6 py-3 font-medium transition-colors ${activeTab === 'settings' ? 'bg-red-600 text-white' : 'hover:bg-gray-800 hover:text-white'}`}
                >
                  <SettingsIcon size={20} /> Settings
                </button>
              </li>
            </ul>
          </nav>
          
          {/* Back to Store Button */}
          <div className="p-4 border-t border-gray-800">
            <button 
              onClick={() => navigate('/')}
              className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg transition-colors tracking-wide text-sm"
            >
              <Home size={18} /> Back to Store
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">{activeTab} Overview</h1>
            
            {/* Mobile Back Button */}
            <button 
              onClick={() => navigate('/')}
              className="lg:hidden flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
            >
              <Home size={16} /> <span className="hidden sm:inline">Back to Store</span>
            </button>
          </div>
          
          {/* Mobile Tabs Navigation */}
          <div className="lg:hidden flex overflow-x-auto gap-2 pb-4 mb-6 border-b border-gray-200 dark:border-gray-800 scrollbar-hide">
            {[
              { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
              { id: 'orders', icon: ShoppingBag, label: 'Orders' },
              { id: 'products', icon: Package, label: 'Products' },
              { id: 'promos', icon: Tag, label: 'Promos' },
              { id: 'settings', icon: SettingsIcon, label: 'Settings' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-colors ${activeTab === tab.id ? 'bg-red-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
              >
                <tab.icon size={14} /> {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'dashboard' && (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div 
                  className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between cursor-pointer hover:border-red-600 transition-colors"
                  onClick={() => setActiveTab('orders')}
                >
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Sales</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">₦{dashboardData.totalSales.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-full flex items-center justify-center">
                    <DollarSign size={24} />
                  </div>
                </div>
                
                <div 
                  className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between cursor-pointer hover:border-red-600 transition-colors"
                  onClick={() => setActiveTab('orders')}
                >
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Orders</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{dashboardData.totalOrders}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-full flex items-center justify-center">
                    <ShoppingBag size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm mb-8">
                <h3 className="font-bold text-gray-900 dark:text-white mb-6">Revenue Over Time (Last 7 Days)</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dashboardData.chartData}>
                      <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₦${value}`} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="Sales" fill="#dc2626" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                <h3 className="font-bold text-gray-900 dark:text-white">Recent Orders</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                      <th className="px-6 py-3 font-medium">Order ID</th>
                      <th className="px-6 py-3 font-medium">Customer</th>
                      <th className="px-6 py-3 font-medium">Date</th>
                      <th className="px-6 py-3 font-medium">Status</th>
                      <th className="px-6 py-3 font-medium">Total</th>
                      <th className="px-6 py-3 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                    {ordersLoading ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading orders...</td>
                      </tr>
                    ) : orders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No orders found.</td>
                      </tr>
                    ) : (
                      orders.map((o: any) => (
                        <tr key={o.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <td className="px-6 py-4 font-mono text-xs text-gray-900 dark:text-white">
                            {o.id.substring(0, 8).toUpperCase()}
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-medium text-gray-900 dark:text-white">{o.profiles?.name || 'Unknown'}</p>
                            <p className="text-xs text-gray-500">{o.payment_method}</p>
                          </td>
                          <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                            {new Date(o.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-widest ${
                              o.status === 'delivered' ? 'bg-green-100 text-green-700' :
                              o.status === 'shipped' ? 'bg-purple-100 text-purple-700' :
                              o.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                              o.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {o.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                            ₦{o.total.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => handleViewOrder(o)}
                              className="text-xs font-bold uppercase tracking-widest text-red-600 hover:text-red-700"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                <h3 className="font-bold text-gray-900 dark:text-white">Product Catalog</h3>
                <button 
                  onClick={() => handleOpenModal()}
                  className="bg-red-600 hover:bg-red-700 text-white text-sm font-bold py-2 px-4 rounded flex items-center gap-2"
                >
                  <Plus size={16} /> Add Product
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                      <th className="px-6 py-3 font-medium">Product</th>
                      <th className="px-6 py-3 font-medium">Category</th>
                      <th className="px-6 py-3 font-medium">Price</th>
                      <th className="px-6 py-3 font-medium">Stock</th>
                      <th className="px-6 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading products...</td>
                      </tr>
                    ) : products.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No products found. Add one above.</td>
                      </tr>
                    ) : (
                      products.map((p: any) => (
                        <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <td className="px-6 py-4 flex items-center gap-3">
                            <img src={p.image} alt="" className="w-10 h-10 object-cover rounded bg-gray-100" />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{p.name}</p>
                              <p className="text-xs text-gray-500">{p.brand}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{p.category}</td>
                          <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">₦{p.price.toLocaleString()}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${p.in_stock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {p.in_stock ? 'In Stock' : 'Out of Stock'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right flex justify-end gap-2">
                            <button onClick={() => handleOpenModal(p)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                              <Edit size={16} />
                            </button>
                            <button onClick={() => handleDeleteProduct(p.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'promos' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden p-6 max-w-3xl">
                <h3 className="font-bold text-gray-900 dark:text-white mb-6">Create New Promo Code</h3>
                <form onSubmit={handleCreatePromo} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Code</label>
                    <input 
                      type="text" required value={promoForm.code} onChange={e => setPromoForm({...promoForm, code: e.target.value})} 
                      placeholder="e.g. WELCOME10" className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2 rounded uppercase focus:outline-none focus:border-red-600" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">% Discount</label>
                    <input 
                      type="number" value={promoForm.discount_percent} onChange={e => setPromoForm({...promoForm, discount_percent: e.target.value})} 
                      placeholder="e.g. 10" className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2 rounded focus:outline-none focus:border-red-600" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Flat Amount (₦)</label>
                    <input 
                      type="number" value={promoForm.discount_amount} onChange={e => setPromoForm({...promoForm, discount_amount: e.target.value})} 
                      placeholder="e.g. 5000" className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2 rounded focus:outline-none focus:border-red-600" 
                    />
                  </div>
                  <div className="md:col-span-3 flex justify-end">
                    <button type="submit" disabled={promoLoading} className="bg-red-600 hover:bg-red-700 text-white text-sm font-bold py-2 px-6 rounded disabled:opacity-50">
                      {promoLoading ? 'Creating...' : 'Create Promo Code'}
                    </button>
                  </div>
                </form>
              </div>

              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                  <h3 className="font-bold text-gray-900 dark:text-white">Active Promo Codes</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                        <th className="px-6 py-3 font-medium">Code</th>
                        <th className="px-6 py-3 font-medium">Discount</th>
                        <th className="px-6 py-3 font-medium">Status</th>
                        <th className="px-6 py-3 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                      {promoLoading && promoCodes.length === 0 ? (
                        <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">Loading promos...</td></tr>
                      ) : promoCodes.length === 0 ? (
                        <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No promo codes found.</td></tr>
                      ) : (
                        promoCodes.map((p: any) => (
                          <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                            <td className="px-6 py-4 font-bold text-gray-900 dark:text-white font-mono">{p.code}</td>
                            <td className="px-6 py-4 font-medium text-red-600">
                              {p.discount_percent ? `${p.discount_percent}% OFF` : `₦${p.discount_amount?.toLocaleString()} OFF`}
                            </td>
                            <td className="px-6 py-4">
                              <button onClick={() => handleTogglePromo(p.id, p.is_active)} className={`px-2 py-1 rounded text-xs font-bold ${p.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'}`}>
                                {p.is_active ? 'Active' : 'Inactive'}
                              </button>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button onClick={() => handleDeletePromo(p.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden p-6 max-w-2xl">
              <h3 className="font-bold text-gray-900 dark:text-white mb-6">Payment Settings</h3>
              <form onSubmit={handleSaveSettings} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Paystack Public Key</label>
                  <input 
                    type="text" 
                    value={paystackKey} 
                    onChange={e => setPaystackKey(e.target.value)} 
                    placeholder="pk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded focus:outline-none focus:border-red-600 font-mono text-sm"
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    This key will be used to initialize the Paystack popup for online card payments during checkout.
                  </p>
                </div>
                
                <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-4 text-sm">Secure Backend Keys</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Paystack Secret Key</label>
                      <input 
                        type="password" 
                        value={paystackSecretKey} 
                        onChange={e => setPaystackSecretKey(e.target.value)} 
                        placeholder="Secret Key (sk_test_... or sk_live_...)"
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded focus:outline-none focus:border-red-600 font-mono text-sm"
                      />
                      <p className="mt-2 text-xs text-gray-500">
                        Kept secret. Used by the backend to securely verify successful payments.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Resend API Key</label>
                      <input 
                        type="password" 
                        value={resendApiKey} 
                        onChange={e => setResendApiKey(e.target.value)} 
                        placeholder="re_xxxxxxxxxxxxxxxxxxxxxxxxxxx"
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded focus:outline-none focus:border-red-600 font-mono text-sm"
                      />
                      <p className="mt-2 text-xs text-gray-500">
                        Used to automatically send email receipts to customers after successful payment.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-4 text-sm">SEO & Analytics</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Google Analytics Tracking ID</label>
                    <input 
                      type="text" 
                      value={analyticsId} 
                      onChange={e => setAnalyticsId(e.target.value)} 
                      placeholder="G-XXXXXXXXXX"
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded focus:outline-none focus:border-red-600 font-mono text-sm"
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      Enter your Google Analytics Measurement ID to track visitors. Leave blank to disable.
                    </p>
                  </div>
                </div>
                <button 
                  type="submit" 
                  disabled={savingSettings}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded disabled:opacity-50"
                >
                  {savingSettings ? 'Saving...' : 'Save Settings'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-2xl max-h-screen overflow-y-auto my-8">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSaveProduct} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-full">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Product Name</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded focus:outline-none focus:border-red-600" />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Price (₦)</label>
                  <input type="number" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded focus:outline-none focus:border-red-600" />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Original Price (optional)</label>
                  <input type="number" value={formData.original_price} onChange={e => setFormData({...formData, original_price: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded focus:outline-none focus:border-red-600" />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Category</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as Category})} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded focus:outline-none focus:border-red-600">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Brand</label>
                  <input type="text" required value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded focus:outline-none focus:border-red-600" />
                </div>
                
                <div className="col-span-full">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Description</label>
                  <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded focus:outline-none focus:border-red-600" />
                </div>

                <div className="col-span-full">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Product Image</label>
                  <div className="flex items-center gap-4">
                    {(imageFile || editingProduct?.image) && (
                      <img 
                        src={imageFile ? URL.createObjectURL(imageFile) : editingProduct?.image} 
                        alt="Preview" 
                        className="w-16 h-16 object-cover rounded border"
                      />
                    )}
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={e => setImageFile(e.target.files?.[0] || null)}
                      className="text-sm"
                    />
                  </div>
                </div>

                <div className="col-span-full">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Specs (JSON format)</label>
                  <textarea rows={2} value={formData.specs} onChange={e => setFormData({...formData, specs: e.target.value})} placeholder='{"Color": "Black", "Weight": "2kg"}' className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded focus:outline-none focus:border-red-600 font-mono text-sm" />
                </div>
                
                <div className="col-span-full flex gap-6 border-t border-gray-200 dark:border-gray-800 pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.in_stock} onChange={e => setFormData({...formData, in_stock: e.target.checked})} className="w-4 h-4 text-red-600 focus:ring-red-500 rounded" />
                    <span className="text-sm font-medium">In Stock</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.is_new} onChange={e => setFormData({...formData, is_new: e.target.checked})} className="w-4 h-4 text-red-600 focus:ring-red-500 rounded" />
                    <span className="text-sm font-medium">Is New</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.is_popular} onChange={e => setFormData({...formData, is_popular: e.target.checked})} className="w-4 h-4 text-red-600 focus:ring-red-500 rounded" />
                    <span className="text-sm font-medium">Is Popular</span>
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 text-sm font-bold text-gray-600 hover:text-gray-900">
                  Cancel
                </button>
                <button type="submit" disabled={uploading} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded disabled:opacity-50 flex items-center gap-2">
                  {uploading ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {isOrderModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-3xl max-h-screen overflow-y-auto my-8">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-800">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Order Details
                </h2>
                <p className="text-sm font-mono text-gray-500 mt-1">ID: {selectedOrder.id}</p>
              </div>
              <button onClick={() => setIsOrderModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Customer Information</h4>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <p className="font-bold text-gray-900 dark:text-white mb-1">{selectedOrder.profiles?.name || 'Unknown User'}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{selectedOrder.profiles?.phone || 'No phone provided'}</p>
                    
                    <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Shipping Address</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedOrder.shipping_address}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Order Status & Payment</h4>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg h-full">
                    <div className="mb-4">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Update Status</label>
                      <select 
                        value={selectedOrder.status}
                        onChange={(e) => handleUpdateOrderStatus(selectedOrder.id, e.target.value)}
                        className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded p-2 text-sm font-medium focus:outline-none focus:border-red-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    
                    <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Payment Method</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-mono capitalize">{selectedOrder.payment_method}</p>
                  </div>
                </div>
              </div>

              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Ordered Items</h4>
              <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-800">
                    <tr>
                      <th className="px-4 py-2 text-xs font-medium text-gray-500">Product</th>
                      <th className="px-4 py-2 text-xs font-medium text-gray-500 text-center">Qty</th>
                      <th className="px-4 py-2 text-xs font-medium text-gray-500 text-right">Price</th>
                      <th className="px-4 py-2 text-xs font-medium text-gray-500 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {orderItemsLoading ? (
                      <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">Loading items...</td></tr>
                    ) : orderItems.length === 0 ? (
                      <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">No items found for this order.</td></tr>
                    ) : (
                      orderItems.map((item: any) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3 flex items-center gap-3">
                            <img src={item.products?.image} alt="" className="w-10 h-10 object-cover rounded bg-gray-100" />
                            <span className="font-medium text-sm text-gray-900 dark:text-white line-clamp-1">{item.products?.name || 'Deleted Product'}</span>
                          </td>
                          <td className="px-4 py-3 text-center text-sm font-medium text-gray-900 dark:text-white">{item.quantity}</td>
                          <td className="px-4 py-3 text-right text-sm text-gray-600 dark:text-gray-400">₦{item.price.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right text-sm font-bold text-gray-900 dark:text-white">₦{(item.price * item.quantity).toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  <tfoot className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-800">
                    <tr>
                      <td colSpan={3} className="px-4 py-3 text-right text-sm font-bold text-gray-900 dark:text-white">Order Total:</td>
                      <td className="px-4 py-3 text-right text-lg font-black text-red-600">₦{selectedOrder.total.toLocaleString()}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 dark:border-gray-800 flex justify-end">
              <button onClick={() => setIsOrderModalOpen(false)} className="bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 font-bold py-2 px-6 rounded transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
