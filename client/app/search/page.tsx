import { Metadata } from 'next';
import SearchClient from './SearchClient';

export const metadata: Metadata = {
  title: "Search Results - Innvibs",
  description: "Search for articles on Innvibs blog. Find the latest insights on technology, lifestyle, fashion, and more.",
  keywords: ["search", "blog", "articles", "innvibs"],
  openGraph: {
    title: "Search Results - Innvibs",
    description: "Search for articles on Innvibs blog. Find the latest insights on technology, lifestyle, fashion, and more.",
    type: "website",
  },
};

export default function SearchPage() {
  return <SearchClient />;
}