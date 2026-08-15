# Production Deployment

This runbook is the release source of truth. Complete every step against the production Supabase and Paystack projects before directing customer traffic to the site.

## 1. Local Release Gate

Use Node.js 22 or newer.

```bash
npm ci
npm run check
```

The command must finish with a successful TypeScript check, Vite production build, and zero production dependency vulnerabilities.

## 2. Frontend Environment

Set these values in the hosting provider. Both are public browser credentials; use only the Supabase anon key.

```text
VITE_SUPABASE_URL=https://PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=PRODUCTION_ANON_KEY
```

Never expose the Supabase service role key, Paystack secret key, or Resend key through a `VITE_` variable.

## 3. Database

Install the Supabase CLI, then link and push the production schema:

```bash
npx supabase login
npx supabase link --project-ref PROJECT_REF
npx supabase db push
```

The migration creates all commerce tables, indexes, stock functions, the product image bucket, and row-level security policies.

The administrator can synchronize the bundled 78-product catalog with the non-destructive Bulk Import button. For a server-side import, set `SUPABASE_SERVICE_ROLE_KEY` only in the local shell and run `node import_products.cjs`; never place that key in frontend hosting variables.

Create the first account through the storefront, then promote only the owner account from the Supabase SQL editor:

```sql
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'OWNER_EMAIL');
```

Use a unique administrator password and enable MFA for the Supabase and Paystack owner accounts.

## 4. Edge Function Secrets

Set server-only credentials and deploy all functions:

```bash
npx supabase secrets set PAYSTACK_SECRET_KEY=YOUR_LIVE_SECRET_KEY
npx supabase secrets set RESEND_API_KEY=YOUR_RESEND_KEY
npx supabase secrets set RESEND_FROM_EMAIL="Longlife Electronics <orders@YOUR_VERIFIED_DOMAIN>"
npx supabase secrets set CONTACT_EMAIL=sales@YOUR_DOMAIN
npx supabase functions deploy
```

Supabase provides `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` to deployed functions automatically.

## 5. Paystack

In the production Paystack dashboard:

1. Register this webhook URL:

   ```text
   https://PROJECT_REF.supabase.co/functions/v1/paystack-webhook
   ```

2. Put the live public key in Admin Dashboard > Settings > Paystack Public Key.
3. Keep the secret key only in Supabase Edge Function secrets.
4. Confirm the production account settlement bank details and business verification.

Card orders remain pending until Paystack verifies the exact NGN amount. The signed webhook and customer verification endpoint are both idempotent.

## 6. Authentication And Email

In Supabase Authentication > URL Configuration:

1. Set Site URL to the final HTTPS storefront URL.
2. Add the storefront URL and any required callback URLs to Redirect URLs.
3. Enable leaked-password protection and set the minimum password length to at least eight characters.
4. Configure production SMTP if authentication confirmations or password recovery emails are enabled.

Verify the sending domain in Resend before using it in `RESEND_FROM_EMAIL`.

## 7. Hosting

Build command:

```text
npm run build
```

Publish directory:

```text
dist
```

The included `netlify.toml` and `public/_redirects` configure the production build, security headers, asset caching, and SPA route fallback for Netlify.

## 8. Go-Live Verification

Run these checks on the deployed HTTPS URL:

1. Register and sign in as a new customer.
2. Add, update, and remove cart, wishlist, and address records; verify another account cannot read them.
3. Place pay-on-delivery and bank-transfer orders and confirm stock decreases once.
4. Complete one small live Paystack payment and confirm the order changes from pending to processing once.
5. Close a card popup, retry from Profile, then complete it successfully.
6. Confirm customer and admin order views, receipt delivery, status changes, and stock restoration on cancellation.
7. Upload a product image and create/edit/delete a test product and promo as an admin.
8. Verify a non-admin cannot open the admin dashboard or mutate admin data.
9. Test mobile checkout, a direct deep link, the 404 page, cookie rejection, and cookie acceptance.
10. Confirm Paystack webhook deliveries return HTTP 200 and review Supabase Edge Function logs for errors.

Do not switch DNS or advertising traffic until all ten checks pass with live production credentials.
