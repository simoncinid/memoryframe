'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getPricing, createCheckout } from '@/lib/credits';
import { getUser, isAuthenticated } from '@/lib/auth';
import { useToast } from '@/components/Toast';
import Link from 'next/link';

export default function PurchaseCreditsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [pricing, setPricing] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [customCredits, setCustomCredits] = useState(50);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login?redirect=/purchase-credits');
      return;
    }

    const loadData = async () => {
      try {
        const [pricingData, userData] = await Promise.all([
          getPricing(),
          getUser(),
        ]);
        setPricing(pricingData);
        setUser(userData);
      } catch (error) {
        showToast('Error loading data', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router, showToast]);

  const handlePurchase = async (credits: number) => {
    if (!isAuthenticated()) {
      router.push('/login?redirect=/purchase-credits');
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[#A4193D] mb-4">Purchase Credits</h1>
        {user && (
          <p className="text-lg text-[#A4193D]">
            Current credits: <span className="font-bold text-blue-600">{user.creditsPhoto}</span>
          </p>
        )}
      </div>

      {pricing && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {pricing.photoPacks.map((pack: any) => (
              <div
                key={pack.id}
                className="border border-[#FFDFB9] rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <h3 className="text-2xl font-bold text-[#A4193D] mb-2">{pack.name}</h3>
                <p className="text-4xl font-bold text-blue-600 mb-4">
                  ${pack.price.toFixed(2)}
                </p>
                <p className="text-[#A4193D] mb-6">{pack.credits} credits</p>
                <button
                  onClick={() => handlePurchase(pack.credits)}
                  disabled={processing}
                  className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {processing ? 'Loading...' : 'Purchase'}
                </button>
              </div>
            ))}
          </div>

          <div className="border-t pt-8">
            <h2 className="text-2xl font-bold text-[#A4193D] mb-4">Custom Purchase</h2>
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-[#A4193D] mb-2">
                  Number of credits
                </label>
                <input
                  type="number"
                  min="1"
                  value={customCredits}
                  onChange={(e) => setCustomCredits(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-[#FFDFB9] rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-2 text-sm text-[#7D132E]">
                  Total: ${((customCredits * pricing.pricePerCredit) / 100).toFixed(2)}
                </p>
              </div>
              <button
                onClick={() => handlePurchase(customCredits)}
                disabled={processing || customCredits < 1}
                className="py-2 px-6 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {processing ? 'Loading...' : 'Purchase'}
              </button>
            </div>
          </div>
        </>
      )}

      <div className="mt-12 text-center text-[#A4193D]">
        <p>Credits are credited immediately after payment.</p>
        <p className="mt-2">
          Price per credit: <span className="font-bold">${((pricing?.pricePerCredit || 0) / 100).toFixed(2)}</span>
        </p>
      </div>
    </div>
  );
}
