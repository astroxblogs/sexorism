import { Metadata } from 'next';
import AdminLoginClient from './AdminLoginClient';

export const metadata: Metadata = {
  title: "Admin Login - Innvibs",
  description: "Admin login page for Innvibs",
};

export default function AdminLoginPage() {
  return <AdminLoginClient />;
}