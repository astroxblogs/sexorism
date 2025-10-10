'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { pushToDataLayer } from '../lib/gtmEvents';

const GtmTracker = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const query = searchParams?.toString();
    const page_path = query ? `${pathname}?${query}` : pathname;

    // Page view (single-page app navigations)
    pushToDataLayer('page_view', {
      page_path,
      page_title: typeof document !== 'undefined' ? document.title : '',
      page_location: typeof window !== 'undefined' ? window.location.href : '',
    });
  }, [pathname, searchParams]);

  return null;
};

export default GtmTracker;
