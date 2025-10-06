import dynamic from 'next/dynamic';
import { Metadata } from 'next';

// Dynamically import HomePage component for tag pages
const HomePage = dynamic(() => import('../../components/HomePage'), {
  ssr: false,
  loading: () => <div className="text-center py-20">Loading tag page...</div>
});

export const metadata: Metadata = {
  title: "Tag - Innvibs",
  description: "Browse articles by tag on Innvibs",
};

interface TagPageProps {
  params: {
    tagName: string;
  };
}

export default function TagPageRoute({ params }: TagPageProps) {
   return <HomePage />;
}