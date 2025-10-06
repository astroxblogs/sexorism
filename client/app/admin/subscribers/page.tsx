'use client'

import { AdminBlogTable } from '../../components/AdminBlogTable';

export default function AdminSubscribersPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Subscriber Management</h1>
      <AdminBlogTable
        blogs={[]}
        onEdit={(item) => console.log('Edit subscriber:', item)}
        onDelete={(id) => console.log('Delete subscriber:', id)}
        onUpdateDate={(id, date) => console.log('Update subscriber date:', id, date)}
      />
    </div>
  );
}