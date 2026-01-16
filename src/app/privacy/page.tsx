import { Metadata } from "next";
import { copy } from "@/content/copy";

export const metadata: Metadata = {
  title: `Privacy Policy | ${copy.brand.name}`,
  description: "Learn how MemoryFrame handles your photos and data. Your privacy matters to us.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
  const { privacy } = copy.legal;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#A4193D] mb-2">
          {privacy.title}
        </h1>
        <p className="text-[#7D132E]">Last updated: {privacy.lastUpdated}</p>
      </div>

      <div className="prose prose-stone max-w-none">
        {privacy.sections.map((section, index) => (
          <section key={index} className="mb-8">
            <h2 className="text-xl font-semibold text-[#A4193D] mb-3">
              {section.title}
            </h2>
            <p className="text-[#A4193D] leading-relaxed">{section.content}</p>
          </section>
        ))}
      </div>

      <div className="mt-12 p-6 bg-[#FFF5EB] rounded-xl border border-[#FFDFB9]">
        <h3 className="font-semibold text-[#A4193D] mb-2">Questions?</h3>
        <p className="text-[#A4193D]">
          Contact us at{" "}
          <a
            href={`mailto:${copy.legal.contact.privacyEmail}`}
            className="text-[#A4193D] underline underline-offset-4"
          >
            {copy.legal.contact.privacyEmail}
          </a>
        </p>
      </div>
    </div>
  );
}

