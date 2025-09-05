import { Metadata } from 'next';
import { WishlistPageContent } from '@/components/wishlist/wishlist-page-content';

export const metadata: Metadata = {
  title: 'My Wishlist - Qissey',
  description: 'Save your favorite pieces and never miss out on the items you love.',
};

export default function WishlistPage() {
  return (
    <div className="min-h-screen pt-16">
      <WishlistPageContent />
    </div>
  );
}