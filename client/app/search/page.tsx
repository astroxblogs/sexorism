import { Metadata } from 'next';
import SearchClient from './SearchClient';


export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: "Search Results - Sexorism",
  description: "Search for articles on Sexorism blog. Find the latest insights on technology, lifestyle, fashion, and more.",
  keywords: ["search", "blog", "articles", "Sexorism"],
  openGraph: {
    title: "Search Results - Sexorism",
    description: "Search for articles on Sexorism blog. Find the latest insights on technology, lifestyle, fashion, and more.",
    type: "website",
  },
};

export default function SearchPage() {
  return <SearchClient />;
}