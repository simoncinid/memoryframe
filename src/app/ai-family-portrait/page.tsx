import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { FAQ, FAQJsonLd } from "@/components/FAQ";
import { FreeServiceBanner } from "@/components/FreeServiceBanner";
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
    <>
      <FAQJsonLd items={faqItems} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-stone-800 mb-4">{pageData.h1}</h1>
          <p className="text-lg text-stone-600 max-w-3xl mx-auto">{pageData.intro}</p>
        </div>

        {/* Free Service Banner */}
        <div className="mb-12">
          <FreeServiceBanner variant="hero" />
        </div>

        {/* How It Works Steps - Visual Version */}
        <section className="mb-16">
          <h2 className="text-3xl font-semibold text-stone-800 mb-8 text-center">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 - Upload Photos */}
            <div className="p-6 bg-white border border-stone-200 rounded-2xl shadow-sm">
              <div className="w-12 h-12 bg-stone-800 text-white rounded-xl flex items-center justify-center text-xl font-bold mb-4">
                1
              </div>
              <h3 className="font-semibold text-stone-800 mb-3 text-lg">
                Upload Photos
              </h3>
              <p className="text-stone-600 text-sm mb-4">Upload clear photos of two people you want to combine.</p>
              
              {/* Visual Example */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <p className="text-xs text-stone-500 mb-1 font-medium">Person 1</p>
                  <div className="aspect-square rounded-lg overflow-hidden border-2 border-stone-200 bg-stone-100">
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
                  <p className="text-xs text-stone-500 mb-1 font-medium">Person 2</p>
                  <div className="aspect-square rounded-lg overflow-hidden border-2 border-stone-200 bg-stone-100">
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
            <div className="p-6 bg-white border border-stone-200 rounded-2xl shadow-sm">
              <div className="w-12 h-12 bg-stone-800 text-white rounded-xl flex items-center justify-center text-xl font-bold mb-4">
                2
              </div>
              <h3 className="font-semibold text-stone-800 mb-3 text-lg">
                Pick a Style
              </h3>
              <p className="text-stone-600 text-sm mb-4">Select from classic, painterly, cinematic, and more artistic styles.</p>
              
              {/* Visual Example - Style Cards */}
              <div className="grid grid-cols-2 gap-2">
                {/* Selected Style */}
                <div className="p-3 bg-stone-800 rounded-lg border-2 border-stone-800 relative">
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="w-full aspect-square rounded bg-gradient-to-br from-stone-600 to-stone-800 mb-2" />
                  <p className="text-xs text-white font-medium text-center">Classic</p>
                </div>
                
                {/* Other Styles */}
                <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 opacity-60">
                  <div className="w-full aspect-square rounded bg-gradient-to-br from-amber-500 to-orange-700 mb-2" />
                  <p className="text-xs text-stone-600 font-medium text-center">Painterly</p>
                </div>
                <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 opacity-60">
                  <div className="w-full aspect-square rounded bg-gradient-to-br from-slate-700 to-slate-900 mb-2" />
                  <p className="text-xs text-stone-600 font-medium text-center">Cinematic</p>
                </div>
                <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 opacity-60">
                  <div className="w-full aspect-square rounded bg-gradient-to-br from-amber-600 to-amber-800 mb-2" />
                  <p className="text-xs text-stone-600 font-medium text-center">Vintage</p>
                </div>
              </div>
            </div>

            {/* Step 3 - Generate & Download */}
            <div className="p-6 bg-white border border-stone-200 rounded-2xl shadow-sm">
              <div className="w-12 h-12 bg-stone-800 text-white rounded-xl flex items-center justify-center text-xl font-bold mb-4">
                3
              </div>
              <h3 className="font-semibold text-stone-800 mb-3 text-lg">
                Generate & Download
              </h3>
              <p className="text-stone-600 text-sm mb-4">Get your portrait in seconds. Download in high quality.</p>
              
              {/* Visual Example - Result */}
              <div className="relative">
                <div className="aspect-[4/5] rounded-xl overflow-hidden border-2 border-stone-200 bg-stone-100 shadow-lg">
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
            className="inline-flex items-center gap-2 px-8 py-4 bg-stone-800 text-white rounded-xl font-medium text-lg hover:bg-stone-700 transition-colors shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Your Family Portrait — It&apos;s Free
          </Link>
        </div>

        {/* Use Cases / Perfect For */}
        <section className="mb-16">
          <h2 className="text-3xl font-semibold text-stone-800 mb-8 text-center">
            Perfect For
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {pageData.useCases.map((useCase, index) => (
              <div
                key={index}
                className="bg-stone-50 rounded-2xl border border-stone-200 overflow-hidden"
              >
                {/* Image */}
                <div className="aspect-video bg-stone-200 overflow-hidden">
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
                  <h3 className="font-semibold text-stone-800 mb-2 text-lg">
                    {useCase.title}
                  </h3>
                  <p className="text-stone-600">{useCase.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Example Prompts */}
        {prompts && prompts.length > 0 && (
          <section className="mb-16">
            <h2 className="text-3xl font-semibold text-stone-800 mb-8 text-center">
              Example Prompts to Try
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {prompts.map((p, i) => (
                <div key={i} className="p-6 bg-white border border-stone-200 rounded-xl">
                  <p className="text-stone-800 font-medium mb-2">{p.name}</p>
                  <p className="text-stone-600 text-sm">{p.prompt}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Common Mistakes / Tips */}
        <section className="mb-16">
          <h2 className="text-3xl font-semibold text-stone-800 mb-8 text-center">
            Tips for Best Results
          </h2>
          <div className="max-w-3xl mx-auto">
            <ul className="space-y-4">
              {pageData.commonMistakes.map((mistake, index) => (
                <li key={index} className="flex items-start gap-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <span className="shrink-0 w-8 h-8 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-lg font-bold">
                    !
                  </span>
                  <span className="text-stone-700 pt-1">Avoid: {mistake}</span>
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
        <section className="text-center py-16 bg-gradient-to-br from-stone-800 to-stone-900 rounded-2xl mb-16 px-4">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Create Your Portrait?
          </h2>
          <p className="text-stone-300 mb-2">
            Free to use. No signup required. No watermarks.
          </p>
          <p className="text-stone-400 text-sm mb-8">
            Tips help us keep this tool free for everyone 💜
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/create"
              className="px-8 py-4 bg-white text-stone-800 rounded-xl font-medium text-lg hover:bg-stone-100 transition-colors"
            >
              Start Creating Now
            </Link>
            <a
              href="https://buymeacoffee.com/diegosimoncini"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-gradient-to-r from-[#A4193D] to-[#C51D4D] text-white rounded-xl font-medium text-lg hover:from-[#7D132E] hover:to-[#A4193D] transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.216 6.415l-.132-.666c-.119-.598-.388-1.163-1.001-1.379-.197-.069-.42-.098-.57-.241-.152-.143-.196-.366-.231-.572-.065-.378-.125-.756-.192-1.133-.057-.325-.102-.69-.25-.987-.195-.4-.597-.634-.996-.788a5.723 5.723 0 00-.626-.194c-1-.263-2.05-.36-3.077-.416a25.834 25.834 0 00-3.7.062c-.915.083-1.88.184-2.75.5-.318.116-.646.256-.888.501-.297.302-.393.77-.177 1.146.154.267.415.456.692.58.36.162.737.284 1.123.366 1.075.238 2.189.331 3.287.37 1.218.05 2.437.01 3.65-.118.299-.033.598-.073.896-.119.352-.054.578-.513.474-.834-.124-.383-.457-.531-.834-.473-.466.074-.96.108-1.382.146-1.177.08-2.358.082-3.536.006a22.228 22.228 0 01-1.157-.107c-.086-.01-.18-.025-.258-.036-.243-.036-.484-.08-.724-.13-.111-.027-.111-.185 0-.212h.005c.277-.06.557-.108.838-.147h.002c.131-.009.263-.032.394-.048a25.076 25.076 0 013.426-.12c.674.019 1.347.067 2.017.144l.228.031c.267.04.533.088.798.145.392.085.895.113 1.07.542.055.137.08.288.111.431l.319 1.484a.237.237 0 01-.199.284h-.003c-.037.006-.075.01-.112.015a36.704 36.704 0 01-4.743.295 37.059 37.059 0 01-4.699-.304c-.14-.017-.293-.042-.417-.06-.326-.048-.649-.108-.973-.161-.393-.065-.768-.032-1.123.161-.29.16-.527.404-.675.701-.154.316-.199.66-.267 1-.069.34-.176.707-.135 1.056.087.753.613 1.365 1.37 1.502a39.69 39.69 0 0011.343.376.483.483 0 01.535.53l-.071.697-1.018 9.907c-.041.41-.047.832-.125 1.237-.122.637-.553 1.028-1.182 1.171-.577.131-1.165.185-1.756.205-.656.023-1.314-.002-1.968-.063-.694-.074-1.407-.133-2.017-.543-.635-.426-.834-1.024-.898-1.741l-.102-1.18-.105-1.207-.088-1.052-.072-.828-.06-.69c-.017-.198-.03-.396-.063-.592-.08-.472-.328-.778-.79-.799-.396-.017-.729.283-.761.737-.02.295.016.59.043.884l.102 1.18.105 1.207.088 1.052.072.828.06.69c.024.282.04.565.085.843.14.852.52 1.544 1.26 1.989.622.373 1.32.497 2.03.578.774.088 1.554.1 2.333.055.72-.04 1.431-.119 2.108-.354.792-.274 1.347-.758 1.543-1.602.085-.367.115-.744.153-1.117l1.043-10.146.072-.705a.506.506 0 01.549-.468c.474.034.948.046 1.422.046a39.77 39.77 0 003.464-.184.504.504 0 01.556.403l.124.61z"/>
              </svg>
              Buy Me a Coffee
            </a>
          </div>
        </section>

        {/* Related Pages */}
        <div className="pt-8 border-t border-stone-200">
          <h3 className="text-lg font-semibold text-stone-800 mb-4">
            Related Guides
          </h3>
          <div className="flex flex-wrap gap-4">
            {relatedPages.map((page, i) => (
              <Link
                key={i}
                href={page.href}
                className="text-stone-600 hover:text-stone-800 underline underline-offset-4"
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
