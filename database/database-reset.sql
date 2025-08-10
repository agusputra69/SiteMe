-- SiteMe Database Reset Script
-- WARNING: This will completely reset your database and delete all data!
-- Run this in Supabase SQL Editor

-- ============================================
-- STEP 1: DROP EXISTING OBJECTS
-- ============================================

-- Note: Objects are dropped in reverse dependency order to avoid constraint violations

-- Drop existing triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop existing functions
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Drop existing storage policies
DROP POLICY IF EXISTS "Users can upload their own resumes" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own resumes" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own resumes" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Public can view profile photos" ON storage.objects;

-- Drop existing table policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Public can view profiles by username" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own sites" ON sites;
DROP POLICY IF EXISTS "Public can view published sites" ON sites;
DROP POLICY IF EXISTS "Users can insert their own sites" ON sites;
DROP POLICY IF EXISTS "Users can update their own sites" ON sites;
DROP POLICY IF EXISTS "Users can delete their own sites" ON sites;

-- Drop existing tables with CASCADE to handle dependencies
DROP TABLE IF EXISTS sites CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop existing storage objects first (to avoid foreign key constraint errors)
DELETE FROM storage.objects WHERE bucket_id IN ('resumes', 'profile-photos');

-- Drop existing storage buckets
DELETE FROM storage.buckets WHERE id IN ('resumes', 'profile-photos');

-- ============================================
-- STEP 2: CREATE TABLES
-- ============================================

-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sites table for user-generated sites
CREATE TABLE sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  site_name TEXT NOT NULL,
  subdomain TEXT UNIQUE,
  is_published BOOLEAN DEFAULT false,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_sites_user_id ON sites(user_id);
CREATE INDEX IF NOT EXISTS idx_sites_subdomain ON sites(subdomain);
CREATE INDEX IF NOT EXISTS idx_sites_published ON sites(is_published);

-- ============================================
-- STEP 3: ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 4: CREATE POLICIES FOR PROFILES TABLE
-- ============================================

-- Users can view their own profile
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Public can view profiles by username (for public profile pages)
CREATE POLICY "Public can view profiles by username" ON profiles
  FOR SELECT USING (username IS NOT NULL);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Users can delete their own profile
CREATE POLICY "Users can delete their own profile" ON profiles
  FOR DELETE USING (auth.uid() = id);

-- ============================================
-- STEP 5: CREATE POLICIES FOR SITES TABLE
-- ============================================

-- Users can view their own sites
CREATE POLICY "Users can view their own sites" ON sites
  FOR SELECT USING (auth.uid() = user_id);

-- Public can view published sites
CREATE POLICY "Public can view published sites" ON sites
  FOR SELECT USING (is_published = true);

-- Users can insert their own sites
CREATE POLICY "Users can insert their own sites" ON sites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own sites
CREATE POLICY "Users can update their own sites" ON sites
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own sites
CREATE POLICY "Users can delete their own sites" ON sites
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- STEP 6: CREATE STORAGE BUCKETS
-- ============================================

-- Create storage bucket for resumes
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resumes',
  'resumes',
  false,
  5242880, -- 5MB limit
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Create storage bucket for profile photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-photos',
  'profile-photos',
  true,
  2097152, -- 2MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================
-- STEP 7: CREATE STORAGE POLICIES
-- ============================================

-- Resume storage policies
CREATE POLICY "Users can upload their own resumes" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'resumes' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own resumes" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'resumes' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own resumes" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'resumes' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Profile photo storage policies
CREATE POLICY "Users can upload profile photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'profile-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view profile photos" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'profile-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete profile photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'profile-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Public can view profile photos (for public profiles)
CREATE POLICY "Public can view profile photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-photos');

-- ============================================
-- STEP 8: CREATE FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, data)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    jsonb_build_object(
      'template', 'modern',
      'theme', 'blue',
      'customization', jsonb_build_object(
        'fontSize', 'medium',
        'spacing', 'normal',
        'colors', jsonb_build_object(
          'primary', '#3b82f6',
          'secondary', '#64748b',
          'accent', '#06b6d4'
        )
      ),
      'personalInfo', jsonb_build_object(
        'name', COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        'email', COALESCE(NEW.email, ''),
        'phone', '',
        'location', '',
        'website', '',
        'linkedin', '',
        'github', ''
      ),
      'summary', '',
      'experience', '[]'::jsonb,
      'education', '[]'::jsonb,
      'skills', '[]'::jsonb,
      'projects', '[]'::jsonb,
      'certifications', '[]'::jsonb,
      'languages', '[]'::jsonb
    )
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the user creation
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sites_updated_at
  BEFORE UPDATE ON sites
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- STEP 9: GRANT PERMISSIONS
-- ============================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO anon, authenticated;
GRANT ALL ON public.sites TO anon, authenticated;

-- ============================================
-- RESET COMPLETE
-- ============================================

-- Verify the setup
DO $$
BEGIN
    -- Check if tables exist
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles') THEN
        RAISE NOTICE 'SUCCESS: Profiles table created successfully';
    ELSE
        RAISE EXCEPTION 'ERROR: Profiles table creation failed';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'sites') THEN
        RAISE NOTICE 'SUCCESS: Sites table created successfully';
    ELSE
        RAISE EXCEPTION 'ERROR: Sites table creation failed';
    END IF;
    
    -- Check if storage buckets exist
    IF EXISTS (SELECT FROM storage.buckets WHERE id = 'resumes') THEN
        RAISE NOTICE 'SUCCESS: Resumes storage bucket created successfully';
    ELSE
        RAISE EXCEPTION 'ERROR: Resumes storage bucket creation failed';
    END IF;
    
    IF EXISTS (SELECT FROM storage.buckets WHERE id = 'profile-photos') THEN
        RAISE NOTICE 'SUCCESS: Profile photos storage bucket created successfully';
    ELSE
        RAISE EXCEPTION 'ERROR: Profile photos storage bucket creation failed';
    END IF;
    
    -- Check if functions exist
    IF EXISTS (SELECT FROM information_schema.routines WHERE routine_name = 'handle_new_user') THEN
        RAISE NOTICE 'SUCCESS: User signup function created successfully';
    ELSE
        RAISE EXCEPTION 'ERROR: User signup function creation failed';
    END IF;
    
    RAISE NOTICE '🎉 DATABASE RESET COMPLETED SUCCESSFULLY! 🎉';
    RAISE NOTICE 'You can now test PDF processing without timeout errors.';
END
$$;