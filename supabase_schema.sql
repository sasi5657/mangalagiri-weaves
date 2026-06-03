-- =====================================================================
-- THE MANGALAGIRI WEAVES — Supabase schema
-- Run this in your Supabase project: SQL Editor → New query → paste → Run
-- =====================================================================

-- IMPORTANT: set your owner email here (must match ownerEmail in js/config.js)
-- This single account is the only one allowed to add / edit / delete products.
-- Used by the policies below via the helper function.

create or replace function public.owner_email()
returns text language sql immutable as $$
  select 'bandarusivanageswaraohandlooms@gmail.com'   -- owner email (must match ownerEmail in js/config.js)
$$;

-- ---------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  created_at  timestamptz default now()
);

create table if not exists public.products (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  description  text default '',
  price        numeric not null default 0,
  category_id  uuid references public.categories(id) on delete set null,
  image_url    text default '',
  in_stock     boolean default true,
  created_at   timestamptz default now()
);

-- ---------------------------------------------------------------------
-- Row Level Security
--   • Everyone (even logged-out visitors) can READ the catalogue.
--   • Only the owner email can WRITE.
-- ---------------------------------------------------------------------
alter table public.categories enable row level security;
alter table public.products   enable row level security;

-- public read
drop policy if exists "read categories" on public.categories;
create policy "read categories" on public.categories for select using (true);

drop policy if exists "read products" on public.products;
create policy "read products" on public.products for select using (true);

-- owner-only write (insert / update / delete)
drop policy if exists "owner writes categories" on public.categories;
create policy "owner writes categories" on public.categories
  for all to authenticated
  using (auth.jwt() ->> 'email' = public.owner_email())
  with check (auth.jwt() ->> 'email' = public.owner_email());

drop policy if exists "owner writes products" on public.products;
create policy "owner writes products" on public.products
  for all to authenticated
  using (auth.jwt() ->> 'email' = public.owner_email())
  with check (auth.jwt() ->> 'email' = public.owner_email());

-- ---------------------------------------------------------------------
-- Storage bucket for product images (public read, owner write)
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "public read images" on storage.objects;
create policy "public read images" on storage.objects
  for select using (bucket_id = 'product-images');

drop policy if exists "owner uploads images" on storage.objects;
create policy "owner uploads images" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'product-images'
              and auth.jwt() ->> 'email' = public.owner_email());

drop policy if exists "owner deletes images" on storage.objects;
create policy "owner deletes images" on storage.objects
  for delete to authenticated
  using (bucket_id = 'product-images'
         and auth.jwt() ->> 'email' = public.owner_email());

-- ---------------------------------------------------------------------
-- Optional: seed a few starter categories
-- ---------------------------------------------------------------------
insert into public.categories (name) values
  ('Pure Cotton'), ('Silk Cotton'), ('Pattu (Silk)'), ('Bridal Collection')
on conflict (name) do nothing;
