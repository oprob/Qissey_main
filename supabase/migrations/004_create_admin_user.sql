-- This script creates an admin user from an existing user
-- Replace 'your-email@example.com' with your actual email address

-- First, make sure your user has a profile entry
INSERT INTO profiles (id, email, role, first_name, last_name)
SELECT 
    au.id,
    au.email,
    'admin',
    au.raw_user_meta_data->>'first_name',
    au.raw_user_meta_data->>'last_name'
FROM auth.users au
WHERE au.email = 'your-actual-email@example.com' -- IMPORTANT: Replace this with your actual email address
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- Alternative: If you want to make an existing profile an admin
-- UPDATE profiles 
-- SET role = 'admin' 
-- WHERE email = 'your-email@example.com'; -- Replace with your email

-- You can also create a super admin with even more privileges
-- UPDATE profiles 
-- SET role = 'super_admin' 
-- WHERE email = 'your-email@example.com'; -- Replace with your email

-- To check all profiles and their roles:
-- SELECT id, email, role, first_name, last_name, created_at FROM profiles;