// lib/site.ts
import { headers } from 'next/headers';

export function getBaseUrl() {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl) return envUrl;

  try {
    const host = headers().get('host') || '';
    if (!host) return 'http://localhost:3000';
    const protocol = host.includes('localhost') || host.includes('127.0.0.1') ? 'http' : 'https';
    return `${protocol}://${host}`;
  } catch {
    return 'http://localhost:3000';
  }
}
