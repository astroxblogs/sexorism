'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

interface BreadcrumbItem {
  label: string
  href?: string
}

export default function Breadcrumbs() {
  const [isClient, setIsClient] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Don't render on server side to prevent hydration mismatch
  if (!isClient || !pathname) {
    return null
  }

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (!pathname) return [{ label: 'Home', href: '/' }]

    const pathSegments = pathname.split('/').filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Home', href: '/' }
    ]

    if (pathSegments.length === 0) return breadcrumbs

    if (pathSegments[0] === 'category') {
      if (pathSegments.length >= 2) {
        breadcrumbs.push(
          { label: 'Categories', href: '/category' },
          { label: decodeURIComponent(pathSegments[1].replace(/-/g, ' ')) }
        )

        if (pathSegments.length >= 3) {
          breadcrumbs.push({ label: 'Post' })
        }
      }
    } else if (pathSegments[0] === 'tag') {
      breadcrumbs.push(
        { label: 'Tags', href: '/tag' },
        { label: decodeURIComponent(pathSegments[1].replace(/-/g, ' ')) }
      )
    } else if (pathSegments[0] === 'search') {
      breadcrumbs.push({ label: 'Search' })
    } else {
      // Handle other static pages
      const pageNames: { [key: string]: string } = {
        'about': 'About Us',
        'contact': 'Contact',
        'privacy': 'Privacy Policy',
        'terms': 'Terms of Service'
      }

      if (pageNames[pathSegments[0]]) {
        breadcrumbs.push({ label: pageNames[pathSegments[0]] })
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
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
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