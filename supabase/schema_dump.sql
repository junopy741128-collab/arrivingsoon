-- ========================================
-- Supabase Schema Recovery Script
-- ========================================

-- 1. Create profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  points int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create point_history table
create table if not exists public.point_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  amount int not null,
  type text not null,  -- 'used' or 'earned'
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Enable RLS (Row Level Security)
alter table public.profiles enable row level security;
alter table public.point_history enable row level security;

-- 4. Create Policies for profiles
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- 5. Create Policies for point_history
create policy "Users can view own point history"
  on point_history for select
  using (auth.uid() = user_id);

create policy "Users can insert own point history"
  on point_history for insert
  with check (auth.uid() = user_id);
