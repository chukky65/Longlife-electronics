import React from 'react';
import { X, ShoppingCart, MessageCircle, Star } from 'lucide-react';
import { Product } from '../../types';
import { useStore } from '../../store';
import { formatCurrency } from '../../utils';

interface QuickViewModalProps {
  product: Product;
  onClose: () => void;
}

export const QuickViewModal = ({ product, onClose }: QuickViewModalProps) => {
  const { addToCart } = useStore();
  const whatsappMsg = `Hello Longlife Electronics, I want to inquire about the ${product.name} priced at ${formatCurrency(product.price)}.`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white/90 dark:bg-slate-800/90 text-slate-500 hover:text-red-600 w-8 h-8 flex items-center justify-center transition-colors"
        >
          <X size={20} />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image */}
          <div className="bg-slate-50 dark:bg-slate-800 p-8 flex items-center justify-center min-h-[300px]">
            <img src={product.image} alt={product.name} className="max-w-full max-h-[400px] object-contain mix-blend-multiply dark:mix-blend-normal" />
          </div>

          {/* Details */}
          <div className="p-8 md:p-12 flex flex-col justify-center">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
              {product.brand}
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4">
              {product.name}
            </h2>

            <div className="flex items-center gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700'}
                />
              ))}
              <span className="text-[11px] text-slate-500 ml-2">({product.reviewsCount} reviews)</span>
            </div>

            <div className="mb-6">
              {product.originalPrice && (
                <div className="text-[13px] text-slate-400 line-through mb-1">
                  {formatCurrency(product.originalPrice)}
                </div>
              )}
              <div className="text-3xl font-black text-red-600 tracking-tighter">
                {formatCurrency(product.price)}
              </div>
            </div>

            <div className="flex items-center gap-1.5 mt-2">
              <span className={`inline-flex items-center justify-center px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${product.stock > 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                {product.stock > 0 ? `${product.stock} In Stock` : 'Out of Stock'}
              </span>
            </div>

            <p className="text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed flex-1 mt-4">
              {product.description.substring(0, 150)}...
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-auto">
              <button
                onClick={() => {
                  addToCart(product);
                  onClose();
                }}
                disabled={product.stock <= 0}
                className="flex-1 bg-slate-900 hover:bg-red-600 dark:bg-white dark:hover:bg-red-600 dark:text-slate-900 dark:hover:text-white text-white font-bold py-4 px-6 text-[11px] uppercase tracking-widest transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart size={16} />
                {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </button>
              <a
                href={`https://wa.me/2349069361175?text=${encodeURIComponent(whatsappMsg)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-4 px-6 text-[11px] uppercase tracking-widest transition-colors flex items-center justify-center gap-2 sm:w-auto"
              >
                <MessageCircle size={16} />
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
