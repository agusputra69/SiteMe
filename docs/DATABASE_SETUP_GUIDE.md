# Database Setup Guide for SiteMe

## Quick Setup Instructions

### Step 1: Access Supabase SQL Editor

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Run the Complete Setup Script

1. Copy the entire contents of `complete-database-setup.sql`
2. Paste it into the SQL Editor
3. Click **Run** to execute the script

### Step 3: Verify Setup

After running the script, you should have:

✅ **Tables Created:**

- `profiles` - User profile data
- `sites` - Multiple sites per user

✅ **Storage Bucket:**

- `resumes` - For PDF resume uploads

✅ **Security Policies:**

- Row Level Security (RLS) enabled
- User-specific access controls
- Fixed storage policies for file uploads

✅ **Functions & Triggers:**

- Auto-create profile on user signup
- Ensure single primary site per user
- Site limit enforcement (max 3 per user)
- Auto-update timestamps

## What's Fixed

### 🔧 Storage RLS Policies

- **Before:** Used `storage.foldername(name)` which caused policy violations
- **After:** Uses `split_part(name, '/', 1)` for proper file path parsing
- **Result:** Resume uploads now work correctly

### 🗄️ Database Schema

- **Added:** Complete `sites` table with `name` column
- **Fixed:** Missing table structure that caused site creation errors
- **Result:** Site creation and management now works

### 🔐 Security

- All tables have proper RLS policies
- User-specific data access
- Secure file upload permissions

## Troubleshooting

If you encounter any errors:

1. **Permission Errors:** Make sure you're running the script as a Supabase admin
2. **Table Exists Errors:** The script uses `if not exists` so it's safe to re-run
3. **Policy Errors:** The script drops existing policies before creating new ones

## Alternative: Individual Scripts

If you prefer to run scripts separately:

1. First run: `setup-database.sql`
2. Then run: `database-migration-sites.sql`

Both approaches will give you the same result.

---

**Note:** After running the database setup, your SiteMe application should work without the previous errors related to storage policies, missing tables, or site creation issues.
