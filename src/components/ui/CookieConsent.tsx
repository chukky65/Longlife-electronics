import React, { useState, useEffect } from 'react';
import { X, Cookie } from 'lucide-react';

export const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasConsented = localStorage.getItem('longlife_cookie_consent');
    if (!hasConsented) {
      // Small delay to not overwhelm the user immediately
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('longlife_cookie_consent', 'true');
    setIsVisible(false);
  };

  const handleClose = () => {
    setIsVisible(false);
    // Optionally don't set local storage so it asks again next time,
    // or set it to false if you want to track decline, but we just dismiss it here.
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[90] bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] animate-in slide-in-from-bottom-full duration-300">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="bg-slate-100 dark:bg-slate-800 p-2 shrink-0">
            <Cookie size={20} className="text-slate-600 dark:text-slate-400" />
          </div>
          <div>
            <h4 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest mb-1">
              Privacy & Cookies
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed max-w-3xl">
              We use cookies and local storage to enhance your browsing experience, save your preferences, and analyze our traffic. By clicking "Accept", you consent to our use of cookies and data storage.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
          <button 
            onClick={handleClose}
            className="text-[11px] font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white uppercase tracking-widest transition-colors px-4 py-2"
          >
            Dismiss
          </button>
          <button 
            onClick={handleAccept}
            className="flex-1 sm:flex-none bg-slate-900 hover:bg-red-600 dark:bg-white dark:hover:bg-red-600 dark:text-slate-900 dark:hover:text-white text-white font-bold py-2.5 px-6 text-[11px] uppercase tracking-widest transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};
