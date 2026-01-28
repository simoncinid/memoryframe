'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

function UnlockSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchImage = useCallback(async (jobId: string, retries = 2): Promise<string | null> => {
    for (let i = 0; i <= retries; i++) {
      const res = await fetch(`/api/result/${encodeURIComponent(jobId)}`);
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.image_base64) {
        return `data:${data.mime_type || 'image/png'};base64,${data.image_base64}`;
      }
      if (res.status === 402 && i < retries) {
        await new Promise((r) => setTimeout(r, 1500));
        continue;
      }
      setError(data.error || data.message || 'Could not load image');
      return null;
    }
    return null;
  }, []);

  useEffect(() => {
    const jobId = searchParams.get('job_id');
    if (!jobId) {
      router.push('/create');
      return;
    }

    fetchImage(jobId).then((url) => {
      setImageUrl(url);
      setLoading(false);
    });
  }, [searchParams, router, fetchImage]);

  const handleDownload = useCallback(() => {
    if (!imageUrl) return;
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `memoryframe-portrait-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [imageUrl]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF5EB]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#FFDFB9] border-t-[#A4193D] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#A4193D]">Loading your unlocked photo…</p>
        </div>
      </div>
    );
  }

  if (error || !imageUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF5EB] py-12 px-4">
        <div className="max-w-md w-full text-center">
          <p className="text-[#A4193D] mb-6">{error || 'Image not available.'}</p>
          <Link
            href="/create"
            className="inline-block px-6 py-3 bg-[#A4193D] text-white rounded-xl hover:bg-[#7D132E]"
          >
            Back to Create
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <div className="text-green-600 text-4xl mb-2">✓</div>
        <h1 className="text-3xl font-bold text-[#A4193D] mb-2">Photo unlocked!</h1>
        <p className="text-[#A4193D]">You can now download your portrait without watermark.</p>
      </div>

      <div className="bg-[#FFF5EB] rounded-2xl p-4 mb-8">
        <div className="relative aspect-square max-w-2xl mx-auto rounded-xl overflow-hidden bg-[#FFDFB9]">
          <Image
            src={imageUrl}
            alt="Unlocked portrait"
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
        <button
          onClick={handleDownload}
          className="px-8 py-3 bg-[#A4193D] text-white rounded-xl font-medium hover:bg-[#7D132E] transition-colors"
        >
          Download
        </button>
        <Link
          href="/create"
          className="px-8 py-3 bg-[#FFDFB9] text-[#A4193D] rounded-xl font-medium hover:bg-[#FFE8D1] transition-colors text-center"
        >
          Create another portrait
        </Link>
      </div>
    </div>
  );
}

export default function UnlockSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FFF5EB]">
          <div className="w-12 h-12 border-4 border-[#FFDFB9] border-t-[#A4193D] rounded-full animate-spin" />
        </div>
      }
    >
      <UnlockSuccessContent />
    </Suspense>
  );
}
