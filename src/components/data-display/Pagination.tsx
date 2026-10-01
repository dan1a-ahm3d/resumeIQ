"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  itemLabel?: string;
  showPageNumbers?: boolean;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  itemLabel = "items",
  showPageNumbers = false,
  onPageChange,
  className,
}: PaginationProps) {
  const startItem = Math.min((currentPage - 1) * pageSize + 1, totalItems);
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div
      className={cn(
        "px-space-md py-space-sm bg-surface-container-lowest flex flex-col sm:flex-row items-center justify-between gap-space-sm select-none border-t border-outline-variant/20",
        className
      )}
    >
      <span className="font-meta-default text-meta-default text-outline">
        Showing{" "}
        <span className="text-on-surface font-body-medium">{startItem}</span> to{" "}
        <span className="text-on-surface font-body-medium">{endItem}</span> of{" "}
        <span className="text-on-surface font-body-medium">{totalItems}</span>{" "}
        {itemLabel}
      </span>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="h-7 px-2.5 rounded bg-surface-container-low text-on-surface hover:bg-surface-container transition-colors font-label-default text-label-default inline-flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <span className="material-symbols-outlined text-[14px]">
            chevron_left
          </span>
          <span>Previous</span>
        </button>

        {showPageNumbers && (
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
              const isActive = p === currentPage;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => onPageChange(p)}
                  className={cn(
                    "h-7 w-7 rounded font-code-mono text-meta-medium flex items-center justify-center transition-colors cursor-pointer",
                    isActive
                      ? "bg-surface-container text-on-surface font-semibold"
                      : "text-secondary hover:bg-surface-container-low"
                  )}
                >
                  {p}
                </button>
              );
            })}
          </div>
        )}

        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="h-7 px-2.5 rounded bg-surface-container-low text-on-surface hover:bg-surface-container transition-colors font-label-default text-label-default inline-flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <span>Next</span>
          <span className="material-symbols-outlined text-[14px]">
            chevron_right
          </span>
        </button>
      </div>
    </div>
  );
}
