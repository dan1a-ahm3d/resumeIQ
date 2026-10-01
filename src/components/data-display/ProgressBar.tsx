import React from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number; // 0 - 100
  secondaryValue?: number; // optional second segment
  height?: "sm" | "md" | "lg";
  variant?: "primary" | "dark" | "two-tone";
  className?: string;
}

export function ProgressBar({
  value,
  secondaryValue,
  height = "sm",
  variant = "primary",
  className,
}: ProgressBarProps) {
  const heights = {
    sm: "h-1",
    md: "h-1.5",
    lg: "h-2",
  };

  const clampedVal = Math.max(0, Math.min(100, value));

  if (variant === "two-tone" && secondaryValue !== undefined) {
    const clampedSec = Math.max(0, Math.min(100, secondaryValue));
    return (
      <div
        className={cn(
          "w-full rounded-full bg-surface-container flex overflow-hidden",
          heights[height],
          className
        )}
      >
        <div
          className="h-full bg-primary-container transition-all duration-200"
          style={{ width: `${clampedVal}%` }}
        />
        <div
          className="h-full bg-secondary transition-all duration-200"
          style={{ width: `${clampedSec}%` }}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "w-full rounded-full bg-surface-container overflow-hidden",
        heights[height],
        className
      )}
    >
      <div
        className={cn(
          "h-full rounded-full transition-all duration-300",
          variant === "dark" ? "bg-primary-container" : "bg-primary"
        )}
        style={{ width: `${clampedVal}%` }}
      />
    </div>
  );
}
