import { Metadata } from "next";
import { HowToPageLayout } from "@/components/HowToPageLayout";
import { copy } from "@/content/copy";

const pageData = copy.seoPages.familyPortraitFromTwoPhotos;

export const metadata: Metadata = {
  title: pageData.title,
  description: pageData.metaDescription,
  keywords: [
    "family portrait from two photos",
    "create family portrait",
    "combine family photos",
    "family photo from separate pictures",
    "make family portrait AI",
    "family portrait generator",
  ],
  alternates: {
    canonical: "/family-portrait-from-two-photos",
  },
  openGraph: {
    title: "Create Family Portrait From Two Photos | Free AI Tool",
    description: "Create beautiful family portraits from just two photos. Our AI combines them into one cohesive portrait. Free, easy to use.",
    type: "website",
  },
};

const faqItems = [
  {
    question: "Can I create a family portrait from just two photos?",
    answer: "Yes! Upload a photo of each person, choose a background and style, and our AI will create a beautiful family portrait that looks like everyone was photographed together.",
  },
  {
    question: "What if the photos are from different years?",
    answer: "Our AI handles photos from different time periods well. This is actually one of the most meaningful uses — creating portraits that bridge generations or commemorate loved ones.",
  },
  {
    question: "Do both people need to be facing the same direction?",
    answer: "Not necessarily, but similar angles help create more natural results. Our AI adjusts for differences, but starting with compatible photos gives the best outcome.",
  },
  {
    question: "Can I include children in the portrait?",
    answer: "Yes, but you must be the parent/legal guardian or have explicit consent from them to upload photos of minors.",
  },
  {
    question: "How much does it cost?",
    answer: "MemoryFrame offers 1 free image per day. No signup required, no hidden fees, no watermarks.",
  },
];

const prompts = [
  {
    name: "Generations Together",
    prompt: "Multi-generational family portrait, warm lighting, loving expressions, classic studio setting",
  },
  {
    name: "Home Setting",
    prompt: "Family at home, cozy living room, natural window light, relaxed and happy",
  },
  {
    name: "Outdoor Portrait",
    prompt: "Family portrait outdoors, golden hour lighting, natural scenery, genuine smiles",
  },
];

const relatedPages = [
  { label: "AI Family Portrait Generator", href: "/ai-family-portrait" },
  { label: "Combine Two Photos", href: "/combine-two-photos" },
  { label: "Merge Photos AI", href: "/merge-photos-ai" },
  { label: "Portrait Styles", href: "/styles" },
];

export default function FamilyPortraitFromTwoPhotosPage() {
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
