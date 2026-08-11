import React, { useRef } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: "Chukwudi O.",
    role: "Verified Buyer in Asaba",
    content: "I bought my LG refrigerator here. The delivery was incredibly fast, and it's a genuine product. Will definitely shop here again.",
    rating: 5,
  },
  {
    id: 2,
    name: "Ngozi A.",
    role: "Local Business Owner",
    content: "Longlife Electronics supplied all the AC units for my restaurant. Their in-store staff was very helpful and guided me to the right choice.",
    rating: 5,
  },
  {
    id: 3,
    name: "Emeka U.",
    role: "Verified Buyer",
    content: "Was skeptical about buying a TV online, but visiting their physical store gave me confidence. Real products, real people. Highly recommended!",
    rating: 5,
  },
  {
    id: 4,
    name: "Grace M.",
    role: "Verified Buyer",
    content: "Their customer service on WhatsApp is top-notch! They replied immediately and I got exactly what I ordered the same day.",
    rating: 5,
  },
  {
    id: 5,
    name: "David T.",
    role: "Verified Buyer",
    content: "Very satisfied with my purchase. The microwave works perfectly and the price was better than other stores in Delta State.",
    rating: 4,
  }
];

export const TestimonialCarousel = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef;
      const scrollAmount = current.clientWidth >= 768 ? 400 : 300;
      if (direction === 'left') {
        current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  return (
    <section className="py-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div className="max-w-2xl">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2">
              Don't Just Take Our Word For It
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-relaxed">
              Real feedback from real customers across Delta State.
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => scroll('left')}
              className="w-10 h-10 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors"
              aria-label="Previous testimonials"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={() => scroll('right')}
              className="w-10 h-10 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors"
              aria-label="Next testimonials"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-4 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {testimonials.map((testimonial) => (
            <div 
              key={testimonial.id}
              className="snap-start shrink-0 w-[280px] sm:w-[350px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-8 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={14} 
                        className={i < testimonial.rating ? "fill-yellow-400 text-yellow-400" : "fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700"} 
                      />
                    ))}
                  </div>
                  <Quote size={20} className="text-slate-300 dark:text-slate-600" />
                </div>
                <p className="text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed mb-6 font-medium">
                  "{testimonial.content}"
                </p>
              </div>
              <div>
                <h4 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest">
                  {testimonial.name}
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5">
                  {testimonial.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
