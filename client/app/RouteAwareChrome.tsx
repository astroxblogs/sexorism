// app/RouteAwareChrome.tsx
'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Breadcrumbs from './components/Breadcrumbs';
import MinimalFooter from './components/MinimalFooter'; // <- adjust path if your footer lives elsewhere

const HIDE_ON = new Set(['/contact', '/privacy', '/terms', '/about']);

function normalize(pathname: string) {
  if (pathname.length > 1 && pathname.endsWith('/')) return pathname.slice(0, -1);
  return pathname;
}

export default function RouteAwareChrome({ children }: { children: React.ReactNode }) {
  const pathname = normalize(usePathname() || '/');
  const hide = HIDE_ON.has(pathname);

  return (
    <>
      {!hide && <Breadcrumbs />}
      {children}
      {hide && <MinimalFooter />}
    </>
  );
}
