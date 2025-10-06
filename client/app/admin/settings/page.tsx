import dynamic from 'next/dynamic';
import { Metadata } from 'next';

const AdminSettings = dynamic(() => import('../../../src/pages/Admin-pages/Adminsetting'), {
  ssr: false,
  loading: () => <div className="text-center py-20">Loading admin settings...</div>
});

export const metadata: Metadata = {
  title: "Admin Settings - Innvibs",
  description: "Admin settings for Innvibs",
};

export default function AdminSettingsPage() {
  return <AdminSettings />;
}