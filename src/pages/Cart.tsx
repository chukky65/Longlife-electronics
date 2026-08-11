import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { formatCurrency } from '../utils';
import { Trash2, ArrowRight, ShoppingBag } from 'lucide-react';

export const Cart = () => {
  const { cart, updateCartQuantity, removeFromCart, cartTotal } = useStore();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-slate-50 dark:bg-gray-950 p-4">
        <div className="w-48 h-48 bg-white dark:bg-slate-900 shadow-xl border border-slate-100 dark:border-slate-800 rounded-full flex items-center justify-center mb-8 relative">
           <div className="absolute inset-0 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-full animate-spin-slow"></div>
           <ShoppingBag size={64} className="text-slate-300 dark:text-slate-600" />
           <div className="absolute -bottom-2 -right-2 bg-red-600 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-red-600/30">0</div>
        </div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4">Your Cart is Empty</h2>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mb-10 max-w-md text-center">
          Looks like you haven't added any electronics to your cart yet. Browse our top categories to find what you need.
        </p>
        <Link to="/products" className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-4 px-10 text-[11px] uppercase tracking-widest hover:bg-red-600 dark:hover:bg-red-600 hover:text-white dark:hover:text-white transition-colors flex items-center gap-2">
          Start Shopping <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 dark:bg-gray-950 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-8">Shopping Cart</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-2/3">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <div className="col-span-6">Product</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-3 text-right">Total</div>
                <div className="col-span-1 text-center">Action</div>
              </div>
              
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {cart.map(({ product, quantity }) => (
                  <div key={product.id} className="p-4 md:p-6 flex flex-col md:grid md:grid-cols-12 md:items-center gap-4">
                    
                    {/* Mobile Product info */}
                    <div className="col-span-6 flex items-start gap-4">
                      <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 p-2 shrink-0 border border-slate-200 dark:border-slate-700">
                        <img src={product.image} alt={product.name} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{product.brand}</span>
                        <Link to={`/products/${product.slug}`} className="text-[11px] font-bold text-slate-900 dark:text-white hover:text-red-600 line-clamp-2 mt-1 uppercase leading-snug">
                          {product.name}
                        </Link>
                        <span className="text-slate-500 dark:text-slate-400 font-bold text-[11px] mt-1 md:hidden">
                          {formatCurrency(product.price)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Quantity controls */}
                    <div className="col-span-2 flex items-center justify-between md:justify-center mt-2 md:mt-0">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 md:hidden">Qty:</span>
                      <div className="flex items-center border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900">
                        <button 
                          className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                          onClick={() => updateCartQuantity(product.id, quantity - 1)}
                        >-</button>
                        <input 
                          type="number" 
                          value={quantity}
                          readOnly
                          className="w-8 text-center bg-transparent border-none focus:ring-0 text-[11px] font-bold text-slate-900 dark:text-white p-0"
                        />
                        <button 
                          className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white disabled:opacity-50"
                          onClick={() => updateCartQuantity(product.id, quantity + 1)}
                          disabled={quantity >= product.stock}
                        >+</button>
                      </div>
                    </div>
                    
                    {/* Item Total */}
                    <div className="col-span-3 text-right hidden md:block">
                      <span className="font-black text-slate-900 dark:text-white text-[13px]">
                        {formatCurrency(product.price * quantity)}
                      </span>
                    </div>

                    {/* Mobile Item Total & Action */}
                    <div className="flex items-center justify-between md:hidden pt-4 border-t border-slate-100 dark:border-slate-800 mt-2">
                      <span className="font-black text-slate-900 dark:text-white text-[13px]">
                        {formatCurrency(product.price * quantity)}
                      </span>
                      <button 
                        onClick={() => removeFromCart(product.id)}
                        className="text-red-600 flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest"
                      >
                        <Trash2 size={14} /> Remove
                      </button>
                    </div>
                    
                    {/* Desktop Action */}
                    <div className="col-span-1 text-center hidden md:flex justify-center">
                      <button 
                        onClick={() => removeFromCart(product.id)}
                        className="text-slate-400 hover:text-red-600 transition-colors p-2"
                        aria-label="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="w-full lg:w-1/3">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 lg:sticky lg:top-24 shadow-sm">
              <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  <span>Subtotal</span>
                  <span className="text-slate-900 dark:text-white">{formatCurrency(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  <span>Shipping</span>
                  <span className="text-slate-900 dark:text-white">At checkout</span>
                </div>
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-end">
                  <span className="text-[13px] font-black text-slate-900 dark:text-white uppercase tracking-tighter">Total</span>
                  <span className="text-xl font-black text-slate-900 dark:text-white">{formatCurrency(cartTotal)}</span>
                </div>
              </div>
              
              <button 
                onClick={() => navigate('/checkout')}
                className="w-full bg-slate-900 hover:bg-red-600 text-white font-bold py-4 px-6 text-[11px] uppercase tracking-widest transition-colors flex items-center justify-center gap-2 mb-4"
              >
                Checkout <ArrowRight size={16} />
              </button>
              
              <div className="text-center text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 flex flex-col gap-2">
                <p>or</p>
                <Link to="/products" className="text-slate-900 dark:text-white hover:text-red-600 transition-colors">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
