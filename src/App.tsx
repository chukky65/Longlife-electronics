/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { StoreProvider } from './store';
import { AnalyticsProvider } from './components/AnalyticsProvider';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Layout } from './components/layout/Layout';
const Home = lazy(() => import('./pages/Home').then((module) => ({ default: module.Home })));
const Products = lazy(() => import('./pages/Products').then((module) => ({ default: module.Products })));
const ProductDetails = lazy(() => import('./pages/ProductDetails').then((module) => ({ default: module.ProductDetails })));
const Cart = lazy(() => import('./pages/Cart').then((module) => ({ default: module.Cart })));
const Checkout = lazy(() => import('./pages/Checkout').then((module) => ({ default: module.Checkout })));
const Wishlist = lazy(() => import('./pages/Wishlist').then((module) => ({ default: module.Wishlist })));
const Compare = lazy(() => import('./pages/Compare').then((module) => ({ default: module.Compare })));
const About = lazy(() => import('./pages/About').then((module) => ({ default: module.About })));
const Contact = lazy(() => import('./pages/Contact').then((module) => ({ default: module.Contact })));
const OrderTracking = lazy(() => import('./pages/OrderTracking').then((module) => ({ default: module.OrderTracking })));
const Admin = lazy(() => import('./pages/Admin').then((module) => ({ default: module.Admin })));
const Profile = lazy(() => import('./pages/Profile').then((module) => ({ default: module.Profile })));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy').then((module) => ({ default: module.PrivacyPolicy })));
const Terms = lazy(() => import('./pages/Terms').then((module) => ({ default: module.Terms })));
const RefundPolicy = lazy(() => import('./pages/RefundPolicy').then((module) => ({ default: module.RefundPolicy })));
const NotFound = lazy(() => import('./pages/NotFound').then((module) => ({ default: module.NotFound })));

const RouteFallback = () => (
  <div className="min-h-[60vh] flex items-center justify-center bg-slate-50 dark:bg-slate-950">
    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Loading page...</p>
  </div>
);

export default function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <StoreProvider>
          <AnalyticsProvider>
            <BrowserRouter>
              <Suspense fallback={<RouteFallback />}>
                <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="products" element={<Products />} />
                  <Route path="products/:slug" element={<ProductDetails />} />
                  <Route path="cart" element={<Cart />} />
                  <Route path="checkout" element={<Checkout />} />
                  <Route path="wishlist" element={<Wishlist />} />
                  <Route path="compare" element={<Compare />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="about" element={<About />} />
                  <Route path="contact" element={<Contact />} />
                  <Route path="tracking" element={<OrderTracking />} />
                  <Route path="privacy" element={<PrivacyPolicy />} />
                  <Route path="terms" element={<Terms />} />
                  <Route path="refund" element={<RefundPolicy />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
                <Route path="/admin" element={<Admin />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </AnalyticsProvider>
        </StoreProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}
