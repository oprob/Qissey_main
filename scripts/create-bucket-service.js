// Create bucket using service role key
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
  console.log('Creating storage bucket with service role...\n');

  try {
    // First, list existing buckets
    const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) {
      console.error('Error listing buckets:', listError);
    } else {
      console.log('Existing buckets:', existingBuckets.map(b => b.name).join(', '));
    }

    // Try to create the product-images bucket
    console.log('\nCreating product-images bucket...');
    const { data, error } = await supabase.storage.createBucket('product-images', {
      public: true,
      allowedMimeTypes: ['image/png', 'image/jpg', 'image/jpeg', 'image/webp', 'image/gif'],
      fileSizeLimit: 5242880 // 5MB
    });

    if (error) {
      if (error.message.includes('already exists')) {
        console.log('✅ Bucket already exists');
      } else {
        console.error('Error creating bucket:', error);
        return;
      }
    } else {
      console.log('✅ Bucket created successfully:', data);
    }

    // Verify the bucket exists and is public
    const { data: buckets, error: verifyError } = await supabase.storage.listBuckets();
    if (verifyError) {
      console.error('Error verifying bucket:', verifyError);
    } else {
      const productBucket = buckets.find(b => b.name === 'product-images');
      if (productBucket) {
        console.log('✅ Bucket verification successful:');
        console.log('   Name:', productBucket.name);
        console.log('   Public:', productBucket.public);
        console.log('   Created:', productBucket.created_at);
      } else {
        console.error('❌ Bucket not found after creation');
      }
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

createBucket();