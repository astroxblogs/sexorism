// app/category/[categoryName]/page.tsx
import dynamic from 'next/dynamic';

interface CategoryPageProps {
  params: { categoryName: string };
}

// Load the client CategoryPage from components
const CategoryPage = dynamic(() => import('../../components/CategoryPage'), {
  ssr: false,
  loading: () => <div className="text-center py-20">Loading category…</div>,
});

export default function CategoryPageRoute({ params }: CategoryPageProps) {
  // Pass decoded slug to the client component
  const categoryName = decodeURIComponent(params.categoryName);
  return <CategoryPage categoryName={categoryName} />;
}
