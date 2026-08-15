import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Clock, PackageSearch, Truck, UserCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useStore } from '../store';

export const OrderTracking = () => {
  const { user, authLoading } = useStore();
  const [searchParams] = useSearchParams();
  const initialId = searchParams.get('id') || '';
  const [orderId, setOrderId] = useState(initialId);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim() || !user) return;

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId.trim())
        .eq('user_id', user.id)
        .single();

      if (fetchError || !data) {
        throw new Error('Order not found in your account. Please check the ID and try again.');
      }

      setOrder(data);
    } catch (err: any) {
      setError(err.message || 'Order not found.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialId && user) {
      handleTrack({ preventDefault: () => {} } as React.FormEvent);
    }
  }, [initialId, user]);

  if (authLoading) {
    return <div className="min-h-[70vh] flex items-center justify-center font-bold text-slate-500 uppercase tracking-widest">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="bg-gray-50 dark:bg-gray-950 min-h-screen py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 md:p-12 shadow-sm text-center">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <UserCircle size={40} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-4">Sign In To Track Orders</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-lg mx-auto">
              Order tracking is linked to your customer account so only you can view your order timeline and payment status.
            </p>
            <Link to="/profile" className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 px-6 rounded-lg transition-colors">
              Log In <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 md:p-12 shadow-sm text-center">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <PackageSearch size={40} />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-4">Track Your Order</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-lg mx-auto">
            Enter an order ID from your account to check the current status of delivery and payment progress.
          </p>

          <form className="max-w-md mx-auto mb-10" onSubmit={handleTrack}>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-3.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Tracking...' : <><span className="hidden sm:inline">Track</span> <ArrowRight size={18} /></>}
              </button>
            </div>
          </form>

          {error && (
            <div className="text-red-600 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-sm font-medium mb-6">
              {error}
            </div>
          )}

          {order && (
            <div className="text-left bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Order #{order.id.substring(0, 8).toUpperCase()}</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white capitalize">Status: {order.status}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 capitalize mt-1">Payment Method: {order.payment_method.replace(/_/g, ' ')}</p>
                </div>
                <div className="w-12 h-12 bg-white dark:bg-gray-700 rounded-full shadow-sm flex items-center justify-center text-red-600">
                  {order.status === 'delivered' ? <CheckCircle2 size={24} /> : order.status === 'processing' || order.status === 'shipped' ? <Truck size={24} /> : <Clock size={24} />}
                </div>
              </div>

              <div className="relative border-l-2 border-red-600 ml-4 space-y-8 pb-4">
                {order.status === 'delivered' && (
                  <div className="relative pl-6">
                    <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-red-600 border-2 border-white dark:border-gray-800"></div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">Delivered</h4>
                  </div>
                )}
                {(order.status === 'shipped' || order.status === 'delivered') && (
                  <div className="relative pl-6">
                    <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-red-600 border-2 border-white dark:border-gray-800"></div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">Out for Delivery / Shipped</h4>
                  </div>
                )}
                {(order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered') && (
                  <div className="relative pl-6">
                    <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-red-600 border-2 border-white dark:border-gray-800"></div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">Payment Confirmed / Order Processing</h4>
                  </div>
                )}
                <div className="relative pl-6">
                  <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-red-600 border-2 border-white dark:border-gray-800"></div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm">Order Received</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{new Date(order.created_at).toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
