'use client'

import { AdminBlogTable } from '../../components/AdminBlogTable';

export default function AdminBlogsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Blogs</h1>
      <AdminBlogTable
        blogs={[]}
        onEdit={(item) => console.log('Edit blog:', item)}
        onDelete={(id) => console.log('Delete blog:', id)}
        onUpdateDate={(id, date) => console.log('Update blog date:', id, date)}
      />
    </div>
  );
}