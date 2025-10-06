import dynamic from 'next/dynamic';
import { Metadata } from 'next';

const SubscriberManagement = dynamic(() => import('../../../src/pages/Admin-pages/SubscriberManagement'), {
  ssr: false,
  loading: () => <div className="text-center py-20">Loading subscriber management...</div>
});

export const metadata: Metadata = {
  title: "Subscriber Management - Innvibs",
  description: "Manage subscribers in admin panel",
};

export default function AdminSubscribersPage() {
  return <SubscriberManagement />;
}