import Link from "next/link";
import { FAQ, FAQJsonLd } from "@/components/FAQ";
import { FreeServiceBanner } from "@/components/FreeServiceBanner";
import { copy } from "@/content/copy";

interface UseCase {
  readonly title: string;
  readonly description: string;
}

interface FAQItem {
  readonly question: string;
  readonly answer: string;
}

interface HowToPageLayoutProps {
  h1: string;
  intro: string;
  useCases: readonly UseCase[];
  commonMistakes: readonly string[];
  faqItems: readonly FAQItem[];
  relatedPages: readonly { label: string; href: string }[];
  prompts?: readonly { name: string; prompt: string }[];
}

export function HowToPageLayout({
  h1,
  intro,
  useCases,
  commonMistakes,
  faqItems,
  relatedPages,
  prompts,
}: HowToPageLayoutProps) {
  return (
    <>
      <FAQJsonLd items={faqItems} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Top CTA */}
        <div className="mb-8">
          <Link
            href="/create"
            className="inline-flex items-center gap-2 px-6 py-3 bg-stone-800 text-white rounded-xl font-medium hover:bg-stone-700 transition-colors shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Start Creating Your Portrait — It&apos;s Free
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-stone-800 mb-4">{h1}</h1>
          <p className="text-lg text-stone-600">{intro}</p>
        </div>

        {/* Free Service Banner */}
        <FreeServiceBanner variant="hero" />

        {/* How It Works Steps */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-stone-800 mb-6">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {copy.home.howItWorks.steps.map((step, index) => (
              <div
                key={index}
                className="p-5 bg-white border border-stone-200 rounded-xl"
              >
                <div className="w-10 h-10 bg-stone-800 text-white rounded-lg flex items-center justify-center text-lg font-bold mb-3">
                  {step.number}
                </div>
                <h3 className="font-semibold text-stone-800 mb-2">
                  {step.title}
                </h3>
                <p className="text-stone-600 text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Use Cases */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-stone-800 mb-6">
            Perfect For
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {useCases.map((useCase, index) => (
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
        {prompts && prompts.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-stone-800 mb-6">
              Example Prompts to Try
            </h2>
            <div className="space-y-4">
              {prompts.map((p, i) => (
                <div key={i} className="p-4 bg-white border border-stone-200 rounded-xl">
                  <p className="text-stone-800 font-medium mb-2">{p.name}</p>
                  <p className="text-stone-600 text-sm">{p.prompt}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Common Mistakes */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-stone-800 mb-6">
            Tips for Best Results
          </h2>
          <ul className="space-y-3">
            {commonMistakes.map((mistake, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="shrink-0 w-6 h-6 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-sm">
                  !
                </span>
                <span className="text-stone-600">Avoid: {mistake}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <FAQ items={faqItems} title="Frequently Asked Questions" />
        </section>

        {/* Mid CTA */}
        <section className="text-center py-12 bg-gradient-to-br from-stone-800 to-stone-900 rounded-2xl mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">
            Ready to Create Your Portrait?
          </h2>
          <p className="text-stone-300 mb-2">
            Free to use. No signup required. No watermarks.
          </p>
          <p className="text-stone-400 text-sm mb-6">
            Tips help us keep this tool free for everyone 💜
          </p>
          <Link
            href="/create"
            className="inline-block px-8 py-3 bg-white text-stone-800 rounded-xl font-medium hover:bg-stone-100 transition-colors"
          >
            Start Creating Now
          </Link>
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

