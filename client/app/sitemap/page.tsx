// client/app/sitemap/page.tsx
import Link from 'next/link';

export const metadata = {
  title: 'Sitemap | Sexorism',
  description: 'Discover the world of Lifestyle, Fashion, Travel, Sports, Technology, Astrology, and Vastu Shastra at Sexorism — your trusted destination for daily inspiration, trending ideas, and expert insights. Explore fashion trends, travel guides, health and fitness tips, tech innovations, spiritual wisdom, and vastu-based home solutions. Stay updated, stay inspired — Sexorism: Explore Inside, Express Outside.',
  robots: { index: true, follow: true },
};

export const dynamic = 'force-static';

const CATEGORIES = [
  'Technology',
  'Fashion',
  'Health & Wellness',
  'Travel',
  'Food & Cooking',
  'Sports',
  'Business & Finance',
  'Lifestyle',
  'Trends',
  'Relationship',
  'Astrology',
  'Vastu Shastra',
];

const slug = (s: string) =>
  s.toLowerCase().replace(/ & /g, '-and-').replace(/\s+/g, '-');

export default function SitemapPage() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12">
      {/* Header */}
      <header className="mb-8 md:mb-12">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
          Sitemap
        </h1>
        <p className="mt-2 text-sm md:text-base text-gray-600 dark:text-gray-300">
          Quick links to primary pages and categories across Sexorism.
        </p>
      </header>

      {/* Cards wrapper */}
      <div className="grid gap-6 md:gap-8 md:grid-cols-2">
        {/* Main links */}
        <section
          aria-labelledby="sitemap-main"
          className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 backdrop-blur p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <h2
              id="sitemap-main"
              className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white"
            >
              Main
            </h2>
          </div>

          <ul className="mt-4 divide-y divide-gray-100 dark:divide-gray-800">
            {[
              { href: '/', label: 'Home' },
              { href: '/about', label: 'About' },
              { href: '/contact', label: 'Contact' },
              { href: '/privacy', label: 'Privacy Policy' },
              { href: '/terms', label: 'Terms of Service' },
            ].map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="group flex items-center justify-between py-3 outline-none"
                >
                  <span className="text-sm md:text-base text-gray-800 dark:text-gray-200 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {item.label}
                  </span>
                  {/* chevron */}
                  <svg
                    className="h-4 w-4 text-gray-400 group-hover:text-purple-500 transition-transform group-hover:translate-x-0.5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Categories */}
        <section
          aria-labelledby="sitemap-categories"
          className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 backdrop-blur p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <h2
              id="sitemap-categories"
              className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white"
            >
              Categories
            </h2>
            <span className="text-xs md:text-sm px-2 py-1 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-100 dark:border-purple-800">
              {CATEGORIES.length} sections
            </span>
          </div>

          <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {CATEGORIES.map((name) => (
              <li key={name}>
                <Link
                  href={`/${slug(name)}`}
                  className="group flex items-center justify-between rounded-lg border border-transparent hover:border-purple-200 hover:bg-purple-50/60 dark:hover:bg-purple-900/20 px-3 py-2 transition-colors outline-none"
                >
                  <span className="text-sm md:text-base text-gray-800 dark:text-gray-200 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
                    {name}
                  </span>
                  <svg
                    className="h-4 w-4 text-gray-400 group-hover:text-purple-500 transition-transform group-hover:translate-x-0.5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Bottom helper note */}
      <p className="mt-8 text-xs md:text-sm text-gray-500 dark:text-gray-400">
        Looking for something else? Try the site search or browse tags from any article.
      </p>
    </section>
  );
}
