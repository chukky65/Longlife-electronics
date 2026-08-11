import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Instagram, Facebook, Twitter, CreditCard, Send } from 'lucide-react';
import { useStore } from '../../store';

export const Footer = () => {
  const [email, setEmail] = useState('');
  const { toast } = useStore();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      toast('Please enter a valid email address.', 'error');
      return;
    }
    toast('Subscribed to newsletter successfully!');
    setEmail('');
  };

  return (
    <footer className="bg-slate-900 pt-16 pb-8 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Newsletter Section */}
        <div className="bg-slate-800 rounded-2xl p-8 mb-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-white font-bold text-lg mb-2">Subscribe to our Newsletter</h3>
            <p className="text-[11px] text-slate-400">Get the latest updates on new products and upcoming sales.</p>
          </div>
          <form onSubmit={handleSubscribe} className="flex w-full md:w-auto gap-2">
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email" 
              className="bg-slate-900 border border-slate-700 text-white px-4 py-2 text-[11px] min-w-[250px] focus:outline-none focus:border-red-600 rounded-sm"
            />
            <button type="submit" className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 rounded-sm transition-colors">
              Subscribe <Send size={14} />
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand & About */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-red-600 p-1.5 rounded-sm">
                <div className="w-6 h-6 border-2 border-white flex items-center justify-center font-black text-white text-[10px] italic">
                  LL
                </div>
              </div>
              <div>
                <h1 className="text-lg font-black text-white leading-none tracking-tighter uppercase">Longlife</h1>
                <p className="text-[7px] font-bold text-red-600 uppercase tracking-widest leading-none mt-1">Electronics</p>
              </div>
            </div>
            <p className="text-[11px] leading-relaxed mb-6">
              Plug Into The Future With Longlife Electronics. Your trusted source for genuine home appliances and electronics in Asaba, Delta State.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors">
                <Facebook size={14} />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors">
                <Instagram size={14} />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors">
                <Twitter size={14} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-[11px] uppercase tracking-widest mb-6">Quick Links</h4>
            <ul className="space-y-3 text-[11px]">
              <li><Link to="/products" className="hover:text-white transition-colors">Shop All Products</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link to="/tracking" className="hover:text-white transition-colors">Track Order</Link></li>
              <li><Link to="/admin" className="hover:text-white transition-colors">Admin Portal</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-bold text-[11px] uppercase tracking-widest mb-6">Top Categories</h4>
            <ul className="space-y-3 text-[11px]">
              <li><Link to="/products?category=Refrigerators" className="hover:text-white transition-colors">Refrigerators</Link></li>
              <li><Link to="/products?category=LED+%26+Smart+TVs" className="hover:text-white transition-colors">Smart TVs</Link></li>
              <li><Link to="/products?category=Air+Conditioners" className="hover:text-white transition-colors">Air Conditioners</Link></li>
              <li><Link to="/products?category=Home+Theater" className="hover:text-white transition-colors">Home Theater</Link></li>
              <li><Link to="/products?category=Washing+Machines" className="hover:text-white transition-colors">Washing Machines</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold text-[11px] uppercase tracking-widest mb-6">Visit Our Store</h4>
            <ul className="space-y-4 text-[11px]">
              <li className="flex gap-3 items-start">
                <MapPin className="text-red-600 shrink-0 mt-0.5" size={16} />
                <span>Jossy Plaza Opp. Ezebuilo Filling Station,<br />Off Dennis Osadebe Way,<br />Asaba, Delta State</span>
              </li>
              <li className="flex gap-3 items-center">
                <Phone className="text-red-600 shrink-0" size={16} />
                <span>09069361175, 09036434242</span>
              </li>
              <li className="flex gap-3 items-center">
                <Mail className="text-red-600 shrink-0" size={16} />
                <span>sales@longlifeelectronics.com.ng</span>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom bar */}
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] uppercase tracking-widest">
          <p>&copy; {new Date().getFullYear()} Longlife Electronics. All rights reserved.</p>
          <div className="flex items-center gap-4 text-slate-500">
             <span className="flex items-center gap-1"><CreditCard size={14} /> Visa</span>
             <span className="flex items-center gap-1"><CreditCard size={14} /> Mastercard</span>
             <span className="flex items-center gap-1"><CreditCard size={14} /> Verve</span>
          </div>
          <div className="flex flex-wrap gap-4 md:gap-6 justify-center">
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/refund" className="hover:text-white transition-colors">Refund Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
