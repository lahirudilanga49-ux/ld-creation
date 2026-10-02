-- LD Creation Supabase database setup
-- Run this entire script in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  mobile text,
  role text not null default 'customer' check (role in ('customer','admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'Abstract',
  price numeric(12,2) not null check (price >= 0),
  description text default '',
  image_url text default '',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_no bigint generated always as identity unique,
  user_id uuid not null references public.profiles(id) on delete restrict,
  customer_name text not null,
  mobile text not null,
  address text not null,
  payment_method text not null default 'Cash on Delivery',
  total numeric(12,2) not null check (total >= 0),
  status text not null default 'Pending' check (status in ('Pending','Confirmed','Processing','Delivered','Cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  unit_price numeric(12,2) not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0)
);

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles(id,email) values(new.id,new.email) on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

-- Profiles: customers can read/update their own profile; admins can read all.
drop policy if exists "profiles own select" on public.profiles;
create policy "profiles own select" on public.profiles for select to authenticated using (id = auth.uid() or public.is_admin());
drop policy if exists "profiles own update" on public.profiles;
create policy "profiles own update" on public.profiles for update to authenticated using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());
drop policy if exists "profiles admin all" on public.profiles;
create policy "profiles admin all" on public.profiles for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Products: everyone can view active products; admins manage products.
drop policy if exists "products public read" on public.products;
create policy "products public read" on public.products for select to anon, authenticated using (active = true or public.is_admin());
drop policy if exists "products admin insert" on public.products;
create policy "products admin insert" on public.products for insert to authenticated with check (public.is_admin());
drop policy if exists "products admin update" on public.products;
create policy "products admin update" on public.products for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "products admin delete" on public.products;
create policy "products admin delete" on public.products for delete to authenticated using (public.is_admin());

-- Orders: customers can create and read their own; admins can manage all.
drop policy if exists "orders customer insert" on public.orders;
create policy "orders customer insert" on public.orders for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "orders customer select" on public.orders;
create policy "orders customer select" on public.orders for select to authenticated using (user_id = auth.uid() or public.is_admin());
drop policy if exists "orders admin update" on public.orders;
create policy "orders admin update" on public.orders for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "orders admin delete" on public.orders;
create policy "orders admin delete" on public.orders for delete to authenticated using (public.is_admin());

-- Order items: customer can insert items only for their own order; customers/admins can read accordingly.
drop policy if exists "order items customer insert" on public.order_items;
create policy "order items customer insert" on public.order_items for insert to authenticated with check (exists(select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
drop policy if exists "order items select" on public.order_items;
create policy "order items select" on public.order_items for select to authenticated using (exists(select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin())));
drop policy if exists "order items admin update" on public.order_items;
create policy "order items admin update" on public.order_items for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "order items admin delete" on public.order_items;
create policy "order items admin delete" on public.order_items for delete to authenticated using (public.is_admin());

-- Storage bucket for product images.
insert into storage.buckets (id,name,public) values ('product-images','product-images',true) on conflict (id) do update set public=true;

drop policy if exists "product images public read" on storage.objects;
create policy "product images public read" on storage.objects for select to public using (bucket_id='product-images');
drop policy if exists "product images admin upload" on storage.objects;
create policy "product images admin upload" on storage.objects for insert to authenticated with check (bucket_id='product-images' and public.is_admin());
drop policy if exists "product images admin update" on storage.objects;
create policy "product images admin update" on storage.objects for update to authenticated using (bucket_id='product-images' and public.is_admin()) with check (bucket_id='product-images' and public.is_admin());
drop policy if exists "product images admin delete" on storage.objects;
create policy "product images admin delete" on storage.objects for delete to authenticated using (bucket_id='product-images' and public.is_admin());

-- After creating your admin user through Supabase Authentication, run:
-- update public.profiles set role='admin' where email='YOUR_ADMIN_EMAIL';
