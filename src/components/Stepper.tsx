"use client";

import { cn } from "@/lib/utils";

interface Step {
  id: string;
  title: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
}

export function Stepper({ steps, currentStep, onStepClick }: StepperProps) {
  return (
    <div className="w-full">
      {/* Mobile View */}
      <div className="md:hidden mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-[#A4193D]">
            Step {currentStep + 1} of {steps.length}
          </span>
          <span className="text-sm text-[#A4193D]">
            {steps[currentStep]?.title}
          </span>
        </div>
        <div className="w-full bg-[#FFDFB9] rounded-full h-2">
          <div
            className="bg-[#A4193D] h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden md:flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isClickable = onStepClick && index <= currentStep;

          return (
            <div key={step.id} className="flex items-center flex-1">
              <button
                onClick={() => isClickable && onStepClick(index)}
                disabled={!isClickable}
                className={cn(
                  "flex items-center gap-3 group",
                  isClickable && "cursor-pointer"
                )}
              >
                {/* Step Circle */}
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                    isCompleted && "bg-[#A4193D] text-white",
                    isCurrent && "bg-[#A4193D] text-white ring-4 ring-stone-200",
                    !isCompleted && !isCurrent && "bg-[#FFDFB9] text-[#7D132E]"
                  )}
                >
                  {isCompleted ? (
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
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>

                {/* Step Label */}
                <div className="text-left">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      isCurrent ? "text-[#A4193D]" : "text-[#7D132E]"
                    )}
                  >
                    {step.title}
                  </p>
                </div>
              </button>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-4">
                  <div
                    className={cn(
                      "h-0.5 rounded-full",
                      index < currentStep ? "bg-[#A4193D]" : "bg-[#FFDFB9]"
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

