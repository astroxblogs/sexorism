import dynamic from 'next/dynamic';
import { Metadata } from 'next';

const AdminBlogList = dynamic(() => import('../../../src/pages/Admin-pages/AdminBlogList'), {
  ssr: false,
  loading: () => <div className="text-center py-20">Loading admin blogs...</div>
});

export const metadata: Metadata = {
  title: "Admin Blogs - Innvibs",
  description: "Manage blogs in admin panel",
};

export default function AdminBlogsPage() {
  return <AdminBlogList />;
}