"use client";

import { cn } from "@/lib/utils";

interface PromptChipsProps {
  prompts: readonly string[];
  onSelect: (prompt: string) => void;
  selectedPrompt?: string;
}

export function PromptChips({ prompts, onSelect, selectedPrompt }: PromptChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {prompts.map((prompt, index) => {
        const isSelected = selectedPrompt === prompt;
        return (
          <button
            key={index}
            onClick={() => onSelect(prompt)}
            className={cn(
              "px-3 py-2 rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 text-left",
              isSelected
                ? "bg-stone-800 text-white"
                : "bg-stone-100 text-stone-700 hover:bg-stone-200"
            )}
          >
            {prompt.length > 60 ? prompt.substring(0, 60) + "..." : prompt}
          </button>
        );
      })}
    </div>
  );
}

interface PromptCategoryProps {
  categoryName: string;
  prompts: readonly string[];
  onCopy: (prompt: string) => void;
}

export function PromptCategory({ categoryName, prompts, onCopy }: PromptCategoryProps) {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-stone-800 mb-4">{categoryName}</h3>
      <div className="space-y-3">
        {prompts.map((prompt, index) => (
          <div
            key={index}
            className="flex items-start gap-3 p-4 bg-stone-50 rounded-xl border border-stone-200"
          >
            <p className="flex-1 text-stone-700 text-sm">{prompt}</p>
            <button
              onClick={() => onCopy(prompt)}
              className="shrink-0 px-3 py-1.5 text-xs font-medium bg-stone-800 text-white rounded-lg hover:bg-stone-700 transition-colors focus:outline-none focus:ring-2 focus:ring-stone-500"
            >
              Copy
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

