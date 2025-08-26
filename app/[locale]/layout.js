import { NextIntlClientProvider } from "next-intl";
import localFont from "next/font/local";
import i18nConfig from "../../i18n.js";
import "../globals.css";
import { headers } from "next/headers";

const almarai = localFont({
  src: "../fonts/Almarai.ttf",
  display: "swap",
});

export default async function RootLayout({ children, params }) {
  console.log("RootLayout params:", params);
  const { locale } = await params;
  console.log("RootLayout locale:", locale);
  const { messages } = await i18nConfig({ locale });

  return (
    <html lang="en">
      <body className="font-almarai" data-locale={locale}>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
