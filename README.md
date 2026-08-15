# Longlife Electronics

A production-oriented e-commerce platform for Longlife Electronics, built with React, Vite, Supabase, Paystack, and Resend.

## Features
- Authenticated customer accounts, synced carts, wishlists, and saved addresses
- Product catalog, search/filtering, stock control, reviews, and promo codes
- Server-authoritative checkout with Paystack verification and webhook handling
- Order history, payment retry, order tracking, and receipt email delivery
- Role-protected admin dashboard for catalog, promotions, settings, and fulfilment
- Row-level security, atomic inventory reservation/restoration, and route-level code splitting

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure Environment:
   Create a `.env.local` file using `.env.example`:
   ```
   VITE_SUPABASE_URL=YOUR_URL
   VITE_SUPABASE_ANON_KEY=YOUR_KEY
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Run the complete release gate:

   ```bash
   npm run check
   ```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the database, Edge Function, Paystack, email, hosting, and go-live procedure.
