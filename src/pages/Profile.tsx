import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { User, LogOut, Package, MapPin, Settings, History, LayoutDashboard } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const Profile = () => {
  const { user, logout, toast, authLoading } = useStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'settings'>('orders');
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  React.useEffect(() => {
    if (user && activeTab === 'orders') {
      const fetchOrders = async () => {
        setOrdersLoading(true);
        const { data } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (data) {
          setOrders(data);
        }
        setOrdersLoading(false);
      };
      fetchOrders();
    }
  }, [user, activeTab]);

  if (authLoading) {
    return <div className="min-h-[70vh] flex items-center justify-center font-bold text-slate-500 uppercase tracking-widest">Loading...</div>;
  }

  if (!user) {
    const handleAuth = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      try {
        if (isLogin) {
          const { error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) throw error;
          toast('Logged in successfully!');
        } else {
          const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName,
              }
            }
          });
          if (error) throw error;
          toast('Account created! You are now logged in.');
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
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 text-slate-900 dark:text-white focus:outline-none focus:border-red-600 transition-colors" />
              </div>
            )}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 text-slate-900 dark:text-white focus:outline-none focus:border-red-600 transition-colors" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 text-slate-900 dark:text-white focus:outline-none focus:border-red-600 transition-colors" />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-red-600 text-white font-bold py-3 text-[11px] uppercase tracking-widest hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Register'}
            </button>
          </form>
          <div className="mt-6 text-center text-[11px] text-slate-500 font-bold uppercase tracking-widest">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
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

  return (
    <div className="bg-slate-50 dark:bg-gray-950 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-8">My Account</h1>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 shrink-0">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm mb-6 flex flex-col items-center">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl font-black text-slate-400 uppercase">{user.name.charAt(0)}</span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-[13px]">{user.name}</h3>
              <p className="text-slate-500 text-[10px] uppercase tracking-widest">{user.email}</p>
            </div>
            
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
              <button 
                onClick={() => setActiveTab('orders')}
                className={`flex items-center gap-3 p-4 text-[11px] font-bold uppercase tracking-widest transition-colors ${activeTab === 'orders' ? 'bg-red-50 text-red-600 dark:bg-slate-800 dark:text-white border-l-4 border-red-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white border-l-4 border-transparent'}`}
              >
                <Package size={16} /> Order History
              </button>
              <button 
                onClick={() => setActiveTab('addresses')}
                className={`flex items-center gap-3 p-4 text-[11px] font-bold uppercase tracking-widest transition-colors ${activeTab === 'addresses' ? 'bg-red-50 text-red-600 dark:bg-slate-800 dark:text-white border-l-4 border-red-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white border-l-4 border-transparent'}`}
              >
                <MapPin size={16} /> Saved Addresses
              </button>
              <button 
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-3 p-4 text-[11px] font-bold uppercase tracking-widest transition-colors ${activeTab === 'settings' ? 'bg-red-50 text-red-600 dark:bg-slate-800 dark:text-white border-l-4 border-red-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white border-l-4 border-transparent'}`}
              >
                <Settings size={16} /> Profile Settings
              </button>
              
              {user.role === 'admin' && (
                <button 
                  onClick={() => navigate('/admin')}
                  className="flex items-center gap-3 p-4 text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-slate-800 dark:hover:text-white border-l-4 border-transparent transition-colors mt-2"
                >
                  <LayoutDashboard size={16} /> Admin Dashboard
                </button>
              )}
              <button 
                onClick={handleLogout}
                className="flex items-center gap-3 p-4 text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-500 border-l-4 border-transparent transition-colors mt-auto border-t border-slate-100 dark:border-slate-800"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 shadow-sm min-h-[500px]">
              {activeTab === 'orders' && (
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-6 flex items-center gap-2">
                    <History size={20} /> Order History
                  </h2>
                  {ordersLoading ? (
                    <div className="py-16 text-center text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                      Loading your orders...
                    </div>
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
                      {orders.map(order => (
                        <div key={order.id} className="border border-slate-200 dark:border-slate-800 p-4">
                          <div className="flex flex-wrap justify-between items-start gap-4 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                            <div>
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Order ID</p>
                              <p className="font-bold text-slate-900 dark:text-white text-[13px]">{order.id.substring(0,8).toUpperCase()}</p>
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
                                'bg-yellow-100 text-yellow-700'
                              }`}>
                                {order.status}
                              </span>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total</p>
                              <p className="font-bold text-red-600 text-[13px]">₦{order.total.toLocaleString()}</p>
                            </div>
                          </div>
                          <button onClick={() => navigate('/track-order')} className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-red-600 transition-colors flex items-center gap-1">
                            Track Order &rarr;
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === 'addresses' && (
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-6">Saved Addresses</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-slate-200 dark:border-slate-700 p-4 relative">
                      <span className="absolute top-4 right-4 bg-red-100 text-red-600 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-widest">Default</span>
                      <h4 className="font-bold text-[13px] text-slate-900 dark:text-white mb-2">{user.name}</h4>
                      <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">
                        123 Main Street<br />
                        Asaba<br />
                        Delta State, Nigeria
                      </p>
                      <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest">
                        <button className="text-slate-500 hover:text-slate-900 dark:hover:text-white">Edit</button>
                        <button className="text-red-600 hover:text-red-700">Delete</button>
                      </div>
                    </div>
                    <button className="border border-dashed border-slate-300 dark:border-slate-700 p-4 flex flex-col items-center justify-center text-slate-400 hover:text-red-600 hover:border-red-600 transition-colors h-full min-h-[160px]">
                      <MapPin size={24} className="mb-2" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Add New Address</span>
                    </button>
                  </div>
                </div>
              )}
              
              {activeTab === 'settings' && (
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-6">Profile Settings</h2>
                  <form className="max-w-md space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Full Name</label>
                      <input type="text" defaultValue={user.name} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 text-slate-900 dark:text-white focus:outline-none focus:border-red-600 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Email Address</label>
                      <input type="email" defaultValue={user.email} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 text-slate-900 dark:text-white focus:outline-none focus:border-red-600 transition-colors" />
                    </div>
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-6">
                      <h3 className="font-bold text-[11px] text-slate-900 dark:text-white uppercase tracking-widest mb-4">Change Password</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Current Password</label>
                          <input type="password" placeholder="••••••••" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 text-slate-900 dark:text-white focus:outline-none focus:border-red-600 transition-colors" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">New Password</label>
                          <input type="password" placeholder="••••••••" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 text-slate-900 dark:text-white focus:outline-none focus:border-red-600 transition-colors" />
                        </div>
                      </div>
                    </div>
                    <button type="button" onClick={() => toast('Profile updated successfully')} className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-3 px-8 text-[11px] uppercase tracking-widest hover:bg-red-600 dark:hover:bg-red-600 hover:text-white transition-colors mt-6">
                      Save Changes
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
