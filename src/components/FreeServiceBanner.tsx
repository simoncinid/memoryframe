import Link from "next/link";

interface FreeServiceBannerProps {
  variant?: "inline" | "hero";
}

export function FreeServiceBanner({ variant = "inline" }: FreeServiceBannerProps) {
  if (variant === "hero") {
    return (
      <div className="bg-gradient-to-r from-[#FFF5EB] via-[#FFE8D1] to-[#FFDFB9] border border-[#FFDFB9]/50 rounded-2xl p-6 mb-8">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-br from-[#A4193D] to-[#C51D4D] rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="font-semibold text-[#A4193D] mb-1">100% Free — Supported by Tips</h3>
            <p className="text-sm text-[#A4193D]">
              This tool is completely free to use. Running AI costs real money, but generous tips from users like you keep it free for everyone. No signup, no hidden fees — just create your portrait and enjoy!
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
            <Link
              href="/create"
              className="px-6 py-3 bg-[#A4193D] text-white rounded-xl font-medium hover:bg-[#7D132E] transition-all text-center"
            >
              Start Creating →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FFF5EB] border border-[#FFDFB9] rounded-xl p-4 mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex items-start gap-3 flex-1">
          <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-[#A4193D]">This tool is 100% free</p>
            <p className="text-sm text-[#A4193D]">
              Generous tips from users help us cover the AI costs and keep MemoryFrame free for families everywhere.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
