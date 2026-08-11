import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trash2, ShoppingCart } from 'lucide-react';
import { useStore } from '../store';
import { formatCurrency } from '../utils';
import { Product } from '../types';

export const Compare = () => {
  const { compareList, removeFromCompare, clearCompare, addToCart } = useStore();

  const allSpecs: string[] = Array.from(
    new Set(compareList.flatMap((product) => Object.keys(product.specs)))
  );

  return (
    <div className="bg-slate-50 dark:bg-gray-950 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
              Compare Products
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">
              {compareList.length} / 3 selected
            </p>
          </div>
          {compareList.length > 0 && (
            <button
              onClick={clearCompare}
              className="text-[10px] font-bold uppercase tracking-widest text-red-600 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1"
            >
              <Trash2 size={14} /> Clear All
            </button>
          )}
        </div>

        {compareList.length === 0 ? (
          <div className="min-h-[60vh] flex flex-col items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-12 text-center">
            <div className="w-48 h-48 bg-slate-50 dark:bg-slate-800 shadow-xl border border-slate-100 dark:border-slate-700 rounded-full flex items-center justify-center mb-8 relative">
               <div className="absolute inset-0 border-2 border-dashed border-slate-200 dark:border-slate-600 rounded-full animate-[spin_4s_linear_infinite]"></div>
               <div className="flex gap-2">
                 <div className="w-8 h-16 border-2 border-slate-300 dark:border-slate-500 rounded-sm"></div>
                 <div className="w-8 h-16 border-2 border-slate-300 dark:border-slate-500 rounded-sm mt-4"></div>
               </div>
               <div className="absolute -bottom-2 -right-2 bg-red-600 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-red-600/30">0</div>
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4">Nothing to Compare</h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mb-10 max-w-md text-center">
              Add products to comparison to see them side-by-side and find the perfect match.
            </p>
            <Link
              to="/products"
              className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-4 px-10 text-[11px] uppercase tracking-widest hover:bg-red-600 dark:hover:bg-red-600 hover:text-white dark:hover:text-white transition-colors flex items-center gap-2"
            >
              Browse Products <ArrowLeft size={16} />
            </Link>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto">
            <table className="w-full min-w-[600px] text-left border-collapse">
              <thead>
                <tr>
                  <th className="p-4 border-b border-r border-slate-200 dark:border-slate-800 w-1/4 bg-slate-50 dark:bg-slate-800/50">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Product Info</span>
                  </th>
                  {compareList.map((product) => (
                    <th key={product.id} className="p-4 border-b border-r border-slate-200 dark:border-slate-800 w-1/4 relative align-top">
                      <button
                        onClick={() => removeFromCompare(product.id)}
                        className="absolute top-2 right-2 text-slate-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                      <div className="flex justify-center mb-4 h-32 p-2">
                        <img src={product.image} alt={product.name} className="h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
                      </div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{product.brand}</div>
                      <Link to={`/products/${product.slug}`} className="block mb-2 text-[11px] font-bold text-slate-900 dark:text-white hover:text-red-600 line-clamp-2">
                        {product.name}
                      </Link>
                      <div className="text-[13px] font-black text-slate-900 dark:text-white mb-4">
                        {formatCurrency(product.price)}
                      </div>
                      <button
                        onClick={() => addToCart(product)}
                        disabled={!product.inStock}
                        className="w-full bg-slate-900 hover:bg-red-600 dark:bg-white dark:text-slate-900 text-white font-bold py-2 text-[10px] uppercase tracking-widest transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                      >
                        <ShoppingCart size={14} /> Add to Cart
                      </button>
                    </th>
                  ))}
                  {/* Fill empty columns if less than 3 */}
                  {Array.from({ length: 3 - compareList.length }).map((_, i) => (
                    <th key={`empty-${i}`} className="p-4 border-b border-slate-200 dark:border-slate-800 w-1/4 bg-slate-50/50 dark:bg-slate-800/30 border-r last:border-r-0">
                      <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-50">
                        <div className="w-12 h-12 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-full flex items-center justify-center mb-2">
                          <span className="text-xl">+</span>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest">Add Product</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="bg-slate-50 dark:bg-slate-800/50">
                  <td colSpan={4} className="p-3 border-b border-slate-200 dark:border-slate-800 text-[11px] font-black uppercase tracking-widest text-slate-900 dark:text-white">
                    Specifications
                  </td>
                </tr>
                {allSpecs.map((spec) => (
                  <tr key={spec} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 border-b border-r border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-50 dark:bg-slate-800/50">
                      {spec}
                    </td>
                    {compareList.map((product) => (
                      <td key={product.id} className="p-4 border-b border-r border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-900 dark:text-slate-300">
                        {product.specs[spec] || '-'}
                      </td>
                    ))}
                    {Array.from({ length: 3 - compareList.length }).map((_, i) => (
                      <td key={`empty-spec-${i}`} className="p-4 border-b border-slate-200 dark:border-slate-800 border-r last:border-r-0 text-center text-slate-300 dark:text-slate-700">
                        -
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
