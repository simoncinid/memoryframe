"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { copy } from "@/content/copy";
import { getUser, isAuthenticated, logout } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { BuyCreditsModal } from "@/components/BuyCreditsModal";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [showBuyCreditsModal, setShowBuyCreditsModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      if (isAuthenticated()) {
        const userData = await getUser();
        setUser(userData);
      }
      setAuthChecked(true);
    };
    checkAuth();

    // Aggiorna user quando cambia lo stato di autenticazione
    const updateUser = async () => {
      if (isAuthenticated()) {
        const userData = await getUser();
        if (userData) {
          setUser(userData);
        }
      } else {
        setUser(null);
      }
    };

    const interval = setInterval(updateUser, 2000); // Controlla ogni 2 secondi

    // Aggiorna anche quando la pagina diventa visibile (dopo login in altra tab o dopo redirect)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        updateUser();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Aggiorna anche quando si fa focus sulla finestra
    window.addEventListener('focus', updateUser);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', updateUser);
    };
  }, []);

  // Listener per eventi di storage (quando si fa login in un'altra tab)
  useEffect(() => {
    const handleStorageChange = async () => {
      if (isAuthenticated()) {
        const userData = await getUser();
        setUser(userData);
      } else {
        setUser(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogout = async () => {
    await logout();
    setUser(null);
    router.push('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#FFDFB9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt={copy.brand.name}
              width={72}
              height={72}
              className="w-[72px] h-[72px]"
            />
            <span className="font-semibold text-[#A4193D] text-lg">
              {copy.brand.name}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {/* Left side: Navigation links */}
            <div className="flex items-center gap-6">
              {copy.navbar.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[#A4193D] hover:text-[#7D132E] transition-colors text-sm font-medium"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right side: Credits, Buy Credits, Logout */}
            {authChecked && (
              <>
                {user ? (
                  <div className="flex items-center gap-4">
                    {/* Credits and Buy Credits in peach rounded container */}
                    <div className="flex items-center gap-3 px-4 py-2 bg-[#FFDFB9] rounded-full">
                      <span className="text-sm font-medium">
                        Credits: <span className="font-bold text-[#C97A5A]">{user.creditsPhoto}</span>
                      </span>
                      <button
                        onClick={() => setShowBuyCreditsModal(true)}
                        className="px-3 py-1 bg-[#A4193D] text-white rounded-full text-xs font-medium hover:bg-[#7D132E] transition-colors"
                      >
                        Buy Credits
                      </button>
                    </div>
                    {/* Logout icon */}
                    <button
                      onClick={handleLogout}
                      className="p-2 text-[#A4193D] hover:text-[#7D132E] transition-colors"
                      aria-label="Logout"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="text-[#A4193D] hover:text-[#7D132E] transition-colors text-sm font-medium"
                  >
                    Login
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-[#A4193D] hover:text-[#7D132E] focus:outline-none focus:ring-2 focus:ring-[#C51D4D] rounded-lg"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#FFDFB9]">
            <div className="flex flex-col gap-4">
              {copy.navbar.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[#A4193D] hover:text-[#7D132E] transition-colors text-sm font-medium px-2 py-1"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {authChecked && (
                <>
                  {user ? (
                    <>
                      <div className="px-2 py-2">
                        <div className="flex items-center gap-3 px-4 py-2 bg-[#FFDFB9] rounded-full">
                          <span className="text-sm font-medium">
                            Credits: <span className="font-bold text-[#C97A5A]">{user.creditsPhoto}</span>
                          </span>
                          <button
                            onClick={() => {
                              setShowBuyCreditsModal(true);
                              setIsMenuOpen(false);
                            }}
                            className="px-3 py-1 bg-[#A4193D] text-white rounded-full text-xs font-medium hover:bg-[#7D132E] transition-colors"
                          >
                            Buy Credits
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center gap-2 text-[#A4193D] hover:text-[#7D132E] transition-colors text-sm font-medium px-2 py-1"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        Logout
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/login"
                      className="text-[#A4193D] hover:text-[#7D132E] transition-colors text-sm font-medium px-2 py-1"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Login
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <BuyCreditsModal
        isOpen={showBuyCreditsModal}
        onClose={() => setShowBuyCreditsModal(false)}
      />
    </nav>
  );
}

