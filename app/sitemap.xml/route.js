// app/sitemap.xml/route.js
import { NextResponse } from "next/server";

export default async function GET() {
  const locales = ['en', 'ar']; // Inferred from messages directory
  const baseUrl = 'https://nestsouq.app';
  const currentDate = new Date().toISOString(); // Get current date for lastmod

  let sitemapEntries = '';

  // Add homepage entries for each locale
  locales.forEach(locale => {
    sitemapEntries += `
  <url>
    <loc>${baseUrl}/${locale}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`;
  });

  // Add pricing page entries for each locale
  locales.forEach(locale => {
    sitemapEntries += `
  <url>
    <loc>${baseUrl}/${locale}/pricing</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
  });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemapEntries}
</urlset>`;;

  return new NextResponse(sitemap, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
