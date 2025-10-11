import { Metadata } from 'next';
import { headers } from 'next/headers';
import BlogDetailClient from './BlogDetailClient';

// ✅ Helper
const normalizeCategoryForApi = (s: string) =>
  decodeURIComponent(s || '')
    .toLowerCase()
    .replace(/-and-/g, '-&-')
    .replace(/%26/g, '&');

// ✅ Fetch single blog server-side
async function getBlog(category: string, slug: string) {
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.innvibs.in';
  const res = await fetch(`${API_BASE}/api/blogs/${category}/${slug}`, {
    cache: 'no-store', // you can replace with { next: { revalidate: 600 } } for ISR
  });
  if (!res.ok) throw new Error(`Failed to fetch blog: ${res.status}`);
  return res.json();
}

// ✅ Metadata (you already did this perfectly)
export async function generateMetadata(
  { params }: { params: { categoryName: string; blogSlug: string } }
): Promise<Metadata> {
  const categoryForApi = normalizeCategoryForApi(params.categoryName);
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

    const textContent = (blog?.content || '').replace(/<[^>]*>/g, '');
    const excerpt = textContent.slice(0, 160) + (textContent.length > 160 ? '…' : '');

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
            url: blog.image || `${siteUrl}/top.png`,
            width: 1200,
            height: 630,
            alt: blog.title,
          },
        ],
        type: 'article',
        publishedTime: blog.date || blog.createdAt,
        modifiedTime: blog.updatedAt,
        authors: [blog.createdBy || 'Innvibs'],
        tags: blog.tags || [],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${blog.title} - Innvibs Blog`,
        description: excerpt,
        images: [blog.image || `${siteUrl}/top.png`],
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

// ✅ Actual Page (Server-Side Rendered)
export default async function BlogDetailPageRoute({ params }: BlogDetailPageProps) {
  const categoryForApi = normalizeCategoryForApi(params.categoryName);
  const blog = await getBlog(categoryForApi, params.blogSlug);

  if (!blog) {
    return <div className="container mx-auto p-6 text-center">Blog not found.</div>;
  }

  // ✅ Render content directly into HTML
  return (
    <article className="max-w-3xl mx-auto px-4 py-10 prose lg:prose-lg">
      <h1 className="text-3xl font-bold mb-4">{blog.title}</h1>
      <p className="text-sm text-gray-500 mb-8">
        {blog.createdBy ? `By ${blog.createdBy}` : 'Innvibs'} •{' '}
        {new Date(blog.createdAt).toLocaleDateString()}
      </p>
      <img
        src={blog.image || '/top.png'}
        alt={blog.title}
        className="rounded-lg mb-8 w-full"
        loading="lazy"
      />
      <div dangerouslySetInnerHTML={{ __html: blog.content }} />
      {/* Optional client features like share/like can stay */}
     <BlogDetailClient params={params} blog={blog} />
    </article>
  );
}
