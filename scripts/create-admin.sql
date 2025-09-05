-- Create admin user script
-- Run this in your Supabase SQL editor

-- First, let's see all existing users
SELECT 
  au.id,
  au.email,
  au.created_at,
  p.role,
  p.first_name,
  p.last_name
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
ORDER BY au.created_at DESC;

-- Create or update admin profile
-- REPLACE 'your-email@example.com' with your actual email address
INSERT INTO profiles (id, email, role, first_name, last_name, created_at, updated_at)
SELECT 
    au.id,
    au.email,
    'admin',
    COALESCE(au.raw_user_meta_data->>'first_name', 'Admin'),
    COALESCE(au.raw_user_meta_data->>'last_name', 'User'),
    NOW(),
    NOW()
FROM auth.users au
WHERE au.email = 'your-email@example.com'  -- CHANGE THIS TO YOUR EMAIL
ON CONFLICT (id) DO UPDATE SET 
  role = 'admin',
  updated_at = NOW();

-- Verify the admin was created
SELECT * FROM profiles WHERE role = 'admin';