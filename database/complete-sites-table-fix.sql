-- Complete Sites Table Fix
-- This script ensures the sites table exists with all required columns, policies, and triggers
-- Run this in Supabase SQL Editor

-- ========================================
-- STEP 1: CREATE OR FIX SITES TABLE
-- ========================================

-- Create sites table if it doesn't exist
CREATE TABLE IF NOT EXISTS sites (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    data jsonb,
    template text DEFAULT 'modern',
    status text DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    is_primary boolean DEFAULT false,
    created_at timestamp DEFAULT now(),
    updated_at timestamp DEFAULT now()
);

-- Add missing columns if they don't exist
DO $$
BEGIN
    -- Add status column if missing
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'sites' AND column_name = 'status') THEN
        ALTER TABLE sites ADD COLUMN status text DEFAULT 'draft' CHECK (status IN ('draft', 'published'));
        RAISE NOTICE 'Added status column to sites table';
    END IF;
    
    -- Add name column if missing
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'sites' AND column_name = 'name') THEN
        ALTER TABLE sites ADD COLUMN name text NOT NULL DEFAULT 'My Site';
        RAISE NOTICE 'Added name column to sites table';
    END IF;
    
    -- Add template column if missing
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'sites' AND column_name = 'template') THEN
        ALTER TABLE sites ADD COLUMN template text DEFAULT 'modern';
        RAISE NOTICE 'Added template column to sites table';
    END IF;
    
    -- Add is_primary column if missing
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'sites' AND column_name = 'is_primary') THEN
        ALTER TABLE sites ADD COLUMN is_primary boolean DEFAULT false;
        RAISE NOTICE 'Added is_primary column to sites table';
    END IF;
    
    -- Add updated_at column if missing
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'sites' AND column_name = 'updated_at') THEN
        ALTER TABLE sites ADD COLUMN updated_at timestamp DEFAULT now();
        RAISE NOTICE 'Added updated_at column to sites table';
    END IF;
END
$$;

-- ========================================
-- STEP 2: ENABLE RLS AND CREATE POLICIES
-- ========================================

-- Enable RLS
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own sites" ON sites;
DROP POLICY IF EXISTS "Public can view published primary sites" ON sites;
DROP POLICY IF EXISTS "Users can insert their own sites" ON sites;
DROP POLICY IF EXISTS "Users can update their own sites" ON sites;
DROP POLICY IF EXISTS "Users can delete their own sites" ON sites;

-- Create policies
CREATE POLICY "Users can view their own sites" ON sites
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Public can view published primary sites" ON sites
    FOR SELECT USING (status = 'published' AND is_primary = true);

CREATE POLICY "Users can insert their own sites" ON sites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sites" ON sites
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sites" ON sites
    FOR DELETE USING (auth.uid() = user_id);

-- ========================================
-- STEP 3: CREATE FUNCTIONS AND TRIGGERS
-- ========================================

-- Function to ensure only one primary site per user
CREATE OR REPLACE FUNCTION ensure_single_primary_site()
RETURNS trigger AS $$
BEGIN
    -- If setting a site as primary, unset all other primary sites for this user
    IF NEW.is_primary = true THEN
        UPDATE sites 
        SET is_primary = false 
        WHERE user_id = NEW.user_id AND id != NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to check site limit (max 3 sites per user)
CREATE OR REPLACE FUNCTION check_site_limit()
RETURNS trigger AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF (SELECT count(*) FROM sites WHERE user_id = NEW.user_id) >= 3 THEN
            RAISE EXCEPTION 'Maximum of 3 sites allowed per user';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers
DROP TRIGGER IF EXISTS ensure_single_primary_site_trigger ON sites;
DROP TRIGGER IF EXISTS check_site_limit_trigger ON sites;
DROP TRIGGER IF EXISTS update_sites_updated_at ON sites;

-- Create triggers
CREATE TRIGGER ensure_single_primary_site_trigger
    BEFORE INSERT OR UPDATE ON sites
    FOR EACH ROW EXECUTE FUNCTION ensure_single_primary_site();

CREATE TRIGGER check_site_limit_trigger
    BEFORE INSERT ON sites
    FOR EACH ROW EXECUTE FUNCTION check_site_limit();

CREATE TRIGGER update_sites_updated_at
    BEFORE UPDATE ON sites
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- STEP 4: VERIFY THE FIX
-- ========================================

-- Show table structure
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'sites' 
ORDER BY ordinal_position;

-- Verify policies exist
SELECT policyname, tablename, cmd, qual 
FROM pg_policies 
WHERE tablename = 'sites';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Sites table fix completed successfully!';
    RAISE NOTICE '✅ All required columns are now present';
    RAISE NOTICE '✅ RLS policies are in place';
    RAISE NOTICE '✅ Triggers and functions are configured';
END
$$;