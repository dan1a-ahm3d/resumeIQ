"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: string;
  activeMatch: (pathname: string) => boolean;
}

const WORKSPACE_NAV: NavItem[] = [
  {
    label: "Overview",
    href: "/overview",
    icon: "grid_view",
    activeMatch: (p) => p === "/overview" || p === "/",
  },
  {
    label: "Analyses",
    href: "/new-analysis",
    icon: "insights",
    activeMatch: (p) => p.startsWith("/new-analysis") || p.startsWith("/requirements-review"),
  },
  {
    label: "Candidates",
    href: "/analysis",
    icon: "group",
    activeMatch: (p) => p === "/analysis" || p.startsWith("/candidates"),
  },
  {
    label: "Reports",
    href: "/reports",
    icon: "summarize",
    activeMatch: (p) => p.startsWith("/reports"),
  },
];

const SYSTEM_NAV: NavItem[] = [
  {
    label: "Settings",
    href: "/settings",
    icon: "tune",
    activeMatch: (p) => p.startsWith("/settings"),
  },
  {
    label: "Help",
    href: "#",
    icon: "help",
    activeMatch: () => false,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-[220px] bg-surface-container-lowest border-r border-outline-variant/30 z-50 flex flex-col justify-between select-none">
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className="h-16 flex items-center gap-space-sm px-space-md border-b border-outline-variant/20">
          <div className="h-8 w-8 rounded bg-[#0f172a] text-white flex items-center justify-center font-semibold text-xs tracking-tighter shadow-xs">
            <svg
              className="w-5 h-5 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M7 8h10" />
              <path d="M7 12h6" />
              <path d="M7 16h8" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight leading-none">
              ResumeIQ
            </span>
            <span className="font-table-header text-table-header text-outline tracking-wider uppercase mt-0.5">
              Intelligence
            </span>
          </div>
        </div>

        {/* Workspace Nav Section */}
        <div className="px-space-sm pt-space-md pb-space-xs">
          <span className="px-space-sm font-table-header text-table-header text-outline uppercase tracking-wider">
            Workspace
          </span>
        </div>
        <nav className="flex flex-col gap-0.5 px-space-sm">
          {WORKSPACE_NAV.map((item) => {
            const isActive = item.activeMatch(pathname);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-space-sm px-space-sm py-1.5 rounded-lg transition-colors font-body-default text-body-default",
                  isActive
                    ? "bg-surface-container-high text-on-surface font-body-medium"
                    : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="my-space-md mx-space-sm border-t border-outline-variant/30" />

        {/* System Nav Section */}
        <div className="px-space-sm pb-space-xs">
          <span className="px-space-sm font-table-header text-table-header text-outline uppercase tracking-wider">
            System
          </span>
        </div>
        <nav className="flex flex-col gap-0.5 px-space-sm">
          {SYSTEM_NAV.map((item) => {
            const isActive = item.activeMatch(pathname);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-space-sm px-space-sm py-1.5 rounded-lg transition-colors font-body-default text-body-default",
                  isActive
                    ? "bg-surface-container-high text-on-surface font-body-medium"
                    : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                )}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-space-md border-t border-outline-variant/20">
        <div className="flex items-center justify-between text-outline">
          <span className="font-code-mono text-code-mono">v1.0.4</span>
          <span className="inline-flex items-center gap-1 font-meta-default text-meta-default text-on-surface-variant">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
            Enterprise
          </span>
        </div>
      </div>
    </aside>
  );
}
