import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { FAQ, FAQJsonLd } from "@/components/FAQ";
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
    answer: "MemoryFrame offers 1 free image per day. No signup required, no hidden fees, no watermarks.",
  },
  {
    question: "Do you store my family photos?",
    answer: "Photos are stored securely in our database. All data is encrypted in transit and at rest. We use industry-standard security practices to protect your family's privacy.",
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
    <>
      <FAQJsonLd items={faqItems} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-[#A4193D] mb-4">{pageData.h1}</h1>
          <p className="text-lg text-[#A4193D] max-w-3xl mx-auto">{pageData.intro}</p>
        </div>


        {/* How It Works Steps - Visual Version */}
        <section className="mb-16">
          <h2 className="text-3xl font-semibold text-[#A4193D] mb-8 text-center">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 - Upload Photos */}
            <div className="p-6 bg-white border border-[#FFDFB9] rounded-2xl shadow-sm">
              <div className="w-12 h-12 bg-[#A4193D] text-white rounded-xl flex items-center justify-center text-xl font-bold mb-4">
                1
              </div>
              <h3 className="font-semibold text-[#A4193D] mb-3 text-lg">
                Upload Photos
              </h3>
              <p className="text-[#A4193D] text-sm mb-4">Upload clear photos of two people you want to combine.</p>
              
              {/* Visual Example */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <p className="text-xs text-[#7D132E] mb-1 font-medium">Person 1</p>
                  <div className="aspect-square rounded-lg overflow-hidden border-2 border-[#FFDFB9] bg-[#FFE8D1]">
                    <Image 
                      src="/examplephoto1.png" 
                      alt="Example person 1" 
                      width={150} 
                      height={150}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-[#7D132E] mb-1 font-medium">Person 2</p>
                  <div className="aspect-square rounded-lg overflow-hidden border-2 border-[#FFDFB9] bg-[#FFE8D1]">
                    <Image 
                      src="/examplephoto2.png" 
                      alt="Example person 2" 
                      width={150} 
                      height={150}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 - Pick a Style */}
            <div className="p-6 bg-white border border-[#FFDFB9] rounded-2xl shadow-sm">
              <div className="w-12 h-12 bg-[#A4193D] text-white rounded-xl flex items-center justify-center text-xl font-bold mb-4">
                2
              </div>
              <h3 className="font-semibold text-[#A4193D] mb-3 text-lg">
                Pick a Style
              </h3>
              <p className="text-[#A4193D] text-sm mb-4">Select from classic, painterly, cinematic, and more artistic styles.</p>
              
              {/* Visual Example - Style Cards */}
              <div className="grid grid-cols-2 gap-2">
                {/* Selected Style */}
                <div className="p-3 bg-[#A4193D] rounded-lg border-2 border-[#A4193D] relative">
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="w-full aspect-square rounded bg-gradient-to-br from-[#C51D4D] to-[#A4193D] mb-2" />
                  <p className="text-xs text-white font-medium text-center">Classic</p>
                </div>
                
                {/* Other Styles */}
                <div className="p-3 bg-[#FFF5EB] rounded-lg border border-[#FFDFB9] opacity-60">
                  <div className="w-full aspect-square rounded bg-gradient-to-br from-amber-500 to-orange-700 mb-2" />
                  <p className="text-xs text-[#A4193D] font-medium text-center">Painterly</p>
                </div>
                <div className="p-3 bg-[#FFF5EB] rounded-lg border border-[#FFDFB9] opacity-60">
                  <div className="w-full aspect-square rounded bg-gradient-to-br from-[#7D132E] to-[#A4193D] mb-2" />
                  <p className="text-xs text-[#A4193D] font-medium text-center">Cinematic</p>
                </div>
                <div className="p-3 bg-[#FFF5EB] rounded-lg border border-[#FFDFB9] opacity-60">
                  <div className="w-full aspect-square rounded bg-gradient-to-br from-amber-600 to-amber-800 mb-2" />
                  <p className="text-xs text-[#A4193D] font-medium text-center">Vintage</p>
                </div>
              </div>
            </div>

            {/* Step 3 - Generate & Download */}
            <div className="p-6 bg-white border border-[#FFDFB9] rounded-2xl shadow-sm">
              <div className="w-12 h-12 bg-[#A4193D] text-white rounded-xl flex items-center justify-center text-xl font-bold mb-4">
                3
              </div>
              <h3 className="font-semibold text-[#A4193D] mb-3 text-lg">
                Generate & Download
              </h3>
              <p className="text-[#A4193D] text-sm mb-4">Get your portrait in seconds. Download in high quality.</p>
              
              {/* Visual Example - Result */}
              <div className="relative">
                <div className="aspect-[4/5] rounded-xl overflow-hidden border-2 border-[#FFDFB9] bg-[#FFE8D1] shadow-lg">
                  <Image 
                    src="/examplemerged.png" 
                    alt="Example merged portrait result" 
                    width={280} 
                    height={350}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Download Badge */}
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-2 bg-green-500 text-white rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-lg">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Ready to Download
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Button */}
        <div className="text-center mb-16">
          <Link
            href="/create"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#A4193D] text-white rounded-xl font-medium text-lg hover:bg-[#7D132E] transition-colors shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Your Family Portrait
          </Link>
        </div>

        {/* Use Cases / Perfect For */}
        <section className="mb-16">
          <h2 className="text-3xl font-semibold text-[#A4193D] mb-8 text-center">
            Perfect For
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {pageData.useCases.map((useCase, index) => (
              <div
                key={index}
                className="bg-[#FFF5EB] rounded-2xl border border-[#FFDFB9] overflow-hidden"
              >
                {/* Image */}
                <div className="aspect-video bg-[#FFDFB9] overflow-hidden">
                  <Image 
                    src={`/img${index + 1}.png`}
                    alt={useCase.title}
                    width={400}
                    height={225}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Content */}
                <div className="p-6">
                  <h3 className="font-semibold text-[#A4193D] mb-2 text-lg">
                    {useCase.title}
                  </h3>
                  <p className="text-[#A4193D]">{useCase.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Example Prompts */}
        {prompts && prompts.length > 0 && (
          <section className="mb-16">
            <h2 className="text-3xl font-semibold text-[#A4193D] mb-8 text-center">
              Example Prompts to Try
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {prompts.map((p, i) => (
                <div key={i} className="p-6 bg-white border border-[#FFDFB9] rounded-xl">
                  <p className="text-[#A4193D] font-medium mb-2">{p.name}</p>
                  <p className="text-[#A4193D] text-sm">{p.prompt}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Common Mistakes / Tips */}
        <section className="mb-16">
          <h2 className="text-3xl font-semibold text-[#A4193D] mb-8 text-center">
            Tips for Best Results
          </h2>
          <div className="max-w-3xl mx-auto">
            <ul className="space-y-4">
              {pageData.commonMistakes.map((mistake, index) => (
                <li key={index} className="flex items-start gap-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <span className="shrink-0 w-8 h-8 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-lg font-bold">
                    !
                  </span>
                  <span className="text-[#A4193D] pt-1">Avoid: {mistake}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-16">
          <div className="max-w-3xl mx-auto">
            <FAQ items={faqItems} title="Frequently Asked Questions" />
          </div>
        </section>

        {/* Mid CTA */}
        <section className="text-center py-16 bg-gradient-to-br from-[#A4193D] to-[#7D132E] rounded-2xl mb-16 px-4">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Create Your Portrait?
          </h2>
          <p className="text-white/70 mb-8">
            No signup required. No watermarks.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/create"
              className="px-8 py-4 bg-white text-[#A4193D] rounded-xl font-medium text-lg hover:bg-[#FFE8D1] transition-colors"
            >
              Start Creating Now
            </Link>
          </div>
        </section>

        {/* Related Pages */}
        <div className="pt-8 border-t border-[#FFDFB9]">
          <h3 className="text-lg font-semibold text-[#A4193D] mb-4">
            Related Guides
          </h3>
          <div className="flex flex-wrap gap-4">
            {relatedPages.map((page, i) => (
              <Link
                key={i}
                href={page.href}
                className="text-[#A4193D] hover:text-[#A4193D] underline underline-offset-4"
              >
                {page.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
