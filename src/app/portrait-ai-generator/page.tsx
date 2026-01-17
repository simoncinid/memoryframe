import { Metadata } from "next";
import { HowToPageLayout } from "@/components/HowToPageLayout";

export const metadata: Metadata = {
  title: "Portrait AI Generator | Create Stunning AI Portraits",
  description: "Generate beautiful AI portraits from your photos. Transform ordinary photos into artistic portraits with various styles like classic, painterly, cinematic, and more.",
  keywords: [
    "portrait AI generator",
    "AI portrait maker",
    "photo to portrait AI",
    "AI portrait creator",
    "generate portrait from photo",
    "AI art portrait",
    "portrait generator online",
    "free AI portrait",
  ],
  alternates: {
    canonical: "/portrait-ai-generator",
  },
  openGraph: {
    title: "Portrait AI Generator | Free AI Portrait Creator",
    description: "Transform photos into stunning AI portraits. Multiple artistic styles available. Free, no signup required.",
    type: "website",
  },
};

const useCases = [
  {
    title: "Professional Headshots",
    description: "Transform casual photos into polished, professional-looking portraits perfect for LinkedIn or business use.",
  },
  {
    title: "Artistic Portraits",
    description: "Create unique artistic portraits in styles like oil painting, watercolor, or renaissance art.",
  },
  {
    title: "Special Gifts",
    description: "Generate personalized portrait art as meaningful gifts for birthdays, anniversaries, or holidays.",
  },
];

const commonMistakes = [
  "Using photos with faces partially hidden or obscured",
  "Uploading heavily filtered or edited photos",
  "Choosing mismatched styles for the subject matter",
  "Using group photos when you want an individual portrait",
];

const faqItems = [
  {
    question: "What styles of AI portraits can I create?",
    answer: "We offer multiple styles including Classic Portrait, Painterly (oil painting), Cinematic, Vintage, Black & White, Watercolor, Pop Art, and Renaissance. Each style transforms your photo into a unique artistic interpretation.",
  },
  {
    question: "How long does portrait generation take?",
    answer: "Most portraits are generated within 10-30 seconds, depending on the complexity of the scene and current server load.",
  },
  {
    question: "Can I use AI portraits commercially?",
    answer: "Yes! You own full rights to the generated portraits. Use them for personal projects, social media, print products, or commercial purposes.",
  },
  {
    question: "What photo quality do I need?",
    answer: "For best results, use clear photos with good lighting where faces are clearly visible. We accept JPG, PNG, and WebP up to 10MB.",
  },
  {
    question: "Do you store my photos?",
    answer: "Photos are stored securely in our database. All data is encrypted in transit and at rest. We use industry-standard security practices to protect your privacy.",
  },
];

const prompts = [
  {
    name: "Professional Headshot",
    prompt: "Professional business portrait, clean studio background, confident expression, soft lighting",
  },
  {
    name: "Oil Painting Style",
    prompt: "Classical oil painting portrait, rich colors, visible brushstrokes, museum-quality art",
  },
  {
    name: "Cinematic Portrait",
    prompt: "Movie poster style portrait, dramatic lighting, cinematic color grading, powerful expression",
  },
];

const relatedPages = [
  { label: "AI Family Portrait Generator", href: "/ai-family-portrait" },
  { label: "Merge Photos AI", href: "/merge-photos-ai" },
  { label: "Photo Background Replacement", href: "/photo-background-replacement" },
  { label: "Browse Portrait Styles", href: "/styles" },
];

export default function PortraitAIGeneratorPage() {
  return (
    <HowToPageLayout
      h1="Portrait AI Generator — Create Stunning Portraits Free"
      intro="Transform your photos into stunning AI-generated portraits with just a few clicks. Choose from multiple artistic styles — from classic studio portraits to painterly oil paintings to dramatic cinematic looks. Our AI understands composition, lighting, and style to create portraits that truly capture the essence of your subjects."
      useCases={useCases}
      commonMistakes={commonMistakes}
      faqItems={faqItems}
      relatedPages={relatedPages}
      prompts={prompts}
    />
  );
}

