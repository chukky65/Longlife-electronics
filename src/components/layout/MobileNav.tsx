import React from 'react';
import { Home, Search, Heart, ShoppingCart, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../../store';
import { cn } from '../../utils';

export const MobileNav = () => {
  const location = useLocation();
  const { cartCount } = useStore();

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Search', path: '/products', icon: Search },
    { name: 'Wishlist', path: '/wishlist', icon: Heart },
    { name: 'Cart', path: '/cart', icon: ShoppingCart, badge: cartCount },
    { name: 'Account', path: '/admin', icon: User },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pb-safe z-50 transition-colors">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
                          (item.path !== '/' && location.pathname.startsWith(item.path));
          
          return (
            <Link 
              key={item.name} 
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors relative",
                isActive ? "text-red-600" : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              )}
            >
              <div className="relative">
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-red-600 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center border border-white dark:border-gray-900">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
