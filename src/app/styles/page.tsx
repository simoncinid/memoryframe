import Link from "next/link";
import { Metadata } from "next";
import { copy } from "@/content/copy";

export const metadata: Metadata = {
  title: copy.seoPages.stylesPage.title,
  description: copy.seoPages.stylesPage.metaDescription,
  alternates: {
    canonical: "/styles",
  },
};

export default function StylesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="max-w-3xl mb-12">
        <h1 className="text-4xl font-bold text-stone-800 mb-4">
          {copy.seoPages.stylesPage.h1}
        </h1>
        <p className="text-lg text-stone-600">{copy.seoPages.stylesPage.intro}</p>
      </div>

      {/* Styles Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {copy.styles.map((style) => (
          <Link
            key={style.id}
            href={`/create?style=${style.id}`}
            className="group block p-6 bg-white rounded-2xl border border-stone-200 hover:border-stone-400 hover:shadow-lg transition-all"
          >
            <div
              className={`aspect-video rounded-xl mb-4 ${getStyleGradient(style.id)} flex items-center justify-center`}
            >
              <span className="text-white/80 text-sm font-medium uppercase tracking-wide">
                Preview
              </span>
            </div>
            <h2 className="text-xl font-semibold text-stone-800 mb-2 group-hover:text-stone-600 transition-colors">
              {style.name}
            </h2>
            <p className="text-stone-600 mb-4">{style.description}</p>
            <span className="text-stone-800 font-medium group-hover:underline">
              Use this style →
            </span>
          </Link>
        ))}
      </div>

      {/* CTA */}
      <div className="text-center py-12 bg-stone-50 rounded-2xl">
        <h2 className="text-2xl font-bold text-stone-800 mb-4">
          Ready to create your portrait?
        </h2>
        <p className="text-stone-600 mb-6">
          Choose a style above or explore all options in the creator.
        </p>
        <Link
          href="/create"
          className="inline-block px-8 py-3 bg-stone-800 text-white rounded-xl font-medium hover:bg-stone-700 transition-colors"
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
            href="/prompts"
            className="text-stone-600 hover:text-stone-800 underline underline-offset-4"
          >
            Browse Prompts
          </Link>
          <Link
            href="/ai-family-portrait"
            className="text-stone-600 hover:text-stone-800 underline underline-offset-4"
          >
            AI Family Portrait Guide
          </Link>
        </div>
      </div>
    </div>
  );
}

function getStyleGradient(styleId: string): string {
  const gradients: Record<string, string> = {
    classic: "bg-gradient-to-br from-stone-600 to-stone-800",
    painterly: "bg-gradient-to-br from-amber-500 to-orange-700",
    cinematic: "bg-gradient-to-br from-slate-700 to-slate-900",
    vintage: "bg-gradient-to-br from-amber-600 to-amber-800",
    blackwhite: "bg-gradient-to-br from-gray-600 to-gray-900",
    watercolor: "bg-gradient-to-br from-sky-400 to-blue-600",
    "pop-art": "bg-gradient-to-br from-[#A4193D] to-[#7D132E]",
    renaissance: "bg-gradient-to-br from-yellow-700 to-amber-900",
  };
  return gradients[styleId] || "bg-gradient-to-br from-stone-500 to-stone-700";
}

