'use client'

import { AdminBlogTable } from '../../components/AdminBlogTable';

export default function AdminDashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <AdminBlogTable
        blogs={[]}
        onEdit={(item) => console.log('Edit item:', item)}
        onDelete={(id) => console.log('Delete item:', id)}
        onUpdateDate={(id, date) => console.log('Update item date:', id, date)}
      />
    </div>
  );
}