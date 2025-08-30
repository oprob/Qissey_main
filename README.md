# Rare Rabbit E-commerce Website

A sophisticated, minimalist e-commerce platform built with Next.js 14 and Supabase, inspired by the elegant design of the Rare Rabbit Android app.

## ✨ Features

### 🎨 Design & UI
- **Minimalist Aesthetic**: Clean, elegant design with refined typography and spacing
- **Responsive Design**: Seamlessly adapts across mobile, tablet, and desktop
- **Smooth Animations**: Framer Motion powered transitions and micro-interactions
- **Accessible**: WCAG compliant with proper ARIA labels and keyboard navigation

### 🛍️ E-commerce Functionality
- **Product Catalog**: Advanced filtering, sorting, and search capabilities
- **Shopping Cart**: Real-time cart updates with persistent storage
- **Wishlist**: Save favorite items across sessions
- **Checkout Flow**: Streamlined, secure checkout process
- **Order Management**: Track orders and view purchase history

### 🔐 Authentication & User Management
- **Supabase Auth**: Secure email/password authentication
- **User Profiles**: Customizable user profiles and preferences
- **Address Management**: Multiple shipping and billing addresses
- **Early Access**: Exclusive preview access for registered users

### ⚡ Performance & SEO
- **Next.js 14**: App Router with React Server Components
- **ISR**: Incremental Static Regeneration for product pages
- **Image Optimization**: Next.js Image component with lazy loading
- **SEO Optimized**: Meta tags, structured data, and sitemap

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - App Router, RSC, SSG/ISR
- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations and transitions
- **Embla Carousel** - Touch-friendly carousels

### Backend & Database
- **Supabase** - PostgreSQL database with real-time capabilities
- **Row Level Security** - Fine-grained access controls
- **Supabase Auth** - User authentication and management
- **Supabase Storage** - File and image storage

### State Management
- **Zustand** - Lightweight state management
- **React Hook Form** - Form handling and validation
- **Zod** - Schema validation

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Static type checking

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd rare-rabbit-ecommerce
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Supabase credentials and other configuration values.

4. **Set up the database**
   - Create a new Supabase project
   - Run the SQL schema from `supabase-schema.sql` in your Supabase SQL editor
   - Enable Row Level Security on the tables

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
├── app/                    # Next.js 14 App Router pages
│   ├── (auth)/            # Authentication pages
│   ├── products/          # Product pages
│   ├── collections/       # Collection pages
│   ├── account/           # User account pages
│   └── layout.tsx         # Root layout
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   ├── layout/           # Layout components
│   ├── product/          # Product-related components
│   ├── cart/             # Cart components
│   └── auth/             # Authentication components
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
├── types/                # TypeScript type definitions
├── utils/                # Utility functions
└── public/               # Static assets
```

## 🎯 Key Components

### Header Component
- Responsive navigation with mobile menu
- Search functionality
- User authentication status
- Cart and wishlist indicators

### Product Card
- Hover effects with secondary images
- Quick add to cart functionality
- Wishlist toggle
- Sale badges and pricing

### Cart Management
- Persistent cart across sessions
- Real-time quantity updates
- Guest and authenticated user support

### Authentication
- Email/password sign up and sign in
- User profile management
- Protected routes

## 🗄️ Database Schema

The database includes the following main tables:

- **Products**: Core product information
- **Collections**: Product groupings
- **Product Images**: Multiple images per product
- **Product Variants**: Size, color, and other variations
- **Users & Profiles**: User account information
- **Cart Items**: Shopping cart persistence
- **Wishlist**: Saved favorite products
- **Orders**: Purchase history and tracking
- **Addresses**: Shipping and billing addresses

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- Render
- AWS Amplify

## 🔧 Configuration

### Environment Variables
See `.env.example` for all required environment variables.

### Supabase Setup
1. Create tables using the provided SQL schema
2. Set up Row Level Security policies
3. Configure authentication providers
4. Set up storage buckets for images

## 📱 Mobile-First Design

The application is built with a mobile-first approach, ensuring:
- Touch-friendly interactions
- Optimized performance on mobile devices
- Progressive enhancement for larger screens
- Responsive image loading

## 🔒 Security

- Row Level Security (RLS) enabled on all user data
- Input validation with Zod schemas
- Secure authentication with Supabase Auth
- Protected API routes
- XSS and CSRF protection

## 🎨 Design System

### Typography
- **Headers**: Playfair Display (serif)
- **Body**: Inter (sans-serif)
- Consistent scale and hierarchy

### Colors
- **Primary**: Sophisticated neutrals and blacks
- **Accent**: Carefully chosen accent colors
- **System**: Semantic colors for states

### Spacing
- Consistent spacing scale using Tailwind
- Generous whitespace for breathing room
- Proper content hierarchy

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation
- Review the code comments

---

Built with ❤️ using Next.js and Supabase