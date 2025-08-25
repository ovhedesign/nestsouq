import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Netsouq - AI-Powered Image Metadata & Prompt Generation",
  description: "Netsouq helps you generate comprehensive metadata and creative prompts for your images using AI. Optimize your images for SEO, content creation, and more.",
  keywords: "AI, image processing, metadata generation, prompt generation, SEO, content creation, image optimization, Gemini AI",
  openGraph: {
    title: "Netsouq - AI-Powered Image Metadata & Prompt Generation",
    description: "Netsouq helps you generate comprehensive metadata and creative prompts for your images using AI. Optimize your images for SEO, content creation, and more.",
    url: "https://www.netsouq.com", // Replace with your actual domain
    siteName: "Netsouq",
    images: [
      {
        url: "https://www.netsouq.com/og-image.jpg", // Replace with your actual OG image URL
        width: 1200,
        height: 630,
        alt: "Netsouq - AI Image Processing",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@netsouq", // Replace with your Twitter handle
    title: "Netsouq - AI-Powered Image Metadata & Prompt Generation",
    description: "Netsouq helps you generate comprehensive metadata and creative prompts for your images using AI. Optimize your images for SEO, content creation, and more.",
    images: ["https://www.netsouq.com/twitter-image.jpg"], // Replace with your actual Twitter image URL
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
