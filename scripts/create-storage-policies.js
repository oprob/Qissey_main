// Create storage policies using SQL
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createStoragePolicies() {
  console.log('Creating storage policies...\n');

  const policies = [
    {
      name: 'Enable public read access for product images',
      sql: `
        CREATE POLICY IF NOT EXISTS "Public read access for product images"
        ON storage.objects FOR SELECT
        USING (bucket_id = 'product-images');
      `
    },
    {
      name: 'Enable authenticated users to upload product images',
      sql: `
        CREATE POLICY IF NOT EXISTS "Authenticated users can upload product images"
        ON storage.objects FOR INSERT
        WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');
      `
    },
    {
      name: 'Enable admins to update product images',
      sql: `
        CREATE POLICY IF NOT EXISTS "Admins can update product images"
        ON storage.objects FOR UPDATE
        USING (
          bucket_id = 'product-images' AND
          EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
          )
        );
      `
    },
    {
      name: 'Enable admins to delete product images',
      sql: `
        CREATE POLICY IF NOT EXISTS "Admins can delete product images"
        ON storage.objects FOR DELETE
        USING (
          bucket_id = 'product-images' AND
          EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
          )
        );
      `
    }
  ];

  try {
    for (const policy of policies) {
      console.log(`Creating policy: ${policy.name}`);
      const { data, error } = await supabase.rpc('sql', { 
        query: policy.sql 
      });
      
      if (error) {
        console.error(`Error creating policy: ${error.message}`);
      } else {
        console.log('✅ Policy created successfully');
      }
    }

    console.log('\n✅ All storage policies processed');

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

createStoragePolicies();