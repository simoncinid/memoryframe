"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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

  // Generate random cost between $1.00 and $1.99
  const generationCost = useMemo(() => {
    return (1 + Math.random() * 0.99).toFixed(2);
  }, []);

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
              <div className="w-14 h-14 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-7 h-7 text-pink-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </div>
              <h2
                id="tip-modal-title"
                className="text-xl font-semibold text-stone-800 mb-2"
              >
                {copy.tipModal.title}
              </h2>
              <p className="text-stone-600 mb-4">{copy.tipModal.subtitle}</p>
              
              {/* Generation Cost Display */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-full mb-4">
                <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-amber-800">
                  {copy.tipModal.costMessage} <span className="font-bold">${generationCost}</span>
                </span>
              </div>
              
              <p className="text-sm text-stone-500 leading-relaxed">
                {copy.tipModal.empatheticMessage}
              </p>
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
                    "py-3 rounded-xl font-medium transition-all focus:outline-none focus:ring-2 focus:ring-pink-500",
                    selectedAmount === amount
                      ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg"
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
                  className="w-full pl-8 pr-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={!selectedAmount && !customAmount}
              className={cn(
                "w-full py-3 rounded-xl font-medium transition-all focus:outline-none focus:ring-2 focus:ring-pink-500",
                selectedAmount || customAmount
                  ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600 shadow-lg"
                  : "bg-stone-200 text-stone-400 cursor-not-allowed"
              )}
            >
              {copy.tipModal.checkoutButton}
            </button>

            {/* Skip Note */}
            <button
              onClick={onClose}
              className="w-full text-center text-sm text-stone-500 mt-4 hover:text-stone-700 transition-colors py-2"
            >
              {copy.tipModal.skipText}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

