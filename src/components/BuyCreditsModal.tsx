"use client";

import { useState, useEffect } from "react";
import { createCheckout, getPricing } from "@/lib/credits";
import { useToast } from "@/components/Toast";

interface BuyCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BuyCreditsModal({ isOpen, onClose }: BuyCreditsModalProps) {
  const { showToast } = useToast();
  const [credits, setCredits] = useState(50);
  const [pricing, setPricing] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadPricing();
    }
  }, [isOpen]);

  const loadPricing = async () => {
    try {
      const pricingData = await getPricing();
      setPricing(pricingData);
    } catch (error) {
      showToast('Error loading pricing', 'error');
    }
  };

  const handlePurchase = async () => {
    if (!credits || credits < 1) {
      showToast('Inserisci un numero valido di crediti', 'error');
      return;
    }

    setProcessing(true);
    try {
      const checkout = await createCheckout(credits);
      window.location.href = checkout.url;
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Error creating checkout', 'error');
      setProcessing(false);
    }
  };

  if (!isOpen) return null;

  const pricePerCredit = pricing?.pricePerCredit || 0.19;
  const totalPrice = (credits * pricePerCredit).toFixed(2);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="buy-credits-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-[#A4193D] to-[#C51D4D] px-6 py-5">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-white/70 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 rounded-full p-1.5 hover:bg-white/10"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <h2 id="buy-credits-modal-title" className="text-xl font-bold text-white">
            Acquista Crediti
          </h2>
        </div>

        {/* Content */}
        <div className="px-6 py-6 bg-white">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A4193D]"></div>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <label className="block text-sm font-medium text-[#A4193D] mb-2">
                  Numero di crediti
                </label>
                <input
                  type="number"
                  min="1"
                  value={credits}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 1;
                    setCredits(Math.max(1, value));
                  }}
                  className="w-full px-4 py-3 border border-[#FFDFB9] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C51D4D] focus:border-transparent text-lg"
                  placeholder="50"
                />
                <p className="mt-2 text-sm text-[#7D132E]">
                  Prezzo per credito: <span className="font-bold">${pricePerCredit.toFixed(2)}</span>
                </p>
              </div>

              <div className="bg-[#FFF5EB] border-2 border-[#FFDFB9] rounded-xl p-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-[#A4193D] font-medium">Totale:</span>
                  <span className="text-2xl font-bold text-[#A4193D]">${totalPrice}</span>
                </div>
              </div>

              <button
                onClick={handlePurchase}
                disabled={processing || credits < 1}
                className="w-full py-4 bg-gradient-to-r from-[#A4193D] to-[#C51D4D] text-white rounded-xl font-bold text-lg hover:from-[#7D132E] hover:to-[#A4193D] transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? 'Elaborazione...' : 'Procedi al Pagamento'}
              </button>

              <p className="mt-4 text-xs text-center text-[#7D132E]">
                I crediti verranno accreditati immediatamente dopo il pagamento
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
