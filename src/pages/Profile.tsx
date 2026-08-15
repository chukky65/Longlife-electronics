import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, LayoutDashboard, LogOut, MapPin, Package, Settings, User } from 'lucide-react';
import { usePaystackPayment } from 'react-paystack';
import { useStore } from '../store';
import { supabase } from '../lib/supabase';
import { getSavedAddresses, SavedAddress } from '../lib/customerStorage';
import { formatCurrency } from '../utils';

interface PaystackRetryConfig {
  reference: string;
  email: string;
  amount: number;
  publicKey: string;
  metadata: {
    custom_fields: Array<{
      display_name: string;
      variable_name: string;
      value: string;
    }>;
  };
}

const emptyAddressForm = {
  label: '',
  recipientName: '',
  phone: '',
  address: '',
  city: 'Asaba',
  state: 'Delta',
  isDefault: false,
};

export const Profile = () => {
  const { user, logout, toast, authLoading, passwordRecovery, clearPasswordRecovery } = useStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'settings'>('orders');
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [recoveryPassword, setRecoveryPassword] = useState('');
  const [recoveryPasswordConfirmation, setRecoveryPasswordConfirmation] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [orderItemsLoading, setOrderItemsLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [addressSaving, setAddressSaving] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState(emptyAddressForm);
  const [paystackKey, setPaystackKey] = useState('');
  const [paystackConfig, setPaystackConfig] = useState<PaystackRetryConfig | null>(null);
  const [retryingOrderId, setRetryingOrderId] = useState<string | null>(null);
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    newPassword: '',
  });
  const paymentOpenedRef = useRef(false);

  const mapAddress = (address: any): SavedAddress => ({
    id: address.id,
    label: address.label,
    recipientName: address.recipient_name,
    phone: address.phone,
    address: address.address,
    city: address.city,
    state: address.state,
    isDefault: address.is_default,
  });

  const loadAddresses = async () => {
    if (!user) return;
    setAddressesLoading(true);

    const { data, error } = await supabase
      .from('customer_addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: true });

    if (error) {
      setAddresses(getSavedAddresses(user.id));
      toast('Saved addresses could not be synchronized. Your local copy is still available.', 'error');
      setAddressesLoading(false);
      return;
    }

    if (!data?.length) {
      const localAddresses = getSavedAddresses(user.id);
      if (localAddresses.length) {
        const { data: migrated } = await supabase
          .from('customer_addresses')
          .insert(localAddresses.map((address) => ({
            id: address.id,
            user_id: user.id,
            label: address.label,
            recipient_name: address.recipientName,
            phone: address.phone,
            address: address.address,
            city: address.city,
            state: address.state,
            is_default: address.isDefault,
          })))
          .select('*');

        setAddresses((migrated || []).map(mapAddress));
      } else {
        setAddresses([]);
      }
    } else {
      setAddresses(data.map(mapAddress));
    }

    setAddressesLoading(false);
  };

  const loadOrders = async () => {
    if (!user) return;
    setOrdersLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast(error.message, 'error');
    } else {
      setOrders(data || []);
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
    } else {
      setOrderItems(data || []);
    }
    setOrderItemsLoading(false);
  };

  useEffect(() => {
    if (!user) return;

    setProfileForm({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      newPassword: '',
    });
    loadAddresses();

    const fetchPublicSettings = async () => {
      const { data } = await supabase
        .from('store_settings')
        .select('*')
        .in('id', ['paystack_public_key']);
      const publicKey = data?.find((item) => item.id === 'paystack_public_key');
      if (publicKey?.value) {
        setPaystackKey(publicKey.value);
      }
    };

    fetchPublicSettings();
  }, [user]);

  useEffect(() => {
    if (user && activeTab === 'orders') {
      loadOrders();
    }
  }, [activeTab, user]);

  const initializeRetryPayment = usePaystackPayment(paystackConfig || { publicKey: paystackKey || 'pending' });

  useEffect(() => {
    if (!paystackConfig || !retryingOrderId) return;
    if (paymentOpenedRef.current) return;
    paymentOpenedRef.current = true;

    initializeRetryPayment({
      onSuccess: async () => {
        const { data, error } = await supabase.functions.invoke('verify-payment', {
          body: {
            orderId: paystackConfig.reference,
            email: profileForm.email,
            name: profileForm.name,
          },
        });

        setRetryingOrderId(null);
        setPaystackConfig(null);
        paymentOpenedRef.current = false;

        if (error || data?.error) {
          toast(data?.error || error?.message || 'Payment verification failed. Please try again.', 'error');
          return;
        }

        toast('Payment confirmed. Your order is now processing.');
        await loadOrders();
      },
      onClose: () => {
        setRetryingOrderId(null);
        setPaystackConfig(null);
        paymentOpenedRef.current = false;
        toast('Payment window closed. Your order is still pending in your account.', 'info');
      },
    });
  }, [initializeRetryPayment, paystackConfig, profileForm.email, profileForm.name, retryingOrderId, toast]);

  if (authLoading) {
    return <div className="min-h-[70vh] flex items-center justify-center font-bold text-slate-500 uppercase tracking-widest">Loading...</div>;
  }

  if (user && passwordRecovery) {
    const handleRecoverySubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (recoveryPassword !== recoveryPasswordConfirmation) {
        toast('The passwords do not match.', 'error');
        return;
      }

      setLoading(true);
      const { error } = await supabase.auth.updateUser({ password: recoveryPassword });
      setLoading(false);

      if (error) {
        toast(error.message, 'error');
        return;
      }

      setRecoveryPassword('');
      setRecoveryPasswordConfirmation('');
      clearPasswordRecovery();
      toast('Your password has been updated.');
    };

    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-slate-50 dark:bg-gray-950 p-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 w-full max-w-md shadow-sm">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter text-center mb-2">Choose a New Password</h2>
          <p className="text-sm text-slate-500 text-center mb-6">Use at least 8 characters with uppercase, lowercase, and a number.</p>
          <form className="space-y-4" onSubmit={handleRecoverySubmit}>
            <input
              aria-label="New password"
              type="password"
              value={recoveryPassword}
              onChange={(e) => setRecoveryPassword(e.target.value)}
              required
              minLength={8}
              pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 text-slate-900 dark:text-white focus:outline-none focus:border-red-600"
              placeholder="New password"
            />
            <input
              aria-label="Confirm new password"
              type="password"
              value={recoveryPasswordConfirmation}
              onChange={(e) => setRecoveryPasswordConfirmation(e.target.value)}
              required
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 text-slate-900 dark:text-white focus:outline-none focus:border-red-600"
              placeholder="Confirm new password"
            />
            <button type="submit" disabled={loading} className="w-full bg-red-600 text-white font-bold py-3 text-[11px] uppercase tracking-widest hover:bg-red-700 disabled:opacity-50">
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!user) {
    const handlePasswordResetRequest = async () => {
      if (!email.trim()) {
        toast('Enter your email address first.', 'error');
        return;
      }

      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/profile`,
      });
      setLoading(false);

      if (error) {
        toast(error.message, 'error');
        return;
      }

      toast('If that email is registered, a password reset link has been sent.', 'info');
    };

    const handleAuth = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);

      try {
        if (isLogin) {
          const { error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) throw error;
          toast('Logged in successfully!');
        } else {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName,
              },
            },
          });

          if (error) throw error;

          if (data.user) {
            await supabase.from('profiles').upsert({
              id: data.user.id,
              email,
              name: fullName,
              phone: '',
              role: 'user',
            });
          }

          toast(data.session
            ? 'Account created! You can continue shopping right away.'
            : 'Account created. Check your email to confirm your address before signing in.');
        }
      } catch (error: any) {
        toast(error.message, 'error');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-slate-50 dark:bg-gray-950 p-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 w-full max-w-md shadow-sm">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <User size={32} className="text-slate-400" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter text-center mb-6">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>

          <form className="space-y-4" onSubmit={handleAuth}>
            {!isLogin && (
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Full Name</label>
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 text-slate-900 dark:text-white focus:outline-none focus:border-red-600 transition-colors" />
              </div>
            )}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 text-slate-900 dark:text-white focus:outline-none focus:border-red-600 transition-colors" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={isLogin ? 1 : 8}
                pattern={isLogin ? undefined : '(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}'}
                title={isLogin ? undefined : 'Use at least 8 characters with uppercase, lowercase, and a number.'}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 text-slate-900 dark:text-white focus:outline-none focus:border-red-600 transition-colors"
              />
              {!isLogin && <p className="text-[10px] text-slate-500 mt-1">At least 8 characters with uppercase, lowercase, and a number.</p>}
            </div>
            <button type="submit" disabled={loading} className="w-full bg-red-600 text-white font-bold py-3 text-[11px] uppercase tracking-widest hover:bg-red-700 transition-colors disabled:opacity-50">
              {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Register'}
            </button>
            {isLogin && (
              <button type="button" onClick={handlePasswordResetRequest} disabled={loading} className="w-full text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:text-red-600 disabled:opacity-50">
                Forgot password?
              </button>
            )}
          </form>
          <div className="mt-6 text-center text-[11px] text-slate-500 font-bold uppercase tracking-widest">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => setIsLogin(!isLogin)} className="text-red-600 hover:text-red-700">{isLogin ? 'Register' : 'Sign In'}</button>
          </div>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleRetryPayment = (order: any) => {
    if (!paystackKey) {
      toast('Card payments are not configured yet. Please contact support.', 'error');
      return;
    }

    paymentOpenedRef.current = false;
    setRetryingOrderId(order.id);
    setPaystackConfig({
      reference: order.id,
      email: profileForm.email || user.email,
      amount: Math.round(Number(order.total || 0) * 100),
      publicKey: paystackKey,
      metadata: {
        custom_fields: [
          {
            display_name: 'Customer Name',
            variable_name: 'customer_name',
            value: profileForm.name || user.name,
          },
        ],
      },
    });
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);

    try {
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: user.id,
        name: profileForm.name,
        phone: profileForm.phone,
      });

      if (profileError) throw profileError;

      const authUpdates: Record<string, string> = {};
      if (profileForm.email && profileForm.email !== user.email) {
        authUpdates.email = profileForm.email;
      }
      if (profileForm.newPassword) {
        authUpdates.password = profileForm.newPassword;
      }

      if (Object.keys(authUpdates).length > 0) {
        const { error: authError } = await supabase.auth.updateUser(authUpdates);
        if (authError) throw authError;
      }

      toast('Profile updated successfully.');
      setProfileForm((current) => ({ ...current, newPassword: '' }));
    } catch (error: any) {
      toast(error.message || 'Unable to save your profile.', 'error');
    } finally {
      setProfileSaving(false);
    }
  };

  const resetAddressForm = () => {
    setAddressForm(emptyAddressForm);
    setEditingAddressId(null);
  };

  const handleEditAddress = (address: SavedAddress) => {
    setEditingAddressId(address.id);
    setAddressForm({
      label: address.label,
      recipientName: address.recipientName,
      phone: address.phone,
      address: address.address,
      city: address.city,
      state: address.state,
      isDefault: address.isDefault,
    });
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressSaving(true);
    const addressPayload = {
      user_id: user.id,
      label: addressForm.label,
      recipient_name: addressForm.recipientName,
      phone: addressForm.phone,
      address: addressForm.address,
      city: addressForm.city,
      state: addressForm.state,
      is_default: addressForm.isDefault || addresses.length === 0,
    };

    const query = editingAddressId
      ? supabase.from('customer_addresses').update(addressPayload).eq('id', editingAddressId).eq('user_id', user.id)
      : supabase.from('customer_addresses').insert(addressPayload);
    const { error } = await query;

    if (error) {
      toast(error.message || 'Unable to save this address.', 'error');
    } else {
      toast(editingAddressId ? 'Address updated.' : 'Address saved.');
      resetAddressForm();
      await loadAddresses();
    }
    setAddressSaving(false);
  };

  const handleDeleteAddress = async (addressId: string) => {
    const deletedAddress = addresses.find((address) => address.id === addressId);
    const { error } = await supabase
      .from('customer_addresses')
      .delete()
      .eq('id', addressId)
      .eq('user_id', user.id);

    if (error) {
      toast(error.message || 'Unable to remove this address.', 'error');
      return;
    }

    const remainingAddresses = addresses.filter((address) => address.id !== addressId);
    if (deletedAddress?.isDefault && remainingAddresses.length) {
      await supabase
        .from('customer_addresses')
        .update({ is_default: true })
        .eq('id', remainingAddresses[0].id)
        .eq('user_id', user.id);
    }

    await loadAddresses();
    toast('Address removed.', 'info');

    if (editingAddressId === addressId) {
      resetAddressForm();
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-gray-950 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-8">My Account</h1>

        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-64 shrink-0">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm mb-6 flex flex-col items-center">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl font-black text-slate-400 uppercase">{user.name.charAt(0)}</span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-[13px]">{profileForm.name || user.name}</h3>
              <p className="text-slate-500 text-[10px] uppercase tracking-widest">{profileForm.email || user.email}</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
              <button onClick={() => setActiveTab('orders')} className={`flex items-center gap-3 p-4 text-[11px] font-bold uppercase tracking-widest transition-colors ${activeTab === 'orders' ? 'bg-red-50 text-red-600 dark:bg-slate-800 dark:text-white border-l-4 border-red-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white border-l-4 border-transparent'}`}>
                <Package size={16} /> Order History
              </button>
              <button onClick={() => setActiveTab('addresses')} className={`flex items-center gap-3 p-4 text-[11px] font-bold uppercase tracking-widest transition-colors ${activeTab === 'addresses' ? 'bg-red-50 text-red-600 dark:bg-slate-800 dark:text-white border-l-4 border-red-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white border-l-4 border-transparent'}`}>
                <MapPin size={16} /> Saved Addresses
              </button>
              <button onClick={() => setActiveTab('settings')} className={`flex items-center gap-3 p-4 text-[11px] font-bold uppercase tracking-widest transition-colors ${activeTab === 'settings' ? 'bg-red-50 text-red-600 dark:bg-slate-800 dark:text-white border-l-4 border-red-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white border-l-4 border-transparent'}`}>
                <Settings size={16} /> Profile Settings
              </button>
              {user.role === 'admin' && (
                <button onClick={() => navigate('/admin')} className="flex items-center gap-3 p-4 text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-slate-800 dark:hover:text-white border-l-4 border-transparent transition-colors mt-2">
                  <LayoutDashboard size={16} /> Admin Dashboard
                </button>
              )}
              <button onClick={handleLogout} className="flex items-center gap-3 p-4 text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-500 border-l-4 border-transparent transition-colors mt-auto border-t border-slate-100 dark:border-slate-800">
                <LogOut size={16} /> Logout
              </button>
            </div>
          </div>

          <div className="flex-1">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 shadow-sm min-h-[500px]">
              {activeTab === 'orders' && (
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-6 flex items-center gap-2">
                    <History size={20} /> Order History
                  </h2>
                  {ordersLoading ? (
                    <div className="py-16 text-center text-[11px] font-bold text-slate-500 uppercase tracking-widest">Loading your orders...</div>
                  ) : orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 text-slate-300 dark:text-slate-600 rounded-full flex items-center justify-center mb-4">
                        <Package size={32} />
                      </div>
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4">You haven't placed any orders yet.</p>
                      <button onClick={() => navigate('/products')} className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-3 px-6 text-[10px] uppercase tracking-widest hover:bg-red-600 dark:hover:bg-red-600 hover:text-white transition-colors">
                        Start Shopping
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => {
                        const canRetryPayment = order.payment_method === 'card' && order.status === 'pending';

                        return (
                          <div key={order.id} className="border border-slate-200 dark:border-slate-800 p-4">
                            <div className="flex flex-wrap justify-between items-start gap-4 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                              <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Order ID</p>
                                <p className="font-bold text-slate-900 dark:text-white text-[13px]">{order.id.substring(0, 8).toUpperCase()}</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Date</p>
                                <p className="font-medium text-slate-900 dark:text-white text-[13px]">{new Date(order.created_at).toLocaleDateString()}</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Status</p>
                                <span className={`inline-block px-2 py-1 text-[9px] font-bold uppercase tracking-widest rounded ${
                                  order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                  order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                                  order.status === 'shipped' ? 'bg-purple-100 text-purple-700' :
                                  order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                  'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {order.status}
                                </span>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total</p>
                                <p className="font-bold text-red-600 text-[13px]">{formatCurrency(order.total)}</p>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-4">
                              <button onClick={() => handleViewOrder(order)} className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                                View Details
                              </button>
                              <button onClick={() => navigate(`/tracking?id=${order.id}`)} className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-red-600 transition-colors">
                                Track Order
                              </button>
                              {canRetryPayment && (
                                <button onClick={() => handleRetryPayment(order)} className="text-[10px] font-bold uppercase tracking-widest text-red-600 hover:text-red-700 transition-colors">
                                  Complete Card Payment
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'addresses' && (
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-6">Saved Addresses</h2>
                  <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-8">
                    <div className="space-y-4">
                    {addressesLoading ? (
                      <p className="text-[13px] text-slate-500">Loading saved addresses...</p>
                    ) : addresses.length === 0 ? (
                        <div className="border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center text-slate-500">
                          No saved addresses yet. Add one to speed up checkout.
                        </div>
                      ) : (
                        addresses.map((address) => (
                          <div key={address.id} className="border border-slate-200 dark:border-slate-700 p-4 relative">
                            {address.isDefault && (
                              <span className="absolute top-4 right-4 bg-red-100 text-red-600 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-widest">Default</span>
                            )}
                            <h4 className="font-bold text-[13px] text-slate-900 dark:text-white mb-2">{address.label}</h4>
                            <p className="text-[11px] text-slate-500 mb-2">{address.recipientName} • {address.phone}</p>
                            <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">
                              {address.address}<br />
                              {address.city}<br />
                              {address.state}, Nigeria
                            </p>
                            <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest">
                              <button onClick={() => handleEditAddress(address)} className="text-slate-500 hover:text-slate-900 dark:hover:text-white">Edit</button>
                              <button onClick={() => handleDeleteAddress(address.id)} className="text-red-600 hover:text-red-700">Delete</button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <form onSubmit={handleSaveAddress} className="border border-slate-200 dark:border-slate-700 p-6 space-y-4 h-fit">
                      <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-widest text-[11px]">
                        {editingAddressId ? 'Edit Address' : 'Add New Address'}
                      </h3>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Label</label>
                        <input value={addressForm.label} onChange={(e) => setAddressForm((current) => ({ ...current, label: e.target.value }))} required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 text-slate-900 dark:text-white focus:outline-none focus:border-red-600 transition-colors" placeholder="Home, Office..." />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Recipient Name</label>
                        <input value={addressForm.recipientName} onChange={(e) => setAddressForm((current) => ({ ...current, recipientName: e.target.value }))} required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 text-slate-900 dark:text-white focus:outline-none focus:border-red-600 transition-colors" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Phone</label>
                        <input value={addressForm.phone} onChange={(e) => setAddressForm((current) => ({ ...current, phone: e.target.value }))} required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 text-slate-900 dark:text-white focus:outline-none focus:border-red-600 transition-colors" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Street Address</label>
                        <input value={addressForm.address} onChange={(e) => setAddressForm((current) => ({ ...current, address: e.target.value }))} required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 text-slate-900 dark:text-white focus:outline-none focus:border-red-600 transition-colors" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">City</label>
                          <input value={addressForm.city} onChange={(e) => setAddressForm((current) => ({ ...current, city: e.target.value }))} required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 text-slate-900 dark:text-white focus:outline-none focus:border-red-600 transition-colors" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">State</label>
                          <input value={addressForm.state} onChange={(e) => setAddressForm((current) => ({ ...current, state: e.target.value }))} required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 text-slate-900 dark:text-white focus:outline-none focus:border-red-600 transition-colors" />
                        </div>
                      </div>
                      <label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                        <input type="checkbox" checked={addressForm.isDefault} onChange={(e) => setAddressForm((current) => ({ ...current, isDefault: e.target.checked }))} className="w-4 h-4 text-red-600 focus:ring-red-500 rounded" />
                        Make Default
                      </label>
                      <div className="flex gap-3 pt-2">
                        <button type="submit" disabled={addressSaving} className="bg-red-600 text-white font-bold py-3 px-6 text-[11px] uppercase tracking-widest hover:bg-red-700 transition-colors disabled:opacity-50">
                          {addressSaving ? 'Saving...' : editingAddressId ? 'Update Address' : 'Save Address'}
                        </button>
                        {editingAddressId && (
                          <button type="button" onClick={resetAddressForm} className="border border-slate-200 dark:border-slate-700 text-slate-500 font-bold py-3 px-6 text-[11px] uppercase tracking-widest hover:text-slate-900 dark:hover:text-white transition-colors">
                            Cancel
                          </button>
                        )}
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-6">Profile Settings</h2>
                  <form className="max-w-md space-y-4" onSubmit={handleProfileSave}>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Full Name</label>
                      <input type="text" value={profileForm.name} onChange={(e) => setProfileForm((current) => ({ ...current, name: e.target.value }))} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 text-slate-900 dark:text-white focus:outline-none focus:border-red-600 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Email Address</label>
                      <input type="email" value={profileForm.email} onChange={(e) => setProfileForm((current) => ({ ...current, email: e.target.value }))} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 text-slate-900 dark:text-white focus:outline-none focus:border-red-600 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Phone Number</label>
                      <input type="tel" value={profileForm.phone} onChange={(e) => setProfileForm((current) => ({ ...current, phone: e.target.value }))} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 text-slate-900 dark:text-white focus:outline-none focus:border-red-600 transition-colors" />
                    </div>
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-6">
                      <h3 className="font-bold text-[11px] text-slate-900 dark:text-white uppercase tracking-widest mb-4">Change Password</h3>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">New Password</label>
                        <input type="password" minLength={8} pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}" value={profileForm.newPassword} onChange={(e) => setProfileForm((current) => ({ ...current, newPassword: e.target.value }))} placeholder="Leave blank to keep your current password" title="Use at least 8 characters with uppercase, lowercase, and a number." className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 text-slate-900 dark:text-white focus:outline-none focus:border-red-600 transition-colors" />
                      </div>
                    </div>
                    <button type="submit" disabled={profileSaving} className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-3 px-8 text-[11px] uppercase tracking-widest hover:bg-red-600 dark:hover:bg-red-600 hover:text-white transition-colors mt-6 disabled:opacity-50">
                      {profileSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isOrderModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter">Order Details</h2>
              <button onClick={() => setIsOrderModalOpen(false)} className="text-slate-500 hover:text-slate-900 dark:hover:text-white text-2xl leading-none">&times;</button>
            </div>

            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Order ID</p>
                  <p className="font-bold text-slate-900 dark:text-white text-[13px]">{selectedOrder.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total</p>
                  <p className="font-bold text-red-600 text-[13px]">{formatCurrency(selectedOrder.total)}</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Items</p>
                {orderItemsLoading ? (
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center py-4">Loading items...</p>
                ) : (
                  <div className="space-y-4">
                    {orderItems.map((item: any) => (
                      <div key={item.id} className="flex gap-4 items-center bg-slate-50 dark:bg-slate-800/50 p-4 border border-slate-200 dark:border-slate-700">
                        <img src={item.products?.image || 'https://via.placeholder.com/150'} alt={item.products?.name} className="w-16 h-16 object-cover" />
                        <div className="flex-1">
                          <p className="font-bold text-slate-900 dark:text-white text-[13px] leading-tight mb-1">{item.products?.name || 'Unknown Product'}</p>
                          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-bold text-slate-900 dark:text-white text-[13px]">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
              <button onClick={() => setIsOrderModalOpen(false)} className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-3 px-8 text-[11px] uppercase tracking-widest transition-colors hover:bg-slate-800 dark:hover:bg-slate-200">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
