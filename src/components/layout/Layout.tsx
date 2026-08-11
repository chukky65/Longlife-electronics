import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { MobileNav } from './MobileNav';
import { FloatingWhatsApp } from './FloatingWhatsApp';
import { NewsletterModal } from '../ui/NewsletterModal';
import { CookieConsent } from '../ui/CookieConsent';
import { Breadcrumbs } from './Breadcrumbs';

export const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 transition-colors">
      <Header />
      <Breadcrumbs />
      <main className="flex-grow pb-16 lg:pb-0">
        <Outlet />
      </main>
      <Footer />
      <MobileNav />
      <FloatingWhatsApp />
      <NewsletterModal />
      <CookieConsent />
    </div>
  );
};
