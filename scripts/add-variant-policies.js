const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function addVariantPolicies() {
  try {
    console.log('Adding RLS policies for product variants...');

    // Create the admin check function
    const { error: functionError } = await supabase.rpc('exec', {
      sql: `
        CREATE OR REPLACE FUNCTION is_admin_user()
        RETURNS BOOLEAN AS $$
        BEGIN
          RETURN EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
          );
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `
    });

    if (functionError) {
      console.error('Error creating function:', functionError);
      return;
    }

    // Add INSERT policy
    const { error: insertError } = await supabase.rpc('exec', {
      sql: `CREATE POLICY "Admins can insert product variants" ON product_variants
            FOR INSERT WITH CHECK (is_admin_user());`
    });

    if (insertError && !insertError.message?.includes('already exists')) {
      console.error('Error creating INSERT policy:', insertError);
      return;
    }

    // Add UPDATE policy
    const { error: updateError } = await supabase.rpc('exec', {
      sql: `CREATE POLICY "Admins can update product variants" ON product_variants
            FOR UPDATE USING (is_admin_user());`
    });

    if (updateError && !updateError.message?.includes('already exists')) {
      console.error('Error creating UPDATE policy:', updateError);
      return;
    }

    // Add DELETE policy
    const { error: deleteError } = await supabase.rpc('exec', {
      sql: `CREATE POLICY "Admins can delete product variants" ON product_variants
            FOR DELETE USING (is_admin_user());`
    });

    if (deleteError && !deleteError.message?.includes('already exists')) {
      console.error('Error creating DELETE policy:', deleteError);
      return;
    }

    console.log('Successfully added RLS policies for product variants!');

  } catch (error) {
    console.error('Script error:', error);
  }
}

addVariantPolicies();