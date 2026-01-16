"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  items: readonly FAQItem[];
  title?: string;
}

export function FAQ({ items, title }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div>
      {title && (
        <h2 className="text-2xl font-semibold text-[#A4193D] mb-6">{title}</h2>
      )}
      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={index}
            className="border border-[#FFDFB9] rounded-xl overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full flex items-center justify-between p-4 text-left bg-white hover:bg-[#FFF5EB] transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#C51D4D]"
              aria-expanded={openIndex === index}
            >
              <span className="font-medium text-[#A4193D] pr-4">
                {item.question}
              </span>
              <svg
                className={cn(
                  "w-5 h-5 text-[#7D132E] shrink-0 transition-transform duration-200",
                  openIndex === index && "rotate-180"
                )}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            <div
              className={cn(
                "overflow-hidden transition-all duration-200",
                openIndex === index ? "max-h-96" : "max-h-0"
              )}
            >
              <div className="p-4 pt-0 text-[#A4193D]">{item.answer}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// JSON-LD for FAQ structured data
export function FAQJsonLd({ items }: { items: readonly FAQItem[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

