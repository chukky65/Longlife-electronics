import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, CartItem, User } from './types';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { cn } from './utils';
import { supabase } from './lib/supabase';

export type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

export interface StoreContextType {
  cart: CartItem[];
  wishlist: Product[];
  compareList: Product[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  toggleCompare: (product: Product) => void;
  removeFromCompare: (productId: string) => void;
  isInCompare: (productId: string) => boolean;
  clearCompare: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  cartTotal: number;
  cartCount: number;
  toast: (message: string, type?: ToastType) => void;
  user: User | null;
  login: (user: User) => void;
  logout: () => Promise<void>;
  authLoading: boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('longlife_cart');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [wishlist, setWishlist] = useState<Product[]>(() => {
    const saved = localStorage.getItem('longlife_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  const [compareList, setCompareList] = useState<Product[]>(() => {
    const saved = localStorage.getItem('longlife_compare');
    return saved ? JSON.parse(saved) : [];
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('longlife_theme');
    return (saved as 'light' | 'dark') || 'light';
  });

  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync state to local storage (always do this as a fallback)
  useEffect(() => {
    localStorage.setItem('longlife_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('longlife_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('longlife_compare', JSON.stringify(compareList));
  }, [compareList]);

  useEffect(() => {
    localStorage.setItem('longlife_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Sync from DB when user logs in
  const syncUserCartAndWishlist = async (userId: string) => {
    // 1. Wishlist
    const { data: dbWishlist } = await supabase
      .from('wishlist_items')
      .select('*, product:products(*)')
      .eq('user_id', userId);
      
    if (dbWishlist) {
      const dbWishlistProducts = dbWishlist
        .filter(item => item.product)
        .map(item => ({
          ...item.product,
          originalPrice: item.product.original_price,
          inStock: item.product.in_stock,
          reviewsCount: item.product.reviews_count,
          isNew: item.product.is_new,
          isPopular: item.product.is_popular
        })) as Product[];
      setWishlist(dbWishlistProducts);
    }

    // 2. Cart
    const { data: dbCart } = await supabase
      .from('cart_items')
      .select('*, product:products(*)')
      .eq('user_id', userId);

    if (dbCart) {
      const dbCartItems: CartItem[] = dbCart
        .filter(item => item.product)
        .map(item => ({
          product: {
            ...item.product,
            originalPrice: item.product.original_price,
            inStock: item.product.in_stock,
            reviewsCount: item.product.reviews_count,
            isNew: item.product.is_new,
            isPopular: item.product.is_popular
          } as Product,
          quantity: item.quantity
        }));
      setCart(dbCartItems);
    }
  };

  // Auth Listener
  useEffect(() => {
    const fetchProfile = async (userId: string, email: string) => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data) {
        setUser({
          id: data.id,
          name: data.name || 'User',
          email: email,
          phone: data.phone || '',
          role: data.role as 'user' | 'admin',
        });
      } else {
        setUser({
          id: userId,
          name: 'User',
          email: email,
          phone: '',
          role: 'user',
        });
      }
      
      await syncUserCartAndWishlist(userId);
      setAuthLoading(false);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email || '');
      } else {
        setUser(null);
        setAuthLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email || '');
      } else {
        setUser(null);
        setCart([]); // Clear cart on logout
        setWishlist([]); // Clear wishlist on logout
        setAuthLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = (newUser: User) => {
    setUser(newUser);
    toast('Logged in successfully!');
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    toast('Logged out successfully!', 'info');
  };

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addToCart = async (product: Product, quantity = 1) => {
    let quantityAdded = 0;
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      
      if (existing) {
        const newQty = Math.min(product.stock, existing.quantity + quantity);
        quantityAdded = newQty - existing.quantity;
        if (quantityAdded === 0) return prev;
        
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: newQty }
            : item
        );
      }
      
      quantityAdded = Math.min(product.stock, quantity);
      if (quantityAdded === 0) return prev;
      
      return [...prev, { product, quantity: quantityAdded }];
    });
    
    // We didn't add anything, so don't toast or update DB
    if (quantityAdded === 0) {
      toast(`Cannot add more ${product.name}, stock limit reached`, 'error');
      return;
    }
    
    toast(`Added ${product.name} to cart`);

    if (user) {
      const { data: existing } = await supabase.from('cart_items').select('*').eq('user_id', user.id).eq('product_id', product.id).single();
      if (existing) {
        await supabase.from('cart_items').update({ quantity: existing.quantity + quantity }).eq('id', existing.id);
      } else {
        await supabase.from('cart_items').insert({ user_id: user.id, product_id: product.id, quantity });
      }
    }
  };

  const removeFromCart = async (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
    toast('Item removed from cart', 'info');

    if (user) {
      await supabase.from('cart_items').delete().eq('user_id', user.id).eq('product_id', productId);
    }
  };

  const updateCartQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(prev => {
      const item = prev.find(i => i.product.id === productId);
      if (!item) return prev;
      
      const newQty = Math.min(item.product.stock, quantity);
      return prev.map(i => 
        i.product.id === productId ? { ...i, quantity: newQty } : i
      );
    });

    if (user) {
      await supabase.from('cart_items').update({ quantity }).eq('user_id', user.id).eq('product_id', productId);
    }
  };

  const clearCart = async () => {
    setCart([]);
    toast('Cart cleared', 'info');

    if (user) {
      await supabase.from('cart_items').delete().eq('user_id', user.id);
    }
  };

  const toggleWishlist = async (product: Product) => {
    let isAdding = false;
    setWishlist(prev => {
      const exists = prev.some(p => p.id === product.id);
      if (exists) {
        toast('Removed from wishlist', 'info');
        return prev.filter(p => p.id !== product.id);
      }
      toast('Added to wishlist');
      isAdding = true;
      return [...prev, product];
    });

    if (user) {
      if (isAdding) {
        await supabase.from('wishlist_items').insert({ user_id: user.id, product_id: product.id });
      } else {
        await supabase.from('wishlist_items').delete().eq('user_id', user.id).eq('product_id', product.id);
      }
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some(p => p.id === productId);
  };

  const toggleCompare = (product: Product) => {
    setCompareList(prev => {
      const exists = prev.some(p => p.id === product.id);
      if (exists) {
        toast('Removed from compare', 'info');
        return prev.filter(p => p.id !== product.id);
      }
      if (prev.length >= 3) {
        toast('You can only compare up to 3 items', 'error');
        return prev;
      }
      toast('Added to compare');
      return [...prev, product];
    });
  };

  const removeFromCompare = (productId: string) => {
    setCompareList(prev => prev.filter(p => p.id !== productId));
    toast('Removed from compare', 'info');
  };

  const clearCompare = () => {
    setCompareList([]);
    toast('Comparison cleared', 'info');
  };

  const isInCompare = (productId: string) => {
    return compareList.some(p => p.id === productId);
  };

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const cartTotal = cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <StoreContext.Provider value={{
      cart, wishlist, compareList, addToCart, removeFromCart, updateCartQuantity, clearCart,
      toggleWishlist, isInWishlist, toggleCompare, removeFromCompare, isInCompare, clearCompare, theme, toggleTheme, cartTotal, cartCount, toast, user, login, logout, authLoading
    }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "flex items-center gap-3 p-4 min-w-[300px] shadow-lg animate-in slide-in-from-right-full fade-in duration-300",
              t.type === 'success' ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" :
              t.type === 'error' ? "bg-red-600 text-white" :
              "bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900"
            )}
          >
            {t.type === 'success' && <CheckCircle2 size={16} />}
            {t.type === 'error' && <AlertCircle size={16} />}
            <span className="text-[10px] font-bold uppercase tracking-widest flex-1">{t.message}</span>
            <button onClick={() => removeToast(t.id)} className="opacity-50 hover:opacity-100 transition-opacity">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
