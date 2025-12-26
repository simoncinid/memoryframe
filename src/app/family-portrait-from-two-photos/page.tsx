import Link from "next/link";
import { Metadata } from "next";
import { copy } from "@/content/copy";
import { FAQ, FAQJsonLd } from "@/components/FAQ";

const pageData = copy.seoPages.familyPortraitFromTwoPhotos;

export const metadata: Metadata = {
  title: pageData.title,
  description: pageData.metaDescription,
  alternates: {
    canonical: "/family-portrait-from-two-photos",
  },
};

const faqItems = [
  {
    question: "Do I need professional photos?",
    answer: "No, casual photos work great! Just make sure faces are clearly visible and well-lit. Phone photos are perfectly fine.",
  },
  {
    question: "Can the photos be from different years?",
    answer: "Yes, our AI can harmonize photos from different time periods. This is popular for creating portraits that span generations.",
  },
  {
    question: "What styles work best for family portraits?",
    answer: "Classic, Vintage, and Painterly styles are popular for family portraits. Cinematic works well for more dramatic looks.",
  },
];

export default function FamilyPortraitFromTwoPhotosPage() {
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
            Perfect For
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
            Scene Ideas
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
            Things to Watch Out For
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
            Create Your Family Portrait
          </h2>
          <p className="text-stone-300 mb-6">
            Two photos, one beautiful portrait.
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
              href="/ai-family-portrait"
              className="text-stone-600 hover:text-stone-800 underline underline-offset-4"
            >
              AI Family Portrait Guide
            </Link>
            <Link
              href="/styles"
              className="text-stone-600 hover:text-stone-800 underline underline-offset-4"
            >
              Browse Styles
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

