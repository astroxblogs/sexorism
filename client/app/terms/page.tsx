import dynamic from 'next/dynamic';
import { Metadata } from 'next';

// Dynamically import TermsOfServicePage component
const TermsOfServicePage = dynamic(() => import('../../src/pages/Public-pages/TermsOfServicePage'), {
  ssr: false,
  loading: () => <div className="text-center py-20">Loading terms of service...</div>
});

export const metadata: Metadata = {
  title: "Terms of Service - Innvibs",
  description: "Read our terms of service and user agreement",
};

export default function TermsPage() {
  return <TermsOfServicePage />;
}