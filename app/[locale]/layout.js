import { NextIntlClientProvider } from "next-intl";
import localFont from "next/font/local";
import i18nConfig from "../../i18n.js";
import "../globals.css";

const almarai = localFont({
  src: "../fonts/Almarai.ttf",
  display: "swap",
});

export default async function RootLayout({ children, params: { locale } }) {
  const { messages } = await i18nConfig({ locale });

  const siteTitle = "NestSouq – AI Powered Image to Prompt & Metadata";
  const siteDescription =
    "NestSouq helps Middle East creators transform images into AI prompts and metadata instantly.";
  const siteUrl = "https://nestsouq.com"; // Replace with your real domain
  const socialImage = `${siteUrl}/social-image.png`; // Place an OG image in /public

  return (
    <html lang={locale || "en"}>
      <head>
        <title>{siteTitle}</title>
        <meta name="description" content={siteDescription} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={siteTitle} />
        <meta property="og:description" content={siteDescription} />
        <meta property="og:url" content={siteUrl} />
        <meta property="og:image" content={socialImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={siteTitle} />
        <meta name="twitter:description" content={siteDescription} />
        <meta name="twitter:image" content={socialImage} />
        <meta name="geo.region" content="AE" />
        <meta name="geo.placename" content="Dubai" />
        <meta name="geo.position" content="25.276987;55.296249" />
      </head>

      <body className="font-almarai" data-locale={locale}>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
