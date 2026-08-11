import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Search, User, Menu, X, Sun, Moon, Scale } from 'lucide-react';
import { useStore } from '../../store';

export const Header = () => {
  const { cartCount, theme, toggleTheme, compareList } = useStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800 transition-colors">
      {/* Top bar */}
      <div className="bg-red-700 text-white text-[10px] py-1 px-4 flex justify-between items-center hidden md:flex">
        <span className="font-medium uppercase tracking-widest">Free Delivery within Asaba & Environs</span>
        <div className="flex gap-4">
          <span>Call: 09069361175</span>
          <span>WhatsApp: 09036434242</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="bg-red-600 p-1.5 rounded-sm">
              <div className="w-6 h-6 border-2 border-white flex items-center justify-center font-black text-white text-xs italic">
                LL
              </div>
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white leading-none tracking-tighter uppercase">Longlife</h1>
              <p className="text-[8px] font-bold text-red-600 uppercase tracking-widest leading-none mt-1">Electronics</p>
            </div>
          </Link>

          {/* Desktop Search */}
          <div className="hidden lg:flex flex-1 max-w-xl mx-8 relative flex items-center">
            <form onSubmit={handleSearch} className="w-full relative">
              <input 
                type="text" 
                placeholder="Search for refrigerators, TVs, ACs..." 
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full py-2 px-10 text-xs focus:outline-none focus:ring-1 focus:ring-red-500 dark:text-white transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-600 transition-colors">
                <Search size={16} />
              </button>
              <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-red-600 uppercase tracking-tight">
                Ask AI Assistant
              </button>
            </form>
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-4 pl-6 border-l border-gray-200 dark:border-gray-700">
            <button onClick={toggleTheme} className="text-slate-600 dark:text-gray-300 hover:text-red-600 transition-colors">
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <Link to="/profile" className="text-slate-600 dark:text-gray-300 hover:text-red-600 transition-colors">
              <User size={20} />
            </Link>
            <Link to="/compare" className="relative text-slate-600 dark:text-gray-300 hover:text-red-600 transition-colors">
              <Scale size={20} />
              {compareList.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center border-none">
                  {compareList.length}
                </span>
              )}
            </Link>
            <Link to="/wishlist" className="relative text-slate-600 dark:text-gray-300 hover:text-red-600 transition-colors">
              <Heart size={20} />
            </Link>
            <Link to="/cart" className="relative text-slate-600 dark:text-gray-300 hover:text-red-600 transition-colors">
              <ShoppingCart size={20} />
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center border-none">
                {cartCount}
              </span>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center gap-4 lg:hidden">
            <button onClick={toggleTheme} className="text-gray-600 dark:text-gray-300">
              {theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
            </button>
            <button 
              className="text-gray-600 dark:text-gray-300"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Expansion */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-4 space-y-4 shadow-lg absolute w-full">
          <form onSubmit={handleSearch} className="w-full relative">
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full bg-gray-100 dark:bg-gray-800 border-transparent rounded-lg py-3 pl-4 pr-12 text-sm dark:text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search size={20} />
            </button>
          </form>
          
          <nav className="flex flex-col gap-2">
            <Link to="/products" className="py-2 text-gray-800 dark:text-gray-200 font-medium border-b border-gray-100 dark:border-gray-800" onClick={() => setIsMobileMenuOpen(false)}>All Products</Link>
            <Link to="/compare" className="py-2 text-gray-800 dark:text-gray-200 font-medium border-b border-gray-100 dark:border-gray-800 flex justify-between" onClick={() => setIsMobileMenuOpen(false)}>
              <span>Compare</span>
              {compareList.length > 0 && <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{compareList.length}</span>}
            </Link>
            <Link to="/profile" className="py-2 text-gray-800 dark:text-gray-200 font-medium border-b border-gray-100 dark:border-gray-800" onClick={() => setIsMobileMenuOpen(false)}>My Account</Link>
            <Link to="/about" className="py-2 text-gray-800 dark:text-gray-200 font-medium border-b border-gray-100 dark:border-gray-800" onClick={() => setIsMobileMenuOpen(false)}>About Us</Link>
            <Link to="/contact" className="py-2 text-gray-800 dark:text-gray-200 font-medium border-b border-gray-100 dark:border-gray-800" onClick={() => setIsMobileMenuOpen(false)}>Contact</Link>
            <Link to="/tracking" className="py-2 text-gray-800 dark:text-gray-200 font-medium border-b border-gray-100 dark:border-gray-800" onClick={() => setIsMobileMenuOpen(false)}>Order Tracking</Link>
          </nav>
        </div>
      )}

      {/* Desktop Navigation Categories */}
      <div className="hidden lg:block border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ul className="flex items-center gap-6 py-3 text-[11px] font-bold uppercase tracking-tight text-slate-600 dark:text-gray-300 overflow-x-auto whitespace-nowrap">
            <li><Link to="/products" className="text-red-600 hover:text-red-700 transition-colors">All Products</Link></li>
            <li><Link to="/products?category=Refrigerators" className="hover:text-red-600 transition-colors">Refrigerators</Link></li>
            <li><Link to="/products?category=LED+%26+Smart+TVs" className="hover:text-red-600 transition-colors">LED & Smart TVs</Link></li>
            <li><Link to="/products?category=Air+Conditioners" className="hover:text-red-600 transition-colors">Air Conditioners</Link></li>
            <li><Link to="/products?category=Home+Theater" className="hover:text-red-600 transition-colors">Home Theater</Link></li>
            <li><Link to="/products?category=Washing+Machines" className="hover:text-red-600 transition-colors">Washing Machines</Link></li>
            <li><Link to="/about" className="hover:text-red-600 transition-colors ml-auto text-slate-400 dark:text-gray-500">About Store</Link></li>
          </ul>
        </div>
      </div>
    </header>
  );
};
