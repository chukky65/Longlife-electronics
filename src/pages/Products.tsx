import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ProductCard } from '../components/ui/ProductCard';
import { PriceRangeFilter } from '../components/ui/PriceRangeFilter';
import { SEO } from '../components/ui/SEO';
import { Category, Product, CATEGORIES } from '../types';

export const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  
  const currentCategory = searchParams.get('category');
  const searchQuery = searchParams.get('search');
  const sortMethod = searchParams.get('sort') || 'latest';
  
  const minPriceParam = parseInt(searchParams.get('minPrice') || '0', 10);
  const maxPriceParam = parseInt(searchParams.get('maxPrice') || '1000000', 10);
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const ITEMS_PER_PAGE = 24;

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      
      let query = supabase
        .from('products')
        .select('*', { count: 'exact' });

      if (currentCategory) {
        query = query.eq('category', currentCategory);
      }
      
      if (searchQuery) {
        // Remove commas from search query because they break Supabase's .or() syntax
        const safeQuery = searchQuery.replace(/,/g, ' ').trim();
        if (safeQuery) {
          query = query.or(`name.ilike.%${safeQuery}%,brand.ilike.%${safeQuery}%,category.ilike.%${safeQuery}%`);
        }
      }
      
      query = query.gte('price', minPriceParam).lte('price', maxPriceParam);

      switch (sortMethod) {
        case 'price-low':
          query = query.order('price', { ascending: true });
          break;
        case 'price-high':
          query = query.order('price', { ascending: false });
          break;
        case 'popular':
          query = query.order('is_popular', { ascending: false });
          break;
        case 'latest':
        default:
          query = query.order('is_new', { ascending: false });
          break;
      }
      
      const from = (pageParam - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data, count, error } = await query;
      
      if (data && !error) {
        const mappedData = data.map(p => ({
          ...p,
          originalPrice: p.original_price,
          inStock: p.in_stock,
          reviewsCount: p.reviews_count,
          isNew: p.is_new,
          isPopular: p.is_popular
        })) as Product[];
        setProducts(mappedData);
        setTotalCount(count || 0);
      }
      setLoading(false);
    };

    fetchProducts();
  }, [currentCategory, searchQuery, sortMethod, minPriceParam, maxPriceParam, pageParam]);

  const updateSearchParam = (key: string, value: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    if (key !== 'page') {
      newParams.set('page', '1');
    }
    setSearchParams(newParams);
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const seoTitle = searchQuery 
    ? `Search: "${searchQuery}" - Longlife Electronics` 
    : currentCategory 
      ? `${currentCategory} - Longlife Electronics` 
      : 'All Electronics - Longlife Electronics';

  return (
    <div className="bg-slate-50 dark:bg-gray-950 min-h-screen py-8">
      <SEO title={seoTitle} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
              {searchQuery ? `Search: "${searchQuery}"` : 
               currentCategory ? currentCategory : 'All Electronics'}
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">
              Showing {totalCount} product{totalCount !== 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button 
              className="md:hidden flex items-center justify-center gap-2 flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-2 text-[11px] font-bold uppercase tracking-widest text-slate-900 dark:text-white"
              onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
            >
              <Filter size={14} /> Filters
            </button>
            
            <div className="relative flex-1 md:w-48">
              <select 
                className="w-full appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-2 pl-3 pr-8 text-[11px] font-bold uppercase tracking-widest text-slate-900 dark:text-white focus:outline-none focus:border-red-600 rounded-none"
                value={sortMethod}
                onChange={(e) => updateSearchParam('sort', e.target.value)}
              >
                <option value="latest">Sort: Latest</option>
                <option value="popular">Sort: Popular</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={14} />
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Sidebar Filters */}
          <aside className={`w-full lg:w-56 shrink-0 ${isMobileFiltersOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 space-y-6 sticky top-24">
              <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
                <SlidersHorizontal size={16} className="text-slate-900 dark:text-white" />
                <h2 className="font-bold text-[11px] uppercase tracking-widest text-slate-900 dark:text-white">Filters</h2>
              </div>
              
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-3 text-[10px] uppercase tracking-widest">Categories</h3>
                <ul className="space-y-2">
                  <li>
                    <button 
                      onClick={() => updateSearchParam('category', null)}
                      className={`text-[11px] uppercase tracking-tight w-full text-left transition-colors ${!currentCategory ? 'text-red-600 font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-red-600 font-medium'}`}
                    >
                      All Categories
                    </button>
                  </li>
                  {CATEGORIES.map(cat => (
                    <li key={cat}>
                      <button 
                         onClick={() => updateSearchParam('category', cat)}
                         className={`text-[11px] uppercase tracking-tight w-full text-left transition-colors ${currentCategory === cat ? 'text-red-600 font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-red-600 font-medium'}`}
                      >
                        {cat}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-3 text-[10px] uppercase tracking-widest">Price Range</h3>
                <PriceRangeFilter 
                  minPrice={0} 
                  maxPrice={1000000} 
                  currentMin={minPriceParam} 
                  currentMax={maxPriceParam} 
                  onChange={(min, max) => {
                    const newParams = new URLSearchParams(searchParams);
                    newParams.set('minPrice', min.toString());
                    newParams.set('maxPrice', max.toString());
                    newParams.set('page', '1');
                    setSearchParams(newParams);
                  }} 
                />
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-12 text-center text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                Loading products...
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-12 text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mb-4">
                  <Filter size={24} />
                </div>
                <h3 className="text-[13px] font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-2">No products found</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-6">Try adjusting your filters or search query.</p>
                <button 
                  onClick={() => {
                    updateSearchParam('category', null);
                    updateSearchParam('search', null);
                    updateSearchParam('minPrice', null);
                    updateSearchParam('maxPrice', null);
                    updateSearchParam('page', null);
                  }}
                  className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-2 px-6 text-[10px] uppercase tracking-widest hover:bg-red-600 dark:hover:bg-red-600 hover:text-white dark:hover:text-white transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {products.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                
                {totalPages > 1 && (
                  <div className="flex justify-center items-center mt-12 gap-4">
                    <button 
                      disabled={pageParam === 1} 
                      onClick={() => {
                        updateSearchParam('page', (pageParam - 1).toString());
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="px-6 py-3 border border-slate-200 dark:border-slate-800 disabled:opacity-50 text-[11px] font-bold uppercase tracking-widest text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      Previous
                    </button>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                      Page {pageParam} of {totalPages}
                    </span>
                    <button 
                      disabled={pageParam === totalPages} 
                      onClick={() => {
                        updateSearchParam('page', (pageParam + 1).toString());
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="px-6 py-3 border border-slate-200 dark:border-slate-800 disabled:opacity-50 text-[11px] font-bold uppercase tracking-widest text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
