import React from "react";
import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  currentStep: 1 | 2 | 3;
  className?: string;
}

export function StepIndicator({ currentStep, className }: StepIndicatorProps) {
  if (currentStep === 3) {
    return (
      <div
        className={cn(
          "flex items-center gap-1.5 bg-surface-container-low px-3 py-1.5 rounded-xl border border-outline-variant/30 select-none",
          className
        )}
      >
        <div className="flex items-center gap-1.5 text-secondary">
          <span className="font-code-mono text-[11px] font-medium text-outline">
            01
          </span>
          <span className="font-label-default text-label-default text-secondary">
            Job
          </span>
        </div>
        <span className="text-outline-variant text-[12px]">→</span>
        <div className="flex items-center gap-1.5 text-secondary">
          <span className="font-code-mono text-[11px] font-medium text-outline">
            02
          </span>
          <span className="font-label-default text-label-default text-secondary">
            Resumes
          </span>
        </div>
        <span className="text-outline-variant text-[12px]">→</span>
        <div className="flex items-center gap-1.5 bg-surface-container-lowest px-2 py-0.5 rounded shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="font-code-mono text-[11px] font-semibold text-on-surface">
            03
          </span>
          <span className="font-label-default text-label-default text-on-surface font-semibold">
            Review & Processing
          </span>
        </div>
      </div>
    );
  }

  // currentStep 1 or 2
  return (
    <nav
      aria-label="Workflow Steps"
      className={cn(
        "flex items-center gap-space-sm bg-surface-container-lowest px-space-md py-1.5 rounded-lg border border-outline-variant/30 select-none",
        className
      )}
    >
      {/* Step 1 */}
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "w-5 h-5 rounded-full flex items-center justify-center font-code-mono text-[11px] leading-none",
            currentStep === 1
              ? "bg-primary text-on-primary font-medium"
              : "bg-surface-container text-outline"
          )}
        >
          01
        </span>
        <span
          className={cn(
            currentStep === 1
              ? "font-body-medium text-body-medium text-on-surface"
              : "font-meta-default text-meta-default text-outline"
          )}
        >
          Job & Scope
        </span>
        {currentStep === 1 && (
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
        )}
      </div>

      <span className="text-outline-variant/60 font-code-mono text-xs">───</span>

      {/* Step 2 */}
      <div className="flex items-center gap-2 text-outline">
        <span
          className={cn(
            "w-5 h-5 rounded-full flex items-center justify-center font-code-mono text-[11px] leading-none",
            currentStep === 2
              ? "bg-primary text-on-primary font-medium"
              : "bg-surface-container text-outline"
          )}
        >
          02
        </span>
        <span
          className={cn(
            currentStep === 2
              ? "font-body-medium text-body-medium text-on-surface"
              : "font-meta-default text-meta-default text-outline"
          )}
        >
          Resumes
        </span>
      </div>

      <span className="text-outline-variant/60 font-code-mono text-xs">───</span>

      {/* Step 3 */}
      <div className="flex items-center gap-2 text-outline">
        <span className="w-5 h-5 rounded-full bg-surface-container text-outline flex items-center justify-center font-code-mono text-[11px] leading-none">
          03
        </span>
        <span className="font-meta-default text-meta-default text-outline">
          Review
        </span>
      </div>
    </nav>
  );
}
