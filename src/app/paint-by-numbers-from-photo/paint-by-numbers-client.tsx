"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { UploadDropzone } from "@/components/UploadDropzone";
import { TipModal } from "@/components/TipModal";
import { useToast } from "@/components/Toast";
import { fileToBase64 } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";

const generatingMessages = [
  "Analyzing your photo...",
  "Simplifying shapes...",
  "Drawing clean outlines...",
  "Adding numbered regions...",
  "Finishing the template...",
];

export default function PaintByNumbersClient() {
  const { showToast } = useToast();

  const [uploadedPhoto, setUploadedPhoto] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingMessage, setGeneratingMessage] = useState("");
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [coloredImage, setColoredImage] = useState<string | null>(null);
  const [sliderPosition, setSliderPosition] = useState(50);

  const [showTipModal, setShowTipModal] = useState(false);
  const [hasShownTipModal, setHasShownTipModal] = useState(false);
  
  const sliderContainerRef = useRef<HTMLDivElement>(null);

  // Show tip modal shortly after result appears
  useEffect(() => {
    if (resultImage && !hasShownTipModal) {
      const timer = setTimeout(() => {
        setShowTipModal(true);
        setHasShownTipModal(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [resultImage, hasShownTipModal]);

  const handleGenerate = useCallback(async () => {
    if (!uploadedPhoto) {
      showToast("Please upload a photo first", "error");
      return;
    }

    setIsGenerating(true);
    trackEvent("paint_by_numbers_generate_started");

    // Cycle through generating messages
    let messageIndex = 0;
    setGeneratingMessage(generatingMessages[0]);
    const messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % generatingMessages.length;
      setGeneratingMessage(generatingMessages[messageIndex]);
    }, 1500);

    try {
      const photoBase64 = await fileToBase64(uploadedPhoto);

      const response = await fetch("/api/paint-by-numbers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photo: photoBase64 }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Generation failed");
      }

      setResultImage(data.resultImageUrl);
      setColoredImage(data.coloredImageUrl || null);
      trackEvent("paint_by_numbers_generate_success");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Generation failed";
      showToast(message, "error");
      trackEvent("paint_by_numbers_generate_error", { error: message });
    } finally {
      clearInterval(messageInterval);
      setIsGenerating(false);
    }
  }, [uploadedPhoto, showToast]);

  const handleDownload = useCallback(() => {
    if (!resultImage) return;

    trackEvent("paint_by_numbers_download_click");

    if (!hasShownTipModal) {
      setShowTipModal(true);
      setHasShownTipModal(true);
    }

    const link = document.createElement("a");
    link.href = resultImage;
    link.download = `paint-by-numbers-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [resultImage, hasShownTipModal]);

  const handleReset = useCallback(() => {
    setUploadedPhoto(null);
    setResultImage(null);
    setColoredImage(null);
    setSliderPosition(50);
    setIsGenerating(false);
    setGeneratingMessage("");
    setHasShownTipModal(false);
  }, []);

  // Handle slider drag
  const handleSliderMove = useCallback((clientX: number) => {
    if (!sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (e.buttons !== 1) return; // Only when mouse button is pressed
    handleSliderMove(e.clientX);
  }, [handleSliderMove]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    handleSliderMove(e.touches[0].clientX);
  }, [handleSliderMove]);

  // Result View
  if (resultImage) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-stone-800 mb-2">
            Your Paint-by-Numbers Template is Ready
          </h1>
          <p className="text-stone-600">
            Download and print it — then paint it with your favorite colors.
          </p>
        </div>

        {/* Comparison Slider */}
        {coloredImage ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-4 mb-4 shadow-sm">
            <div 
              ref={sliderContainerRef}
              className="relative max-w-3xl mx-auto rounded-xl overflow-hidden bg-white cursor-ew-resize select-none"
              onMouseMove={handleMouseMove}
              onMouseDown={(e) => handleSliderMove(e.clientX)}
              onTouchMove={handleTouchMove}
              onTouchStart={(e) => handleSliderMove(e.touches[0].clientX)}
            >
              {/* Template Image (base layer, determines size) */}
              <img
                src={resultImage}
                alt="Paint by numbers template"
                className="w-full h-auto block pointer-events-none"
                draggable={false}
              />
              
              {/* Colored Image (overlay, clipped from right) */}
              <div 
                className="absolute inset-0 overflow-hidden"
                style={{ 
                  clipPath: `inset(0 0 0 ${sliderPosition}%)`,
                }}
              >
                <img
                  src={coloredImage}
                  alt="Colored preview of paint by numbers"
                  className="w-full h-full object-cover pointer-events-none"
                  draggable={false}
                />
              </div>
              
              {/* Slider Line */}
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-stone-800 shadow-lg pointer-events-none"
                style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
              >
                {/* Slider Handle */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full border-2 border-stone-800 shadow-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-stone-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <svg className="w-5 h-5 text-stone-800 -ml-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>

              {/* Labels */}
              <div className="absolute top-3 left-3 bg-white/90 px-3 py-1 rounded-full text-sm font-medium text-stone-700 shadow pointer-events-none">
                Template
              </div>
              <div className="absolute top-3 right-3 bg-white/90 px-3 py-1 rounded-full text-sm font-medium text-stone-700 shadow pointer-events-none">
                Colored
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-stone-200 p-4 mb-4 shadow-sm">
            <div className="relative max-w-3xl mx-auto rounded-xl overflow-hidden bg-white">
              <img
                src={resultImage}
                alt="Paint by numbers template generated from photo"
                className="w-full h-auto block"
              />
            </div>
          </div>
        )}

        {/* Slider instruction */}
        {coloredImage && (
          <p className="text-center text-stone-500 text-sm mb-6">
            ← Drag the slider to compare template vs colored preview →
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button
            onClick={handleDownload}
            className="px-8 py-3 bg-stone-800 text-white rounded-xl font-medium hover:bg-stone-700 transition-colors focus:outline-none focus:ring-2 focus:ring-stone-500"
          >
            Download Template (PNG)
          </button>
        </div>

        <div className="text-center">
          <button
            onClick={handleReset}
            className="text-stone-600 hover:text-stone-800 underline underline-offset-4"
          >
            Create another template
          </button>
        </div>

        <TipModal isOpen={showTipModal} onClose={() => setShowTipModal(false)} />
      </div>
    );
  }

  // Generating View
  if (isGenerating) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center justify-center min-h-[420px]">
          <div className="w-16 h-16 border-4 border-stone-200 border-t-stone-800 rounded-full animate-spin mb-6" />
          <h2 className="text-xl font-semibold text-stone-800 mb-2">
            Creating your paint-by-number...
          </h2>
          <p className="text-stone-600 animate-pulse-soft">{generatingMessage}</p>
        </div>
      </div>
    );
  }

  // Main Form View (SEO + Tool)
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-stone-800 mb-4">
          Paint by Numbers from Photo — Free AI Generator
        </h1>
        <p className="text-lg text-stone-600 max-w-2xl mx-auto mb-4">
          Upload a photo and instantly turn it into a clean, printable
          paint-by-numbers outline in black & white.
        </p>
        <div className="flex flex-wrap justify-center gap-2 text-sm">
          <span className="bg-stone-100 text-stone-700 px-3 py-1 rounded-full font-medium">
            Printable Template
          </span>
          <span className="bg-stone-100 text-stone-700 px-3 py-1 rounded-full font-medium">
            Black & White Outline
          </span>
          <span className="bg-stone-100 text-stone-700 px-3 py-1 rounded-full font-medium">
            Free Download
          </span>
        </div>
      </div>

      {/* Upload */}
      <div className="mb-10">
        <div className="bg-white rounded-2xl border-2 border-stone-200 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-stone-800 mb-2 text-center">
            Step 1: Upload your photo
          </h2>
          <p className="text-stone-500 text-sm mb-4 text-center">
            For best results, use a clear photo with one main subject.
          </p>
          <div className="max-w-md mx-auto">
            <UploadDropzone
              onFileSelect={setUploadedPhoto}
              value={uploadedPhoto}
              onClear={() => setUploadedPhoto(null)}
              label="Upload your photo"
              guidelines={[
                "One main subject",
                "Good lighting",
                "Sharp focus",
                "Simple background helps",
              ]}
            />
          </div>
        </div>
      </div>

      {/* Generate */}
      <div className="mb-12 flex justify-center">
        <button
          onClick={handleGenerate}
          disabled={!uploadedPhoto}
          className="w-full max-w-md py-4 bg-stone-800 text-white rounded-xl font-bold text-lg hover:bg-stone-700 transition-colors focus:outline-none focus:ring-2 focus:ring-stone-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Generate Paint-by-Numbers
        </button>
      </div>

      {/* SEO Content */}
      <div className="bg-stone-50 rounded-2xl p-8 mb-12 border border-stone-200">
        <h2 className="text-2xl font-bold text-stone-800 mb-4 text-center">
          What is a paint-by-numbers template?
        </h2>
        <div className="prose prose-stone max-w-none">
          <p className="text-stone-600">
            A <strong>paint by numbers</strong> template is a simplified drawing
            of your photo with clean outlines and numbered regions. You paint
            each region with a matching color to recreate the original image —
            it&apos;s relaxing, beginner-friendly, and perfect for gifts.
          </p>
          <h3 className="text-lg font-semibold text-stone-800 mt-6 mb-2">
            Great for
          </h3>
          <ul className="text-stone-600">
            <li>Pets (dogs, cats)</li>
            <li>Couples and family photos</li>
            <li>Memorial / tribute artwork</li>
            <li>Wedding photos</li>
            <li>Kids drawings turned into a paintable outline</li>
          </ul>
        </div>
      </div>

      {/* FAQ (simple, SEO-friendly) */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-stone-800 mb-6 text-center">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4 max-w-3xl mx-auto">
          <details className="bg-white rounded-xl border border-stone-200 p-4 group">
            <summary className="font-semibold text-stone-800 cursor-pointer list-none flex justify-between items-center">
              Is it free to download?
              <span className="transform group-open:rotate-180 transition-transform">
                ▼
              </span>
            </summary>
            <p className="text-stone-600 mt-3">
              Yes — downloads are free. If you like the result, you can leave an
              optional tip to help cover AI costs.
            </p>
          </details>

          <details className="bg-white rounded-xl border border-stone-200 p-4 group">
            <summary className="font-semibold text-stone-800 cursor-pointer list-none flex justify-between items-center">
              What photo works best?
              <span className="transform group-open:rotate-180 transition-transform">
                ▼
              </span>
            </summary>
            <p className="text-stone-600 mt-3">
              Use a sharp photo with good lighting and one main subject. Busy
              backgrounds can make the outline less clean.
            </p>
          </details>

          <details className="bg-white rounded-xl border border-stone-200 p-4 group">
            <summary className="font-semibold text-stone-800 cursor-pointer list-none flex justify-between items-center">
              Do you store my photo?
              <span className="transform group-open:rotate-180 transition-transform">
                ▼
              </span>
            </summary>
            <p className="text-stone-600 mt-3">
              No. We don&apos;t store user photos. Processing happens via real-time
              API calls.
            </p>
          </details>
        </div>
      </div>

      {/* Keyword footer */}
      <div className="text-center text-sm text-stone-400 border-t border-stone-200 pt-8">
        <p>
          Popular searches: paint by numbers from photo, custom paint by numbers,
          photo to paint by numbers, paint by number template, printable
          paint-by-number, paint by numbers outline, ai paint by numbers
        </p>
      </div>

      <TipModal isOpen={showTipModal} onClose={() => setShowTipModal(false)} />
    </div>
  );
}


