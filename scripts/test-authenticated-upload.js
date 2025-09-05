// Test authenticated upload
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuthenticatedUpload() {
  console.log('Testing authenticated upload...\n');

  try {
    // First, try to sign in as admin
    console.log('1. Signing in as admin...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@admin.com',
      password: 'admin123' // You might need to adjust this
    });

    if (authError) {
      console.error('Authentication failed:', authError);
      return;
    }

    console.log('✅ Authenticated as:', authData.user.email);

    // Now try to upload
    console.log('\n2. Testing upload as authenticated user...');
    const pngData = new Uint8Array([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00,
      0x0D, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
      0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);
    const testFile = new Blob([pngData], { type: 'image/png' });
    const fileName = `auth-test-${Date.now()}.png`;
    const filePath = `products/test/${fileName}`;

    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(filePath, testFile, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('Upload error:', error);
    } else {
      console.log('✅ Upload successful:', data);
      
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(data.path);
      
      console.log('✅ Public URL:', publicUrl);
    }

    // Sign out
    await supabase.auth.signOut();

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testAuthenticatedUpload();