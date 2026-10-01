"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

interface HeaderProps {
  breadcrumbMain?: string;
  breadcrumbSub?: string;
}

export function Header({
  breadcrumbMain = "ResumeIQ",
  breadcrumbSub = "Talent Platform",
}: HeaderProps) {
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayName = user?.fullName || "Elena Rostov";
  const displayRole = user?.role || "Talent Lead";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="fixed top-0 left-[220px] right-0 h-16 bg-surface-container-lowest border-b border-outline-variant/30 z-40 px-space-xl flex items-center justify-between">
      {/* Breadcrumb Left */}
      <div className="flex items-center gap-space-sm">
        <span className="font-meta-default text-meta-default text-outline">
          {breadcrumbMain}
        </span>
        <span className="text-outline-variant">/</span>
        <span className="font-label-default text-label-default text-on-surface">
          {breadcrumbSub}
        </span>
      </div>

      {/* Action Controls Right */}
      <div className="flex items-center gap-space-md">
        {/* Search Input Bar */}
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-2.5 text-outline text-[16px] pointer-events-none">
            search
          </span>
          <input
            className="h-8 pl-8 pr-12 w-64 rounded-lg bg-surface-container-lowest border border-outline-variant/40 font-body-default text-body-default text-on-surface placeholder:text-outline focus:outline-none focus:border-on-surface transition-colors cursor-pointer"
            placeholder="Search candidates, files..."
            type="text"
            readOnly
          />
          <kbd className="absolute right-2 px-1.5 py-0.5 border border-outline-variant/30 rounded font-code-mono text-[10px] text-outline bg-surface-container-low select-none">
            ⌘K
          </kbd>
        </div>

        {/* Help Button */}
        <button
          className="h-8 w-8 flex items-center justify-center rounded-lg border border-outline-variant/30 bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors cursor-pointer"
          type="button"
          aria-label="Help"
        >
          <span className="material-symbols-outlined text-[18px]">
            help_outline
          </span>
        </button>

        {/* Separator */}
        <div className="h-5 w-px bg-outline-variant/30" />

        {/* User Profile Area & Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="flex items-center gap-space-sm pl-space-xs cursor-pointer select-none text-left p-1 rounded-md hover:bg-surface-container-low transition-colors"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant/20 bg-primary-container text-white flex items-center justify-center text-xs font-semibold">
              {initials}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="font-label-default text-label-default text-on-surface leading-tight">
                {displayName}
              </span>
              <span className="font-meta-default text-meta-default text-outline leading-tight">
                {displayRole}
              </span>
            </div>
            <span
              className={`material-symbols-outlined text-outline text-[18px] transition-transform ${
                isMenuOpen ? "rotate-180" : ""
              }`}
            >
              expand_more
            </span>
          </button>

          {/* Lightweight Profile Menu */}
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-md bg-surface-container-lowest border border-outline-variant/30 shadow-lg py-1 z-50 animate-in fade-in-50 zoom-in-95">
              {/* User Identity Info */}
              <div className="px-3.5 py-2.5 border-b border-outline-variant/20">
                <p className="font-body-medium text-body-medium text-on-surface truncate">
                  {displayName}
                </p>
                <p className="font-meta-default text-[11px] text-secondary truncate">
                  {user?.email || "elena.rostov@talent.resumeiq.internal"}
                </p>
              </div>

              {/* Menu Links */}
              <div className="py-1">
                <Link
                  href="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-body-default text-on-surface hover:bg-surface-container-low transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px] text-secondary">
                    person
                  </span>
                  <span>View Profile</span>
                </Link>

                <Link
                  href="/settings"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-body-default text-on-surface hover:bg-surface-container-low transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px] text-secondary">
                    tune
                  </span>
                  <span>Settings & Scoring</span>
                </Link>
              </div>

              {/* Sign Out */}
              <div className="border-t border-outline-variant/20 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    signOut();
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-body-default text-error hover:bg-error-container/20 transition-colors text-left cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    logout
                  </span>
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
