import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Product } from '../types';
import { useStore } from '../store';
import { formatCurrency } from '../utils';
import { ShoppingCart, Heart, Star, Share2, ShieldCheck, Truck, ArrowLeft, MessageCircle, Scale } from 'lucide-react';
import { AskTheExpert } from '../components/ui/AskTheExpert';
import { ProductCard } from '../components/ui/ProductCard';
import { ProductReviews } from '../components/ui/ProductReviews';
import { SEO } from '../components/ui/SEO';

export const ProductDetails = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const { addToCart, toggleWishlist, isInWishlist, toggleCompare, isInCompare, compareList } = useStore();
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .single();
      
      if (data && !error) {
        const mappedProduct = {
          ...data,
          originalPrice: data.original_price,
          inStock: data.in_stock,
          reviewsCount: data.reviews_count,
          isNew: data.is_new,
          isPopular: data.is_popular
        } as Product;
        setProduct(mappedProduct);

        // Fetch related products
        const { data: relatedData } = await supabase
          .from('products')
          .select('*')
          .eq('category', data.category)
          .neq('id', data.id)
          .limit(4);
        
        if (relatedData) {
          setRelatedProducts(relatedData.map(p => ({
            ...p,
            originalPrice: p.original_price,
            inStock: p.in_stock,
            reviewsCount: p.reviews_count,
            isNew: p.is_new,
            isPopular: p.is_popular
          })) as Product[]);
        }
      }
      setLoading(false);
    };

    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 p-4 text-center">
        <h2 className="text-xl font-bold text-slate-500 uppercase tracking-widest">Loading...</h2>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 p-4 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Product Not Found</h2>
        <Link to="/products" className="text-red-600 hover:underline flex items-center gap-2">
          <ArrowLeft size={16} /> Back to Products
        </Link>
      </div>
    );
  }

  const isWishlisted = isInWishlist(product.id);
  const whatsappMsg = `Hello Longlife Electronics, I want to inquire about the ${product.name} priced at ${formatCurrency(product.price)}.`;

  return (
    <div className="bg-slate-50 dark:bg-gray-950 min-h-screen py-8">
      <SEO 
        title={`${product.name} - Longlife Electronics`}
        description={product.description.substring(0, 160)}
        image={product.image}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <nav className="flex text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li><Link to="/" className="hover:text-red-600 transition-colors">Home</Link></li>
            <li><span className="mx-2">/</span></li>
            <li><Link to="/products" className="hover:text-red-600 transition-colors">Products</Link></li>
            <li><span className="mx-2">/</span></li>
            <li className="text-slate-900 dark:text-white truncate">{product.name}</li>
          </ol>
        </nav>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            
            {/* Image Gallery */}
            <div className="p-8 md:p-12 bg-slate-50 dark:bg-slate-800/50 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800">
              <div className="relative aspect-square mb-6 bg-white dark:bg-slate-800 flex items-center justify-center p-8 border border-slate-200 dark:border-slate-700">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal"
                />
                {product.isNew && (
                  <span className="absolute top-4 left-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white text-[10px] font-bold uppercase tracking-widest py-1 px-2">
                    New
                  </span>
                )}
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {product.gallery.map((img, i) => (
                  <button key={i} className={`w-16 h-16 shrink-0 border-2 overflow-hidden bg-white ${i === 0 ? 'border-red-600' : 'border-slate-200 dark:border-slate-700'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal" />
                  </button>
                ))}
              </div>
            </div>

            {/* Details */}
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">
                {product.brand}
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight mb-4 uppercase">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className={i < Math.floor(product.rating) ? "fill-yellow-400" : "fill-slate-200 text-slate-200"} />
                  ))}
                </div>
                <a href="#reviews" className="text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:text-red-600 transition-colors">
                  {product.reviewsCount} Reviews
                </a>
                <div className="flex items-center gap-1.5">
                  <span className={`inline-flex items-center justify-center px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${product.stock > 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                    {product.stock > 0 ? `${product.stock} In Stock` : 'Out of Stock'}
                  </span>
                </div>
              </div>

              <div className="flex items-end gap-3 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                  {formatCurrency(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-sm font-bold text-slate-400 line-through mb-1">
                    {formatCurrency(product.originalPrice)}
                  </span>
                )}
              </div>

              <p className="text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
                {product.description}
              </p>

              {/* Actions */}
              <div className="space-y-3 mb-8">
                <div className="flex gap-3">
                  <div className="w-32 flex items-center border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900">
                    <button 
                      className="w-10 h-full flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white disabled:opacity-50"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={product.stock <= 0}
                    >-</button>
                    <input 
                      type="number" 
                      value={product.stock <= 0 ? 0 : quantity}
                      readOnly
                      className="w-full text-center bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white font-bold text-[13px]"
                    />
                    <button 
                      className="w-10 h-full flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white disabled:opacity-50"
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      disabled={product.stock <= 0 || quantity >= product.stock}
                    >+</button>
                  </div>
                  <button 
                    onClick={() => addToCart(product, quantity)}
                    disabled={product.stock <= 0}
                    className="flex-1 bg-slate-900 hover:bg-red-600 dark:bg-white dark:hover:bg-red-600 dark:text-slate-900 dark:hover:text-white text-white font-bold py-3 px-6 text-[11px] uppercase tracking-widest transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <ShoppingCart size={16} /> {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                </div>
                
                <div className="flex gap-3">
                  <button 
                    onClick={() => toggleWishlist(product)}
                    className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-red-600 hover:text-red-600 text-slate-700 dark:text-slate-300 font-bold py-3 px-4 text-[11px] uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                  >
                    <Heart size={16} className={isWishlisted ? "fill-red-600 text-red-600" : ""} /> 
                    {isWishlisted ? 'Saved' : 'Save'}
                  </button>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      if (!isInCompare(product.id) && compareList.length >= 3) {
                        alert("You can only compare up to 3 products at a time.");
                        return;
                      }
                      toggleCompare(product);
                    }}
                    className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-blue-600 hover:text-blue-600 text-slate-700 dark:text-slate-300 font-bold py-3 px-4 text-[11px] uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                  >
                    <Scale size={16} className={isInCompare(product.id) ? "text-blue-600" : ""} /> 
                    {isInCompare(product.id) ? 'Comparing' : 'Compare'}
                  </button>
                </div>
                <a 
                  href={`https://wa.me/2349069361175?text=${encodeURIComponent(whatsappMsg)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-3 px-6 text-[11px] uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle size={16} /> Buy on WhatsApp
                </a>
              </div>

              {/* Guarantees */}
              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="text-red-600 shrink-0" size={20} />
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-[11px] uppercase tracking-widest">Genuine Product</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Manufacturer Warranty</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Truck className="text-red-600 shrink-0" size={20} />
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-[11px] uppercase tracking-widest">Fast Local Delivery</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Within Asaba & Delta</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Specs Section */}
        <div className="mt-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 md:p-12">
          <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-6">Technical Specifications</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-0 max-w-4xl">
            {Object.entries(product.specs).map(([key, value]) => (
              <div key={key} className="flex border-b border-slate-100 dark:border-slate-800 py-3">
                <span className="w-1/3 text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-widest">{key}</span>
                <span className="w-2/3 text-slate-900 dark:text-white text-[11px] font-bold uppercase">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <ProductReviews productId={product.id} rating={product.rating} reviewsCount={product.reviewsCount} />

        <AskTheExpert productId={product.id} productName={product.name} />

        {/* Related Products */}
        <div className="mt-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
              You May Also Like
            </h2>
            <Link to={`/products?category=${product.category}`} className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-red-600 transition-colors flex items-center gap-1">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map(relatedProduct => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
