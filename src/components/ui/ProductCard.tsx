import React, { useState, MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { ShoppingCart, Heart, Star, Scale, MessageCircle, Eye } from 'lucide-react';
import { Product } from '../../types';
import { formatCurrency, cn } from '../../utils';
import { useStore } from '../../store';
import { QuickViewModal } from './QuickViewModal';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, toggleWishlist, isInWishlist, toggleCompare, isInCompare, compareList } = useStore();
  const [showQuickView, setShowQuickView] = useState(false);
  const isWishlisted = isInWishlist(product.id);
  const isCompared = isInCompare(product.id);
  
  const whatsappMsg = `Hello Longlife Electronics, I want to inquire about the ${product.name} priced at ${formatCurrency(product.price)}.`;

  const handleCompareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isCompared && compareList.length >= 3) {
      alert("You can only compare up to 3 products at a time.");
      return;
    }
    toggleCompare(product);
  };

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div 
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group flex flex-col bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 hover:border-slate-300 dark:hover:border-gray-700 transition-colors h-[280px]"
    >
      
      {/* Image Area */}
      <div className="relative h-[160px] bg-slate-50 dark:bg-gray-800 p-4 flex items-center justify-center overflow-hidden">
        <Link to={`/products/${product.slug}`} className="w-full h-full flex items-center justify-center">
          <img 
            src={product.image} 
            alt={product.name} 
            className="h-full object-contain mix-blend-multiply dark:mix-blend-normal group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {product.isNew && (
            <span className="bg-slate-900 dark:bg-white dark:text-slate-900 text-white text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5">
              New
            </span>
          )}
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="bg-red-600 text-white text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5">
              Sale
            </span>
          )}
          {product.stock <= 0 && (
            <span className="bg-gray-800 text-white text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5">
              Out of Stock
            </span>
          )}
        </div>

        <div className="absolute top-2 right-2 flex flex-col gap-1.5 z-10 opacity-0 group-hover:opacity-100 transition-all">
          <button 
            onClick={(e) => { e.preventDefault(); setShowQuickView(true); }}
            className="text-slate-400 hover:text-red-600 bg-white/90 dark:bg-slate-800/90 p-1.5 rounded-full shadow-sm"
          >
            <Eye size={14} />
          </button>
          <button 
            onClick={(e) => { e.preventDefault(); toggleWishlist(product); }}
            className="text-slate-400 hover:text-red-600 bg-white/90 dark:bg-slate-800/90 p-1.5 rounded-full shadow-sm"
          >
            <Heart size={14} className={cn(isWishlisted && "fill-red-600 text-red-600 opacity-100")} />
          </button>
          <button 
            onClick={handleCompareClick}
            className="text-slate-400 hover:text-blue-600 bg-white/90 dark:bg-slate-800/90 p-1.5 rounded-full shadow-sm"
          >
            <Scale size={14} className={cn(isCompared && "text-blue-600 opacity-100")} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col flex-1">
        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
          {product.brand}
        </div>
        <Link to={`/products/${product.slug}`} className="block flex-1">
          <h3 className="text-[11px] font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover:text-red-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="mt-auto flex items-end justify-between pt-2">
          <div className="flex flex-col">
            {product.originalPrice && (
              <div className="text-[10px] text-slate-400 line-through leading-none">
                {formatCurrency(product.originalPrice)}
              </div>
            )}
            <div className="text-[13px] font-black text-slate-900 dark:text-white mt-0.5 leading-none">
              {formatCurrency(product.price)}
            </div>
          </div>
          <div className="flex gap-1.5">
            <a 
              href={`https://wa.me/2349069361175?text=${encodeURIComponent(whatsappMsg)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="h-7 w-7 bg-[#25D366] text-white flex items-center justify-center hover:bg-[#128C7E] transition-colors shrink-0"
              aria-label="Buy on WhatsApp"
            >
              <MessageCircle size={14} />
            </a>
            <button 
              onClick={() => addToCart(product)}
              disabled={product.stock <= 0}
              className="h-7 w-7 bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center hover:bg-red-600 dark:hover:bg-red-600 hover:text-white dark:hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              aria-label="Add to cart"
            >
              <ShoppingCart size={14} />
            </button>
          </div>
        </div>
      </div>
      {showQuickView && (
        <QuickViewModal product={product} onClose={() => setShowQuickView(false)} />
      )}
    </motion.div>
  );
};
