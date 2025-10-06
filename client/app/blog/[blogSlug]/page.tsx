import { Metadata } from 'next';
import BlogDetailClient from './BlogDetailClient';

export const metadata: Metadata = {
  title: "Blog - Innvibs",
  description: "Read our latest blog posts and articles",
};

interface BlogDetailPageProps {
  params: {
    blogSlug: string;
  };
}

export default function BlogDetailPageRoute({ params }: BlogDetailPageProps) {
  return <BlogDetailClient params={params} />;
}