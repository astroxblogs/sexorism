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
  description: " Discover the world of Lifestyle, Fashion, Travel, Sports, Technology, Astrology, and Vastu Shastra at Innvibs — your trusted destination for daily inspiration, trending ideas, and expert insights. Explore fashion trends, travel guides, health and fitness tips, tech innovations, spiritual wisdom, and vastu-based home solutions. Stay updated, stay inspired — Inner Vibes: Explore Inside, Express Outside.",
};

export default function HomePage() {
  return (
    <Suspense fallback={<div className="text-center py-20">Loading...</div>}>
      <Home />
    </Suspense>
  );
}