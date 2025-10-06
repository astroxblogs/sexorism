import dynamic from 'next/dynamic';
import { Metadata } from 'next';

const OperatorManagement = dynamic(() => import('../../../src/pages/Admin-pages/Operatormanagement'), {
  ssr: false,
  loading: () => <div className="text-center py-20">Loading operator management...</div>
});

export const metadata: Metadata = {
  title: "Operator Management - Innvibs",
  description: "Manage operators in admin panel",
};

export default function AdminOperatorsPage() {
  return <OperatorManagement />;
}