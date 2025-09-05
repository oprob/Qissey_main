import { supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

// Helper function to create admin client (only for server-side use)
function createAdminClient() {
  if (typeof window !== 'undefined') {
    throw new Error('Admin client should only be used on server-side');
  }
  
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}

export interface UploadedImage {
  url: string;
  path: string;
  alt_text?: string;
  sort_order: number;
}

/**
 * Upload a single image to Supabase storage
 */
export async function uploadProductImage(
  file: File, 
  productSlug: string,
  sortOrder: number = 0
): Promise<UploadedImage> {
  try {
    console.log(`Uploading image: ${file.name} (${file.size} bytes) for product: ${productSlug}`);

    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('productSlug', productSlug);
    formData.append('sortOrder', sortOrder.toString());

    // Get auth token
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Not authenticated');
    }

    // Upload via API route
    const response = await fetch('/api/admin/upload-image', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Upload failed: ${response.status}`);
    }

    const result = await response.json();
    console.log('Upload successful:', result);

    return result;

  } catch (error) {
    console.error('Error uploading image:', error);
    console.error('Error details:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      productSlug,
      sortOrder
    });
    throw error;
  }
}

/**
 * Upload multiple images for a product
 */
export async function uploadProductImages(
  files: File[], 
  productSlug: string
): Promise<UploadedImage[]> {
  const uploadPromises = files.map((file, index) => 
    uploadProductImage(file, productSlug, index)
  );

  try {
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    throw error;
  }
}

/**
 * Delete an image from storage
 */
export async function deleteProductImage(imagePath: string): Promise<void> {
  try {
    const supabaseAdmin = createAdminClient();
    const { error } = await supabaseAdmin.storage
      .from('product-images')
      .remove([imagePath]);

    if (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
}

/**
 * Save uploaded images to product_images table via API
 */
export async function saveProductImages(
  productId: string,
  images: UploadedImage[]
): Promise<void> {
  try {
    console.log(`Saving ${images.length} images to database for product ${productId}`);
    
    // Get auth token
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Not authenticated');
    }

    // Save images via API route
    const response = await fetch('/api/admin/save-product-images', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        productId,
        images
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Save failed: ${response.status}`);
    }

    const result = await response.json();
    console.log('Images saved successfully:', result);

  } catch (error) {
    console.error('Error saving product images:', error);
    throw error;
  }
}

/**
 * Update image alt text
 */
export async function updateImageAltText(
  imageId: string, 
  altText: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('product_images')
      .update({ alt_text: altText })
      .eq('id', imageId);

    if (error) {
      throw new Error(`Failed to update alt text: ${error.message}`);
    }
  } catch (error) {
    console.error('Error updating image alt text:', error);
    throw error;
  }
}

/**
 * Get optimized image URL with transformations
 */
export function getOptimizedImageUrl(
  imageUrl: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpg' | 'png';
  } = {}
): string {
  // For now return original URL
  // In the future, you can add image transformation logic here
  // using services like Supabase's image transformations or external services
  return imageUrl;
}