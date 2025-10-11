import NextDynamic from 'next/dynamic';
import type { Metadata } from 'next';

// Define a type for your HomePage component props
type HomeProps = {
  blogs: any[];
};

export const dynamic = 'force-dynamic';

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ||
  (process.env.NODE_ENV !== 'production' ? 'https://api.innvibs.in' : '');

const Home = NextDynamic<HomeProps>(() => import('./components/HomePage.js'));

export const metadata: Metadata = {
  title:
    'Inner Vibes  - Technology, Travel, Health, Lifestyle, Trends, Sports, Fashion with Vastu & Astro - innvibs.com',
  description:
    'Discover the world of Lifestyle, Fashion, Travel, Sports, Technology, Astrology, and Vastu Shastra at Innvibs...',
};

async function fetchHomeBlogs() {
  try {
    const res = await fetch(`${API_BASE}/api/blogs`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : data?.data ?? data?.payload?.data ?? [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const blogs = await fetchHomeBlogs();
  return <Home blogs={blogs} />;
}
