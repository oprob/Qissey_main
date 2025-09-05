// Test storage upload functionality
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testStorage() {
  console.log('Testing storage access...\n');

  try {
    // Test bucket access
    console.log('1. Testing bucket access...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError);
      return;
    }
    console.log('✅ Buckets accessible:', buckets.map(b => b.name).join(', '));
    console.log('Full bucket details:', buckets);

    // Check if product-images bucket exists
    const productBucket = buckets.find(b => b.name === 'product-images');
    if (!productBucket) {
      console.error('❌ product-images bucket not found');
      return;
    }
    console.log('✅ product-images bucket found');
    console.log('   Public:', productBucket.public);
    console.log('   Created:', productBucket.created_at);

    // Test auth status
    console.log('\n2. Testing authentication...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.log('⚠️  No authenticated user (this is expected for anon key)');
    } else if (user) {
      console.log('✅ Authenticated user:', user.email);
    } else {
      console.log('⚠️  Anonymous user');
    }

    // Test file listing
    console.log('\n3. Testing file listing...');
    const { data: files, error: listError } = await supabase.storage
      .from('product-images')
      .list('products', { limit: 5 });

    if (listError) {
      console.error('Error listing files:', listError);
      return;
    }
    console.log('✅ File listing successful');
    console.log('   Files found:', files.length);

    // Test public URL generation
    console.log('\n4. Testing public URL generation...');
    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl('test-path/test-file.jpg');
    
    console.log('✅ Public URL generated:', publicUrl);

    console.log('\n✅ All storage tests passed!');

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testStorage();