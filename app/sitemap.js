// app/sitemap.js
const baseUrl = 'https://nestsouq.app';

export default function sitemap() {
  const locales = ['en', 'ar'];

  const sitemapEntries = [];

  locales.forEach(locale => {
    sitemapEntries.push({
      url: `${baseUrl}/${locale}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    });
  });

  locales.forEach(locale => {
    sitemapEntries.push({
      url: `${baseUrl}/${locale}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  });

  return sitemapEntries;
}
