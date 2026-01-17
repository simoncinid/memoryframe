import { Metadata } from "next";
import { HowToPageLayout } from "@/components/HowToPageLayout";

export const metadata: Metadata = {
  title: "Merge Photos AI | Combine Multiple Photos Into One Portrait",
  description: "Use AI to seamlessly merge two photos into one beautiful portrait. Free online tool to combine separate photos of loved ones into a single, professional-quality image.",
  keywords: [
    "merge photos AI",
    "combine photos online",
    "photo merger",
    "AI photo combination",
    "blend two photos",
    "merge two faces",
    "photo merging tool",
    "combine portraits AI",
  ],
  alternates: {
    canonical: "/merge-photos-ai",
  },
  openGraph: {
    title: "Merge Photos AI | Free Photo Combination Tool",
    description: "Seamlessly merge two photos into one beautiful portrait using AI. Free, no signup required.",
    type: "website",
  },
};

const useCases = [
  {
    title: "Family Reunions",
    description: "Merge photos of family members who couldn't be at the same gathering into one cohesive portrait.",
  },
  {
    title: "Couple Portraits",
    description: "Combine individual photos into romantic couple portraits, perfect for anniversaries or gifts.",
  },
  {
    title: "Memorial Photos",
    description: "Create meaningful portraits that bring together loved ones across time and distance.",
  },
];

const commonMistakes = [
  "Using photos with drastically different lighting conditions",
  "Merging photos where subjects face opposite directions",
  "Choosing a background that doesn't match the subjects' attire",
  "Using low-resolution or heavily compressed source images",
];

const faqItems = [
  {
    question: "How does AI photo merging work?",
    answer: "Our AI analyzes both photos, understanding the faces, poses, and lighting. It then intelligently combines them into a single portrait while maintaining natural proportions and consistent lighting across both subjects.",
  },
  {
    question: "What's the best photo format for merging?",
    answer: "We accept JPG, PNG, and WebP files up to 10MB. For best results, use high-resolution photos with clear, well-lit faces and similar angles between the two subjects.",
  },
  {
    question: "Can I merge more than two photos?",
    answer: "Currently, our tool supports merging two photos at a time. For larger groups, you can create multiple portraits and combine them in subsequent generations.",
  },
  {
    question: "Will the merged photo look natural?",
    answer: "Yes! Our AI is trained to create natural-looking compositions. Using photos with similar lighting and angles will give the best results.",
  },
  {
    question: "Is this tool really free?",
    answer: "MemoryFrame offers 1 free image per day. No signup required, no hidden fees, no watermarks.",
  },
];

const prompts = [
  {
    name: "Classic Studio Portrait",
    prompt: "Professional studio portrait with soft lighting, neutral gray background, elegant poses",
  },
  {
    name: "Romantic Couple",
    prompt: "Romantic couple portrait, golden hour lighting, soft bokeh background, warm tones",
  },
  {
    name: "Family Holiday",
    prompt: "Family gathered together, cozy living room setting, warm fireplace glow, holiday decorations",
  },
];

const relatedPages = [
  { label: "AI Family Portrait Generator", href: "/ai-family-portrait" },
  { label: "Combine Two Photos", href: "/combine-two-photos" },
  { label: "Add Person to Photo", href: "/add-person-to-photo" },
  { label: "Portrait AI Generator", href: "/portrait-ai-generator" },
];

export default function MergePhotosAIPage() {
  return (
    <HowToPageLayout
      h1="Merge Photos with AI — Free Online Tool"
      intro="Seamlessly combine two separate photos into one beautiful, cohesive portrait using advanced AI technology. Perfect for creating family photos when everyone couldn't be in the same place, couple portraits from individual shots, or bringing together loved ones across time and distance."
      useCases={useCases}
      commonMistakes={commonMistakes}
      faqItems={faqItems}
      relatedPages={relatedPages}
      prompts={prompts}
    />
  );
}

