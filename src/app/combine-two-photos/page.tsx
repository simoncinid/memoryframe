import { Metadata } from "next";
import { HowToPageLayout } from "@/components/HowToPageLayout";
import { copy } from "@/content/copy";

const pageData = copy.seoPages.combineTwoPhotos;

export const metadata: Metadata = {
  title: pageData.title,
  description: pageData.metaDescription,
  keywords: [
    "combine two photos",
    "merge photos online",
    "blend two pictures",
    "photo combination tool",
    "put two photos together",
    "combine pictures AI",
    "photo merger free",
  ],
  alternates: {
    canonical: "/combine-two-photos",
  },
  openGraph: {
    title: "Combine Two Photos Into One | Free AI Photo Tool",
    description: "Seamlessly merge two separate photos into one beautiful portrait. Free AI-powered tool, no signup required.",
    type: "website",
  },
};

const faqItems = [
  {
    question: "How do you combine two photos into one?",
    answer: "Our AI analyzes both photos, understanding the faces, poses, and lighting. It then intelligently merges them into a single, cohesive portrait that looks natural and professional.",
  },
  {
    question: "What if my photos have different backgrounds?",
    answer: "No problem! You can choose a new background, and our AI will seamlessly place both subjects into the new scene while maintaining consistent lighting.",
  },
  {
    question: "Can I combine photos from different time periods?",
    answer: "Yes! This is one of the most meaningful uses of our tool — bringing together photos of loved ones across generations or time periods.",
  },
  {
    question: "Is the combined photo realistic?",
    answer: "Our AI is trained to create natural-looking compositions. For best results, use photos with similar lighting and angles.",
  },
  {
    question: "Do I need to create an account?",
    answer: "No! Just upload your photos, choose a style, and generate. No signup, no email required.",
  },
];

const prompts = [
  {
    name: "Romantic Couple",
    prompt: "Romantic couple portrait, golden hour lighting, soft bokeh background, warm tones",
  },
  {
    name: "Best Friends",
    prompt: "Fun casual portrait, bright natural lighting, genuine smiles, outdoor park setting",
  },
  {
    name: "Professional Portrait",
    prompt: "Business professional portrait, clean studio background, confident expressions",
  },
];

const relatedPages = [
  { label: "Merge Photos AI", href: "/merge-photos-ai" },
  { label: "AI Family Portrait", href: "/ai-family-portrait" },
  { label: "Add Person to Photo", href: "/add-person-to-photo" },
  { label: "Portrait AI Generator", href: "/portrait-ai-generator" },
];

export default function CombineTwoPhotosPage() {
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
