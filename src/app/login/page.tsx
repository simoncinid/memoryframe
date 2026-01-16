'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { login, register, setAuthData } from '@/lib/auth';
import { useToast } from '@/components/Toast';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = isLogin
        ? await login(email, password)
        : await register(email, password);

      setAuthData(data);
      showToast('success', isLogin ? 'Login effettuato!' : 'Registrazione completata!');
      
      const redirect = searchParams.get('redirect') || '/';
      router.push(redirect);
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : 'Errore durante l\'operazione');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isLogin ? 'Accedi al tuo account' : 'Crea un nuovo account'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isLogin ? (
              <>
                Non hai un account?{' '}
                <button
                  onClick={() => setIsLogin(false)}
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Registrati
                </button>
              </>
            ) : (
              <>
                Hai già un account?{' '}
                <button
                  onClick={() => setIsLogin(true)}
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Accedi
                </button>
              </>
            )}
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Indirizzo email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
              />
            </div>
          </div>

          {!isLogin && (
            <div className="text-sm text-gray-600">
              La password deve essere di almeno 8 caratteri.
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Caricamento...' : isLogin ? 'Accedi' : 'Registrati'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
