import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, Clock, MapPin, ArrowRight } from 'lucide-react';
import Spline from '@splinetool/react-spline';

export const About = () => {
  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen">
      
      {/* Hero */}
      <section className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white tracking-tight mb-6">About Longlife Electronics</h1>
          <p className="text-xl text-gray-500 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Plugging Asaba into the future with genuine, high-quality home appliances and electronics.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="lg:w-1/2 w-full h-[400px] md:h-[500px] relative rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-lg bg-gray-100 dark:bg-gray-900">
              <div className="absolute inset-0 pointer-events-none hidden md:block z-10" />
              <Spline scene="https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode" className="w-full h-full" />
            </div>
            <div className="lg:w-1/2 space-y-6">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Our Story</h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                Located in the heart of Asaba at Jossy Plaza, Longlife Electronics has built a reputation as the most trusted retail destination for household appliances and modern electronics.
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                We understand that buying an appliance is an investment in your home. That's why we only stock genuine products from world-renowned brands like LG, Hisense, Panasonic, Samsung, and Thermocool.
              </p>
              <div className="pt-4 flex gap-4">
                <Link to="/products" className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors inline-flex items-center gap-2">
                  Shop Our Collection <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-white dark:bg-gray-900 border-y border-gray-200 dark:border-gray-800 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Why Buy From Us?</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-gray-50 dark:bg-gray-950 p-8 rounded-2xl border border-gray-100 dark:border-gray-800">
              <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-xl flex items-center justify-center mb-6">
                <ShieldCheck size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">100% Genuine</h3>
              <p className="text-gray-600 dark:text-gray-400">We source directly from official manufacturers, ensuring you get authentic products with valid warranties.</p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-950 p-8 rounded-2xl border border-gray-100 dark:border-gray-800">
              <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-xl flex items-center justify-center mb-6">
                <MapPin size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Physical Store</h3>
              <p className="text-gray-600 dark:text-gray-400">Unlike online-only vendors, you can walk into our Asaba store anytime to see products and get support.</p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-950 p-8 rounded-2xl border border-gray-100 dark:border-gray-800">
              <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-xl flex items-center justify-center mb-6">
                <Truck size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Fast Delivery</h3>
              <p className="text-gray-600 dark:text-gray-400">Enjoy swift and safe delivery across Delta State, or order online and pick up in-store.</p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-950 p-8 rounded-2xl border border-gray-100 dark:border-gray-800">
              <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-xl flex items-center justify-center mb-6">
                <Clock size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Expert Support</h3>
              <p className="text-gray-600 dark:text-gray-400">Our knowledgeable staff are always ready to help you choose the right appliance for your needs and budget.</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
