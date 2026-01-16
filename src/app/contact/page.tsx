import { Metadata } from "next";
import { copy } from "@/content/copy";

export const metadata: Metadata = {
  title: `Contact Us | ${copy.brand.name}`,
  description: "Get in touch with the MemoryFrame team. We're here to help.",
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  const { contact } = copy.legal;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#A4193D] mb-4">
          {contact.title}
        </h1>
        <p className="text-lg text-[#A4193D]">{contact.intro}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <div className="p-6 bg-[#FFF5EB] rounded-xl border border-[#FFDFB9]">
          <h2 className="font-semibold text-[#A4193D] mb-2">General Inquiries</h2>
          <a
            href={`mailto:${contact.email}`}
            className="text-[#A4193D] hover:text-[#A4193D] underline underline-offset-4"
          >
            {contact.email}
          </a>
        </div>

        <div className="p-6 bg-[#FFF5EB] rounded-xl border border-[#FFDFB9]">
          <h2 className="font-semibold text-[#A4193D] mb-2">Privacy Concerns</h2>
          <a
            href={`mailto:${contact.privacyEmail}`}
            className="text-[#A4193D] hover:text-[#A4193D] underline underline-offset-4"
          >
            {contact.privacyEmail}
          </a>
        </div>
      </div>

      <div className="p-6 bg-white rounded-xl border border-[#FFDFB9]">
        <h2 className="font-semibold text-[#A4193D] mb-4">Response Time</h2>
        <p className="text-[#A4193D]">{contact.responseTime}</p>
      </div>

      <div className="mt-12 text-center">
        <p className="text-[#A4193D] mb-4">Looking to create a portrait?</p>
        <a
          href="/create"
          className="inline-block px-6 py-3 bg-[#A4193D] text-white rounded-xl font-medium hover:bg-[#7D132E] transition-colors"
        >
          Go to Creator
        </a>
      </div>
    </div>
  );
}

