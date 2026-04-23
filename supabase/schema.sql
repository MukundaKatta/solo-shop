-- solo.shop schema
-- Run this in the Supabase SQL editor (one time).

create extension if not exists "pgcrypto";

-- STORES ----------------------------------------------------------------------
create table if not exists public.stores (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  slug text unique not null check (char_length(slug) between 2 and 40),
  name text not null default 'My Store',
  bio text not null default '',
  stripe_account_id text,
  created_at timestamptz not null default now()
);
create unique index if not exists stores_owner_unique on public.stores(owner_id);
create index if not exists stores_slug_idx on public.stores(slug);

-- PRODUCTS --------------------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  name text not null,
  description text not null default '',
  price_cents integer not null check (price_cents >= 0),
  image_url text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists products_store_idx on public.products(store_id);

-- ORDERS ----------------------------------------------------------------------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete restrict,
  store_id uuid not null references public.stores(id) on delete restrict,
  buyer_email text,
  amount_cents integer not null,
  stripe_session_id text unique,
  status text not null default 'pending' check (status in ('pending','paid','failed')),
  created_at timestamptz not null default now()
);
create index if not exists orders_store_idx on public.orders(store_id);

-- RLS -------------------------------------------------------------------------
alter table public.stores enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;

-- Public read (storefronts are public)
drop policy if exists "stores are publicly readable" on public.stores;
create policy "stores are publicly readable" on public.stores
  for select using (true);

drop policy if exists "products are publicly readable" on public.products;
create policy "products are publicly readable" on public.products
  for select using (true);

-- Owner writes their own store
drop policy if exists "owner inserts store" on public.stores;
create policy "owner inserts store" on public.stores
  for insert with check (auth.uid() = owner_id);

drop policy if exists "owner updates store" on public.stores;
create policy "owner updates store" on public.stores
  for update using (auth.uid() = owner_id);

drop policy if exists "owner deletes store" on public.stores;
create policy "owner deletes store" on public.stores
  for delete using (auth.uid() = owner_id);

-- Owner writes their own products
drop policy if exists "owner manages products" on public.products;
create policy "owner manages products" on public.products
  for all
  using (
    exists (
      select 1 from public.stores s
      where s.id = products.store_id and s.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.stores s
      where s.id = products.store_id and s.owner_id = auth.uid()
    )
  );

-- Orders: only writable by service role (checkout + webhook).
-- Readable by owner of the store.
drop policy if exists "owner reads orders" on public.orders;
create policy "owner reads orders" on public.orders
  for select
  using (
    exists (
      select 1 from public.stores s
      where s.id = orders.store_id and s.owner_id = auth.uid()
    )
  );
