import { Metadata } from 'next';
import { headers } from 'next/headers';
import BlogDetailClient from './BlogDetailClient';

const normalizeCategoryForApi = (s: string) =>
  decodeURIComponent(s || '')
    .toLowerCase()
    .replace(/-and-/g, '-&-') // URL “and” → API “&”
    .replace(/%26/g, '&');    // tolerate encoded &

// --- replace only this function ---
export async function generateMetadata(
  { params }: { params: { categoryName: string; blogSlug: string } }
): Promise<Metadata> {
  const categoryForApi = normalizeCategoryForApi(params.categoryName);

  // env + host
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.innvibs.in';
  const siteUrlEnv = process.env.NEXT_PUBLIC_SITE_URL;
  const host = headers().get('host') || 'www.innvibs.in';
  const siteUrl = siteUrlEnv || `https://${host}`;

  const cleanPath = `/${params.categoryName}/${params.blogSlug}`;
  const cleanUrl = `${siteUrl}${cleanPath}`;

  try {
    const res = await fetch(
      `${API_BASE}/api/blogs/${categoryForApi}/${params.blogSlug}`,
      { cache: 'no-store' }
    );

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const blog = await res.json();

    // build excerpt from HTML (simple)
    const textContent = (blog?.content || '').replace(/<[^>]*>/g, '');
    const excerpt =
      textContent.slice(0, 160) + (textContent.length > 160 ? '…' : '');

    return {
      title: `${blog.title} - Innvibs Blog`,
      description: excerpt,
      alternates: { canonical: cleanUrl },
      openGraph: {
        title: `${blog.title} - Innvibs Blog`,
        description: excerpt,
        url: cleanUrl,
        siteName: 'Innvibs Blog',
        images: [
          {
            url: blog.image || `${siteUrl}/logo.png`,
            width: 1200,
            height: 630,
            alt: blog.title,
          },
        ],
        type: 'article',
        publishedTime: blog.date || blog.createdAt,
        modifiedTime: blog.updatedAt,
        authors: [blog.createdBy || 'Innvibs Team'],
        tags: blog.tags || [],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${blog.title} - Innvibs Blog`,
        description: excerpt,
        images: [blog.image || `${siteUrl}/logo.png`],
        creator: '@innvibs',
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
    };
  } catch (e) {
    console.error('Error fetching blog metadata:', e);
    return {
      title: 'Blog Post - Innvibs',
      description: 'Read the latest blog posts and articles on Innvibs',
      alternates: { canonical: cleanUrl },
    };
  }
}


interface BlogDetailPageProps {
  params: {
    categoryName: string;
    blogSlug: string;
  };
}

export default function BlogDetailPageRoute({ params }: BlogDetailPageProps) {
  return <BlogDetailClient params={params} />;
}
