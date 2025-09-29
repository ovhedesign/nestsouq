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

const siteTitle = "NestSouq – AI Powered Image to Prompt & Metadata";
const siteDescription =
  "NestSouq helps Middle East creators transform images into AI prompts and metadata instantly.";
const siteUrl = "https://nestsouq.app";

export const metadata = {
  title: siteTitle,
  description: siteDescription,
  manifest: "/site.webmanifest",
  viewport: "width=device-width, initial-scale=1",
  openGraph: {
    type: "website",
    title: siteTitle,
    description: siteDescription,
    url: siteUrl,
    images: [socialImage.src],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: [socialImage.src],
  },
  other: {
    "geo.region": "AE",
    "geo.placename": "Dubai",
    "geo.position": "25.276987;55.296249",
    "apple-mobile-web-app-title": "Nestsouq",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-96x96.png", type: "image/png", sizes: "96x96" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export default async function RootLayout({ children, params: { locale } }) {
  const { messages } = await i18nConfig({ locale });

  return (
    <html lang={locale || "en"}>
      <body className="font-almarai" data-locale={locale}>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
        <GoogleAnalytics gaId="G-Q1J3L66B0V" />
      </body>
    </html>
  );
}
