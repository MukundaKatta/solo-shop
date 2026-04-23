# solo.shop

Start selling with a single photo. A minimal nas.com-style creator commerce platform.

- Creator storefronts at `/s/<handle>`
- Product pages with Stripe Checkout
- Magic-link auth (no passwords)

## Stack

- Next.js 16 (App Router, Turbopack)
- Supabase (auth + Postgres + RLS)
- Stripe Checkout
- Tailwind CSS
- Deployed to Vercel

## Setup

### 1. Install deps

```bash
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → create a new project.
2. Once it's ready, open the **SQL Editor** and paste the contents of
   [`supabase/schema.sql`](./supabase/schema.sql). Run it.
3. In **Settings → API**, copy these values into `.env.local`:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (server-only)
4. In **Authentication → URL Configuration**, add your site URL
   (e.g. `http://localhost:3300`) to the redirect allowlist.

### 3. Create a Stripe account

1. Go to [stripe.com](https://stripe.com) → grab your test keys.
2. Copy the secret key into `.env.local` as `STRIPE_SECRET_KEY`.
3. For local webhook testing:
   ```bash
   stripe listen --forward-to localhost:3300/api/stripe/webhook
   ```
   Copy the `whsec_...` it prints into `.env.local` as `STRIPE_WEBHOOK_SECRET`.

### 4. Create `.env.local`

```bash
cp .env.example .env.local
# fill in the values above
```

### 5. Run it

```bash
npm run dev
```

Open [http://localhost:3300](http://localhost:3300).

## Routes

| Path                 | What it is                              |
| -------------------- | --------------------------------------- |
| `/`                  | Landing page                            |
| `/login`             | Magic-link sign in                      |
| `/dashboard`         | Edit your store + add products          |
| `/s/<handle>`        | Public storefront                       |
| `/s/<handle>/<id>`   | Public product page with Stripe checkout |
| `/api/checkout`      | Creates a Stripe Checkout session       |
| `/api/stripe/webhook`| Marks orders paid on `checkout.session.completed` |

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import it on [vercel.com](https://vercel.com/new).
3. Paste the same env vars from `.env.local` into **Project Settings → Environment Variables**.
4. After deploy, configure the Stripe webhook:
   - Stripe Dashboard → Developers → Webhooks → Add endpoint
   - URL: `https://<your-vercel-domain>/api/stripe/webhook`
   - Events: `checkout.session.completed`, `checkout.session.expired`
   - Copy the signing secret into Vercel as `STRIPE_WEBHOOK_SECRET`, redeploy.
5. In Supabase **Authentication → URL Configuration**, add your Vercel domain to the redirect allowlist.

## What's not built yet

- Image uploads (products use image URLs)
- Stripe Connect (all payments land in the platform account — not per-seller payouts)
- Community / messaging
- Ads / analytics
