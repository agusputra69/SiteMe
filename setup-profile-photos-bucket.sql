-- Profile Photos Storage Bucket Setup
-- Run this in Supabase SQL Editor to add profile photo storage

-- Create storage bucket for profile photos
insert into storage.buckets (id, name, public) 
values ('profile-photos', 'profile-photos', true)
on conflict (id) do nothing;

-- Simple storage policies for profile-photos bucket
-- These are more permissive to avoid RLS issues

create policy "Allow authenticated users to upload profile photos" on storage.objects
  for insert with check (bucket_id = 'profile-photos' and auth.role() = 'authenticated');

create policy "Allow public read access to profile photos" on storage.objects
  for select using (bucket_id = 'profile-photos');

create policy "Allow authenticated users to update profile photos" on storage.objects
  for update using (bucket_id = 'profile-photos' and auth.role() = 'authenticated');

create policy "Allow authenticated users to delete profile photos" on storage.objects
  for delete using (bucket_id = 'profile-photos' and auth.role() = 'authenticated');

-- Note: For production, you may want to use more restrictive policies:
-- create policy "Users can only access their own photos" on storage.objects
--   for all using (bucket_id = 'profile-photos' and auth.uid()::text = (storage.foldername(name))[1]);