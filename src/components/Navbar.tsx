"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { copy } from "@/content/copy";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-200">
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
            <span className="font-semibold text-stone-800 text-lg">
              {copy.brand.name}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {copy.navbar.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-stone-600 hover:text-stone-900 transition-colors text-sm font-medium"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/create"
              className="bg-stone-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-stone-700 transition-colors focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
            >
              {copy.navbar.ctaLabel}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-stone-600 hover:text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-500 rounded-lg"
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
          <div className="md:hidden py-4 border-t border-stone-200">
            <div className="flex flex-col gap-4">
              {copy.navbar.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-stone-600 hover:text-stone-900 transition-colors text-sm font-medium px-2 py-1"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/create"
                className="bg-stone-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-stone-700 transition-colors text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                {copy.navbar.ctaLabel}
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

