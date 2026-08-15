import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

export const Terms = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pt-24 pb-16 bg-white dark:bg-gray-950 min-h-screen">
      <Helmet>
        <title>Terms & Conditions | Longlife Electronics</title>
      </Helmet>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Terms & Conditions</h1>
        
        <div className="prose prose-lg dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
          <p className="mb-6">Last updated: 13 August 2026</p>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">1. Agreement to Terms</h2>
          <p className="mb-6">
            These Terms and Conditions constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") 
            and Longlife Electronics ("we," "us" or "our"), concerning your access to and use of our website as well as any other media form, 
            media channel, mobile website or mobile application related, linked, or otherwise connected thereto.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">2. Products and Pricing</h2>
          <p className="mb-6">
            All products are subject to availability, and we cannot guarantee that items will be in stock. We reserve the right to discontinue any products at any time for any reason. 
            Prices for all products are subject to change. We make every effort to display as accurately as possible the colors, features, specifications, and details of the products available on the Site.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">3. Purchases and Payment</h2>
          <p className="mb-6">
            We accept the following forms of payment: Cash on Delivery, Bank Transfer, and Secure Online Card Payments. 
            You agree to provide current, complete, and accurate purchase and account information for all purchases made via the Site.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">4. Shipping and Delivery</h2>
          <p className="mb-6">
            Delivery times are estimates and commence from the date of shipping, rather than the date of order. 
            Delivery times are to be used as a guide only and are subject to the acceptance and approval of your order.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">5. Contact Us</h2>
          <p className="mb-6">
            In order to resolve a complaint regarding the Site or to receive further information regarding use of the Site, please contact us at:<br /><br />
            <strong>Longlife Electronics</strong><br />
            Jossy Plaza Opp. Ezebuilo Filling Station,<br />
            Off Dennis Osadebe Way,<br />
            Asaba, Delta State<br />
            Email: sales@longlifeelectronics.com.ng<br />
            Phone: 09069361175, 09036434242
          </p>
        </div>
      </div>
    </div>
  );
};
