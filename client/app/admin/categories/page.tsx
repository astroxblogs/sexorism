'use client'

import { AdminBlogTable } from '../../components/AdminBlogTable';

export default function AdminCategoriesPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Category Manager</h1>
      <AdminBlogTable
        blogs={[]}
        onEdit={(item) => console.log('Edit category:', item)}
        onDelete={(id) => console.log('Delete category:', id)}
        onUpdateDate={(id, date) => console.log('Update category date:', id, date)}
      />
    </div>
  );
}