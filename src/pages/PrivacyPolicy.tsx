import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

export const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pt-24 pb-16 bg-white dark:bg-gray-950 min-h-screen">
      <Helmet>
        <title>Privacy Policy | Longlife Electronics</title>
      </Helmet>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Privacy Policy</h1>
        
        <div className="prose prose-lg dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
          <p className="mb-6">Last updated: 13 August 2026</p>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">1. Introduction</h2>
          <p className="mb-6">
            Welcome to Longlife Electronics. We respect your privacy and are committed to protecting your personal data. 
            This privacy policy will inform you as to how we look after your personal data when you visit our website 
            (regardless of where you visit it from) and tell you about your privacy rights and how the law protects you.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">2. The Data We Collect About You</h2>
          <p className="mb-6">
            We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
          </p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
            <li><strong>Contact Data:</strong> includes billing address, delivery address, email address and telephone numbers.</li>
            <li><strong>Payment Data:</strong> card details are collected and processed by Paystack. We receive the transaction reference, amount, and payment status, not your full card details.</li>
            <li><strong>Transaction Data:</strong> includes details about payments to and from you and other details of products you have purchased from us.</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">3. How We Use Your Personal Data</h2>
          <p className="mb-6">
            We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
          </p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Where we need to perform the contract we are about to enter into or have entered into with you (e.g., fulfilling an order).</li>
            <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
            <li>Where we need to comply with a legal obligation.</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">4. Data Security</h2>
          <p className="mb-6">
            We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorised way, altered or disclosed. 
            In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">5. Contact Us</h2>
          <p className="mb-6">
            If you have any questions about this privacy policy or our privacy practices, please contact us at:<br /><br />
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
