-- Add public profile access policy
-- Run this in Supabase SQL Editor to allow public access to profiles by username

create policy if not exists "Public can view profiles by username" on profiles
  for select using (username is not null);