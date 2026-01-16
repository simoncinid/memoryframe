'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getTransactions, Transaction } from '@/lib/credits';
import { isAuthenticated } from '@/lib/auth';
import { useToast } from '@/components/Toast';

export default function TransactionsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login?redirect=/transactions');
      return;
    }

    loadTransactions();
  }, [router]);

  const loadTransactions = async () => {
    try {
      const data = await getTransactions(50, offset);
      setTransactions((prev) => [...prev, ...data.transactions]);
      setHasMore(data.transactions.length === 50);
      setOffset((prev) => prev + 50);
    } catch (error) {
      showToast('Errore durante il caricamento transazioni', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('it-IT');
  };

  const getKindLabel = (kind: string) => {
    switch (kind) {
      case 'grant':
        return 'Accreditato';
      case 'spend':
        return 'Speso';
      case 'refund':
        return 'Rimborsato';
      default:
        return kind;
    }
  };

  const getKindColor = (kind: string) => {
    switch (kind) {
      case 'grant':
        return 'text-green-600';
      case 'spend':
        return 'text-red-600';
      case 'refund':
        return 'text-blue-600';
      default:
        return 'text-[#A4193D]';
    }
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-[#A4193D] mb-8">Le tue transazioni</h1>

      {transactions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[#A4193D]">Nessuna transazione trovata.</p>
        </div>
      ) : (
        <>
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {transactions.map((tx) => (
                <li key={tx.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <span className={`font-medium ${getKindColor(tx.kind)}`}>
                          {getKindLabel(tx.kind)}
                        </span>
                        <span className="ml-4 text-[#A4193D]">
                          {tx.photoDelta > 0 ? '+' : ''}{tx.photoDelta} crediti
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-[#7D132E]">{tx.reason}</p>
                      <p className="mt-1 text-xs text-[#7D132E]">{formatDate(tx.createdAt)}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {hasMore && (
            <div className="mt-6 text-center">
              <button
                onClick={loadTransactions}
                disabled={loading}
                className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Caricamento...' : 'Carica altre'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
