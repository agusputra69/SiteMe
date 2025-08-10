-- Fix missing 'status' column in sites table
-- Run this in Supabase SQL Editor

-- Check if sites table exists and what columns it has
DO $$
BEGIN
    -- Check if sites table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'sites') THEN
        RAISE NOTICE 'Sites table exists';
        
        -- Check if status column exists
        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'sites' AND column_name = 'status') THEN
            RAISE NOTICE 'Status column already exists';
        ELSE
            RAISE NOTICE 'Status column is missing - will add it';
            
            -- Add the missing status column
            ALTER TABLE sites ADD COLUMN status text DEFAULT 'draft' CHECK (status IN ('draft', 'published'));
            
            RAISE NOTICE 'Status column added successfully';
        END IF;
    ELSE
        RAISE NOTICE 'Sites table does not exist - need to run complete database setup';
    END IF;
END
$$;

-- Also ensure the table has all required columns
DO $$
BEGIN
    -- If sites table doesn't exist, create it with all columns
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'sites') THEN
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
        
        RAISE NOTICE 'Sites table created with all columns including status';
    END IF;
END
$$;

-- Verify the fix
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'sites' 
ORDER BY ordinal_position;