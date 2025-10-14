// client/app/RouteAwareChrome.tsx
'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Breadcrumbs from './components/Breadcrumbs';
import MinimalFooter from './components/MinimalFooter';

const HIDE_ON = new Set(['/contact', '/privacy', '/terms', '/about']);

function normalize(p: string) {
  if (p.length > 1 && p.endsWith('/')) return p.slice(0, -1);
  return p;
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
