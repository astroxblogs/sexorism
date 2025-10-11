// app/admin/login/page.tsx
import { Metadata } from 'next';
import { Suspense } from 'react';
import AdminLoginClient from './AdminLoginClient';

export const metadata: Metadata = {
  title: 'Admin Login - Innvibs',
  description: 'Admin login page for Innvibs',
};

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="py-10 text-center">Loading…</div>}>
      <AdminLoginClient />
    </Suspense>
  );
}
