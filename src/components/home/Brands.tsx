import React from 'react';

const brandNames = ['Hisense', 'LG', 'Panasonic', 'QASA', 'Century', 'Firman'];

export const Brands = () => {
  return (
    <section className="py-10 bg-slate-950 text-white border-y border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-slate-400 text-center mb-6">
          Trusted Brands In Store
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {brandNames.map((brand) => (
            <div
              key={brand}
              className="border border-slate-800 bg-slate-900/70 px-4 py-5 text-center text-sm font-black uppercase tracking-[0.18em] text-slate-200"
            >
              {brand}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
