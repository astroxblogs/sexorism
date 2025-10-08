import dynamic from 'next/dynamic'
import type { Metadata } from 'next'

// Use the same HomePage layout everywhere (category, tag, home)
const HomePage = dynamic(() => import('../../components/HomePage'), {
  ssr: false,
  loading: () => <div className="text-center py-20">Loading…</div>,
})

export async function generateMetadata({
  params,
}: {
  params: { tagName: string }
}): Promise<Metadata> {
  const raw = decodeURIComponent(params.tagName || '')
  const pretty = raw.replace(/-/g, ' ').replace(/\s+/g, ' ').trim()
  return {
    title: `Curated #${pretty} Reads – Innvibs`,
    description: `Explore articles tagged "${pretty}" on Innvibs.`,
  }
}

export default function TagPageRoute() {
  // No Breadcrumbs here; your layout already renders them.
  return <HomePage />
}
