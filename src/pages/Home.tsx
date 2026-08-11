import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import Spline from '@splinetool/react-spline';
import { ShieldCheck, Truck, Clock, ThumbsUp, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Product } from '../types';
import { ProductCard } from '../components/ui/ProductCard';
import { TestimonialCarousel } from '../components/ui/TestimonialCarousel';
import { Brands } from '../components/home/Brands';
import { AskTheExpert } from '../components/ui/AskTheExpert';
import { SEO } from '../components/ui/SEO';
import { NewsletterModal } from '../components/ui/NewsletterModal';
import { FloatingWhatsApp } from '../components/layout/FloatingWhatsApp';
import promoBannerImg from '../assets/images/promo_appliances_3d.png';
import storeTourImg from '../assets/images/store_tour_3d.png';

export const Home = () => {
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_popular', true)
        .limit(4);
      
      if (data && !error) {
        // Map database fields to frontend types
        const mappedData = data.map(p => ({
          ...p,
          originalPrice: p.original_price,
          inStock: p.in_stock,
          reviewsCount: p.reviews_count,
          isNew: p.is_new,
          isPopular: p.is_popular
        })) as Product[];
        setPopularProducts(mappedData);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  return (
    <div className="w-full">
      <SEO />
      {/* Hero Section */}
      <section className="bg-slate-900 text-white relative overflow-hidden h-[70vh] md:h-[80vh] min-h-[450px] flex items-center">
        {/* 3D Background */}
        {/* On mobile, we disable pointer events so the user can easily scroll past the 3D model without getting stuck */}
        <div className="absolute inset-0 z-0 pointer-events-none lg:pointer-events-auto">
          <Spline scene="https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode" />
        </div>
        
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent pointer-events-none"></div>
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&q=80')] bg-cover bg-center mix-blend-overlay z-0 pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 w-full pointer-events-none">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-2xl pointer-events-auto mt-10 md:mt-0"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter mb-4 uppercase leading-none">
              Plug Into The Future With <span className="text-red-500">Longlife</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-300 mb-8 leading-relaxed max-w-xl">
              Experience the next generation of home appliances and premium electronics in Asaba. Drag the 3D model to interact!
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/products" className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 text-[11px] uppercase tracking-widest text-center transition-all hover:scale-105 flex items-center justify-center gap-2">
                Explore Catalog <ArrowRight size={14} />
              </Link>
              <a href="https://wa.me/2349069361175" target="_blank" rel="noopener noreferrer" className="bg-white/10 hover:bg-white/20 backdrop-blur text-white font-bold py-4 px-8 text-[11px] uppercase tracking-widest text-center transition-all hover:scale-105 border border-white/20">
                Chat with Expert
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Value Props */}
      <section className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 relative z-10 shadow-[0_-10px_20px_rgba(0,0,0,0.3)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: ShieldCheck, title: 'Genuine', desc: '100% authentic appliances.' },
              { icon: Truck, title: 'Fast Delivery', desc: 'Reliable across Delta State.' },
              { icon: Clock, title: 'Store Pickup', desc: 'Order online, pick up in Asaba.' },
              { icon: ThumbsUp, title: 'Trusted', desc: 'Expert advice & support.' }
            ].map((prop, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 text-red-600 flex items-center justify-center mb-3 rounded-full shadow-inner">
                  <prop.icon size={20} />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-1 text-[11px] uppercase tracking-widest">{prop.title}</h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">{prop.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Shop by Category */}
      <section className="py-12 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Shop by Category</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">Find exactly what you need</p>
            </div>
            <Link to="/products" className="hidden sm:flex items-center gap-1 text-[10px] font-bold text-red-600 uppercase tracking-widest hover:text-slate-900 dark:hover:text-white transition-colors">
              All Categories <ArrowRight size={14} />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <Link to="/products?category=Refrigerators" className="group relative h-40 overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent z-10"></div>
              <img src="https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?auto=format&fit=crop&q=80&w=400" alt="Refrigerators" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="relative z-20 mt-auto w-full p-4 text-center">
                <span className="text-white font-black uppercase tracking-widest text-[11px]">Refrigerators</span>
              </div>
            </Link>
            
            <Link to="/products?category=Air+Conditioners" className="group relative h-40 overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent z-10"></div>
              <img src="https://images.unsplash.com/photo-1620916297397-a4a5402a3c6c?auto=format&fit=crop&q=80&w=400" alt="Air Conditioners" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="relative z-20 mt-auto w-full p-4 text-center">
                <span className="text-white font-black uppercase tracking-widest text-[11px]">Air Conditioners</span>
              </div>
            </Link>
            
            <Link to="/products?category=LED+%26+Smart+TVs" className="group relative h-40 overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent z-10"></div>
              <img src="https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&q=80&w=400" alt="Smart TVs" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="relative z-20 mt-auto w-full p-4 text-center">
                <span className="text-white font-black uppercase tracking-widest text-[11px]">Smart TVs</span>
              </div>
            </Link>
            
            <Link to="/products?category=Home+Theater" className="group relative h-40 overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent z-10"></div>
              <img src="https://images.unsplash.com/photo-1558403194-611308249627?auto=format&fit=crop&q=80&w=400" alt="Home Theater" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="relative z-20 mt-auto w-full p-4 text-center">
                <span className="text-white font-black uppercase tracking-widest text-[11px]">Home Theater</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Popular Products */}
      <section className="py-12 bg-slate-100 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Popular Right Now</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">Our best-selling electronics</p>
            </div>
            <Link to="/products?sort=popular" className="hidden sm:flex items-center gap-1 text-[10px] font-bold text-red-600 uppercase tracking-widest hover:text-slate-900 transition-colors">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {loading ? (
              <div className="col-span-full py-8 text-center text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                Loading popular products...
              </div>
            ) : popularProducts.length > 0 ? (
              popularProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-full py-8 text-center text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                No popular products found.
              </div>
            )}
          </div>
          <div className="mt-6 sm:hidden">
            <Link to="/products?sort=popular" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold py-3 text-[11px] uppercase tracking-widest flex items-center justify-center gap-2">
              View All <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Promo Banner */}
      <section className="py-12 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-600 rounded-2xl overflow-hidden relative shadow-xl flex flex-col md:flex-row items-center">
            <div className="p-8 md:p-12 lg:p-16 md:w-1/2 text-white z-10">
              <span className="inline-block py-1 px-3 bg-red-800 rounded-full text-xs font-bold tracking-wider uppercase mb-4">Store Opening Promo</span>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">Upgrade Your Home Setup Today</h2>
              <p className="text-red-100 mb-8 text-lg">Visit our store in Asaba for exclusive in-store discounts on all major appliances.</p>
              <Link to="/about" className="bg-white text-red-600 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors inline-flex items-center gap-2">
                Get Directions
              </Link>
            </div>
            <div 
              className="w-full md:w-1/2 h-64 md:h-full min-h-[300px] bg-cover bg-center relative"
              style={{ backgroundImage: `url(${promoBannerImg})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-red-600 via-transparent to-transparent"></div>
            </div>
          </div>
        </div>
      </section>

      <TestimonialCarousel />

      {/* Real Store Video Placeholder */}
      <section className="py-16 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-4">Real Store. Real Products. Real People.</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-10 max-w-2xl mx-auto">We are not just an online store. We have a physical presence in Asaba ready to serve you.</p>
          
          <div className="aspect-video w-full max-w-4xl mx-auto bg-gray-200 dark:bg-gray-800 rounded-2xl flex items-center justify-center relative overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800 group cursor-pointer">
            <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-all duration-500 z-10 flex flex-col items-center justify-center text-white p-6">
              <div className="w-20 h-20 bg-red-600/90 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-2xl">
                <svg className="w-8 h-8 ml-2" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              </div>
              <p className="font-bold text-xl md:text-2xl tracking-widest uppercase drop-shadow-md">Watch Our Store Tour</p>
            </div>
            <img src={storeTourImg} alt="Electronics Store Front" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
          </div>
        </div>
      </section>
    </div>
  );
};
