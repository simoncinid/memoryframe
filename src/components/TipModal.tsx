"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { copy } from "@/content/copy";
import { trackEvent } from "@/lib/analytics";

interface TipModalProps {
  isOpen: boolean;
  onClose: () => void;
  checkoutUrl?: string;
}

export function TipModal({ isOpen, onClose, checkoutUrl }: TipModalProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [showThankYou, setShowThankYou] = useState(false);

  const finalCheckoutUrl =
    checkoutUrl || process.env.NEXT_PUBLIC_TIP_CHECKOUT_URL || "#";

  useEffect(() => {
    if (isOpen) {
      trackEvent("tip_modal_open");
      // Reset state when opening
      setSelectedAmount(null);
      setCustomAmount("");
      setShowThankYou(false);
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

  const handleCheckout = useCallback(() => {
    const amount = selectedAmount || parseFloat(customAmount) || 0;
    if (amount <= 0) return;

    trackEvent("tip_checkout_click", { amount });

    // Open checkout in new tab
    const url = `${finalCheckoutUrl}?amount=${amount}`;
    window.open(url, "_blank", "noopener,noreferrer");

    // Show thank you
    setShowThankYou(true);
  }, [selectedAmount, customAmount, finalCheckoutUrl]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tip-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 transition-colors focus:outline-none focus:ring-2 focus:ring-stone-500 rounded-lg p-1"
          aria-label="Close modal"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {showThankYou ? (
          /* Thank You State */
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2
              id="tip-modal-title"
              className="text-xl font-semibold text-stone-800 mb-2"
            >
              {copy.tipModal.thankYou.title}
            </h2>
            <p className="text-stone-600 mb-6">
              {copy.tipModal.thankYou.message}
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-stone-800 text-white rounded-lg font-medium hover:bg-stone-700 transition-colors focus:outline-none focus:ring-2 focus:ring-stone-500"
            >
              {copy.tipModal.thankYou.closeButton}
            </button>
          </div>
        ) : (
          /* Tip Selection State */
          <>
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-stone-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <h2
                id="tip-modal-title"
                className="text-xl font-semibold text-stone-800 mb-2"
              >
                {copy.tipModal.title}
              </h2>
              <p className="text-stone-600">{copy.tipModal.subtitle}</p>
            </div>

            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-4 gap-3 mb-4">
              {copy.tipModal.amounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => {
                    setSelectedAmount(amount);
                    setCustomAmount("");
                  }}
                  className={cn(
                    "py-3 rounded-xl font-medium transition-all focus:outline-none focus:ring-2 focus:ring-stone-500",
                    selectedAmount === amount
                      ? "bg-stone-800 text-white"
                      : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                  )}
                >
                  ${amount}
                </button>
              ))}
            </div>

            {/* Custom Amount Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-stone-700 mb-2">
                {copy.tipModal.otherLabel}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500">
                  $
                </span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setSelectedAmount(null);
                  }}
                  placeholder="Enter amount"
                  className="w-full pl-8 pr-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={!selectedAmount && !customAmount}
              className={cn(
                "w-full py-3 rounded-xl font-medium transition-all focus:outline-none focus:ring-2 focus:ring-stone-500",
                selectedAmount || customAmount
                  ? "bg-stone-800 text-white hover:bg-stone-700"
                  : "bg-stone-200 text-stone-400 cursor-not-allowed"
              )}
            >
              {copy.tipModal.checkoutButton}
            </button>

            {/* Skip Note */}
            <p className="text-center text-sm text-stone-500 mt-4">
              No pressure — this tool is free to use.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

