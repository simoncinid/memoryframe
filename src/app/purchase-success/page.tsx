'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';

export default function PurchaseSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (!sessionId) {
      router.push('/purchase-credits');
      return;
    }

    // Refresh user data to get updated credits
    const refreshUser = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('Error refreshing user:', error);
      } finally {
        setLoading(false);
      }
    };

    refreshUser();
  }, [searchParams, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="text-green-600 text-5xl mb-4">✓</div>
        <h2 className="text-3xl font-bold text-gray-900">Pagamento completato!</h2>
        <p className="text-gray-600">
          I tuoi crediti sono stati accreditati con successo.
        </p>
        {user && (
          <p className="text-lg text-gray-700">
            Crediti attuali: <span className="font-bold text-blue-600">{user.creditsPhoto}</span>
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/purchase-credits"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Acquista altri crediti
          </Link>
          <Link
            href="/create"
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Crea immagine
          </Link>
        </div>
      </div>
    </div>
  );
}
