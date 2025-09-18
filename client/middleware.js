import { handle } from '@prerender.io/vercel-middleware';

// This config object tells Vercel WHEN to run the middleware.
export const config = {
  // This regex matches all paths EXCEPT for:
  // - api (API routes)
  // - _next/static (static files)
  // - _next/image (image optimization files)
  // - favicon.ico (the favicon file)
  // - assets (your own static asset folder)
  matcher: '/((?!api|_next/static|_next/image|favicon.ico|assets).*)',
};

// This is the actual middleware function from Prerender.io.
// Note: We are using "export default" now.
export default handle;

