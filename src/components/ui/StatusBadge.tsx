import React from "react";
import { cn } from "@/lib/utils";

export type BadgeStatus =
  | "Completed"
  | "Processing"
  | "Ready"
  | "Reviewed"
  | "Pending"
  | "Matched"
  | "Not found in resume";

interface StatusBadgeProps {
  status: BadgeStatus | string;
  className?: string;
  showDot?: boolean;
}

export function StatusBadge({
  status,
  className,
  showDot = true,
}: StatusBadgeProps) {
  let dotColor = "bg-secondary";
  let containerStyle = "bg-surface-container-low text-on-surface";
  let pulse = false;

  switch (status) {
    case "Completed":
    case "Reviewed":
      dotColor = "bg-secondary";
      containerStyle = "bg-surface-container-low text-on-surface";
      break;
    case "Processing":
      dotColor = "bg-outline";
      containerStyle = "bg-surface-container-high text-on-surface";
      pulse = true;
      break;
    case "Ready":
      dotColor = "bg-[#15803d]";
      containerStyle = "bg-surface-container border border-outline-variant/30 text-on-surface font-code-mono text-[11px]";
      break;
    case "Pending":
      dotColor = "bg-outline-variant";
      containerStyle = "bg-surface-container-low text-secondary";
      break;
    case "Matched":
      dotColor = "bg-secondary";
      containerStyle = "bg-surface-container-high border border-outline-variant/30 text-on-surface text-[11px]";
      break;
    case "Not found in resume":
      dotColor = "bg-outline-variant";
      containerStyle = "bg-surface-container-lowest border border-outline-variant/40 text-outline text-[11px]";
      break;
    default:
      dotColor = "bg-secondary";
      containerStyle = "bg-surface-container-low text-on-surface";
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-meta-medium text-meta-medium select-none whitespace-nowrap",
        containerStyle,
        className
      )}
    >
      {showDot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full shrink-0",
            dotColor,
            pulse && "animate-pulse"
          )}
        />
      )}
      <span>{status}</span>
    </span>
  );
}
