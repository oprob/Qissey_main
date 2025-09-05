-- This script creates an admin user from an existing user
-- Replace with your actual email address before running

-- Option 1: Create admin from existing auth user
INSERT INTO profiles (id, email, role, first_name, last_name)
SELECT 
    au.id,
    au.email,
    'admin',
    COALESCE(au.raw_user_meta_data->>'first_name', 'Admin'),
    COALESCE(au.raw_user_meta_data->>'last_name', 'User')
FROM auth.users au
WHERE au.email = 'admin@qissey.com' -- CHANGE THIS TO YOUR EMAIL
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- Option 2: Update existing profile to admin
-- Uncomment and modify the email below if you want to promote an existing user
-- UPDATE profiles 
-- SET role = 'admin' 
-- WHERE email = 'your-email@example.com';

-- Check all profiles and their roles
-- SELECT id, email, role, first_name, last_name, created_at FROM profiles ORDER BY created_at DESC;