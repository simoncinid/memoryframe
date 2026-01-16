'use client';

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { verifyEmail } from '@/lib/auth';
import { useToast } from '@/components/Toast';

export const dynamic = 'force-dynamic';

function VerifyEmailContent() {
  const router = useRouter();
  const { showToast } = useToast();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'input' | 'success' | 'error'>('input');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code || code.length !== 6) {
      showToast('Enter a 6-digit code', 'error');
      return;
    }

    setLoading(true);
    try {
      await verifyEmail(code);
      setStatus('success');
      setMessage('Email verified successfully!');
      showToast('Email verified successfully!', 'success');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Error during verification');
      showToast(error instanceof Error ? error.message : 'Error during verification', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF5EB] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-[#A4193D]">
            Verify your email
          </h2>
          <p className="mt-2 text-sm text-[#A4193D]">
            Enter the verification code we sent you via email
          </p>
        </div>

        {status === 'input' && (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="code" className="sr-only">
                Verification code
              </label>
              <input
                id="code"
                name="code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                value={code}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setCode(value);
                }}
                className="appearance-none relative block w-full px-3 py-3 border border-[#FFDFB9] placeholder-gray-500 text-[#A4193D] rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 text-center text-2xl font-bold tracking-widest"
                placeholder="000000"
                disabled={loading}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify'}
              </button>
            </div>

            <div className="text-center">
              <a
                href="/login"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Back to login
              </a>
            </div>
          </form>
        )}

        {status === 'success' && (
          <div className="text-center space-y-4">
            <div className="text-green-600 text-5xl mb-4">✓</div>
            <h2 className="text-2xl font-bold text-[#A4193D]">Email verified!</h2>
            <p className="text-[#A4193D]">{message}</p>
            <p className="text-sm text-[#7D132E]">Redirecting to login...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center space-y-4">
            <div className="text-red-600 text-5xl mb-4">✗</div>
            <h2 className="text-2xl font-bold text-[#A4193D]">Error</h2>
            <p className="text-[#A4193D]">{message}</p>
            <button
              onClick={() => {
                setStatus('input');
                setCode('');
                setMessage('');
              }}
              className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Try again
            </button>
            <div className="mt-4">
              <a
                href="/login"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Back to login
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#FFF5EB]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-[#A4193D] ml-4">Loading...</p>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
