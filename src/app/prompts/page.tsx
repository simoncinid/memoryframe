"use client";

import Link from "next/link";
import { useToast } from "@/components/Toast";
import { PromptCategory } from "@/components/PromptChips";
import { copy } from "@/content/copy";
import { trackEvent } from "@/lib/analytics";

export default function PromptsPage() {
  const { showToast } = useToast();

  const handleCopy = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    showToast("Prompt copied to clipboard!", "success");
    trackEvent("prompt_copied", { prompt: prompt.substring(0, 50) });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-stone-800 mb-4">
          {copy.seoPages.promptsPage.h1}
        </h1>
        <p className="text-lg text-stone-600">{copy.seoPages.promptsPage.intro}</p>
      </div>

      {/* Quick Jump */}
      <div className="mb-12 p-6 bg-stone-50 rounded-2xl">
        <h2 className="text-lg font-semibold text-stone-800 mb-4">
          Jump to Category
        </h2>
        <div className="flex flex-wrap gap-2">
          {copy.prompts.categories.map((category) => (
            <a
              key={category.id}
              href={`#${category.id}`}
              className="px-4 py-2 bg-white border border-stone-200 rounded-lg text-sm text-stone-700 hover:bg-stone-100 transition-colors"
            >
              {category.name}
            </a>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-12">
        {copy.prompts.categories.map((category) => (
          <div key={category.id} id={category.id}>
            <PromptCategory
              categoryName={category.name}
              prompts={category.prompts}
              onCopy={handleCopy}
            />
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-16 text-center py-12 bg-stone-800 rounded-2xl">
        <h2 className="text-2xl font-bold text-white mb-4">
          Ready to use these prompts?
        </h2>
        <p className="text-stone-300 mb-6">
          Copy any prompt above and paste it in the creator.
        </p>
        <Link
          href="/create"
          className="inline-block px-8 py-3 bg-white text-stone-800 rounded-xl font-medium hover:bg-stone-100 transition-colors"
        >
          Start Creating
        </Link>
      </div>

      {/* Related Pages */}
      <div className="mt-12 pt-8 border-t border-stone-200">
        <h3 className="text-lg font-semibold text-stone-800 mb-4">
          Related Pages
        </h3>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/styles"
            className="text-stone-600 hover:text-stone-800 underline underline-offset-4"
          >
            Browse Styles
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
  );
}

