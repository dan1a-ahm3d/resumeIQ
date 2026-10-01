"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function SignInPage() {
  const { signIn, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showForgotNotice, setShowForgotNotice] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validations
    if (!email.trim() || !password.trim()) {
      setError("Please fill in both email and password.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid corporate email address.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    try {
      await signIn({ email: email.trim(), password });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
    }
  };

  const handleUseDemo = () => {
    setEmail("elena.rostov@talent.resumeiq.internal");
    setPassword("EnterpriseAuth2026!");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-surface-container-high">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Logo */}
        <Link href="/" className="inline-flex items-center gap-2.5 mb-3 group">
          <div className="h-9 w-9 rounded bg-[#0f172a] text-white flex items-center justify-center font-semibold text-xs tracking-tighter shadow-xs">
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
          <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight font-bold">
            ResumeIQ
          </span>
        </Link>
        <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">
          Sign In to Talent Workspace
        </h2>
        <p className="mt-1 text-xs text-secondary font-meta-default">
          Enter your recruiter credentials to access candidate analyses and dossiers.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-surface-container-lowest py-8 px-6 sm:px-8 shadow-sm rounded-lg border border-outline-variant/30">
          {error && (
            <div className="mb-4 p-3 bg-error-container/30 border border-error/30 text-error rounded text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">error</span>
              <span>{error}</span>
            </div>
          )}

          {showForgotNotice && (
            <div className="mb-4 p-3 bg-surface-container border border-outline-variant/30 text-on-surface rounded text-xs flex items-start gap-2">
              <span className="material-symbols-outlined text-[16px] text-secondary mt-0.5">info</span>
              <div>
                <p className="font-body-medium">Password Reset</p>
                <p className="text-secondary text-[11px] mt-0.5">
                  Corporate Single-Sign-On is managed through your organization&apos;s identity directory.
                  Contact your internal systems administrator for credential rotation.
                </p>
              </div>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <div>
              <label className="block text-xs font-label-default text-on-surface mb-1">
                Corporate Email Address
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="recruiter@company.com"
                disabled={isLoading}
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-label-default text-on-surface">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotNotice((prev) => !prev)}
                  className="text-[11px] text-secondary hover:text-on-surface transition-colors cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                disabled={isLoading}
                required
              />
            </div>

            <Button
              type="submit"
              variant="dark"
              disabled={isLoading}
              className="w-full h-9 mt-2"
              icon={isLoading ? "hourglass_top" : "login"}
            >
              {isLoading ? "Authenticating Session..." : "Sign In to ResumeIQ"}
            </Button>
          </form>

          {/* Quick Demo Pre-fill */}
          <div className="mt-5 pt-4 border-t border-outline-variant/20">
            <button
              type="button"
              onClick={handleUseDemo}
              className="w-full text-center text-xs font-meta-medium text-secondary hover:text-on-surface p-2 rounded bg-surface-container-low/40 hover:bg-surface-container-low border border-outline-variant/20 transition-colors cursor-pointer"
            >
              ⚡ Fill Demo Persona (Elena Rostov · Talent Lead)
            </button>
          </div>

          <div className="mt-4 text-center">
            <span className="text-xs text-secondary">
              Don&apos;t have a recruiter account yet?{" "}
            </span>
            <Link
              href="/sign-up"
              className="text-xs font-body-medium text-on-surface underline hover:text-secondary"
            >
              Sign Up
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-[11px] text-outline font-meta-default">
          ResumeIQ Decision Support Platform · Prototype Environment
        </p>
      </div>
    </div>
  );
}
