import { Suspense } from 'react';
import { SearchPageContent } from '@/components/search/search-page-content';
import { ProductGridSkeleton } from '@/components/ui/skeletons';

interface SearchPageProps {
  searchParams: {
    q?: string;
    sort?: string;
    price_min?: string;
    price_max?: string;
    size?: string;
  };
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  return (
    <div className="min-h-screen pt-16">
      <Suspense fallback={<ProductGridSkeleton />}>
        <SearchPageContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

export function generateMetadata({ searchParams }: SearchPageProps) {
  const query = searchParams.q || '';
  return {
    title: query ? `Search results for "${query}" - Qissey` : 'Search - Qissey',
    description: 'Search through our curated collection of premium fashion and lifestyle products.',
  };
}