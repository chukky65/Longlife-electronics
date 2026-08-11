import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, MessageCircle } from 'lucide-react';
import { StoreLocator } from '../components/ui/StoreLocator';
import { ContactFAQ } from '../components/ui/ContactFAQ';
import { supabase } from '../lib/supabase';
import { useStore } from '../store';

export const Contact = () => {
  const { toast } = useStore();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast('Please fill in all required fields.', 'error');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('inquiries').insert([
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message
        }
      ]);

      if (error) throw error;

      toast('Message sent successfully! We will get back to you soon.');
      setFormData({ name: '', phone: '', email: '', message: '' });
    } catch (error: any) {
      toast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="bg-slate-50 dark:bg-gray-950 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4">Get In Touch</h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-[13px] leading-relaxed">
            We are here to help. Whether you have a question about our products, pricing, or need assistance with your order.
          </p>
        </div>

        <StoreLocator />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
              <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white flex items-center justify-center mb-6">
                <MapPin size={24} />
              </div>
              <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4">Our Store Location</h3>
              <p className="text-slate-600 dark:text-slate-400 text-[13px] leading-relaxed">
                Jossy Plaza Opp. Ezebuilo Filling Station,<br/>
                Off Dennis Osadebe Way,<br/>
                Asaba, Delta State
              </p>
            </div>
            
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
              <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white flex items-center justify-center mb-6">
                <Phone size={24} />
              </div>
              <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4">Call or WhatsApp</h3>
              <p className="text-slate-600 dark:text-slate-400 text-[13px] leading-relaxed mb-1">0906 936 1175</p>
              <p className="text-slate-600 dark:text-slate-400 text-[13px] leading-relaxed">0903 643 4242</p>
            </div>
            
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
              <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white flex items-center justify-center mb-6">
                <Clock size={24} />
              </div>
              <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4">Business Hours</h3>
              <p className="text-slate-600 dark:text-slate-400 text-[13px] leading-relaxed mb-1">Monday - Saturday: 8:00 AM - 6:00 PM</p>
              <p className="text-slate-600 dark:text-slate-400 text-[13px] leading-relaxed">Sunday: Closed</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 md:p-10 shadow-sm">
            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-8">Send us a message</h2>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Your Name *</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 text-[13px] text-slate-900 dark:text-white focus:outline-none focus:border-red-600 transition-colors" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Phone Number</label>
                  <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 text-[13px] text-slate-900 dark:text-white focus:outline-none focus:border-red-600 transition-colors" placeholder="09012345678" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Email Address *</label>
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 text-[13px] text-slate-900 dark:text-white focus:outline-none focus:border-red-600 transition-colors" placeholder="john@example.com" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Message *</label>
                <textarea rows={5} value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 text-[13px] text-slate-900 dark:text-white focus:outline-none focus:border-red-600 transition-colors resize-none" placeholder="How can we help you?"></textarea>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button type="submit" disabled={loading} className="flex-1 bg-slate-900 hover:bg-red-600 dark:bg-white dark:hover:bg-red-600 dark:text-slate-900 dark:hover:text-white text-white font-bold py-4 px-8 text-[11px] uppercase tracking-widest transition-colors disabled:opacity-50">
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
                <a href="https://wa.me/2349069361175" target="_blank" rel="noopener noreferrer" className="flex-1 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-4 px-8 text-[11px] uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                  <MessageCircle size={16} /> Chat on WhatsApp
                </a>
              </div>
            </form>
          </div>
        </div>

        <ContactFAQ />
      </div>
    </div>
  );
};
