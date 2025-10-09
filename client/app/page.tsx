import dynamic from 'next/dynamic';
import { Metadata } from 'next';
import { Suspense } from 'react';

// Dynamically import HomePage component to avoid SSR issues with client-side features
const Home = dynamic(() => import('./components/HomePage.js'), {
  ssr: false,
  loading: () => <div className="text-center py-20">Loading...</div>
});

export const metadata: Metadata = {
  title: "Inner Vibes  - Technology, Travel, Health, Lifestyle, Trends, Sports, Fashion with Vastu & Astro - innvibs.com",
  description: "Discover innovative ideas, cutting-edge technology insights, and breakthrough concepts. Join thousands of innovators exploring the future of tech, business, and creativity.",
};

export default function HomePage() {
  return (
    <Suspense fallback={<div className="text-center py-20">Loading...</div>}>
      <Home />
    </Suspense>
  );
}