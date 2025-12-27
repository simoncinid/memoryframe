import { Metadata } from "next";
import { HowToPageLayout } from "@/components/HowToPageLayout";
import { copy } from "@/content/copy";

const pageData = copy.seoPages.aiFamilyPortrait;

export const metadata: Metadata = {
  title: pageData.title,
  description: pageData.metaDescription,
  keywords: [
    "AI family portrait",
    "family portrait generator",
    "AI family photo",
    "create family portrait",
    "family photo AI",
    "combine family photos",
    "family portrait maker",
  ],
  alternates: {
    canonical: "/ai-family-portrait",
  },
  openGraph: {
    title: "AI Family Portrait Generator | Create Beautiful Family Portraits",
    description: "Create stunning AI family portraits from separate photos. Bring loved ones together in one meaningful image. Free, no signup.",
    type: "website",
  },
};

const faqItems = [
  {
    question: "How does AI family portrait generation work?",
    answer: "Our AI analyzes the faces in your uploaded photos, understands their features, and seamlessly combines them into a single portrait while applying your chosen style and scene description.",
  },
  {
    question: "What quality photos should I use?",
    answer: "For best results, use clear, well-lit photos where faces are visible and not obscured. Similar angles between photos help create a more natural-looking result.",
  },
  {
    question: "Can I create portraits with more than two people?",
    answer: "Currently, our tool supports combining two people into a portrait. For larger family groups, you may need to run multiple generations.",
  },
  {
    question: "Is this really free?",
    answer: "Yes! MemoryFrame is 100% free. We're supported by optional tips from users who love their portraits. No signup, no hidden fees, no watermarks.",
  },
  {
    question: "Do you store my family photos?",
    answer: "No, never. We don't store any photos. Everything is processed via real-time API calls and immediately discarded. Your family's privacy is guaranteed.",
  },
];

const prompts = [
  {
    name: "Holiday Gathering",
    prompt: "Family gathered around a decorated Christmas tree, warm fireplace glow, cozy sweaters",
  },
  {
    name: "Summer Vacation",
    prompt: "Beach sunset, casual summer clothes, golden light, happy expressions, waves in background",
  },
  {
    name: "Classic Studio",
    prompt: "Professional studio portrait with soft lighting, neutral background, elegant poses",
  },
];

const relatedPages = [
  { label: "Family Portrait From Two Photos", href: "/family-portrait-from-two-photos" },
  { label: "Combine Two Photos", href: "/combine-two-photos" },
  { label: "Merge Photos AI", href: "/merge-photos-ai" },
  { label: "Portrait AI Generator", href: "/portrait-ai-generator" },
];

export default function AIFamilyPortraitPage() {
  return (
    <HowToPageLayout
      h1={pageData.h1}
      intro={pageData.intro}
      useCases={pageData.useCases}
      commonMistakes={pageData.commonMistakes}
      faqItems={faqItems}
      relatedPages={relatedPages}
      prompts={prompts}
    />
  );
}
