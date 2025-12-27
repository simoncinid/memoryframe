import { Metadata } from "next";
import { HowToPageLayout } from "@/components/HowToPageLayout";
import { copy } from "@/content/copy";

const pageData = copy.seoPages.photoBackgroundReplacement;

export const metadata: Metadata = {
  title: pageData.title,
  description: pageData.metaDescription,
  keywords: [
    "photo background replacement",
    "change photo background",
    "AI background remover",
    "background changer",
    "replace photo background",
    "photo background editor",
    "remove background AI",
  ],
  alternates: {
    canonical: "/photo-background-replacement",
  },
  openGraph: {
    title: "AI Photo Background Replacement | Change Background Free",
    description: "Replace photo backgrounds instantly with AI. Transform any portrait with beautiful new backgrounds. Free online tool.",
    type: "website",
  },
};

const faqItems = [
  {
    question: "How does AI background replacement work?",
    answer: "Our AI intelligently separates the subjects from the original background and seamlessly places them into your chosen new background, adjusting lighting and shadows for a natural result.",
  },
  {
    question: "What backgrounds can I use?",
    answer: "You can upload any background image, or describe the scene you want and let our AI generate an appropriate setting.",
  },
  {
    question: "Will the edges look clean?",
    answer: "Yes! Our AI handles complex edges like hair and detailed clothing well. The result is professional-quality compositing.",
  },
  {
    question: "Can I use this for professional headshots?",
    answer: "Absolutely! Many users transform casual photos into professional headshots by adding clean studio backgrounds.",
  },
  {
    question: "Do I need Photoshop skills?",
    answer: "Not at all. Our AI does all the complex work. Just upload your photos, choose a style, and get professional results in seconds.",
  },
];

const prompts = [
  {
    name: "Professional Studio",
    prompt: "Clean professional studio background, soft gradient, business appropriate lighting",
  },
  {
    name: "Beach Paradise",
    prompt: "Tropical beach sunset, palm trees, crystal clear water, vacation vibes",
  },
  {
    name: "Mountain Vista",
    prompt: "Majestic mountain landscape, dramatic clouds, golden hour lighting",
  },
];

const relatedPages = [
  { label: "Portrait AI Generator", href: "/portrait-ai-generator" },
  { label: "Add Person to Photo", href: "/add-person-to-photo" },
  { label: "AI Family Portrait", href: "/ai-family-portrait" },
  { label: "Browse Styles", href: "/styles" },
];

export default function PhotoBackgroundReplacementPage() {
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
