import React from "react";
import { cn } from "@/lib/utils";

interface NoticeBoxProps {
  icon?: string;
  title?: string;
  children: React.ReactNode;
  variant?: "inline" | "bordered" | "panel";
  className?: string;
}

export function NoticeBox({
  icon = "info",
  title,
  children,
  variant = "bordered",
  className,
}: NoticeBoxProps) {
  if (variant === "panel") {
    return (
      <div
        className={cn(
          "bg-surface-container-low rounded-xl p-space-md flex items-start gap-space-sm text-secondary select-none border border-outline-variant/20",
          className
        )}
      >
        {icon && (
          <span className="material-symbols-outlined text-outline text-[18px] shrink-0 mt-0.5">
            {icon}
          </span>
        )}
        <div className="font-meta-default text-meta-default leading-relaxed">
          {title && (
            <strong className="font-meta-medium text-on-surface mr-1">
              {title}:
            </strong>
          )}
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "p-3.5 rounded-[6px] bg-surface-container-low/50 border border-outline-variant/30 text-[13px] leading-[18px] text-secondary flex items-start gap-3",
        className
      )}
    >
      {icon && (
        <span className="material-symbols-outlined text-[18px] text-secondary shrink-0 mt-0.5">
          {icon}
        </span>
      )}
      <div className="flex-1">
        {title && (
          <span className="font-body-medium text-on-surface block mb-0.5">
            {title}
          </span>
        )}
        <div className="font-meta-default text-meta-default text-on-surface-variant leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}
