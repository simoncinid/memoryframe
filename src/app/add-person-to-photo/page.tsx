import { Metadata } from "next";
import { HowToPageLayout } from "@/components/HowToPageLayout";
import { copy } from "@/content/copy";

const pageData = copy.seoPages.addPersonToPhoto;

export const metadata: Metadata = {
  title: pageData.title,
  description: pageData.metaDescription,
  keywords: [
    "add person to photo",
    "add someone to picture",
    "insert person in photo",
    "AI photo editing",
    "add people to photos",
    "photo composite AI",
    "add missing person photo",
  ],
  alternates: {
    canonical: "/add-person-to-photo",
  },
  openGraph: {
    title: "Add Person to Photo | AI Photo Editor Free",
    description: "Add a person to any photo using AI. Create natural-looking composite images. Free tool, no signup required.",
    type: "website",
  },
};

const faqItems = [
  {
    question: "How does adding a person to a photo work?",
    answer: "Our AI analyzes both the person's photo and the destination background, then intelligently composites them together while matching lighting, perspective, and scale for a natural result.",
  },
  {
    question: "Can I add someone who wasn't at an event?",
    answer: "Absolutely! This is one of the most popular uses — adding family members who couldn't attend gatherings, or creating photos of moments that didn't happen in person.",
  },
  {
    question: "Will it look fake or photoshopped?",
    answer: "Our AI is designed to create natural-looking results. Using photos with similar lighting conditions and compatible angles will give the best outcome.",
  },
  {
    question: "Can I add deceased loved ones to photos?",
    answer: "Yes, many people use this tool to create meaningful memorial portraits, bringing together family members across time for cherished keepsakes.",
  },
  {
    question: "Is my privacy protected?",
    answer: "100%. We never store your photos — all processing happens in real-time via API calls and photos are immediately discarded.",
  },
];

const prompts = [
  {
    name: "Family Event",
    prompt: "Family gathering at celebration, festive atmosphere, happy expressions, indoor setting",
  },
  {
    name: "Vacation Photo",
    prompt: "Travel destination, beautiful scenery, casual vacation attire, natural lighting",
  },
  {
    name: "Group Photo Fix",
    prompt: "Natural group photo, matching lighting and perspective, seamless integration",
  },
];

const relatedPages = [
  { label: "AI Family Portrait", href: "/ai-family-portrait" },
  { label: "Combine Two Photos", href: "/combine-two-photos" },
  { label: "Photo Background Replacement", href: "/photo-background-replacement" },
  { label: "Portrait AI Generator", href: "/portrait-ai-generator" },
];

export default function AddPersonToPhotoPage() {
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
