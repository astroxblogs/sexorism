import dynamic from 'next/dynamic';
import { Metadata } from 'next';

const CategoryManager = dynamic(() => import('../../../src/pages/Admin-pages/CategoryManager'), {
  ssr: false,
  loading: () => <div className="text-center py-20">Loading category manager...</div>
});

export const metadata: Metadata = {
  title: "Category Manager - Innvibs",
  description: "Manage categories in admin panel",
};

export default function AdminCategoriesPage() {
  return <CategoryManager />;
}