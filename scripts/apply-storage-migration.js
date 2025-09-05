// Script to apply storage migration
// Run this with: node scripts/apply-storage-migration.js

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

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

async function applyStorageMigration() {
  console.log('Applying storage migration...\n');

  try {
    // Create storage bucket for product images
    console.log('1. Creating storage bucket...');
    const { data: bucket, error: bucketError } = await supabase.storage.createBucket('product-images', {
      public: true,
      allowedMimeTypes: ['image/png', 'image/jpg', 'image/jpeg', 'image/webp'],
      fileSizeLimit: 5242880 // 5MB
    });

    if (bucketError) {
      if (bucketError.message.includes('already exists')) {
        console.log('✅ Bucket already exists');
      } else {
        console.error('Error creating bucket:', bucketError);
        return;
      }
    } else {
      console.log('✅ Storage bucket created successfully');
    }

    // Apply storage policies via SQL
    console.log('\n2. Applying storage policies...');
    
    const policies = [
      // Anyone can view product images
      `
      CREATE POLICY IF NOT EXISTS "Anyone can view product images" ON storage.objects
      FOR SELECT USING (bucket_id = 'product-images');
      `,
      
      // Authenticated users can upload product images
      `
      CREATE POLICY IF NOT EXISTS "Authenticated users can upload product images" ON storage.objects
      FOR INSERT WITH CHECK (
        bucket_id = 'product-images' 
        AND auth.role() = 'authenticated'
      );
      `,
      
      // Admins can update product images
      `
      CREATE POLICY IF NOT EXISTS "Admins can update product images" ON storage.objects
      FOR UPDATE USING (
        bucket_id = 'product-images'
        AND EXISTS (
          SELECT 1 FROM profiles 
          WHERE id = auth.uid() 
          AND role IN ('admin', 'super_admin')
        )
      );
      `,
      
      // Admins can delete product images
      `
      CREATE POLICY IF NOT EXISTS "Admins can delete product images" ON storage.objects
      FOR DELETE USING (
        bucket_id = 'product-images'
        AND EXISTS (
          SELECT 1 FROM profiles 
          WHERE id = auth.uid() 
          AND role IN ('admin', 'super_admin')
        )
      );
      `,
      
      // Add indexes for better performance
      `
      CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
      `,
      `
      CREATE INDEX IF NOT EXISTS idx_product_images_sort_order ON product_images(product_id, sort_order);
      `
    ];

    for (const [index, policy] of policies.entries()) {
      const { error } = await supabase.rpc('exec_sql', { sql: policy });
      if (error) {
        console.error(`Error applying policy ${index + 1}:`, error);
      } else {
        console.log(`✅ Policy ${index + 1} applied successfully`);
      }
    }

    console.log('\n✅ Storage migration completed successfully!');
    console.log('\nYou can now:');
    console.log('1. Upload product images through the admin panel');
    console.log('2. Images will be stored in the "product-images" bucket');
    console.log('3. Public URLs will be automatically generated');

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

applyStorageMigration();