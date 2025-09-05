// Script to create admin user
// Run this with: node scripts/create-admin.js

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAdmin() {
  console.log('Setting up admin user...\n');

  try {
    // Get all auth users
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    if (usersError) {
      console.error('Error fetching users:', usersError);
      return;
    }

    console.log('Available users:');
    users.users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (ID: ${user.id})`);
    });

    if (users.users.length === 0) {
      console.log('No users found. Please create a user account first.');
      return;
    }

    // For now, let's make the first user an admin
    // You can modify this to target a specific email
    const targetUser = users.users[0]; // Change this to target specific user
    
    console.log(`\nMaking ${targetUser.email} an admin...`);

    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', targetUser.id)
      .single();

    if (existingProfile) {
      // Update existing profile to admin
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', targetUser.id);

      if (updateError) {
        console.error('Error updating profile:', updateError);
        return;
      }
      console.log('✅ Updated existing profile to admin role');
    } else {
      // Create new profile with admin role
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: targetUser.id,
          email: targetUser.email,
          role: 'admin',
          first_name: targetUser.user_metadata?.first_name || 'Admin',
          last_name: targetUser.user_metadata?.last_name || 'User'
        });

      if (insertError) {
        console.error('Error creating profile:', insertError);
        return;
      }
      console.log('✅ Created new admin profile');
    }

    // Verify the admin user was created
    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', targetUser.id)
      .single();

    console.log('\nAdmin profile:');
    console.log('Email:', adminProfile.email);
    console.log('Role:', adminProfile.role);
    console.log('Name:', adminProfile.first_name, adminProfile.last_name);
    console.log('\n✅ Admin setup complete! You can now access the admin panel.');

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

createAdmin();