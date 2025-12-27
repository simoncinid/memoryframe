"use client";

import { useState, useEffect } from "react";
import { copy } from "@/content/copy";
import { trackEvent } from "@/lib/analytics";

interface TipModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TipModal({ isOpen, onClose }: TipModalProps) {
  const buyMeACoffeeUrl = "https://buymeacoffee.com/diegosimoncini";

  useEffect(() => {
    if (isOpen) {
      trackEvent("tip_modal_open");
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
    trackEvent("tip_checkout_click");
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

        <div className="text-center py-6">
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
          <p className="text-stone-600 mb-6">{copy.tipModal.subtitle}</p>

          {/* Buy Me a Coffee Button */}
          <button
            onClick={handleBuyMeACoffee}
            className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-medium hover:from-pink-600 hover:to-purple-600 shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-pink-500 mb-4"
          >
            Supporta su Buy Me a Coffee
          </button>

          {/* Skip Note */}
          <button
            onClick={onClose}
            className="w-full text-center text-sm text-stone-500 hover:text-stone-700 transition-colors py-2"
          >
            {copy.tipModal.skipText}
          </button>
        </div>
      </div>
    </div>
  );
}

