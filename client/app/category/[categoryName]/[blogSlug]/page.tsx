import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { cookies } from 'next/headers';
import { Suspense } from 'react';
import BlogDetailClient from './BlogDetailClient';

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ||
  (process.env.NODE_ENV !== 'production' ? 'https://api.innvibs.in' : '');

const normalizeCategoryForApi = (s: string) =>
  decodeURIComponent(s || '')
    .toLowerCase()
    .replace(/-and-/g, '-&-') // URL “and” → API “&”
    .replace(/%26/g, '&'); // tolerate encoded &

function currentLang(): 'en' | 'hi' {
  const c = cookies();
  const v = c.get('i18next')?.value || c.get('NEXT_LOCALE')?.value || '';
  return v.toLowerCase().startsWith('hi') ? 'hi' : 'en';
}

// --- REPLACED generateMetadata (standardized env + safer fields) ---
export async function generateMetadata({
  params,
}: {
  params: { categoryName: string; blogSlug: string };
}): Promise<Metadata> {
  const categoryForApi = normalizeCategoryForApi(params.categoryName);

  const siteUrlEnv = process.env.NEXT_PUBLIC_SITE_URL;
  const host = headers().get('host') || 'www.innvibs.in';
  const siteUrl = siteUrlEnv || `https://${host}`;

  const cleanPath = `/${params.categoryName}/${params.blogSlug}`;
  const cleanUrl = `${siteUrl}${cleanPath}`;

  try {
    const res = await fetch(
      `${API_BASE}/api/blogs/${encodeURIComponent(categoryForApi)}/${encodeURIComponent(
        params.blogSlug
      )}`,
      { cache: 'no-store' }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const blog = await res.json();
    const textContent = (blog?.content || '').replace(/<[^>]*>/g, '');
    const excerpt = textContent.slice(0, 160) + (textContent.length > 160 ? '…' : '');

    const title = blog?.title ? `${blog.title} - Innvibs Blog` : 'Innvibs Blog';

    return {
      title,
      description: excerpt || 'Read the latest blog posts and articles on Innvibs',
      alternates: { canonical: cleanUrl },
      openGraph: {
        title,
        description: excerpt,
        url: cleanUrl,
        siteName: 'Innvibs Blog',
        images: [
          {
            url: blog?.image || `${siteUrl}/top.png`,
            width: 1200,
            height: 630,
            alt: blog?.title || 'Innvibs',
          },
        ],
        type: 'article',
        publishedTime: blog?.date || blog?.createdAt,
        modifiedTime: blog?.updatedAt,
        authors: [blog?.createdBy || 'Innvibs'],
        tags: blog?.tags || [],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description: excerpt,
        images: [blog?.image || `${siteUrl}/top.png`],
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

function safeHtml(html: string) {
  // keep as-is; server just passes through to <noscript> article
  return html || '';
}

interface BlogDetailPageProps {
  params: {
    categoryName: string;
    blogSlug: string;
  };
}

// Keep route-level dynamic rendering to avoid caching pitfalls
export const dynamic = 'force-dynamic';

export default async function BlogDetailPageRoute({ params }: BlogDetailPageProps) {
  const lang = currentLang();
  const categoryForApi = normalizeCategoryForApi(params.categoryName);

  // --- SSR shell (JS-off article) ---
  let blog: any = null;
  try {
    const res = await fetch(
      `${API_BASE}/api/blogs/${encodeURIComponent(categoryForApi)}/${encodeURIComponent(
        params.blogSlug
      )}?lang=${lang}`,
      { cache: 'no-store' }
    );
    if (res.ok) blog = await res.json();
  } catch {
    // swallow; SSR shell is best-effort
  }

  return (
    <>
      {/* Visible for crawlers/JS-off; does not change your interactive UI */}
      <noscript>
        {blog ? (
          <article>
            <h1>{blog.title}</h1>
            {blog?.image ? <img src={blog.image} alt={blog.title} /> : null}
            <div dangerouslySetInnerHTML={{ __html: safeHtml(blog.content || blog.body || '') }} />
          </article>
        ) : (
          <article>
            <h1>Blog</h1>
            <p>Content will appear here.</p>
          </article>
        )}
      </noscript>

      {/* Your existing interactive client detail page, unchanged */}
      <Suspense fallback={<div className="text-center py-20">Loading...</div>}>
        <BlogDetailClient params={params} />
      </Suspense>
    </>
  );
}
