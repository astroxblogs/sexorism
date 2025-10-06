import dynamic from 'next/dynamic';
import { Metadata } from 'next';

const AdminDashboard = dynamic(() => import('../../../src/pages/Admin-pages/AdminDashboard'), {
  ssr: false,
  loading: () => <div className="text-center py-20">Loading admin dashboard...</div>
});

export const metadata: Metadata = {
  title: "Admin Dashboard - Innvibs",
  description: "Admin dashboard for Innvibs",
};

export default function AdminDashboardPage() {
  return <AdminDashboard />;
}