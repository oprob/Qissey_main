# Rare Rabbit E-commerce Setup Guide

This guide will help you set up the Rare Rabbit e-commerce website locally and deploy it to production.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** package manager
- **Git** - [Download here](https://git-scm.com/)
- **Supabase Account** - [Sign up here](https://supabase.com/)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd rare-rabbit-ecommerce
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Fill in the following environment variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Optional: Payment Configuration (Stripe)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
```

### 4. Set Up Supabase Database

#### 4.1 Create a New Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Click "New Project"
3. Fill in your project details
4. Wait for the project to be created

#### 4.2 Run Database Schema

1. Go to the SQL Editor in your Supabase dashboard
2. Copy the contents of `supabase-schema.sql`
3. Paste and run the SQL script

#### 4.3 Seed Sample Data (Optional)

1. In the SQL Editor, copy the contents of `seed-data.sql`
2. Paste and run the SQL script to populate sample data

#### 4.4 Configure Authentication

1. Go to Authentication → Settings
2. Configure your authentication providers
3. Set up email templates (optional)

#### 4.5 Set Up Storage (Optional)

1. Go to Storage → Create bucket
2. Create a bucket named "products" for product images
3. Set appropriate policies for public access

### 5. Start Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🗄️ Database Setup Details

### Required Tables

The application requires the following tables (created by `supabase-schema.sql`):

- `collections` - Product collections/categories
- `products` - Main product information
- `product_images` - Product image URLs
- `product_variants` - Size, color variations
- `user_profiles` - Extended user information
- `addresses` - User shipping/billing addresses
- `cart_items` - Shopping cart persistence
- `wishlist_items` - User wishlists
- `orders` - Order information
- `order_line_items` - Individual order items
- `product_reviews` - Product reviews and ratings
- `tags` - Product tags
- `product_tags` - Product-tag relationships
- `collection_products` - Collection-product relationships

### Row Level Security (RLS)

The schema includes RLS policies for:
- User data protection
- Cart and wishlist privacy
- Order access control
- Review management

### Indexes

Optimized indexes are created for:
- Product searches and filtering
- User-specific data queries
- Order lookups
- Performance optimization

## 🔧 Configuration Options

### Authentication

The app supports multiple authentication methods:
- Email/Password (default)
- Google OAuth
- GitHub OAuth
- Magic Link

Configure these in your Supabase dashboard under Authentication → Providers.

### Payment Integration

Currently configured for Stripe integration:

1. Install Stripe CLI (for webhooks)
2. Set up webhook endpoints
3. Configure payment methods in Stripe dashboard

### Email Configuration

For production, configure email settings:
- SMTP configuration in Supabase
- Custom email templates
- Transactional email service (optional)

## 📱 Features Included

### ✅ Completed Features

- **Product Catalog**: Browse, filter, and search products
- **Shopping Cart**: Add, remove, update quantities
- **Wishlist**: Save favorite products
- **User Authentication**: Sign up, sign in, profile management
- **Responsive Design**: Mobile-first, works on all devices
- **Checkout Flow**: Complete purchase process
- **Order Management**: View order history
- **Collections**: Organized product groupings
- **Product Reviews**: Customer feedback system
- **Early Access**: Exclusive previews for members

### 🔄 Additional Features to Implement

- **Payment Processing**: Stripe integration
- **Order Tracking**: Real-time order status
- **Inventory Management**: Stock level tracking
- **Admin Dashboard**: Product and order management
- **Email Notifications**: Order confirmations, shipping updates
- **Search Functionality**: Advanced product search
- **Recommendations**: AI-powered product suggestions
- **Multi-currency**: International support
- **Analytics**: Google Analytics integration

## 🏗️ Project Structure

```
├── app/                    # Next.js 14 App Router
│   ├── (auth)/            # Authentication pages
│   ├── products/          # Product pages
│   ├── collections/       # Collection pages
│   ├── account/           # User account pages
│   ├── cart/              # Shopping cart
│   ├── checkout/          # Checkout process
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
│   ├── ui/               # Base UI components
│   ├── layout/           # Layout components
│   ├── product/          # Product components
│   ├── cart/             # Cart components
│   ├── auth/             # Auth components
│   └── home/             # Homepage components
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
├── types/                # TypeScript definitions
├── utils/                # Helper functions
└── public/               # Static assets
```

## 🎨 Styling

The project uses:
- **Tailwind CSS** for utility-first styling
- **Framer Motion** for animations
- **Custom design system** with consistent spacing and typography
- **Responsive design** patterns

### Color Scheme

- **Primary**: Sophisticated blacks and grays
- **Accent**: Minimal color palette
- **Typography**: Inter (sans-serif) + Playfair Display (serif)

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms

- **Netlify**: Compatible with Next.js
- **Railway**: Full-stack deployment
- **AWS Amplify**: Scalable hosting
- **Render**: Simple deployment

### Environment Variables for Production

Ensure these are set in your production environment:

```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

## 🔒 Security Considerations

### Database Security

- Row Level Security (RLS) enabled
- Secure API endpoints
- Input validation with Zod schemas
- Prepared statements prevent SQL injection

### Authentication Security

- Secure session management
- Protected routes
- Email verification
- Password requirements

### General Security

- HTTPS enforcement
- CORS configuration
- XSS protection
- CSRF protection

## 📊 Performance Optimization

### Built-in Optimizations

- **Next.js Image Optimization**: Automatic image resizing and optimization
- **Static Generation**: Pre-rendered pages for better performance
- **Incremental Static Regeneration**: Update static content without rebuilding
- **Code Splitting**: Automatic bundle optimization
- **Server Components**: Reduced client-side JavaScript

### Database Optimization

- Proper indexing on frequently queried columns
- Efficient query patterns
- Connection pooling with Supabase
- Caching strategies

## 🐛 Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check your environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```

#### Build Errors
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

#### TypeScript Errors
```bash
# Run type checking
npm run type-check
```

### Development Issues

#### Hot Reload Not Working
1. Check if files are in the correct directories
2. Restart the development server
3. Clear browser cache

#### Authentication Issues
1. Verify Supabase configuration
2. Check RLS policies
3. Confirm user table setup

## 📞 Support

For issues and questions:

1. Check the [troubleshooting guide](#troubleshooting)
2. Review the [project documentation](README.md)
3. Create an issue in the GitHub repository
4. Check Supabase documentation for database issues

## 🔄 Updates and Maintenance

### Regular Updates

- Keep dependencies updated
- Monitor Supabase service updates
- Update security patches
- Review and update RLS policies

### Monitoring

- Set up error tracking (Sentry recommended)
- Monitor database performance
- Track user analytics
- Monitor payment processing

---

## 🎯 Next Steps

After setup, consider:

1. **Customize branding**: Update colors, fonts, and logo
2. **Add payment processing**: Integrate Stripe or other providers
3. **Set up analytics**: Google Analytics or alternative
4. **Configure email**: Transactional email service
5. **Add admin features**: Content management interface
6. **Implement search**: Advanced product search functionality
7. **Add recommendations**: AI-powered product suggestions

Welcome to your new e-commerce platform! 🎉