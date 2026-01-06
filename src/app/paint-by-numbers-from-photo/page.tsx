import type { Metadata } from "next";
import PaintByNumbersClient from "./paint-by-numbers-client";

export const metadata: Metadata = {
  title: "Paint by Numbers from Photo | Free AI Paint-by-Number Generator",
  description:
    "Turn any photo into a printable paint-by-numbers template in seconds. Upload your photo, generate a black & white paint-by-number outline, then download for free.",
  keywords: [
    "paint by numbers from photo",
    "photo to paint by numbers",
    "paint by numbers generator",
    "custom paint by numbers",
    "paint by number template",
    "paint by numbers outline",
    "ai paint by numbers",
    "turn photo into paint by numbers",
    "paint by numbers printable",
  ],
  alternates: {
    canonical: "/paint-by-numbers-from-photo",
  },
  openGraph: {
    title: "Paint by Numbers from Photo | Free AI Generator",
    description:
      "Upload a photo and generate a clean, printable paint-by-numbers outline. 100% free — no signup required.",
    type: "website",
  },
};

const faqItems = [
  {
    question: "Is this paint-by-numbers generator really free?",
    answer:
      "Yes. You can generate your paint-by-number template and download it for free. Tips are optional and help cover AI costs.",
  },
  {
    question: "What kind of photos work best?",
    answer:
      "Clear photos with a main subject (a person, pet, couple, or object) work best. Good lighting and a simple background improve the outline quality.",
  },
  {
    question: "Do you store my uploaded photos?",
    answer:
      "No. We don’t store your photos. Images are processed via real-time API calls and discarded after generation.",
  },
  {
    question: "What do I get after generating?",
    answer:
      "You’ll get a black & white paint-by-numbers style template (outline + numbered regions) ready to download and print.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

export default function PaintByNumbersFromPhotoPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <PaintByNumbersClient />
    </>
  );
}


