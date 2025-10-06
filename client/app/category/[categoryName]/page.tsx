import dynamic from 'next/dynamic';
import { Metadata } from 'next';

// Dynamically import CategoryPage component
const CategoryPage = dynamic(() => import('../../components/CategoryPage'), {
  ssr: false,
  loading: () => <div className="text-center py-20">Loading category...</div>
});

export const metadata: Metadata = {
  title: "Category - Innvibs",
  description: "Browse articles by category on Innvibs",
};

interface CategoryPageProps {
  params: {
    categoryName: string;
  };
}

export default function CategoryPageRoute({ params }: CategoryPageProps) {
   return <CategoryPage categoryName={params.categoryName} />;
}