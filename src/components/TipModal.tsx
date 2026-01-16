"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

interface TipModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TipModal({ isOpen, onClose }: TipModalProps) {
  const buyMeACoffeeUrl = "https://buymeacoffee.com/diegosimoncini";
  const generationCost = "1.49";
  const tippedToday = 18;

  useEffect(() => {
    if (isOpen) {
      trackEvent("tip_modal_open");
      return;
    }
  }, [isOpen]);

  // Handle keyboard escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleBuyMeACoffee = () => {
    trackEvent("tip_checkout_click", { suggestedCost: generationCost });
    window.open(buyMeACoffeeUrl, "_blank", "noopener,noreferrer");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tip-modal-title"
    >
      {/* Backdrop con effetto blur */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal con sfondo bianco pulito */}
      <div 
        className={`
          relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden
          transform transition-all duration-500 ease-out
          scale-100 opacity-100
        `}
      >
        {/* Header semplice con gradiente sottile */}
        <div className="relative bg-gradient-to-r from-stone-800 to-stone-700 px-6 py-5">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-white/70 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 rounded-full p-1.5 hover:bg-white/10"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div>
            <h2 id="tip-modal-title" className="text-xl font-bold text-white">
              Your portrait is ready!
            </h2>
            <p className="text-white/70 text-sm">Made with AI magic</p>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 bg-white">
          {/* Costo Box con effetto attention */}
          <div className={`
            relative bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 mb-5
          `}>
            <div className="absolute -top-3 left-4 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
              GENERATION COST
            </div>
            
            <div className="text-center pt-2">
              <p className="text-[#A4193D] text-sm mb-1">This image cost us approximately</p>
              <div className="flex items-center justify-center gap-1">
                <span className="text-4xl font-black bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  ${generationCost}
                </span>
              </div>
              <p className="text-[#7D132E] text-xs mt-1">in API & server costs</p>
            </div>
          </div>

          {/* Empathetic message */}
          <div className="text-center mb-6">
            <p className="text-[#A4193D] text-sm leading-relaxed">
              <span className="font-semibold text-[#7D132E]">MemoryFrame is 100% free</span> — we don&apos;t run ads, and we never will.
              <br />
              <span className="text-amber-600 font-medium">Your tips are the only way</span> we can keep this tool alive and free for everyone.
            </p>
          </div>

          {/* Stats di supporto sociale */}
          <div className="flex items-center justify-center gap-4 mb-6 text-xs text-[#7D132E]">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-ping-slow" />
              <span>{tippedToday} people tipped today</span>
            </div>
          </div>

          {/* Buy Me a Coffee Button con effetto glow */}
          <button
            onClick={handleBuyMeACoffee}
            className={`
              relative w-full py-4 bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 
              text-[#7D132E] rounded-2xl font-bold text-lg
              hover:from-yellow-500 hover:via-yellow-600 hover:to-amber-600 
              shadow-lg hover:shadow-xl transition-all duration-300 
              focus:outline-none focus:ring-4 focus:ring-yellow-300
              transform hover:scale-[1.02] active:scale-[0.98]
            `}
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.216 6.415l-.132-.666c-.119-.598-.388-1.163-1.001-1.379-.197-.069-.42-.098-.57-.241-.152-.143-.196-.366-.231-.572-.065-.378-.125-.756-.192-1.133-.057-.325-.102-.69-.25-.987-.195-.4-.597-.634-.996-.788a5.723 5.723 0 00-.626-.194c-1-.263-2.05-.36-3.077-.416a25.834 25.834 0 00-3.7.062c-.915.083-1.88.184-2.75.5-.318.116-.646.256-.888.501-.297.302-.393.77-.177 1.146.154.267.415.456.692.58.36.162.737.284 1.123.366 1.075.238 2.189.331 3.287.37 1.218.05 2.437.01 3.65-.118.299-.033.598-.073.896-.119.352-.054.578-.513.474-.834-.124-.383-.457-.531-.834-.473-.466.074-.96.108-1.382.146-1.177.08-2.358.082-3.536.006a22.228 22.228 0 01-1.157-.107c-.086-.01-.18-.025-.258-.036-.243-.036-.484-.08-.724-.13-.111-.027-.111-.185 0-.212h.005c.277-.06.557-.108.838-.147h.002c.131-.009.263-.032.394-.048a25.076 25.076 0 013.426-.12c.674.019 1.347.067 2.017.144l.228.031c.267.04.533.088.798.145.392.085.895.113 1.07.542.055.137.08.288.111.431l.319 1.484a.237.237 0 01-.199.284h-.003c-.037.006-.075.01-.112.015a36.704 36.704 0 01-4.743.295 37.059 37.059 0 01-4.699-.304c-.14-.017-.293-.042-.417-.06-.326-.048-.649-.108-.973-.161-.393-.065-.768-.032-1.123.161-.29.16-.527.404-.675.701-.154.316-.199.66-.267 1-.069.34-.176.707-.135 1.056.087.753.613 1.365 1.37 1.502a39.69 39.69 0 0011.343.376.483.483 0 01.535.53l-.071.697-1.018 9.907c-.041.41-.047.832-.125 1.237-.122.637-.553 1.028-1.182 1.171-.577.131-1.165.2-1.756.205-.656.004-1.31-.025-1.966-.022-.699.004-1.556-.06-2.095-.58-.475-.458-.54-1.174-.605-1.793l-.731-7.013-.322-3.094c-.037-.351-.286-.695-.678-.678-.336.015-.718.3-.678.679l.228 2.185.949 9.112c.147 1.344 1.174 2.068 2.446 2.272.742.12 1.503.144 2.257.156.966.016 1.942.053 2.892-.122 1.408-.258 2.465-1.198 2.616-2.657.34-3.332.683-6.663 1.024-9.995l.215-2.087a.484.484 0 01.39-.426c.402-.078.787-.212 1.074-.518.455-.488.546-1.124.385-1.766zm-1.478.772c-.145.137-.363.201-.578.233-2.416.359-4.866.54-7.308.46-1.748-.06-3.477-.254-5.207-.498-.17-.024-.353-.055-.47-.18-.22-.236-.111-.71-.054-.995.052-.26.152-.609.463-.646.484-.057 1.046.148 1.526.22.577.088 1.156.159 1.737.212 2.48.226 5.002.19 7.472-.14.45-.06.899-.13 1.345-.21.399-.072.84-.206 1.08.206.166.281.188.657.162.974a.544.544 0 01-.169.364z"/>
              </svg>
              Buy Me a Coffee
            </span>
          </button>

          {/* Skip Note */}
          <button
            onClick={onClose}
            className="w-full text-center text-xs text-[#7D132E] hover:text-[#7D132E] transition-colors py-3 mt-2"
          >
            Maybe later, thanks
          </button>
        </div>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes pulse-subtle {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4); }
          50% { transform: scale(1.01); box-shadow: 0 0 0 8px rgba(245, 158, 11, 0); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(234, 179, 8, 0.5), 0 10px 40px -10px rgba(234, 179, 8, 0.5); }
          50% { box-shadow: 0 0 40px rgba(234, 179, 8, 0.7), 0 10px 60px -10px rgba(234, 179, 8, 0.7); }
        }
        @keyframes ping-slow {
          0% { transform: scale(1); opacity: 1; }
          75%, 100% { transform: scale(2); opacity: 0; }
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 2s ease-in-out infinite;
        }
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
        .animate-ping-slow {
          animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
}
