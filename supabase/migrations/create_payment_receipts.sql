create table if not exists public.payment_receipts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  order_id text not null unique,
  product_id text not null,
  purchase_token text not null,
  package_name text,
  purchase_time bigint,
  security_token text,
  signature text,
  original_json text,
  verified boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policy (Optional: User can view their own receipts)
alter table public.payment_receipts enable row level security;

create policy "Users can view own receipts"
  on public.payment_receipts for select
  using (auth.uid() = user_id);

-- Only service role (server) can insert verified receipts? 
-- Or Client can insert, but verification happens via trigger/function?
-- For now, allow insert for authenticated users (Client-side logic)
create policy "Users can insert own receipts"
  on public.payment_receipts for insert
  with check (auth.uid() = user_id);
