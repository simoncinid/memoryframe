import Link from "next/link";
import { copy } from "@/content/copy";
import { FAQ, FAQJsonLd } from "@/components/FAQ";

export default function HomePage() {
  return (
    <>
      <FAQJsonLd items={copy.home.faq.items} />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-stone-100 via-white to-stone-50" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,113,108,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(168,162,158,0.08),transparent_50%)]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-stone-800 mb-6 animate-in fade-in slide-in-from-bottom-2">
              {copy.home.hero.headline}
            </h1>
            <p className="text-lg md:text-xl text-stone-600 mb-8 animate-in fade-in slide-in-from-bottom-2 stagger-1">
              {copy.home.hero.subheadline}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-2 stagger-2">
              <Link
                href="/create"
                className="px-8 py-4 bg-stone-800 text-white rounded-xl font-medium text-lg hover:bg-stone-700 transition-colors focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
              >
                {copy.home.hero.ctaPrimary}
              </Link>
              <a
                href="#gallery"
                className="px-8 py-4 bg-white text-stone-800 border border-stone-300 rounded-xl font-medium text-lg hover:bg-stone-50 transition-colors focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
              >
                {copy.home.hero.ctaSecondary}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-stone-800 mb-4">
              {copy.home.howItWorks.title}
            </h2>
            <p className="text-lg text-stone-600">
              {copy.home.howItWorks.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {copy.home.howItWorks.steps.map((step, index) => (
              <div
                key={index}
                className="relative p-8 bg-stone-50 rounded-2xl border border-stone-200"
              >
                <div className="w-12 h-12 bg-stone-800 text-white rounded-xl flex items-center justify-center text-xl font-bold mb-6">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold text-stone-800 mb-3">
                  {step.title}
                </h3>
                <p className="text-stone-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section id="gallery" className="py-20 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-stone-800 mb-4">
              {copy.home.gallery.title}
            </h2>
            <p className="text-lg text-stone-600">
              {copy.home.gallery.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="aspect-square rounded-xl bg-gradient-to-br from-stone-300 to-stone-500 flex items-center justify-center"
              >
                <span className="text-white/60 text-sm font-medium">
                  Example {i}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Styles Preview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-stone-800 mb-4">
              {copy.home.styles.title}
            </h2>
            <p className="text-lg text-stone-600">
              {copy.home.styles.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {copy.styles.slice(0, 8).map((style) => (
              <Link
                key={style.id}
                href={`/create?style=${style.id}`}
                className="group p-4 bg-stone-50 rounded-xl border border-stone-200 hover:border-stone-400 transition-colors"
              >
                <div className={`aspect-video rounded-lg mb-3 ${getStyleGradient(style.id)} flex items-center justify-center`}>
                  <span className="text-white/80 text-xs font-medium uppercase tracking-wide">
                    {style.name}
                  </span>
                </div>
                <h3 className="font-medium text-stone-800 group-hover:text-stone-600 transition-colors">
                  {style.name}
                </h3>
              </Link>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              href="/styles"
              className="text-stone-600 hover:text-stone-800 font-medium underline underline-offset-4"
            >
              View all styles →
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-stone-800 mb-4">
              {copy.home.trust.title}
            </h2>
            <p className="text-lg text-stone-600">
              {copy.home.trust.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {copy.home.trust.items.map((item, index) => (
              <div key={index} className="p-6 bg-white rounded-xl border border-stone-200">
                <div className="w-10 h-10 bg-stone-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-stone-800 mb-2">{item.title}</h3>
                <p className="text-sm text-stone-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Memory Use - Sobria e rispettosa */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-semibold text-stone-700 mb-4">
            {copy.home.memoryUse.title}
          </h2>
          <p className="text-stone-600 leading-relaxed">
            {copy.home.memoryUse.description}
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-stone-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <FAQ items={copy.home.faq.items} title={copy.home.faq.title} />
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-stone-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Create Your Portrait?
          </h2>
          <p className="text-lg text-stone-300 mb-8">
            It only takes a minute. Free, no signup required.
          </p>
          <Link
            href="/create"
            className="inline-block px-8 py-4 bg-white text-stone-800 rounded-xl font-medium text-lg hover:bg-stone-100 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-stone-800"
          >
            {copy.home.hero.ctaPrimary}
          </Link>
        </div>
      </section>
    </>
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
    "pop-art": "bg-gradient-to-br from-pink-500 to-purple-700",
    renaissance: "bg-gradient-to-br from-yellow-700 to-amber-900",
  };
  return gradients[styleId] || "bg-gradient-to-br from-stone-500 to-stone-700";
}
