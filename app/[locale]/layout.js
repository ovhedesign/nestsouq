import { NextIntlClientProvider } from "next-intl";
import { Inter, Geist_Mono } from "next/font/google"; // Changed Geist to Inter
import i18nConfig from "../../i18n.js"; // adjust path if needed
import localFont from 'next/font/local';
import "../globals.css";

// Initialize fonts
const inter = Inter({ // Changed geistSans to inter
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const almarai = localFont({
  src: '../../Almarai.ttf', // Path relative to layout.js
  variable: '--font-almarai',
});

export default async function RootLayout({ children, params }) {
  const { locale } = await params; // ✅ await params
  const { messages } = await i18nConfig({ locale });

  return (
    <html lang={locale || "en"} suppressHydrationWarning>
      <body
        className={`${geistMono.variable} antialiased ${locale === 'ar' ? almarai.variable : inter.variable}`}
      >
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
