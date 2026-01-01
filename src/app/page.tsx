import Link from "next/link";
import Image from "next/image";
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

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
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

      {/* Free Service Banner */}
      <section className="py-6 bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50 border-y border-pink-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-center md:text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </div>
              <div>
                <p className="font-semibold text-stone-800">Free forever, powered by your support</p>
                <p className="text-sm text-stone-600">Running AI costs real money — tips from kind users keep this free for everyone 💜</p>
              </div>
            </div>
            <a
              href="https://buymeacoffee.com/diegosimoncini"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full font-medium text-sm hover:from-pink-600 hover:to-purple-600 transition-all shadow-md flex items-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.216 6.415l-.132-.666c-.119-.598-.388-1.163-1.001-1.379-.197-.069-.42-.098-.57-.241-.152-.143-.196-.366-.231-.572-.065-.378-.125-.756-.192-1.133-.057-.325-.102-.69-.25-.987-.195-.4-.597-.634-.996-.788a5.723 5.723 0 00-.626-.194c-1-.263-2.05-.36-3.077-.416a25.834 25.834 0 00-3.7.062c-.915.083-1.88.184-2.75.5-.318.116-.646.256-.888.501-.297.302-.393.77-.177 1.146.154.267.415.456.692.58.36.162.737.284 1.123.366 1.075.238 2.189.331 3.287.37 1.218.05 2.437.01 3.65-.118.299-.033.598-.073.896-.119.352-.054.578-.513.474-.834-.124-.383-.457-.531-.834-.473-.466.074-.96.108-1.382.146-1.177.08-2.358.082-3.536.006a22.228 22.228 0 01-1.157-.107c-.086-.01-.18-.025-.258-.036-.243-.036-.484-.08-.724-.13-.111-.027-.111-.185 0-.212h.005c.277-.06.557-.108.838-.147h.002c.131-.009.263-.032.394-.048a25.076 25.076 0 013.426-.12c.674.019 1.347.067 2.017.144l.228.031c.267.04.533.088.798.145.392.085.895.113 1.07.542.055.137.08.288.111.431l.319 1.484a.237.237 0 01-.199.284h-.003c-.037.006-.075.01-.112.015a36.704 36.704 0 01-4.743.295 37.059 37.059 0 01-4.699-.304c-.14-.017-.293-.042-.417-.06-.326-.048-.649-.108-.973-.161-.393-.065-.768-.032-1.123.161-.29.16-.527.404-.675.701-.154.316-.199.66-.267 1-.069.34-.176.707-.135 1.056.087.753.613 1.365 1.37 1.502a39.69 39.69 0 0011.343.376.483.483 0 01.535.53l-.071.697-1.018 9.907c-.041.41-.047.832-.125 1.237-.122.637-.553 1.028-1.182 1.171-.577.131-1.165.185-1.756.205-.656.023-1.314-.002-1.968-.063-.694-.074-1.407-.133-2.017-.543-.635-.426-.834-1.024-.898-1.741l-.102-1.18-.105-1.207-.088-1.052-.072-.828-.06-.69c-.017-.198-.03-.396-.063-.592-.08-.472-.328-.778-.79-.799-.396-.017-.729.283-.761.737-.02.295.016.59.043.884l.102 1.18.105 1.207.088 1.052.072.828.06.69c.024.282.04.565.085.843.14.852.52 1.544 1.26 1.989.622.373 1.32.497 2.03.578.774.088 1.554.1 2.333.055.72-.04 1.431-.119 2.108-.354.792-.274 1.347-.758 1.543-1.602.085-.367.115-.744.153-1.117l1.043-10.146.072-.705a.506.506 0 01.549-.468c.474.034.948.046 1.422.046a39.77 39.77 0 003.464-.184.504.504 0 01.556.403l.124.61z"/>
              </svg>
              Support Us
            </a>
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
            {/* Step 1 - Upload Photos */}
            <div className="p-6 bg-stone-50 rounded-2xl border border-stone-200">
              <div className="w-12 h-12 bg-stone-800 text-white rounded-xl flex items-center justify-center text-xl font-bold mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-stone-800 mb-3">
                Upload Photos
              </h3>
              <p className="text-stone-600 text-sm mb-4">Add photos of two people and choose a background scene.</p>
              
              {/* Visual Example */}
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <p className="text-xs text-stone-500 mb-1 font-medium">Person 1</p>
                    <div className="aspect-square rounded-lg overflow-hidden border-2 border-stone-200 bg-stone-100">
                      <Image 
                        src="/examplephoto1.png" 
                        alt="Example person 1" 
                        width={120} 
                        height={120}
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
                        width={120} 
                        height={120}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-stone-500 mb-1 font-medium">Background</p>
                  <div className="aspect-video rounded-lg overflow-hidden border-2 border-stone-200 bg-stone-100">
                    <Image 
                      src="/examplebackground.png" 
                      alt="Example background" 
                      width={280} 
                      height={160}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 - Pick a Style */}
            <div className="p-6 bg-stone-50 rounded-2xl border border-stone-200">
              <div className="w-12 h-12 bg-stone-800 text-white rounded-xl flex items-center justify-center text-xl font-bold mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-stone-800 mb-3">
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
                <div className="p-3 bg-white rounded-lg border border-stone-200 opacity-60">
                  <div className="w-full aspect-square rounded bg-gradient-to-br from-amber-500 to-orange-700 mb-2" />
                  <p className="text-xs text-stone-600 font-medium text-center">Painterly</p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-stone-200 opacity-60">
                  <div className="w-full aspect-square rounded bg-gradient-to-br from-slate-700 to-slate-900 mb-2" />
                  <p className="text-xs text-stone-600 font-medium text-center">Cinematic</p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-stone-200 opacity-60">
                  <div className="w-full aspect-square rounded bg-gradient-to-br from-amber-600 to-amber-800 mb-2" />
                  <p className="text-xs text-stone-600 font-medium text-center">Vintage</p>
                </div>
              </div>
            </div>

            {/* Step 3 - Generate & Download */}
            <div className="p-6 bg-stone-50 rounded-2xl border border-stone-200">
              <div className="w-12 h-12 bg-stone-800 text-white rounded-xl flex items-center justify-center text-xl font-bold mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-stone-800 mb-3">
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
      <section className="py-20 bg-gradient-to-br from-stone-800 to-stone-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full mb-6">
            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm font-medium text-white/90">100% Free • No Signup • No Watermarks</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Create Your Portrait?
          </h2>
          <p className="text-lg text-stone-300 mb-2">
            It only takes a minute. Upload two photos, pick a style, done.
          </p>
          <p className="text-sm text-stone-400 mb-8">
            Love your result? Optional tips help keep this free for families everywhere 💜
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/create"
              className="px-8 py-4 bg-white text-stone-800 rounded-xl font-medium text-lg hover:bg-stone-100 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-stone-800"
            >
              {copy.home.hero.ctaPrimary}
            </Link>
            <a
              href="https://buymeacoffee.com/diegosimoncini"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-medium text-lg hover:from-pink-600 hover:to-purple-600 transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.216 6.415l-.132-.666c-.119-.598-.388-1.163-1.001-1.379-.197-.069-.42-.098-.57-.241-.152-.143-.196-.366-.231-.572-.065-.378-.125-.756-.192-1.133-.057-.325-.102-.69-.25-.987-.195-.4-.597-.634-.996-.788a5.723 5.723 0 00-.626-.194c-1-.263-2.05-.36-3.077-.416a25.834 25.834 0 00-3.7.062c-.915.083-1.88.184-2.75.5-.318.116-.646.256-.888.501-.297.302-.393.77-.177 1.146.154.267.415.456.692.58.36.162.737.284 1.123.366 1.075.238 2.189.331 3.287.37 1.218.05 2.437.01 3.65-.118.299-.033.598-.073.896-.119.352-.054.578-.513.474-.834-.124-.383-.457-.531-.834-.473-.466.074-.96.108-1.382.146-1.177.08-2.358.082-3.536.006a22.228 22.228 0 01-1.157-.107c-.086-.01-.18-.025-.258-.036-.243-.036-.484-.08-.724-.13-.111-.027-.111-.185 0-.212h.005c.277-.06.557-.108.838-.147h.002c.131-.009.263-.032.394-.048a25.076 25.076 0 013.426-.12c.674.019 1.347.067 2.017.144l.228.031c.267.04.533.088.798.145.392.085.895.113 1.07.542.055.137.08.288.111.431l.319 1.484a.237.237 0 01-.199.284h-.003c-.037.006-.075.01-.112.015a36.704 36.704 0 01-4.743.295 37.059 37.059 0 01-4.699-.304c-.14-.017-.293-.042-.417-.06-.326-.048-.649-.108-.973-.161-.393-.065-.768-.032-1.123.161-.29.16-.527.404-.675.701-.154.316-.199.66-.267 1-.069.34-.176.707-.135 1.056.087.753.613 1.365 1.37 1.502a39.69 39.69 0 0011.343.376.483.483 0 01.535.53l-.071.697-1.018 9.907c-.041.41-.047.832-.125 1.237-.122.637-.553 1.028-1.182 1.171-.577.131-1.165.185-1.756.205-.656.023-1.314-.002-1.968-.063-.694-.074-1.407-.133-2.017-.543-.635-.426-.834-1.024-.898-1.741l-.102-1.18-.105-1.207-.088-1.052-.072-.828-.06-.69c-.017-.198-.03-.396-.063-.592-.08-.472-.328-.778-.79-.799-.396-.017-.729.283-.761.737-.02.295.016.59.043.884l.102 1.18.105 1.207.088 1.052.072.828.06.69c.024.282.04.565.085.843.14.852.52 1.544 1.26 1.989.622.373 1.32.497 2.03.578.774.088 1.554.1 2.333.055.72-.04 1.431-.119 2.108-.354.792-.274 1.347-.758 1.543-1.602.085-.367.115-.744.153-1.117l1.043-10.146.072-.705a.506.506 0 01.549-.468c.474.034.948.046 1.422.046a39.77 39.77 0 003.464-.184.504.504 0 01.556.403l.124.61z"/>
              </svg>
              Buy Me a Coffee
            </a>
          </div>
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
