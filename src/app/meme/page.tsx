"use client";

import { useState, useCallback, Suspense } from "react";
import Image from "next/image";
import { UploadDropzone } from "@/components/UploadDropzone";
import { useToast } from "@/components/Toast";
import { fileToBase64 } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";
import { getOrCreateDeviceId } from "@/lib/device-id";

// Meme options
const MEME_OPTIONS = [
  {
    id: "kirk",
    name: "Charlie Kirk",
    description: "Get the viral small face look",
    buttonText: "Kirkify Me! 🔥",
    image: "/kirk.png",
    keywords: ["kirkify", "kirkified", "small face", "tpusa"],
  },
  {
    id: "maduro",
    name: "Nicolás Maduro",
    description: "Transform into the Venezuelan president",
    buttonText: "Maduro-fy Me! 🇻🇪",
    image: "/maduro.png",
    keywords: ["maduro", "venezuela", "nicolas maduro"],
  },
];

const GENERATING_MESSAGES = [
  "Analyzing your face...",
  "Applying meme magic...",
  "Blending facial features...",
  "Adding the finishing touches...",
];

function MemePageContent() {
  const { showToast } = useToast();

  const [uploadedPhoto, setUploadedPhoto] = useState<File | null>(null);
  const [selectedMeme, setSelectedMeme] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingMessage, setGeneratingMessage] = useState("");
  const [resultImage, setResultImage] = useState<string | null>(null);


  const handleGenerate = useCallback(async (memeId: string) => {
    if (!uploadedPhoto) {
      showToast("Please upload a photo first", "error");
      return;
    }

    setSelectedMeme(memeId);
    setIsGenerating(true);
    trackEvent("meme_generate_started", { meme: memeId });

    // Cycle through generating messages
    let messageIndex = 0;
    setGeneratingMessage(GENERATING_MESSAGES[0]);
    const messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % GENERATING_MESSAGES.length;
      setGeneratingMessage(GENERATING_MESSAGES[messageIndex]);
    }, 1500);

    try {
      const photoBase64 = await fileToBase64(uploadedPhoto);

      // Get device ID for anonymous tracking
      const deviceId = getOrCreateDeviceId();

      const response = await fetch("/api/meme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photo: photoBase64,
          memeType: memeId,
          deviceId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Generation failed");
      }

      setResultImage(data.resultImageUrl);
      trackEvent("meme_generate_success", { meme: memeId });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Generation failed";
      showToast(message, "error");
      trackEvent("meme_generate_error", { error: message });
    } finally {
      clearInterval(messageInterval);
      setIsGenerating(false);
    }
  }, [uploadedPhoto, showToast]);

  const handleDownload = useCallback(() => {
    if (!resultImage) return;

    trackEvent("meme_download_click");

    const link = document.createElement("a");
    link.href = resultImage;
    link.download = `meme-faceswap-${selectedMeme}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [resultImage, selectedMeme]);

  const handleReset = useCallback(() => {
    setUploadedPhoto(null);
    setSelectedMeme(null);
    setResultImage(null);
  }, []);

  // Result View
  if (resultImage) {
    const selectedMemeData = MEME_OPTIONS.find(m => m.id === selectedMeme);
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#A4193D] mb-2">
            You&apos;ve Been {selectedMeme === "kirk" ? "Kirkified" : "Maduro-fied"}! 🎉
          </h1>
          <p className="text-[#A4193D]">Share this masterpiece with the world</p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 mb-8 border border-amber-200">
          <div className="relative aspect-square max-w-2xl mx-auto rounded-xl overflow-hidden bg-[#FFDFB9] shadow-xl">
            <Image
              src={resultImage}
              alt={`Face swapped with ${selectedMemeData?.name}`}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button
            onClick={handleDownload}
            className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium hover:from-orange-600 hover:to-red-600 transition-all shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            Download Meme 📥
          </button>
        </div>

        <div className="text-center">
          <button
            onClick={handleReset}
            className="text-[#A4193D] hover:text-[#A4193D] underline underline-offset-4"
          >
            Create another meme
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
          <div className="w-20 h-20 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mb-6" />
          <h2 className="text-xl font-semibold text-[#A4193D] mb-2">
            Creating Your Meme...
          </h2>
          <p className="text-[#A4193D] animate-pulse">{generatingMessage}</p>
        </div>
      </div>
    );
  }

  // Main Form View
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-[#A4193D] to-[#C51D4D] mb-4">
          AI Face Swap Meme Generator
        </h1>
        <p className="text-lg text-[#A4193D] max-w-2xl mx-auto mb-4">
          Kirkify yourself or transform into Maduro with our viral AI face swap tool. 
          Upload your photo and watch the magic happen!
        </p>
        <div className="flex flex-wrap justify-center gap-2 text-sm">
          <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-medium">🔥 Kirkification</span>
          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full font-medium">🇻🇪 Maduro Meme</span>
          <span className="bg-[#FFE8D1] text-[#A4193D] px-3 py-1 rounded-full font-medium">✨ Free AI Face Swap</span>
        </div>
      </div>

      {/* Upload Section */}
      <div className="mb-12">
        <div className="bg-white rounded-2xl border-2 border-[#FFDFB9] p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-[#A4193D] mb-2 text-center">
            Step 1: Upload Your Photo
          </h2>
          <p className="text-[#7D132E] text-sm mb-4 text-center">
            Use a clear, front-facing photo with good lighting for best results
          </p>
          <div className="max-w-md mx-auto">
            <UploadDropzone
              onFileSelect={setUploadedPhoto}
              value={uploadedPhoto}
              onClear={() => setUploadedPhoto(null)}
              label="Upload your photo"
              guidelines={["Clear face visible", "Front-facing works best", "Good lighting helps"]}
            />
          </div>
        </div>
      </div>

      {/* Meme Selection */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold text-[#A4193D] mb-2 text-center">
          Step 2: Choose Your Meme
        </h2>
        <p className="text-[#7D132E] text-sm mb-6 text-center">
          Click a button to swap your face with the meme
        </p>
        
        <div className="grid md:grid-cols-2 gap-6">
          {MEME_OPTIONS.map((meme) => (
            <div
              key={meme.id}
              className={`relative bg-white rounded-2xl border-2 overflow-hidden transition-all hover:shadow-xl ${
                uploadedPhoto 
                  ? "border-orange-300 hover:border-orange-500" 
                  : "border-[#FFDFB9] opacity-75"
              }`}
            >
              {/* Meme Image */}
              <div className="aspect-video relative overflow-hidden">
                <Image
                  src={meme.image}
                  alt={meme.name}
                  fill
                  className="object-cover"
                />
              </div>
              
              {/* Meme Info */}
              <div className="p-6">
                <h3 className="font-bold text-[#A4193D] text-xl mb-1">{meme.name}</h3>
                <p className="text-[#7D132E] text-sm mb-4">{meme.description}</p>
                
                <button
                  onClick={() => handleGenerate(meme.id)}
                  disabled={!uploadedPhoto}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                    uploadedPhoto
                      ? meme.id === "kirk"
                        ? "bg-gradient-to-r from-blue-500 to-[#A4193D] text-white hover:from-blue-600 hover:to-[#7D132E] shadow-lg"
                        : "bg-gradient-to-r from-red-500 to-yellow-500 text-white hover:from-red-600 hover:to-yellow-600 shadow-lg"
                      : "bg-[#FFDFB9] text-[#7D132E] cursor-not-allowed"
                  }`}
                >
                  {meme.buttonText}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SEO Content Section */}
      <div className="bg-[#FFF5EB] rounded-2xl p-8 mb-12 border border-[#FFDFB9]">
        <h2 className="text-2xl font-bold text-[#A4193D] mb-6 text-center">
          What is Kirkification?
        </h2>
        <div className="prose prose-stone max-w-none">
          <p className="text-[#A4193D] mb-4">
            <strong>Kirkification</strong> (also known as &quot;getting kirkified&quot;) is a viral internet meme where 
            people&apos;s faces are edited to resemble Charlie Kirk, the founder of Turning Point USA (TPUSA). 
            The meme typically involves making the face appear smaller in proportion to the head, creating 
            a comedic effect that has taken social media by storm.
          </p>
          <p className="text-[#A4193D] mb-4">
            Our <strong>AI face swap tool</strong> uses advanced image generation technology to seamlessly 
            blend your facial features with the iconic Kirk look, preserving your photo&apos;s background 
            and body while applying the meme transformation.
          </p>
          <h3 className="text-lg font-semibold text-[#A4193D] mt-6 mb-3">Maduro Face Swap</h3>
          <p className="text-[#A4193D]">
            The <strong>Nicolás Maduro face swap</strong> lets you transform into the Venezuelan president, 
            another viral meme format that&apos;s been trending across social media. Perfect for creating 
            political satire content or just having fun with friends!
          </p>
        </div>
      </div>

      {/* FAQ Section for SEO */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-[#A4193D] mb-6 text-center">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4 max-w-3xl mx-auto">
          <details className="bg-white rounded-xl border border-[#FFDFB9] p-4 group">
            <summary className="font-semibold text-[#A4193D] cursor-pointer list-none flex justify-between items-center">
              Is this face swap AI free?
              <span className="transform group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <p className="text-[#A4193D] mt-3">
              MemoryFrame offers 1 free image per day. No signup required, no watermarks on your images.
            </p>
          </details>
          
          <details className="bg-white rounded-xl border border-[#FFDFB9] p-4 group">
            <summary className="font-semibold text-[#A4193D] cursor-pointer list-none flex justify-between items-center">
              How does the kirkification AI work?
              <span className="transform group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <p className="text-[#A4193D] mt-3">
              Our AI analyzes your uploaded photo, identifies your facial features, and intelligently 
              blends them with the target meme face (Charlie Kirk or Maduro) while preserving your 
              photo&apos;s background and body. The result is a seamless, hilarious face swap!
            </p>
          </details>
          
          <details className="bg-white rounded-xl border border-[#FFDFB9] p-4 group">
            <summary className="font-semibold text-[#A4193D] cursor-pointer list-none flex justify-between items-center">
              What&apos;s the best photo to use for face swap?
              <span className="transform group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <p className="text-[#A4193D] mt-3">
              For best results, use a clear, front-facing photo with good lighting. Photos with 
              a single person visible work best. Avoid heavily filtered photos or images where 
              the face is partially obscured.
            </p>
          </details>
          
          <details className="bg-white rounded-xl border border-[#FFDFB9] p-4 group">
            <summary className="font-semibold text-[#A4193D] cursor-pointer list-none flex justify-between items-center">
              Do you store my photos?
              <span className="transform group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <p className="text-[#A4193D] mt-3">
              No! We never store your photos. All processing happens via real-time API calls and 
              your images are immediately discarded after generation. Your privacy is guaranteed.
            </p>
          </details>
        </div>
      </div>

      {/* Related Keywords for SEO */}
      <div className="text-center text-sm text-[#7D132E] border-t border-[#FFDFB9] pt-8">
        <p>
          Popular searches: kirkify, kirkified, kirkification, charlie kirk face swap, 
          maduro meme, venezuela meme, ai face swap, free face swap online, 
          tpusa meme generator, small face meme
        </p>
      </div>
    </div>
  );
}

export default function MemePage() {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-4 border-[#FFDFB9] border-t-orange-500 rounded-full animate-spin" />
        </div>
      </div>
    }>
      <MemePageContent />
    </Suspense>
  );
}

