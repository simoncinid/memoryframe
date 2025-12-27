import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ToastProvider } from "@/components/Toast";
import { copy } from "@/content/copy";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://memoryframe.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${copy.brand.name} - ${copy.brand.tagline}`,
    template: `%s | ${copy.brand.name}`,
  },
  description: copy.home.hero.subheadline,
  keywords: [
    "AI family portrait",
    "family portrait generator",
    "combine photos",
    "add person to photo",
    "AI photo editor",
    "family portrait from photos",
  ],
  authors: [{ name: copy.brand.name }],
  creator: copy.brand.name,
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: copy.brand.name,
    title: `${copy.brand.name} - ${copy.brand.tagline}`,
    description: copy.home.hero.subheadline,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: copy.brand.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${copy.brand.name} - ${copy.brand.tagline}`,
    description: copy.home.hero.subheadline,
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
};

// JSON-LD for WebSite
const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: copy.brand.name,
  description: copy.brand.tagline,
  url: siteUrl,
  potentialAction: {
    "@type": "SearchAction",
    target: `${siteUrl}/search?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={dmSans.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className="font-sans antialiased bg-white text-stone-900">
        <ToastProvider>
          <Navbar />
          <main className="min-h-screen pt-20">{children}</main>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}
