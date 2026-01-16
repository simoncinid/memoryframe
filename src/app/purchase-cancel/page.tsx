'use client';

import Link from 'next/link';

export default function PurchaseCancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF5EB] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="text-yellow-600 text-5xl mb-4">⚠</div>
        <h2 className="text-3xl font-bold text-[#A4193D]">Payment cancelled</h2>
        <p className="text-[#A4193D]">
          Payment was cancelled. No credits were charged.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/purchase-credits"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try purchase again
          </Link>
          <Link
            href="/"
            className="px-6 py-2 bg-[#FFDFB9] text-[#A4193D] rounded-md hover:bg-gray-300"
          >
            Return to home
          </Link>
        </div>
      </div>
    </div>
  );
}
