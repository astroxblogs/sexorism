// client/app/blog/[blogSlug]/page.tsx

import type { Metadata } from 'next';
import { permanentRedirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Blog - Sexorism',
  description: 'Read our latest blog posts and articles',
};

interface BlogDetailPageProps {
  params: { blogSlug: string };
}

// No working "by-slug" API without category -> avoid thin/empty CSR pages.
// Redirect to a crawlable page until we can resolve category from slug.
export default async function BlogDetailPageRoute({ params }: BlogDetailPageProps) {
  permanentRedirect('/');
}
