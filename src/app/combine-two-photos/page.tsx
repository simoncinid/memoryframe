import Link from "next/link";
import { Metadata } from "next";
import { copy } from "@/content/copy";
import { FAQ, FAQJsonLd } from "@/components/FAQ";

const pageData = copy.seoPages.combineTwoPhotos;

export const metadata: Metadata = {
  title: pageData.title,
  description: pageData.metaDescription,
  alternates: {
    canonical: "/combine-two-photos",
  },
};

const faqItems = [
  {
    question: "What does 'combine two photos' mean?",
    answer: "It means taking two separate photographs and merging them into a single cohesive image where both subjects appear together naturally.",
  },
  {
    question: "Will the combined photo look real?",
    answer: "Our AI is trained to create natural-looking compositions. Results depend on the quality and compatibility of your source photos.",
  },
  {
    question: "Can I combine photos from different time periods?",
    answer: "Yes! Many users combine photos from different eras to create meaningful portraits that span generations.",
  },
];

export default function CombineTwoPhotosPage() {
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
            Popular Use Cases
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
            Prompts That Work Well
          </h2>
          <div className="space-y-4">
            {copy.prompts.categories.slice(1, 4).map((cat) => (
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
            Avoid These Mistakes
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
            Combine Your Photos Now
          </h2>
          <p className="text-stone-300 mb-6">
            Upload two photos and see them merged in seconds.
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
              href="/add-person-to-photo"
              className="text-stone-600 hover:text-stone-800 underline underline-offset-4"
            >
              Add Person to Photo
            </Link>
            <Link
              href="/photo-background-replacement"
              className="text-stone-600 hover:text-stone-800 underline underline-offset-4"
            >
              Background Replacement
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

