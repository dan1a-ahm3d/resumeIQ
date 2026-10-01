"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface FilterTabOption {
  key: string;
  label: string;
  count?: number;
}

interface FilterRibbonProps {
  title?: string;
  tabs: FilterTabOption[];
  activeTab: string;
  onTabChange: (key: string) => void;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  rightSlot?: React.ReactNode;
  className?: string;
}

export function FilterRibbon({
  title,
  tabs,
  activeTab,
  onTabChange,
  searchPlaceholder = "Search...",
  searchValue,
  onSearchChange,
  rightSlot,
  className,
}: FilterRibbonProps) {
  return (
    <div
      className={cn(
        "flex flex-col md:flex-row md:items-center justify-between gap-space-sm bg-surface-container-lowest",
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-space-md">
        {title && (
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
            {title}
          </h2>
        )}

        {/* Tab Pills */}
        <div className="flex items-center gap-1 bg-surface-container-low p-0.5 rounded select-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => onTabChange(tab.key)}
                className={cn(
                  "px-2.5 py-1 rounded text-meta-medium font-meta-medium transition-all cursor-pointer",
                  isActive
                    ? "bg-surface-container-lowest text-on-surface shadow-xs font-medium"
                    : "text-outline hover:text-on-surface"
                )}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span
                    className={cn(
                      "font-code-mono text-[11px] ml-1",
                      isActive ? "text-secondary" : "text-outline"
                    )}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Area: Search + Actions */}
      <div className="flex items-center gap-space-sm flex-wrap">
        {onSearchChange && (
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-2.5 text-outline text-[16px] pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={searchValue ?? ""}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="h-8 pl-8 pr-3 w-56 md:w-64 rounded bg-surface-container-low font-body-default text-body-default text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest transition-colors"
            />
          </div>
        )}

        {rightSlot}
      </div>
    </div>
  );
}
