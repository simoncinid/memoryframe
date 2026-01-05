import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kirkify Me - AI Face Swap Meme Generator | Maduro & Charlie Kirk",
  description: "Free AI face swap meme generator. Kirkify yourself with the viral Charlie Kirk small face meme or transform into Nicolás Maduro. Upload your photo and create hilarious face swaps instantly!",
  keywords: [
    // Kirk keywords
    "kirkify",
    "kirkified", 
    "kirkification",
    "charlie kirk",
    "charlie kirk meme",
    "charlie kirk face",
    "charlie kirk small face",
    "tpusa meme",
    "turning point usa meme",
    "kirkify me",
    "get kirkified",
    // Maduro keywords
    "maduro",
    "maduro meme",
    "nicolas maduro",
    "nicolas maduro meme",
    "venezuela meme",
    "maduro face swap",
    "venezuela president meme",
    // General face swap keywords
    "face swap ai",
    "face swap online",
    "face swap free",
    "ai face swap",
    "face swap meme",
    "face swap generator",
    "meme face swap",
    "free face swap",
    "face swap app online",
    "ai meme generator",
    "face swap charlie kirk",
    "political meme generator",
  ],
  alternates: {
    canonical: "/meme",
  },
  openGraph: {
    title: "Kirkify Me - Free AI Face Swap Meme Generator",
    description: "Create viral face swap memes with AI. Kirkify yourself with Charlie Kirk's iconic look or transform into Maduro. Free, instant, no signup!",
    type: "website",
    images: [
      {
        url: "/og-meme.png",
        width: 1200,
        height: 630,
        alt: "AI Face Swap Meme Generator - Kirkification & Maduro",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kirkify Me - AI Face Swap Meme Generator",
    description: "Free AI face swap: Kirkify yourself or become Maduro! Create viral memes instantly.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function MemeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

