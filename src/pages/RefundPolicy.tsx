import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

export const RefundPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pt-24 pb-16 bg-white dark:bg-gray-950 min-h-screen">
      <Helmet>
        <title>Refund & Return Policy | Longlife Electronics</title>
      </Helmet>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Refund & Return Policy</h1>
        
        <div className="prose prose-lg dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
          <p className="mb-6">Last updated: 13 August 2026</p>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">1. Return Window</h2>
          <p className="mb-6">
            We offer a 7-day return window for most eligible items. If 7 days have gone by since your purchase was delivered, 
            unfortunately, we cannot offer you a refund or exchange.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">2. Eligibility for Returns</h2>
          <p className="mb-6">
            To be eligible for a return, your item must be unused, in the same condition that you received it, and in its original packaging. 
            Certain types of goods are exempt from being returned, such as items damaged after delivery or items missing original accessories.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">3. Refunds Process</h2>
          <p className="mb-6">
            Once your return is received and inspected, we will send you an email or call you to notify you that we have received your returned item. 
            We will also notify you of the approval or rejection of your refund. 
            If approved, your refund will be processed, and a credit will automatically be applied to your original method of payment, within 3-5 business days.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">4. Defective or Damaged Items</h2>
          <p className="mb-6">
            We only replace items if they are defective or damaged out-of-the-box. If you need to exchange it for the same item, 
            contact us immediately upon delivery.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">5. Shipping Returns</h2>
          <p className="mb-6">
            To return your product, you should mail or deliver your product to:<br /><br />
            <strong>Longlife Electronics</strong><br />
            Jossy Plaza Opp. Ezebuilo Filling Station,<br />
            Off Dennis Osadebe Way,<br />
            Asaba, Delta State<br /><br />
            You will be responsible for paying for your own shipping costs for returning your item unless the return is due to an error on our part (e.g., wrong item delivered).
          </p>
        </div>
      </div>
    </div>
  );
};
