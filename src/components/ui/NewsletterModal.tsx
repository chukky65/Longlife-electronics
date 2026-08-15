import React, { useState, useEffect } from 'react';
import { X, Mail, ArrowRight } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useStore } from '../../store';

export const NewsletterModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const location = useLocation();
  const { toast } = useStore();

  useEffect(() => {
    const hasSeenModal = localStorage.getItem('longlife_newsletter_seen');
    if (!hasSeenModal && location.pathname === '/') {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('longlife_newsletter_seen', 'true');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isSubmitting) return;

    setIsSubmitting(true);
    const { data, error } = await supabase.functions.invoke('subscribe-newsletter', {
      body: { email },
    });
    setIsSubmitting(false);

    if (error || data?.error) {
      toast(data?.error || error?.message || 'Unable to subscribe right now.', 'error');
      return;
    }

    setIsSubmitted(true);
    localStorage.setItem('longlife_newsletter_seen', 'true');
    setTimeout(() => handleClose(), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg relative animate-in fade-in zoom-in-95 duration-300"
      >
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-red-600 transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col md:flex-row h-full">
          {/* Left Side - Image/Graphic */}
          <div className="hidden md:flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800 p-8 w-2/5 border-r border-slate-200 dark:border-slate-800">
            <div className="bg-red-600 p-2 mb-4">
              <div className="w-12 h-12 border-2 border-white flex items-center justify-center font-black text-white text-xl italic">
                LL
              </div>
            </div>
            <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tighter text-center leading-tight">
              Longlife<br/>Electronics
            </h3>
          </div>

          {/* Right Side - Form */}
          <div className="p-8 md:p-10 w-full md:w-3/5 flex flex-col justify-center">
            {!isSubmitted ? (
              <>
                <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2">
                  Join Our Newsletter
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                  Get exclusive deals, new arrival updates, and tech tips straight to your inbox.
                </p>
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail size={16} className="text-slate-400" />
                    </div>
                    <input 
                      type="email" 
                      required
                      placeholder="Your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 py-3 pl-10 pr-4 text-[11px] font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-red-600 transition-colors rounded-none"
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-slate-900 hover:bg-red-600 dark:bg-white dark:hover:bg-red-600 dark:text-slate-900 dark:hover:text-white text-white font-bold py-3 px-6 text-[11px] uppercase tracking-widest transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Subscribing...' : 'Subscribe'} <ArrowRight size={14} />
                  </button>
                </form>
                <p className="text-[9px] text-slate-400 mt-4 text-center">
                  By subscribing, you agree to our terms & conditions.
                </p>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-6">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center rounded-full mb-4">
                  <Mail size={24} />
                </div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2">
                  Thank You!
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  You have successfully subscribed to our newsletter.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
