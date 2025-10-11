import type { Metadata } from 'next'
import Link from 'next/link'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'Page Not Found - Innvibs Blog',
  description: 'The page you are looking for could not be found. Browse our latest articles and blog posts on Innvibs.',
  keywords: ['404', 'page not found', 'Innvibs', 'blog'],
  robots: {
    index: false,
    follow: true,
  },
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="bg-gradient-to-br from-purple-100 to-violet-100 dark:from-purple-900/30 dark:to-violet-900/30 rounded-full p-6 inline-block mb-6">
            <svg className="w-16 h-16 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" />
            </svg>
          </div>
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">Page Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Sorry, the page you are looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/"
            className="block w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Go to Homepage
          </Link>

          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/search"
              className="block bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold py-3 px-6 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Search Articles
            </Link>
            <Link
              href="/about"
              className="block bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold py-3 px-6 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              About Us
            </Link>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Looking for something specific? Try our search or browse our categories.
          </p>
        </div>
      </div>
    </div>
  )
}