import React from 'react';
import { MapPin, Navigation } from 'lucide-react';

export const StoreLocator = () => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-12">
      <div className="grid grid-cols-1 lg:grid-cols-3">
        
        {/* Address Info */}
        <div className="p-8 md:p-10 lg:col-span-1 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 flex flex-col justify-center">
          <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-6">
            <MapPin size={24} className="text-red-600" />
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4">
            Visit Our Store
          </h3>
          <div className="space-y-4 mb-8 text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed">
            <p>
              <strong className="block text-slate-900 dark:text-white font-bold uppercase tracking-widest text-[11px] mb-1">Address</strong>
              Jossy Plaza Opp. Ezebuilo Filling Station,<br />
              Off Dennis Osadebe Way,<br />
              Asaba, Delta State
            </p>
            <p>
              <strong className="block text-slate-900 dark:text-white font-bold uppercase tracking-widest text-[11px] mb-1">Hours</strong>
              Monday - Saturday: 8:00 AM - 6:00 PM<br />
              Sunday: Closed
            </p>
          </div>
          <a
            href="https://maps.google.com/?q=Jossy+Plaza+Asaba+Delta+State"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-slate-900 hover:bg-red-600 dark:bg-white dark:hover:bg-red-600 dark:text-slate-900 dark:hover:text-white text-white font-bold py-3 px-6 text-[11px] uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
          >
            <Navigation size={14} /> Get Directions
          </a>
        </div>

        {/* Map Placeholder */}
        <div className="lg:col-span-2 relative bg-slate-100 dark:bg-slate-800 h-[300px] lg:h-auto min-h-[400px]">
          {/* We use a stylized placeholder for the map to match the aesthetic */}
          <div className="absolute inset-0 opacity-20 dark:opacity-40" style={{ backgroundImage: 'radial-gradient(circle at center, #94a3b8 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
          
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative group cursor-pointer">
              {/* Ping animation */}
              <div className="absolute -inset-4 bg-red-600/20 rounded-full animate-ping"></div>
              
              {/* Map Marker */}
              <div className="relative w-12 h-12 bg-white dark:bg-slate-900 rounded-full shadow-lg flex items-center justify-center border-2 border-red-600 z-10 transition-transform group-hover:scale-110">
                <div className="w-4 h-4 bg-red-600 rounded-full"></div>
              </div>
              
              {/* Tooltip */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none before:absolute before:bottom-full before:left-1/2 before:-translate-x-1/2 before:border-4 before:border-transparent before:border-b-slate-900 dark:before:border-b-white">
                Longlife Electronics Asaba
              </div>
            </div>
          </div>
          
          <div className="absolute bottom-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 shadow-sm border border-slate-200 dark:border-slate-800">
            Interactive Map Placeholder
          </div>
        </div>

      </div>
    </div>
  );
};
