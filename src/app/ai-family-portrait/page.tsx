import Link from "next/link";
import { Metadata } from "next";
import { copy } from "@/content/copy";
import { FAQ, FAQJsonLd } from "@/components/FAQ";

const pageData = copy.seoPages.aiFamilyPortrait;

export const metadata: Metadata = {
  title: pageData.title,
  description: pageData.metaDescription,
  alternates: {
    canonical: "/ai-family-portrait",
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
];

export default function AIFamilyPortraitPage() {
  return (
    <>
      <FAQJsonLd items={faqItems} />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-stone-800 mb-4">
            {pageData.h1}
          </h1>
          <p className="text-lg text-stone-600">{pageData.intro}</p>
        </div>

        {/* Use Cases */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-stone-800 mb-6">
            How People Use This Tool
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {pageData.useCases.map((useCase, index) => (
              <div
                key={index}
                className="p-6 bg-stone-50 rounded-xl border border-stone-200"
              >
                <h3 className="font-semibold text-stone-800 mb-2">
                  {useCase.title}
                </h3>
                <p className="text-stone-600 text-sm">{useCase.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Example Prompts */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-stone-800 mb-6">
            Example Prompts to Try
          </h2>
          <div className="space-y-4">
            {copy.prompts.categories.slice(0, 3).map((cat) => (
              <div key={cat.id} className="p-4 bg-white border border-stone-200 rounded-xl">
                <p className="text-stone-800 font-medium mb-2">{cat.name}</p>
                <p className="text-stone-600 text-sm">{cat.prompts[0]}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Common Mistakes */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-stone-800 mb-6">
            Common Mistakes to Avoid
          </h2>
          <ul className="space-y-3">
            {pageData.commonMistakes.map((mistake, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="shrink-0 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm">
                  ✕
                </span>
                <span className="text-stone-600">{mistake}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <FAQ items={faqItems} title="Frequently Asked Questions" />
        </section>

        {/* CTA */}
        <section className="text-center py-12 bg-stone-800 rounded-2xl">
          <h2 className="text-2xl font-bold text-white mb-4">
            Create Your Family Portrait Now
          </h2>
          <p className="text-stone-300 mb-6">
            Free to use. No signup required.
          </p>
          <Link
            href="/create"
            className="inline-block px-8 py-3 bg-white text-stone-800 rounded-xl font-medium hover:bg-stone-100 transition-colors"
          >
            Start Creating
          </Link>
        </section>

        {/* Related Pages */}
        <div className="mt-12 pt-8 border-t border-stone-200">
          <h3 className="text-lg font-semibold text-stone-800 mb-4">
            Related Pages
          </h3>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/family-portrait-from-two-photos"
              className="text-stone-600 hover:text-stone-800 underline underline-offset-4"
            >
              Family Portrait From Two Photos
            </Link>
            <Link
              href="/combine-two-photos"
              className="text-stone-600 hover:text-stone-800 underline underline-offset-4"
            >
              Combine Two Photos
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

