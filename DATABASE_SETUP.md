# Database Setup Instructions

## Setting up Supabase Database Schema

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/wtsvpxzkcplbftmtlxlj

2. Navigate to the **SQL Editor** in the left sidebar

3. Copy and paste the contents of `supabase-schema.sql` into the SQL editor

4. Execute the query by clicking **Run**

### Option 2: Using Supabase CLI

If you have the Supabase CLI installed and authenticated:

```bash
npx supabase db push
```

### Option 3: Manual Table Creation

If you prefer to create tables individually, you can run sections of the `supabase-schema.sql` file in the following order:

1. **Extensions and Enums** (lines 1-7)
2. **Core Tables** (collections, products, etc.)
3. **Auth Tables** (user_profiles, addresses, etc.)
4. **Junction Tables** (collection_products, product_tags, etc.)
5. **Indexes** (lines 203-217)
6. **Functions and Triggers** (lines 219-251)
7. **Row Level Security Policies** (lines 253-291)

## Environment Variables

Make sure your `.env.local` file contains:

```env
NEXT_PUBLIC_SUPABASE_URL=https://wtsvpxzkcplbftmtlxlj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Testing Authentication

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to http://localhost:3001 (or your assigned port)

3. Click on the **Login** or **Sign Up** links in the header

4. Test the authentication flow:
   - Create a new account
   - Sign in with existing credentials
   - Check that the user session persists

## Database Tables Created

- **collections** - Product collections/categories
- **products** - Individual products
- **product_images** - Product image gallery
- **product_variants** - Size/color variants
- **user_profiles** - Extended user information
- **addresses** - User shipping/billing addresses
- **cart_items** - Shopping cart items
- **wishlist_items** - User wishlist
- **orders** - Customer orders
- **order_line_items** - Individual order items
- **product_reviews** - Customer reviews

## Row Level Security (RLS)

The schema includes RLS policies to ensure users can only access their own:
- Profile information
- Addresses
- Cart items
- Wishlist items
- Orders
- Reviews

Public access is granted for product-related information.