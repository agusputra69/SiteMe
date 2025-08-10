-- Fix site_name column mismatch in sites table
-- Run this in Supabase SQL Editor to rename site_name to name

-- Check if sites table exists and what columns it has
DO $$
BEGIN
    -- Check if sites table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'sites') THEN
        RAISE NOTICE 'Sites table exists';
        
        -- Check if site_name column exists (the problematic one)
        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'sites' AND column_name = 'site_name') THEN
            RAISE NOTICE 'Found site_name column - will rename to name';
            
            -- Check if name column already exists
            IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'sites' AND column_name = 'name') THEN
                RAISE NOTICE 'Name column already exists - dropping site_name';
                ALTER TABLE sites DROP COLUMN site_name;
            ELSE
                RAISE NOTICE 'Renaming site_name column to name';
                ALTER TABLE sites RENAME COLUMN site_name TO name;
            END IF;
            
        ELSIF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'sites' AND column_name = 'name') THEN
            RAISE NOTICE 'Name column already exists - schema is correct';
        ELSE
            RAISE NOTICE 'Neither site_name nor name column found - adding name column';
            ALTER TABLE sites ADD COLUMN name text NOT NULL DEFAULT 'My Site';
        END IF;
        
    ELSE
        RAISE NOTICE 'Sites table does not exist - will create it';
        
        -- Create sites table with correct schema
        CREATE TABLE sites (
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
        
        -- Enable RLS
        ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
        
        RAISE NOTICE 'Sites table created with correct schema';
    END IF;
END $$;

-- Ensure RLS policies are correct
DROP POLICY IF EXISTS "Users can view their own sites" ON sites;
CREATE POLICY "Users can view their own sites" ON sites
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Public can view published primary sites" ON sites;
CREATE POLICY "Public can view published primary sites" ON sites
    FOR SELECT USING (status = 'published' AND is_primary = true);

DROP POLICY IF EXISTS "Users can insert their own sites" ON sites;
CREATE POLICY "Users can insert their own sites" ON sites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own sites" ON sites;
CREATE POLICY "Users can update their own sites" ON sites
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own sites" ON sites;
CREATE POLICY "Users can delete their own sites" ON sites
    FOR DELETE USING (auth.uid() = user_id);

-- Recreate functions and triggers
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

DROP TRIGGER IF EXISTS ensure_single_primary_site_trigger ON sites;
CREATE TRIGGER ensure_single_primary_site_trigger
    BEFORE INSERT OR UPDATE ON sites
    FOR EACH ROW EXECUTE FUNCTION ensure_single_primary_site();

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

DROP TRIGGER IF EXISTS check_site_limit_trigger ON sites;
CREATE TRIGGER check_site_limit_trigger
    BEFORE INSERT ON sites
    FOR EACH ROW EXECUTE FUNCTION check_site_limit();

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_sites_updated_at ON sites;
CREATE TRIGGER update_sites_updated_at
    BEFORE UPDATE ON sites
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Schema fix complete