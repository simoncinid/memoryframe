"use client";

import { cn } from "@/lib/utils";

interface StyleCardProps {
  id: string;
  name: string;
  description: string;
  isSelected?: boolean;
  onClick?: () => void;
}

export function StyleCard({
  id,
  name,
  description,
  isSelected,
  onClick,
}: StyleCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-4 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2",
        isSelected
          ? "border-stone-800 bg-stone-50 shadow-md"
          : "border-stone-200 hover:border-stone-300 bg-white"
      )}
    >
      {/* Style Preview Placeholder */}
      <div
        className={cn(
          "aspect-video rounded-lg mb-3 flex items-center justify-center",
          getStyleGradient(id)
        )}
      >
        <span className="text-white/80 text-xs font-medium uppercase tracking-wide">
          {name}
        </span>
      </div>

      {/* Style Info */}
      <h3 className="font-medium text-stone-800 mb-1">{name}</h3>
      <p className="text-sm text-stone-500 line-clamp-2">{description}</p>

      {/* Selected Indicator */}
      {isSelected && (
        <div className="mt-3 flex items-center gap-2 text-stone-800">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-sm font-medium">Selected</span>
        </div>
      )}
    </button>
  );
}

function getStyleGradient(styleId: string): string {
  const gradients: Record<string, string> = {
    classic: "bg-gradient-to-br from-stone-600 to-stone-800",
    painterly: "bg-gradient-to-br from-amber-500 to-orange-700",
    cinematic: "bg-gradient-to-br from-slate-700 to-slate-900",
    vintage: "bg-gradient-to-br from-amber-600 to-amber-800",
    blackwhite: "bg-gradient-to-br from-gray-600 to-gray-900",
    watercolor: "bg-gradient-to-br from-sky-400 to-blue-600",
    "pop-art": "bg-gradient-to-br from-pink-500 to-purple-700",
    renaissance: "bg-gradient-to-br from-yellow-700 to-amber-900",
  };
  return gradients[styleId] || "bg-gradient-to-br from-stone-500 to-stone-700";
}

