import dynamic from 'next/dynamic';
import { Metadata } from 'next';

// Dynamically import ContactUsPage component
const ContactUsPage = dynamic(() => import('../../src/pages/Public-pages/ContactUsPage'), {
  ssr: false,
  loading: () => <div className="text-center py-20">Loading contact page...</div>
});

export const metadata: Metadata = {
  title: "Contact Us - Innvibs",
  description: "Get in touch with Innvibs team",
};

export default function ContactPage() {
  return <ContactUsPage />;
}