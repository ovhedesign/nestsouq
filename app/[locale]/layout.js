import { NextIntlClientProvider } from "next-intl";
import localFont from "next/font/local";
import i18nConfig from "../../i18n.js";
import "../globals.css";
import socialImage from "./social-image.png";
import { GoogleAnalytics } from "@next/third-parties/google";

const almarai = localFont({
  src: "../fonts/Almarai.ttf",
  display: "swap",
});

export default async function RootLayout({ children, params: { locale } }) {
  const { messages } = await i18nConfig({ locale });

  const siteTitle = "NestSouq – AI Powered Image to Prompt & Metadata";
  const siteDescription =
    "NestSouq helps Middle East creators transform images into AI prompts and metadata instantly.";
  const siteUrl = "https://nestsouq.app";

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
        <meta property="og:image" content={socialImage.src} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={siteTitle} />
        <meta name="twitter:description" content={siteDescription} />
        <meta name="twitter:image" content={socialImage.src} />
        <meta name="geo.region" content="AE" />
        <meta name="geo.placename" content="Dubai" />
        <meta name="geo.position" content="25.276987;55.296249" />
        <link
          rel="icon"
          type="image/png"
          href="/favicon-96x96.png"
          sizes="96x96"
        />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <meta name="apple-mobile-web-app-title" content="Nestsouq" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>

      <body className="font-almarai" data-locale={locale}>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
        <GoogleAnalytics gaId="G-Q1J3L66B0V" />
      </body>
    </html>
  );
}
