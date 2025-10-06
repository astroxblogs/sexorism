import dynamic from 'next/dynamic';
import { Metadata } from 'next';

// Dynamically import PrivacyPolicyPage component
const PrivacyPolicyPage = dynamic(() => import('../../src/pages/Public-pages/PrivacyPolicyPage'), {
  ssr: false,
  loading: () => <div className="text-center py-20">Loading privacy policy...</div>
});

export const metadata: Metadata = {
  title: "Privacy Policy - Innvibs",
  description: "Read our privacy policy and understand how we protect your data",
};

export default function PrivacyPage() {
  return <PrivacyPolicyPage />;
}