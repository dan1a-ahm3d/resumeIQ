import React from "react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  codeOrBadge?: React.ReactNode;
  subtext?: string;
  icon?: string;
  className?: string;
}

export function MetricCard({
  title,
  value,
  codeOrBadge,
  subtext,
  icon,
  className,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "bg-surface-container-lowest p-space-md rounded-lg border border-outline-variant/30 flex flex-col justify-between shadow-xs",
        className
      )}
    >
      <div className="flex items-center justify-between text-outline">
        <span className="font-table-header text-table-header uppercase tracking-wider">
          {title}
        </span>
        {icon && (
          <span className="material-symbols-outlined text-[18px] text-secondary">
            {icon}
          </span>
        )}
      </div>

      <div className="flex items-baseline justify-between mt-1">
        <span className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface font-semibold tracking-tight">
          {value}
        </span>
        {codeOrBadge && (
          <div className="font-code-mono text-[11px] text-outline">
            {codeOrBadge}
          </div>
        )}
      </div>

      {subtext && (
        <span className="font-meta-default text-meta-default text-outline mt-0.5">
          {subtext}
        </span>
      )}
    </div>
  );
}
