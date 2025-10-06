'use client'

import { AdminBlogTable } from '../../components/AdminBlogTable';

export default function AdminOperatorsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Operator Management</h1>
      <AdminBlogTable
        blogs={[]}
        onEdit={(item) => console.log('Edit operator:', item)}
        onDelete={(id) => console.log('Delete operator:', id)}
        onUpdateDate={(id, date) => console.log('Update operator date:', id, date)}
      />
    </div>
  );
}