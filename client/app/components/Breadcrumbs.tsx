'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

interface BreadcrumbItem {
  label: string
  href?: string
}

/**
 * Exact display names for your categories.
 * If a slug matches one of these keys, we use the mapped label.
 * Otherwise we fall back to smart formatting (title case + "&" handling).
 */
const CATEGORY_DISPLAY_MAP: Record<string, string> = {
  'health-&-wellness': 'Health & Wellness',
  'food-&-cooking': 'Food & Cooking',
  'vastu-shastra': 'Vastu Shastra',
  'business-&-finance': 'Business & Finance',
  'sports': 'Sports',
  'lifestyle': 'Lifestyle',
  'astrology': 'Astrology',
  'technology': 'Technology',
  'trends': 'Trends',
  'fashion': 'Fashion',
  'travel': 'Travel',
}

/** Top-level routes that are NOT categories */
const RESERVED_TOP_LEVEL = new Set([
  '',           // root
  'tag',
  'search',
  'about',
  'contact',
  'privacy',
  'terms',
  'admin',
  'cms',
  '_next',
  'api',
  'static',
])

/** Title-case words (simple, predictable) */
function toTitleCase(s: string) {
  return s
    .split(' ')
    .map(w => (w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : w))
    .join(' ')
}

/** Format a category slug to a nice display label */
function formatCategoryLabelFromSlug(rawSlug: string): string {
  if (!rawSlug) return ''
  const slug = decodeURIComponent(rawSlug).trim().toLowerCase()

  // 1) Exact map first (ensures perfect brand spelling)
  if (CATEGORY_DISPLAY_MAP[slug]) return CATEGORY_DISPLAY_MAP[slug]

  // 2) Generic smart formatting:
  //    - support "-&-" -> " & "
  //    - then replace remaining "-" with spaces
  //    - title-case the result, preserving "&"
  const withAmp = slug.replace(/-&-/g, ' & ')
  const spaced = withAmp.replace(/-/g, ' ')
  const parts = spaced.split('&').map(p => toTitleCase(p.trim()))
  return parts.join(' & ')
}

/** Format a tag slug similarly (no special map, just decode + title case hyphenated words) */
function formatTagLabelFromSlug(rawSlug: string): string {
  const slug = decodeURIComponent(rawSlug || '').trim().toLowerCase()
  return toTitleCase(slug.replace(/-/g, ' '))
}

export default function Breadcrumbs() {
  const [isClient, setIsClient] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient || !pathname) return null

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const breadcrumbs: BreadcrumbItem[] = [{ label: 'Home', href: '/' }]
    const pathSegments = pathname.split('/').filter(Boolean)
    if (pathSegments.length === 0) return breadcrumbs

    // ----- Legacy support: /category/... -----
    if (pathSegments[0] === 'category') {
      if (pathSegments.length >= 2) {
        const categorySlug = pathSegments[1]
        const categoryLabel = formatCategoryLabelFromSlug(categorySlug)

        // /category/[categoryName]
        if (pathSegments.length === 2) {
          breadcrumbs.push({ label: categoryLabel })
          return breadcrumbs
        }

        // /category/[categoryName]/[blogSlug] -> show only Home > Category
        if (pathSegments.length >= 3) {
          breadcrumbs.push({ label: categoryLabel, href: `/${categorySlug}` }) // link to clean URL
          return breadcrumbs
        }
      }
    }

    // ----- Clean URL mode -----
    const first = pathSegments[0]

    if (first === 'tag') {
      // Tag breadcrumb: Home > {tag}
      const tagLabel = formatTagLabelFromSlug(pathSegments[1] || '')
      breadcrumbs.push({ label: tagLabel })
      return breadcrumbs
    }

    if (first === 'search') {
      breadcrumbs.push({ label: 'Search' })
      return breadcrumbs
    }

    const pageNames: Record<string, string> = {
      about: 'About Us',
      contact: 'Contact',
      privacy: 'Privacy Policy',
      terms: 'Terms of Service',
    }

    if (pageNames[first]) {
      breadcrumbs.push({ label: pageNames[first] })
      return breadcrumbs
    }

    // If not reserved, treat as category slug
    if (!RESERVED_TOP_LEVEL.has(first)) {
      const categorySlug = first
      const categoryLabel = formatCategoryLabelFromSlug(categorySlug)

      if (pathSegments.length === 1) {
        // /[categorySlug]
        breadcrumbs.push({ label: categoryLabel })
        return breadcrumbs
      }

      if (pathSegments.length >= 2) {
        // /[categorySlug]/[blogSlug] -> show only Home > Category (no title)
        breadcrumbs.push({ label: categoryLabel, href: `/${categorySlug}` })
        return breadcrumbs
      }
    }

    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()
  if (breadcrumbs.length <= 1) return null

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <ol className="flex items-center space-x-2 text-sm">
            {breadcrumbs.map((breadcrumb, index) => (
              <li key={index} className="flex items-center">
                {index > 0 && (
                  <svg className="w-4 h-4 text-gray-400 mx-2" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                {breadcrumb.href && index < breadcrumbs.length - 1 ? (
                  <Link
                    href={breadcrumb.href}
                    className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 font-medium"
                  >
                    {breadcrumb.label}
                  </Link>
                ) : (
                  <span className="text-gray-500 dark:text-gray-400 font-medium">
                    {breadcrumb.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </nav>
  )
}
