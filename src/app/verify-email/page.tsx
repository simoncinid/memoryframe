'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { verifyEmail } from '@/lib/auth';
import { useToast } from '@/components/Toast';

export const dynamic = 'force-dynamic';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showToast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('Verification token missing');
      return;
    }

    verifyEmail(token)
      .then(() => {
        setStatus('success');
        setMessage('Email verified successfully!');
        showToast('Email verified successfully!', 'success');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      })
      .catch((error) => {
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Error during verification');
        showToast('Error during email verification', 'error');
      });
  }, [searchParams, router, showToast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF5EB] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-[#A4193D]">Verifying email...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="text-green-600 text-5xl mb-4">✓</div>
            <h2 className="text-2xl font-bold text-[#A4193D]">Email verified!</h2>
            <p className="text-[#A4193D]">{message}</p>
            <p className="text-sm text-[#7D132E]">Redirecting to login...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="text-red-600 text-5xl mb-4">✗</div>
            <h2 className="text-2xl font-bold text-[#A4193D]">Error</h2>
            <p className="text-[#A4193D]">{message}</p>
            <a
              href="/login"
              className="mt-4 inline-block text-blue-600 hover:text-blue-500"
            >
              Go to login
            </a>
          </>
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
