"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";

export const dynamic = 'force-dynamic';
import Image from "next/image";
import { Stepper } from "@/components/Stepper";
import { UploadDropzone } from "@/components/UploadDropzone";
import { StyleCard } from "@/components/StyleCard";
import { PromptChips } from "@/components/PromptChips";
import { useToast } from "@/components/Toast";
import { copy } from "@/content/copy";
import { fileToBase64 } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";

const steps = [
  { id: "personA", title: copy.create.steps.personA.title },
  { id: "personB", title: copy.create.steps.personB.title },
  { id: "style", title: copy.create.steps.style.title },
  { id: "prompt", title: copy.create.steps.prompt.title },
];

// Get suggested prompts from the first 4 categories
const suggestedPrompts = copy.prompts.categories
  .slice(0, 4)
  .flatMap((cat) => cat.prompts.slice(0, 1));

function CreatePageContent() {
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const [currentStep, setCurrentStep] = useState(0);
  const [personA, setPersonA] = useState<File | null>(null);
  const [personB, setPersonB] = useState<File | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingMessage, setGeneratingMessage] = useState("");
  const [resultImage, setResultImage] = useState<string | null>(null);


  // Handle style from URL
  useEffect(() => {
    const styleParam = searchParams.get("style");
    if (styleParam && copy.styles.find((s) => s.id === styleParam)) {
      setSelectedStyle(styleParam);
      // Jump to style step if style is pre-selected
      if (personA && personB) {
        setCurrentStep(2);
      }
    }
  }, [searchParams, personA, personB]);

  // Auto-advance steps
  useEffect(() => {
    if (personA && currentStep === 0) setCurrentStep(1);
  }, [personA, currentStep]);

  useEffect(() => {
    if (personB && currentStep === 1) setCurrentStep(2);
  }, [personB, currentStep]);

  useEffect(() => {
    if (selectedStyle && currentStep === 2) setCurrentStep(3);
  }, [selectedStyle, currentStep]);


  const handleGenerate = useCallback(async () => {
    if (!personA || !personB || !selectedStyle || !prompt) {
      showToast("Please complete all steps before generating", "error");
      return;
    }

    setIsGenerating(true);
    trackEvent("generate_started", { style: selectedStyle });

    // Cycle through generating messages
    const messages = copy.create.generating.messages;
    let messageIndex = 0;
    setGeneratingMessage(messages[0]);
    const messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % messages.length;
      setGeneratingMessage(messages[messageIndex]);
    }, 1500);

    try {
      const [personABase64, personBBase64] = await Promise.all([
        fileToBase64(personA),
        fileToBase64(personB),
      ]);

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personA: personABase64,
          personB: personBBase64,
          style: selectedStyle,
          prompt,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Generation failed");
      }

      setResultImage(data.resultImageUrl);
      trackEvent("generate_success", { style: selectedStyle });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Generation failed";
      showToast(message, "error");
      trackEvent("generate_error", { error: message });
    } finally {
      clearInterval(messageInterval);
      setIsGenerating(false);
    }
  }, [personA, personB, selectedStyle, prompt, showToast]);

  const handleDownload = useCallback(() => {
    if (!resultImage) return;

    trackEvent("download_click");

    // Download the image
    const link = document.createElement("a");
    link.href = resultImage;
    link.download = `memoryframe-portrait-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [resultImage]);

  const handleReset = useCallback(() => {
    setPersonA(null);
    setPersonB(null);
    setSelectedStyle(null);
    setPrompt("");
    setResultImage(null);
    setCurrentStep(0);
  }, []);

  // Result View
  if (resultImage) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#A4193D] mb-2">
            {copy.create.result.title}
          </h1>
        </div>

        <div className="bg-[#FFF5EB] rounded-2xl p-4 mb-8">
          <div className="relative aspect-square max-w-2xl mx-auto rounded-xl overflow-hidden bg-[#FFDFB9]">
            <Image
              src={resultImage}
              alt="Generated portrait"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button
            onClick={handleDownload}
            className="px-8 py-3 bg-[#A4193D] text-white rounded-xl font-medium hover:bg-[#7D132E] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C51D4D]"
          >
            {copy.create.result.downloadButton}
          </button>
        </div>

        <div className="text-center">
          <button
            onClick={handleReset}
            className="text-[#A4193D] hover:text-[#A4193D] underline underline-offset-4"
          >
            Create another portrait
          </button>
        </div>
      </div>
    );
  }

  // Generating View
  if (isGenerating) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-16 h-16 border-4 border-[#FFDFB9] border-t-[#A4193D] rounded-full animate-spin mb-6" />
          <h2 className="text-xl font-semibold text-[#A4193D] mb-2">
            {copy.create.generating.title}
          </h2>
          <p className="text-[#A4193D] animate-pulse-soft">{generatingMessage}</p>
        </div>
      </div>
    );
  }

  // Form View
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[#A4193D]">
          {copy.create.title}
        </h1>
      </div>

      {/* Stepper */}
      <div className="mb-12">
        <Stepper
          steps={steps}
          currentStep={currentStep}
          onStepClick={setCurrentStep}
        />
      </div>

      {/* Step Content */}
      <div className="mb-12">
        {/* Step 1: Person A */}
        {currentStep === 0 && (
          <div>
            <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
              {copy.create.uploadGuidelines.map((guideline, index) => (
                <span
                  key={index}
                  className="text-xs text-[#7D132E] bg-[#FFE8D1] px-2 py-1 rounded-full whitespace-nowrap"
                >
                  {guideline}
                </span>
              ))}
            </div>
            <div className="max-w-md mx-auto">
              <h2 className="text-lg font-semibold text-[#A4193D] mb-3 text-center">
                {copy.create.steps.personA.title} — <span className="font-normal text-[#7D132E]">{copy.create.steps.personA.description}</span>
              </h2>
              <UploadDropzone
                onFileSelect={setPersonA}
                value={personA}
                onClear={() => setPersonA(null)}
                label="Upload Person A photo"
                guidelines={[]}
              />
            </div>
          </div>
        )}

        {/* Step 2: Person B */}
        {currentStep === 1 && (
          <div>
            <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
              {copy.create.uploadGuidelines.map((guideline, index) => (
                <span
                  key={index}
                  className="text-xs text-[#7D132E] bg-[#FFE8D1] px-2 py-1 rounded-full whitespace-nowrap"
                >
                  {guideline}
                </span>
              ))}
            </div>
            <div className="max-w-md mx-auto">
              <h2 className="text-lg font-semibold text-[#A4193D] mb-3 text-center">
                {copy.create.steps.personB.title} — <span className="font-normal text-[#7D132E]">{copy.create.steps.personB.description}</span>
              </h2>
              <UploadDropzone
                onFileSelect={setPersonB}
                value={personB}
                onClear={() => setPersonB(null)}
                label="Upload Person B photo"
                guidelines={[]}
              />
            </div>
          </div>
        )}

        {/* Step 3: Style */}
        {currentStep === 2 && (
          <div>
            <h2 className="text-xl font-semibold text-[#A4193D] mb-2">
              {copy.create.steps.style.title}
            </h2>
            <p className="text-[#A4193D] mb-6">
              {copy.create.steps.style.description}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {copy.styles.map((style) => (
                <StyleCard
                  key={style.id}
                  id={style.id}
                  name={style.name}
                  description={style.description}
                  isSelected={selectedStyle === style.id}
                  onClick={() => {
                    setSelectedStyle(style.id);
                    trackEvent("style_selected", { style: style.id });
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Prompt */}
        {currentStep === 3 && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold text-[#A4193D] mb-2">
              {copy.create.steps.prompt.title}
            </h2>
            <p className="text-[#A4193D] mb-6">
              {copy.create.steps.prompt.description}
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-[#A4193D] mb-2">
                Suggested prompts
              </label>
              <PromptChips
                prompts={suggestedPrompts}
                onSelect={setPrompt}
                selectedPrompt={prompt}
              />
            </div>

            <div className="mb-6">
              <label
                htmlFor="prompt"
                className="block text-sm font-medium text-[#A4193D] mb-2"
              >
                Or write your own
              </label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the scene you want to create..."
                rows={4}
                className="w-full px-4 py-3 border border-[#FFDFB9] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C51D4D] focus:border-transparent resize-none"
              />
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={!prompt}
              className="w-full py-4 bg-[#A4193D] text-white rounded-xl font-medium text-lg hover:bg-[#7D132E] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C51D4D] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {copy.create.generateButton}
            </button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          className="px-6 py-2 text-[#A4193D] hover:text-[#A4193D] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Back
        </button>
        {currentStep < 3 && (
          <button
            onClick={() => setCurrentStep(Math.min(3, currentStep + 1))}
            disabled={
              (currentStep === 0 && !personA) ||
              (currentStep === 1 && !personB) ||
              (currentStep === 2 && !selectedStyle)
            }
            className="px-6 py-2 text-[#A4193D] font-medium hover:text-[#A4193D] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        )}
      </div>
    </div>
  );
}

export default function CreatePage() {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-4 border-[#FFDFB9] border-t-[#A4193D] rounded-full animate-spin" />
        </div>
      </div>
    }>
      <CreatePageContent />
    </Suspense>
  );
}
