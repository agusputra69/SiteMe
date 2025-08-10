-- SiteMe Database Setup Script
-- Run this in Supabase SQL Editor

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

-- Create storage bucket for resumes
insert into storage.buckets (id, name, public) 
values ('resumes', 'resumes', false)
on conflict (id) do nothing;

-- Storage policies for resumes bucket
drop policy if exists "Users can upload their own resumes" on storage.objects;
create policy "Users can upload their own resumes" on storage.objects
  for insert with check (bucket_id = 'resumes' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "Users can view their own resumes" on storage.objects;
create policy "Users can view their own resumes" on storage.objects
  for select using (bucket_id = 'resumes' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "Users can delete their own resumes" on storage.objects;
create policy "Users can delete their own resumes" on storage.objects
  for delete using (bucket_id = 'resumes' and auth.uid()::text = (storage.foldername(name))[1]);

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