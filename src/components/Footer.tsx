import Link from "next/link";
import { copy } from "@/content/copy";

export function Footer() {
  return (
    <footer className="bg-stone-50 border-t border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-stone-800 flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="font-semibold text-stone-800 text-lg">
                {copy.brand.name}
              </span>
            </Link>
            <p className="text-stone-600 text-sm mb-4">{copy.footer.tagline}</p>
            <p className="text-stone-500 text-xs">{copy.footer.privacyNote}</p>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold text-stone-800 text-sm mb-4">
              Product
            </h3>
            <ul className="space-y-2">
              {copy.footer.links.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-stone-600 hover:text-stone-900 text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Learn Links */}
          <div>
            <h3 className="font-semibold text-stone-800 text-sm mb-4">Learn</h3>
            <ul className="space-y-2">
              {copy.footer.links.learn.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-stone-600 hover:text-stone-900 text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold text-stone-800 text-sm mb-4">Legal</h3>
            <ul className="space-y-2">
              {copy.footer.links.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-stone-600 hover:text-stone-900 text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-stone-200">
          <p className="text-stone-500 text-sm text-center">
            {copy.footer.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}

