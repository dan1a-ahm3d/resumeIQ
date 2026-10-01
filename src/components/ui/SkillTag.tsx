import React from "react";
import { cn } from "@/lib/utils";

interface SkillTagProps {
  name: string;
  variant?: "table" | "detected" | "removable" | "matched" | "missing";
  onRemove?: () => void;
  className?: string;
}

export function SkillTag({
  name,
  variant = "table",
  onRemove,
  className,
}: SkillTagProps) {
  if (variant === "removable") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-container-lowest border border-outline-variant/50 rounded-lg font-body-medium text-body-medium text-on-surface hover:border-outline transition-colors select-none",
          className
        )}
      >
        <span>{name}</span>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-outline hover:text-error transition-colors flex items-center justify-center p-0.5 cursor-pointer"
            aria-label={`Remove ${name}`}
          >
            <span className="material-symbols-outlined text-[14px]">close</span>
          </button>
        )}
      </span>
    );
  }

  if (variant === "matched") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 h-[26px] px-2.5 rounded-[4px] bg-surface-container-low border border-outline-variant/50 text-on-surface font-label-default text-[12px] select-none",
          className
        )}
      >
        <span className="material-symbols-outlined text-[14px] text-on-surface">
          check
        </span>
        <span>{name}</span>
      </span>
    );
  }

  if (variant === "missing") {
    return (
      <span
        className={cn(
          "inline-flex items-center h-[26px] px-2.5 rounded-[4px] bg-surface-container-lowest border border-outline-variant/40 text-outline font-label-default text-[12px] select-none",
          className
        )}
      >
        {name}
      </span>
    );
  }

  if (variant === "detected") {
    return (
      <span
        className={cn(
          "px-2 py-0.5 rounded border border-outline-variant/40 bg-surface-container-low font-code-mono text-[11px] text-on-surface select-none",
          className
        )}
      >
        {name}
      </span>
    );
  }

  // default: table chip
  return (
    <span
      className={cn(
        "px-1.5 py-0.5 rounded bg-surface-container-low text-on-surface text-meta-default font-meta-default select-none",
        className
      )}
    >
      {name}
    </span>
  );
}
