// Simple bucket creation script
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createBucket() {
  console.log('Creating product-images storage bucket...');

  try {
    const { data, error } = await supabase.storage.createBucket('product-images', {
      public: true,
      allowedMimeTypes: ['image/png', 'image/jpg', 'image/jpeg', 'image/webp'],
      fileSizeLimit: 5242880 // 5MB
    });

    if (error) {
      if (error.message.includes('already exists')) {
        console.log('✅ Bucket already exists');
      } else {
        console.error('Error creating bucket:', error);
      }
    } else {
      console.log('✅ Storage bucket created successfully');
    }

    // Test bucket access
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) {
      console.error('Error listing buckets:', listError);
    } else {
      console.log('Available buckets:', buckets.map(b => b.name).join(', '));
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

createBucket();