-- Database migration for multiple sites support
-- Add this to your Supabase SQL Editor

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

-- Migrate existing profile data to sites table (optional)
-- Uncomment and run this if you want to migrate existing data
/*
insert into sites (user_id, name, data, status, is_primary)
select 
  id as user_id,
  coalesce(full_name, 'My Site') as name,
  data,
  'draft' as status,
  true as is_primary
from profiles 
where data is not null and data != '{}'::jsonb;
*/