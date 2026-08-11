import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store';
import { ProductCard } from '../components/ui/ProductCard';
import { Heart } from 'lucide-react';

export const Wishlist = () => {
  const { wishlist } = useStore();

  if (wishlist.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-slate-50 dark:bg-gray-950 p-4">
        <div className="w-48 h-48 bg-white dark:bg-slate-900 shadow-xl border border-slate-100 dark:border-slate-800 rounded-full flex items-center justify-center mb-8 relative">
           <div className="absolute inset-0 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-full animate-pulse"></div>
           <Heart size={64} className="text-slate-300 dark:text-slate-600" />
           <div className="absolute -bottom-2 -right-2 bg-red-600 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-red-600/30">0</div>
        </div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4">Your Wishlist is Empty</h2>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mb-10 max-w-md text-center">
          Save your favorite items here while you shop to easily find them later.
        </p>
        <Link to="/products" className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-4 px-10 text-[11px] uppercase tracking-widest hover:bg-red-600 dark:hover:bg-red-600 hover:text-white dark:hover:text-white transition-colors flex items-center gap-2">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8 border-b border-gray-200 dark:border-gray-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">My Wishlist</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              {wishlist.length} saved item{wishlist.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {wishlist.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};
