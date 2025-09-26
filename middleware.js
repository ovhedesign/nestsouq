import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';

// Function to simulate country detection (replace with actual geo-IP lookup)
async function getCountryFromRequest(request) {
  // In a real application, you would use a geo-IP service here.
  // For demonstration, let's assume we get the country from a header or a mock.
  // Example: const country = request.headers.get('x-vercel-ip-country') || 'US';
  // For testing Saudi Arabia, you can hardcode 'SA'
  return 'SA'; // For testing purposes, assume Saudi Arabia
}

export default async function middleware(request) {
  const country = await getCountryFromRequest(request);
  const defaultLocale = country === 'SA' ? 'ar' : 'en';

  const handleI18nRouting = createMiddleware({
    locales: ['en', 'ar'],
    defaultLocale: defaultLocale,
    localePrefix: 'always'
  });

  const response = handleI18nRouting(request);

  // Add a header to indicate the detected locale for debugging
  response.headers.set('x-detected-locale', defaultLocale);

  return response;
}

export const config = {
  // Match all request paths except for the ones starting with:
  // - api (API routes)
  // - _next/static (static files)
  // - _next/image (image optimization files)
  // - favicon.ico (favicon file)
  // - sitemap.xml (sitemap file)
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml).*)']
};