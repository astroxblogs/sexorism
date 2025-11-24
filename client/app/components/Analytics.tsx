'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * Analytics component (GTM removed):
 * - Web Vitals tracking only (no GTM dependency)
 * - Measures Core Web Vitals for performance monitoring
 */
export default function Analytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Core Web Vitals tracking (console logging for development)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    (async () => {
      try {
        const { getCLS, getFID, getFCP, getLCP, getTTFB } = await import('web-vitals');

        const report = (metric: any) => {
          // Log to console for development (can be replaced with your analytics)
          console.log('Web Vital:', {
            name: metric.name,
            value: metric.value,
            id: metric.id,
            page: pathname
          });
        };

        getCLS(report);
        getFID(report);
        getFCP(report);
        getLCP(report);
        getTTFB(report);
      } catch {
        // ignore if web-vitals not available
      }
    })();
  }, [pathname]);

  return null;
}
