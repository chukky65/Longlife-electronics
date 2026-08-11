import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store';
import { formatCurrency } from '../utils';
import { CheckCircle2, UserCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { usePaystackPayment } from 'react-paystack';

export const Checkout = () => {
  const { cart, cartTotal, clearCart, toast, user } = useStore();
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: 'Asaba',
    state: 'Delta',
    paymentMethod: 'pay_on_delivery'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [paystackKey, setPaystackKey] = useState('');
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<any>(null);
  const [promoLoading, setPromoLoading] = useState(false);

  let discountAmount = 0;
  if (appliedPromo) {
    if (appliedPromo.discount_percent) {
      discountAmount = cartTotal * (appliedPromo.discount_percent / 100);
    } else if (appliedPromo.discount_amount) {
      discountAmount = appliedPromo.discount_amount;
    }
  }
  const finalTotal = Math.max(0, cartTotal - discountAmount);

  React.useEffect(() => {
    const fetchKey = async () => {
      const { data } = await supabase.from('store_settings').select('*').eq('id', 'paystack_public_key').single();
      if (data) setPaystackKey(data.value || '');
    };
    fetchKey();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Valid email is required';
    if (!formData.phone.trim() || formData.phone.length < 10) newErrors.phone = 'Valid phone number is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [loading, setLoading] = useState(false);

  const handleApplyPromo = async () => {
    if (!promoCodeInput.trim()) return;
    setPromoLoading(true);
    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', promoCodeInput.trim().toUpperCase())
      .eq('is_active', true)
      .single();

    if (error || !data) {
      toast('Invalid or expired promo code', 'error');
      setAppliedPromo(null);
    } else {
      toast('Promo code applied!');
      setAppliedPromo(data);
    }
    setPromoLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast('Please fix the errors in the form before submitting.', 'error');
      return;
    }

    if (!user) {
      toast('Please log in to complete your order.', 'error');
      return;
    }
    
    setLoading(true);

    if (formData.paymentMethod === 'card') {
      if (!paystackKey) {
        toast('Card payments are temporarily unavailable. Please select another method.', 'error');
        setLoading(false);
        return;
      }
    }
    
    // Create the order FIRST, before any payment processing
    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total: finalTotal,
          status: 'pending',
          shipping_address: `${formData.firstName} ${formData.lastName}\n${formData.address}, ${formData.city}, ${formData.state}\nPhone: ${formData.phone}`,
          payment_method: formData.paymentMethod
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = cart.map(item => ({
        order_id: orderData.id,
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // If Cash on Delivery, we are done
      if (formData.paymentMethod !== 'card') {
        handleSuccess();
        return;
      }

      // If Card, trigger Paystack with the new order ID as reference
      setPaystackConfig({
        reference: orderData.id, // Use actual order ID as reference!
        email: formData.email,
        amount: finalTotal * 100, // in kobo
        publicKey: paystackKey,
      });

    } catch (error: any) {
      toast(error.message, 'error');
      setLoading(false);
    }
  };

  const [paystackConfig, setPaystackConfig] = useState<any>(null);
  
  // Provide a dummy config if not ready to prevent hook errors
  const initializePayment = usePaystackPayment(paystackConfig || { publicKey: paystackKey || 'dummy' });

  React.useEffect(() => {
    if (paystackConfig && loading) {
      initializePayment({
        onSuccess: () => {
          // Webhook will handle the status update and email. Just show success.
          handleSuccess();
        },
        onClose: () => {
          setLoading(false);
          setPaystackConfig(null);
          toast('Payment window closed. You can complete your order later in your profile.', 'error');
        }
      });
    }
  }, [paystackConfig]);

  const handleSuccess = () => {
    setIsSuccess(true);
    clearCart();
    setLoading(false);
    setPaystackConfig(null);
    
    setTimeout(() => {
      navigate('/profile'); // Redirect to profile to see order history
    }, 4000);
  };

  if (isSuccess) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 p-4 text-center">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={40} />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Order Successful!</h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-8">
          Thank you for shopping with Longlife Electronics. We have received your order and will contact you shortly.
        </p>
        <p className="text-sm text-gray-500 mb-8">Redirecting you to your profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 p-4 text-center">
        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
          <UserCircle size={40} />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Please Log In</h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-8">
          You need an account to place an order and track its status.
        </p>
        <Link to="/profile" className="bg-red-600 text-white font-bold py-3 px-8 text-[11px] uppercase tracking-widest hover:bg-red-700 transition-colors">
          Log In or Register
        </Link>
      </div>
    );
  }

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-8">Checkout</h1>
        
        <form onSubmit={handleSubmit} className="flex flex-col-reverse lg:flex-row gap-8">
          
          <div className="w-full lg:w-2/3 space-y-6">
            {/* Contact Info */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">First Name</label>
                  <input required type="text" name="firstName" value={formData.firstName} onChange={handleChange} className={`w-full bg-white dark:bg-slate-900 border ${errors.firstName ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} p-3 text-slate-900 dark:text-white focus:outline-none focus:border-red-600 transition-colors`} />
                  {errors.firstName && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Last Name</label>
                  <input required type="text" name="lastName" value={formData.lastName} onChange={handleChange} className={`w-full bg-white dark:bg-slate-900 border ${errors.lastName ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} p-3 text-slate-900 dark:text-white focus:outline-none focus:border-red-600 transition-colors`} />
                  {errors.lastName && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.lastName}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Email Address</label>
                  <input required type="email" name="email" value={formData.email} onChange={handleChange} className={`w-full bg-white dark:bg-slate-900 border ${errors.email ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} p-3 text-slate-900 dark:text-white focus:outline-none focus:border-red-600 transition-colors`} />
                  {errors.email && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.email}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Phone / WhatsApp Number</label>
                  <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className={`w-full bg-white dark:bg-slate-900 border ${errors.phone ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} p-3 text-slate-900 dark:text-white focus:outline-none focus:border-red-600 transition-colors`} />
                  {errors.phone && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.phone}</p>}
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
              <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tighter">Delivery Address</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Street Address</label>
                  <input required type="text" name="address" value={formData.address} onChange={handleChange} className={`w-full bg-white dark:bg-slate-900 border ${errors.address ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} p-3 text-slate-900 dark:text-white focus:outline-none focus:border-red-600 transition-colors`} placeholder="House number and street name" />
                  {errors.address && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.address}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
                  <input required type="text" name="city" value={formData.city} onChange={handleChange} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State</label>
                  <select name="state" value={formData.state} onChange={handleChange} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500">
                    <option value="Delta">Delta State</option>
                    <option value="Anambra">Anambra State</option>
                    <option value="Edo">Edo State</option>
                    <option value="Other">Other (Will incur extra shipping)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Payment Method</h2>
              <div className="space-y-3">
                <label className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <input type="radio" name="paymentMethod" value="pay_on_delivery" checked={formData.paymentMethod === 'pay_on_delivery'} onChange={handleChange} className="w-4 h-4 text-red-600 focus:ring-red-500" />
                  <span className="ml-3 font-medium text-gray-900 dark:text-white">Pay on Delivery</span>
                </label>
                <label className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <input type="radio" name="paymentMethod" value="bank_transfer" checked={formData.paymentMethod === 'bank_transfer'} onChange={handleChange} className="w-4 h-4 text-red-600 focus:ring-red-500" />
                  <span className="ml-3 font-medium text-gray-900 dark:text-white">Bank Transfer</span>
                </label>
                <label className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <input type="radio" name="paymentMethod" value="card" checked={formData.paymentMethod === 'card'} onChange={handleChange} className="w-4 h-4 text-red-600 focus:ring-red-500" />
                  <span className="ml-3 font-medium text-gray-900 dark:text-white flex items-center justify-between w-full">
                    Online Card Payment
                  </span>
                </label>
              </div>
            </div>
          </div>
          
          {/* Order Summary Sidebar */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 sticky top-24 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
                {cart.map(({product, quantity}) => (
                  <div key={product.id} className="flex justify-between gap-4">
                    <div className="flex gap-3">
                      <div className="relative">
                        <img src={product.image} alt="" className="w-12 h-12 rounded object-cover border border-gray-200 dark:border-gray-700" />
                        <span className="absolute -top-2 -right-2 bg-gray-900 dark:bg-gray-700 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">{quantity}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">{product.name}</span>
                        <span className="text-xs text-gray-500">{formatCurrency(product.price)}</span>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(product.price * quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 py-4 border-t border-gray-100 dark:border-gray-800">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(cartTotal)}</span>
                </div>
                {appliedPromo && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount ({appliedPromo.code})</span>
                    <span className="font-medium">- {formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Shipping</span>
                  <span className="font-medium text-gray-900 dark:text-white">Free</span>
                </div>
                
                <div className="pt-3 pb-3 border-t border-b border-gray-100 dark:border-gray-800">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={promoCodeInput}
                      onChange={e => setPromoCodeInput(e.target.value)}
                      placeholder="Promo Code" 
                      className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2 rounded text-sm uppercase focus:outline-none focus:border-red-600"
                    />
                    <button 
                      type="button" 
                      onClick={handleApplyPromo}
                      disabled={promoLoading || !promoCodeInput.trim()}
                      className="bg-gray-900 dark:bg-white hover:bg-gray-800 text-white dark:text-gray-900 px-4 py-2 rounded text-xs font-bold uppercase tracking-widest disabled:opacity-50"
                    >
                      {promoLoading ? '...' : 'Apply'}
                    </button>
                  </div>
                </div>

                <div className="pt-3 border-gray-100 dark:border-gray-800 flex justify-between">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">Total</span>
                  <span className="text-2xl font-bold text-red-600">{formatCurrency(finalTotal)}</span>
                </div>
              </div>
              
              <button 
                type="submit"
                disabled={loading}
                className="w-full mt-6 bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Place Order Now'}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
