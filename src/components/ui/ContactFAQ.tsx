import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { cn } from '../../utils';

const faqs = [
  {
    question: "Do you offer local delivery in Asaba?",
    answer: "Yes, we offer fast local delivery within Asaba and surrounding areas. For most items, same-day or next-day delivery is available. Delivery fees may apply depending on the size of the item and your exact location."
  },
  {
    question: "How do I claim a warranty on a purchased product?",
    answer: "To claim a warranty, bring the product along with your original receipt or invoice to our physical store. All products come with a standard manufacturer's warranty, and our team will assist you with the repair or replacement process as specified by the brand."
  },
  {
    question: "What are your store operating hours?",
    answer: "Our physical store at Jossy Plaza, Asaba is open Monday through Saturday from 8:00 AM to 6:00 PM. We are closed on Sundays and major public holidays."
  },
  {
    question: "Can I pay on delivery?",
    answer: "We offer Payment on Delivery (PoD) for select locations within Asaba. However, for large appliances or bulk orders, a partial commitment deposit might be required before dispatch."
  }
];

export const ContactFAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="mt-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 md:p-10 shadow-sm max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <HelpCircle size={24} className="text-red-600" />
        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
          Frequently Asked Questions
        </h2>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div 
            key={index} 
            className="border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
          >
            <button
              onClick={() => toggleAccordion(index)}
              className="w-full flex items-center justify-between p-4 md:p-6 text-left focus:outline-none"
            >
              <span className="text-[13px] font-bold text-slate-900 dark:text-white">
                {faq.question}
              </span>
              {openIndex === index ? (
                <ChevronUp size={20} className="text-red-600 shrink-0 ml-4" />
              ) : (
                <ChevronDown size={20} className="text-slate-400 shrink-0 ml-4" />
              )}
            </button>
            
            <div 
              className={cn(
                "overflow-hidden transition-all duration-300 ease-in-out",
                openIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              )}
            >
              <div className="p-4 md:p-6 pt-0 text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-200 dark:border-slate-700 mt-2 mx-4 md:mx-6 pb-4 md:pb-6">
                {faq.answer}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
