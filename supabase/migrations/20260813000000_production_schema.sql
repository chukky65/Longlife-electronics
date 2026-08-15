create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default 'User',
  phone text not null default '',
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.profiles (id, name, role)
select
  id,
  coalesce(nullif(raw_user_meta_data ->> 'full_name', ''), 'User'),
  'user'
from auth.users
on conflict (id) do nothing;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  price numeric(12, 2) not null check (price >= 0),
  original_price numeric(12, 2) check (original_price is null or original_price >= price),
  category text not null,
  brand text not null default '',
  image text not null default '',
  gallery jsonb not null default '[]'::jsonb,
  in_stock boolean not null default true,
  stock integer not null default 0 check (stock >= 0),
  rating numeric(2, 1) not null default 0 check (rating between 0 and 5),
  reviews_count integer not null default 0 check (reviews_count >= 0),
  specs jsonb not null default '{}'::jsonb,
  is_new boolean not null default false,
  is_popular boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  total numeric(12, 2) not null check (total >= 0),
  status text not null default 'pending' check (status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  shipping_address text not null,
  payment_method text not null check (payment_method in ('pay_on_delivery', 'bank_transfer', 'card')),
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  price numeric(12, 2) not null check (price >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create table if not exists public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create table if not exists public.promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code = upper(code)),
  discount_percent numeric(5, 2) check (discount_percent > 0 and discount_percent <= 100),
  discount_amount numeric(12, 2) check (discount_amount > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (num_nonnulls(discount_percent, discount_amount) = 1)
);

create table if not exists public.store_settings (
  id text primary key,
  value text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  reviewer_name text not null default 'Customer',
  rating integer not null check (rating between 1 and 5),
  comment text not null check (char_length(trim(comment)) between 3 and 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, user_id)
);

create table if not exists public.customer_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  recipient_name text not null,
  phone text not null,
  address text not null,
  city text not null,
  state text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null default '',
  message text not null,
  status text not null default 'new' check (status in ('new', 'read', 'resolved')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.newsletter_subscriptions (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email = lower(email)),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Keep the migration safe for projects that already have the original tables.
alter table public.profiles add column if not exists updated_at timestamptz not null default now();
alter table public.products add column if not exists updated_at timestamptz not null default now();
alter table public.orders add column if not exists archived_at timestamptz;
alter table public.orders add column if not exists updated_at timestamptz not null default now();
alter table public.cart_items add column if not exists updated_at timestamptz not null default now();
alter table public.promo_codes add column if not exists updated_at timestamptz not null default now();
alter table public.store_settings add column if not exists updated_at timestamptz not null default now();
alter table public.product_reviews add column if not exists reviewer_name text not null default 'Customer';
alter table public.product_reviews add column if not exists updated_at timestamptz not null default now();
alter table public.inquiries add column if not exists status text not null default 'new';
alter table public.inquiries add column if not exists updated_at timestamptz not null default now();
alter table public.newsletter_subscriptions add column if not exists updated_at timestamptz not null default now();

create index if not exists orders_user_id_created_at_idx on public.orders(user_id, created_at desc);
create index if not exists order_items_order_id_idx on public.order_items(order_id);
create index if not exists product_reviews_product_id_idx on public.product_reviews(product_id, created_at desc);
create index if not exists customer_addresses_user_id_idx on public.customer_addresses(user_id);
create index if not exists inquiries_email_created_at_idx on public.inquiries(email, created_at desc);
create unique index if not exists one_default_address_per_user_idx
  on public.customer_addresses(user_id) where is_default;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles', 'products', 'orders', 'cart_items', 'promo_codes',
    'store_settings', 'product_reviews', 'customer_addresses', 'inquiries',
    'newsletter_subscriptions'
  ]
  loop
    execute format('drop trigger if exists set_%I_updated_at on public.%I', table_name, table_name);
    execute format(
      'create trigger set_%I_updated_at before update on public.%I for each row execute function public.set_updated_at()',
      table_name,
      table_name
    );
  end loop;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, role)
  values (new.id, coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), 'User'), 'user')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.decrement_stock(p_product_id uuid, p_quantity integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_quantity <= 0 then
    raise exception 'Quantity must be greater than zero';
  end if;

  update public.products
  set stock = stock - p_quantity,
      in_stock = (stock - p_quantity) > 0
  where id = p_product_id and stock >= p_quantity;

  if not found then
    raise exception 'Product is unavailable or has insufficient stock';
  end if;
end;
$$;

create or replace function public.restore_stock(p_product_id uuid, p_quantity integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_quantity <= 0 then
    raise exception 'Quantity must be greater than zero';
  end if;

  update public.products
  set stock = stock + p_quantity,
      in_stock = true
  where id = p_product_id;

  if not found then
    raise exception 'Product not found';
  end if;
end;
$$;

create or replace function public.create_order_with_items(
  p_user_id uuid,
  p_total numeric,
  p_shipping_address text,
  p_payment_method text,
  p_items jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_order_id uuid;
  item jsonb;
  item_product_id uuid;
  item_quantity integer;
  item_price numeric;
begin
  if p_total < 0 or p_payment_method not in ('pay_on_delivery', 'bank_transfer', 'card') then
    raise exception 'Invalid order details';
  end if;

  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'An order must contain at least one item';
  end if;

  insert into public.orders (user_id, total, status, shipping_address, payment_method)
  values (p_user_id, p_total, 'pending', p_shipping_address, p_payment_method)
  returning id into new_order_id;

  for item in select value from jsonb_array_elements(p_items)
  loop
    item_product_id := (item ->> 'product_id')::uuid;
    item_quantity := (item ->> 'quantity')::integer;
    item_price := (item ->> 'price')::numeric;

    if item_quantity <= 0 or item_price < 0 then
      raise exception 'Invalid order item';
    end if;

    update public.products
    set stock = stock - item_quantity,
        in_stock = (stock - item_quantity) > 0
    where id = item_product_id and stock >= item_quantity and in_stock;

    if not found then
      raise exception 'A product is unavailable or has insufficient stock';
    end if;

    insert into public.order_items (order_id, product_id, quantity, price)
    values (new_order_id, item_product_id, item_quantity, item_price);
  end loop;

  return new_order_id;
end;
$$;

create or replace function public.cancel_order_and_restore_stock(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_status text;
begin
  select status into current_status from public.orders where id = p_order_id for update;
  if current_status is null then
    raise exception 'Order not found';
  end if;
  if current_status = 'cancelled' then
    return;
  end if;

  update public.products as product
  set stock = product.stock + restored.quantity,
      in_stock = true
  from (
    select product_id, sum(quantity)::integer as quantity
    from public.order_items
    where order_id = p_order_id
    group by product_id
  ) as restored
  where product.id = restored.product_id;

  update public.orders set status = 'cancelled' where id = p_order_id;
end;
$$;

create or replace function public.ensure_single_default_address()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.is_default then
    update public.customer_addresses
    set is_default = false
    where user_id = new.user_id and id <> new.id and is_default;
  end if;
  return new;
end;
$$;

drop trigger if exists ensure_single_default_address on public.customer_addresses;
create trigger ensure_single_default_address
  before insert or update of is_default on public.customer_addresses
  for each row execute function public.ensure_single_default_address();

create or replace function public.refresh_product_review_summary()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_product_id uuid := coalesce(new.product_id, old.product_id);
begin
  update public.products
  set rating = coalesce((select round(avg(rating)::numeric, 1) from public.product_reviews where product_id = target_product_id), 0),
      reviews_count = (select count(*) from public.product_reviews where product_id = target_product_id)
  where id = target_product_id;
  return coalesce(new, old);
end;
$$;

create or replace function public.set_review_author()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  select coalesce(nullif(name, ''), 'Customer') into new.reviewer_name
  from public.profiles where id = new.user_id;
  return new;
end;
$$;

drop trigger if exists set_review_author on public.product_reviews;
create trigger set_review_author
  before insert or update of user_id on public.product_reviews
  for each row execute function public.set_review_author();

update public.product_reviews as review
set reviewer_name = coalesce(nullif(profile.name, ''), 'Customer')
from public.profiles as profile
where profile.id = review.user_id;

drop trigger if exists refresh_product_review_summary on public.product_reviews;
create trigger refresh_product_review_summary
  after insert or update or delete on public.product_reviews
  for each row execute function public.refresh_product_review_summary();

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.cart_items enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.promo_codes enable row level security;
alter table public.store_settings enable row level security;
alter table public.product_reviews enable row level security;
alter table public.customer_addresses enable row level security;
alter table public.inquiries enable row level security;
alter table public.newsletter_subscriptions enable row level security;

drop policy if exists "Products are publicly readable" on public.products;
create policy "Products are publicly readable" on public.products for select using (true);
drop policy if exists "Admins manage products" on public.products;
create policy "Admins manage products" on public.products for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Users read their profile" on public.profiles;
create policy "Users read their profile" on public.profiles for select using (id = auth.uid() or public.is_admin());
drop policy if exists "Users create their profile" on public.profiles;
create policy "Users create their profile" on public.profiles for insert with check ((id = auth.uid() and role = 'user') or public.is_admin());
drop policy if exists "Users update their profile" on public.profiles;
create policy "Users update their profile" on public.profiles for update using (id = auth.uid() or public.is_admin()) with check ((id = auth.uid() and role = 'user') or public.is_admin());

drop policy if exists "Users read their orders" on public.orders;
create policy "Users read their orders" on public.orders for select using (user_id = auth.uid() or public.is_admin());
drop policy if exists "Users read their order items" on public.order_items;
create policy "Users read their order items" on public.order_items for select using (
  exists (select 1 from public.orders where orders.id = order_items.order_id and (orders.user_id = auth.uid() or public.is_admin()))
);

drop policy if exists "Users manage their cart" on public.cart_items;
create policy "Users manage their cart" on public.cart_items for all using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "Users manage their wishlist" on public.wishlist_items;
create policy "Users manage their wishlist" on public.wishlist_items for all using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "Users manage their addresses" on public.customer_addresses;
create policy "Users manage their addresses" on public.customer_addresses for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "Active promo codes are readable" on public.promo_codes;
drop policy if exists "Admins manage promo codes" on public.promo_codes;
create policy "Admins manage promo codes" on public.promo_codes for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Safe settings are publicly readable" on public.store_settings;
create policy "Safe settings are publicly readable" on public.store_settings for select using (id in ('paystack_public_key', 'analytics_id') or public.is_admin());
drop policy if exists "Admins manage settings" on public.store_settings;
create policy "Admins manage settings" on public.store_settings for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Reviews are publicly readable" on public.product_reviews;
create policy "Reviews are publicly readable" on public.product_reviews for select using (true);
drop policy if exists "Users create their reviews" on public.product_reviews;
create policy "Users create their reviews" on public.product_reviews for insert with check (
  user_id = auth.uid() and exists (
    select 1
    from public.orders
    join public.order_items on order_items.order_id = orders.id
    where orders.user_id = auth.uid()
      and orders.status = 'delivered'
      and order_items.product_id = product_reviews.product_id
  )
);
drop policy if exists "Users update their reviews" on public.product_reviews;
create policy "Users update their reviews" on public.product_reviews for update using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "Users delete their reviews" on public.product_reviews;
create policy "Users delete their reviews" on public.product_reviews for delete using (user_id = auth.uid() or public.is_admin());

drop policy if exists "Admins manage inquiries" on public.inquiries;
create policy "Admins manage inquiries" on public.inquiries for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admins manage newsletter subscriptions" on public.newsletter_subscriptions;
create policy "Admins manage newsletter subscriptions" on public.newsletter_subscriptions for all using (public.is_admin()) with check (public.is_admin());

grant usage on schema public to anon, authenticated, service_role;
grant select on public.products, public.product_reviews, public.store_settings to anon;
grant all privileges on all tables in schema public to authenticated, service_role;
grant usage, select on all sequences in schema public to authenticated, service_role;

revoke all on function public.decrement_stock(uuid, integer) from public, anon, authenticated;
revoke all on function public.restore_stock(uuid, integer) from public, anon, authenticated;
revoke all on function public.create_order_with_items(uuid, numeric, text, text, jsonb) from public, anon, authenticated;
revoke all on function public.cancel_order_and_restore_stock(uuid) from public, anon, authenticated;
grant execute on function public.decrement_stock(uuid, integer) to service_role;
grant execute on function public.restore_stock(uuid, integer) to service_role;
grant execute on function public.create_order_with_items(uuid, numeric, text, text, jsonb) to service_role;
grant execute on function public.cancel_order_and_restore_stock(uuid) to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('products', 'products', true, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Product images are publicly readable" on storage.objects;
create policy "Product images are publicly readable" on storage.objects for select using (bucket_id = 'products');
drop policy if exists "Admins upload product images" on storage.objects;
create policy "Admins upload product images" on storage.objects for insert to authenticated with check (bucket_id = 'products' and public.is_admin());
drop policy if exists "Admins update product images" on storage.objects;
create policy "Admins update product images" on storage.objects for update to authenticated using (bucket_id = 'products' and public.is_admin()) with check (bucket_id = 'products' and public.is_admin());
drop policy if exists "Admins delete product images" on storage.objects;
create policy "Admins delete product images" on storage.objects for delete to authenticated using (bucket_id = 'products' and public.is_admin());
