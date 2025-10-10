'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { pushToDataLayer } from '../lib/gtmEvents';

/**
 * GTM-friendly analytics component:
 * - DOES NOT inject gtag.js directly
 * - Pushes page_view (redundant safety) and Web Vitals into dataLayer
 * - Let GTM route events to GA4 (configure tags/triggers inside GTM)
 */
export default function Analytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Optional: additional page_view push (harmless with GTM)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const q = searchParams?.toString();
    const page_path = q ? `${pathname}?${q}` : pathname;

    pushToDataLayer('page_view', {
      page_path,
      page_title: typeof document !== 'undefined' ? document.title : '',
      page_location: typeof window !== 'undefined' ? window.location.href : '',
    });
  }, [pathname, searchParams]);

  // Core Web Vitals -> dataLayer (GTM -> GA4)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    (async () => {
      try {
        const { getCLS, getFID, getFCP, getLCP, getTTFB } = await import('web-vitals');

        const report = (metric: any) => {
          // Example: { name: 'CLS', value: 0.03, delta: ..., id: 'v4-...' }
          pushToDataLayer('web_vitals', {
            metric_name: metric.name,
            metric_id: metric.id,
            metric_value: metric.value,
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
  }, []);

  return null;
}
