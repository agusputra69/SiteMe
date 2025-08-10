-- SiteMe Complete Database Setup Script
-- Run this in Supabase SQL Editor to set up the complete database

-- ========================================
-- PROFILES TABLE SETUP
-- ========================================

-- Create profiles table
create table if not exists profiles (
  id uuid primary key references auth.users(id),
  username text,
  full_name text,
  data jsonb,
  created_at timestamp default now()
);

-- Enable RLS (Row Level Security)
alter table profiles enable row level security;

-- Create policies for profiles table
drop policy if exists "Users can view their own profile" on profiles;
create policy "Users can view their own profile" on profiles
  for select using (auth.uid() = id);

drop policy if exists "Public can view profiles by username" on profiles;
create policy "Public can view profiles by username" on profiles
  for select using (username is not null);

drop policy if exists "Users can insert their own profile" on profiles;
create policy "Users can insert their own profile" on profiles
  for insert with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on profiles;
create policy "Users can update their own profile" on profiles
  for update using (auth.uid() = id);

-- ========================================
-- SITES TABLE SETUP
-- ========================================

-- Create sites table for multiple sites per user
create table if not exists sites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  data jsonb,
  template text default 'modern',
  status text default 'draft' check (status in ('draft', 'published')),
  is_primary boolean default false,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Enable RLS for sites table
alter table sites enable row level security;

-- Create policies for sites table
drop policy if exists "Users can view their own sites" on sites;
create policy "Users can view their own sites" on sites
  for select using (auth.uid() = user_id);

drop policy if exists "Public can view published primary sites" on sites;
create policy "Public can view published primary sites" on sites
  for select using (status = 'published' and is_primary = true);

drop policy if exists "Users can insert their own sites" on sites;
create policy "Users can insert their own sites" on sites
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update their own sites" on sites;
create policy "Users can update their own sites" on sites
  for update using (auth.uid() = user_id);

drop policy if exists "Users can delete their own sites" on sites;
create policy "Users can delete their own sites" on sites
  for delete using (auth.uid() = user_id);

-- ========================================
-- STORAGE SETUP
-- ========================================

-- Create storage bucket for resumes
insert into storage.buckets (id, name, public) 
values ('resumes', 'resumes', false)
on conflict (id) do nothing;

-- Storage policies for resumes bucket (FIXED VERSION)
drop policy if exists "Users can upload their own resumes" on storage.objects;
create policy "Users can upload their own resumes" on storage.objects
  for insert with check (
    bucket_id = 'resumes' AND 
    auth.uid()::text = split_part(name, '/', 1)
  );

drop policy if exists "Users can view their own resumes" on storage.objects;
create policy "Users can view their own resumes" on storage.objects
  for select using (
    bucket_id = 'resumes' AND 
    auth.uid()::text = split_part(name, '/', 1)
  );

drop policy if exists "Users can delete their own resumes" on storage.objects;
create policy "Users can delete their own resumes" on storage.objects
  for delete using (
    bucket_id = 'resumes' AND 
    auth.uid()::text = split_part(name, '/', 1)
  );

-- ========================================
-- FUNCTIONS AND TRIGGERS
-- ========================================

-- Create function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new user signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create function to ensure only one primary site per user
create or replace function ensure_single_primary_site()
returns trigger as $$
begin
  -- If setting a site as primary, unset all other primary sites for this user
  if NEW.is_primary = true then
    update sites 
    set is_primary = false 
    where user_id = NEW.user_id and id != NEW.id;
  end if;
  
  return NEW;
end;
$$ language plpgsql;

-- Create trigger for primary site constraint
drop trigger if exists ensure_single_primary_site_trigger on sites;
create trigger ensure_single_primary_site_trigger
  before insert or update on sites
  for each row execute function ensure_single_primary_site();

-- Create function to check site limit (max 3 sites per user)
create or replace function check_site_limit()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    if (select count(*) from sites where user_id = NEW.user_id) >= 3 then
      raise exception 'Maximum of 3 sites allowed per user';
    end if;
  end if;
  
  return NEW;
end;
$$ language plpgsql;

-- Create trigger for site limit
drop trigger if exists check_site_limit_trigger on sites;
create trigger check_site_limit_trigger
  before insert on sites
  for each row execute function check_site_limit();

-- Create updated_at trigger function
create or replace function update_updated_at_column()
returns trigger as $$
begin
  NEW.updated_at = now();
  return NEW;
end;
$$ language plpgsql;

-- Create trigger for updated_at
drop trigger if exists update_sites_updated_at on sites;
create trigger update_sites_updated_at
  before update on sites
  for each row execute function update_updated_at_column();

-- ========================================
-- SETUP COMPLETE
-- ========================================

-- Database setup is now complete!
-- Tables created: profiles, sites
-- Storage bucket created: resumes
-- All RLS policies, functions, and triggers are in place