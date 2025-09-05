import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { CartDrawer } from '@/components/cart/cart-drawer';
import { AuthProvider } from '@/components/providers/auth-provider';
import { ToastProvider } from '@/components/providers/toast-provider';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair',
});

export const metadata: Metadata = {
  title: 'Qissey - Premium Fashion & Lifestyle',
  description: 'Discover the finest collection of premium fashion and lifestyle products. Elegant designs, superior quality, and timeless style.',
  keywords: 'fashion, premium clothing, lifestyle, men fashion, women fashion, accessories',
  authors: [{ name: 'Qissey' }],
  creator: 'Qissey',
  publisher: 'Qissey',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://rarerabbit.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Qissey - Premium Fashion & Lifestyle',
    description: 'Discover the finest collection of premium fashion and lifestyle products.',
    url: 'https://rarerabbit.com',
    siteName: 'Qissey',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Qissey - Premium Fashion',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Qissey - Premium Fashion & Lifestyle',
    description: 'Discover the finest collection of premium fashion and lifestyle products.',
    images: ['/twitter-image.jpg'],
    creator: '@rarerabbit',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen bg-white antialiased">
        <AuthProvider>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
          <CartDrawer />
          <ToastProvider />
        </AuthProvider>
      </body>
    </html>
  );
}
