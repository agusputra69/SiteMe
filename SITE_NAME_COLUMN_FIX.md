# Site Name Column Fix Guide

## Problem Description

The application is experiencing a database constraint violation error:

```
Error creating site: {code: 23502, details: null, hint: null, message: null value in column "site_name" of relation "sites" violates not-null constraint}
```

## Root Cause

There's a **schema mismatch** between the database and the application code:

- **Database Schema**: The actual `sites` table has a column named `site_name`
- **Application Code**: The code expects a column named `name`
- **Setup Scripts**: The setup scripts create a column named `name`

This mismatch likely occurred because:
1. An older version of the database was created with `site_name`
2. The setup scripts were updated to use `name` instead
3. The existing database wasn't migrated to match the new schema

## Solution

### Option 1: Quick Fix (Recommended)

Run the migration script to fix the column name:

```sql
-- Run this in Supabase SQL Editor
\i fix-site-name-column.sql
```

Or copy and paste the contents of `fix-site-name-column.sql` into the Supabase SQL Editor.

### Option 2: Complete Database Reset

If you don't have important data, you can reset the entire database:

1. Run `database-reset.sql` to drop all tables
2. Run `complete-database-setup.sql` to recreate everything with correct schema

## What the Fix Does

1. **Detects the current schema** - Checks if `site_name` or `name` column exists
2. **Renames the column** - Changes `site_name` to `name` if needed
3. **Ensures correct constraints** - Makes sure the `name` column is NOT NULL
4. **Recreates policies** - Sets up all RLS policies correctly
5. **Recreates triggers** - Ensures all functions and triggers work properly

## Verification

After running the fix:

1. Check the database schema in Supabase dashboard
2. Verify the `sites` table has a `name` column (not `site_name`)
3. Test site creation in the application
4. Confirm no more constraint violation errors

## Files Involved

- `fix-site-name-column.sql` - The migration script to fix the issue
- `complete-database-setup.sql` - Complete setup with correct schema
- `database-reset.sql` - Reset script if needed

## Prevention

To prevent this issue in the future:

1. Always use migration scripts when changing database schema
2. Keep database setup scripts in sync with application code
3. Test schema changes in development before production
4. Document all database schema changes