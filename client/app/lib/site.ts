// lib/site.ts

export function getBaseUrl() {
  // highest priority: explicit env
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl) return envUrl;

  // local dev
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }

  // canonical domain (no .in logic anymore)
  return 'https://www.innvibs.com';
}
