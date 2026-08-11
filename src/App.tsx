/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { StoreProvider } from './store';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { Products } from './pages/Products';
import { ProductDetails } from './pages/ProductDetails';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { Wishlist } from './pages/Wishlist';
import { Compare } from './pages/Compare';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { OrderTracking } from './pages/OrderTracking';
import { Admin } from './pages/Admin';
import { Profile } from './pages/Profile';

export default function App() {
  return (
    <HelmetProvider>
      <StoreProvider>
        <BrowserRouter>
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
            </Route>
            {/* Admin doesn't use the standard storefront layout */}
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </BrowserRouter>
      </StoreProvider>
    </HelmetProvider>
  );
}

