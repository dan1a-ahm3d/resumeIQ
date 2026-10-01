"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function SignUpPage() {
  const { signUp, isLoading } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      setError("All fields are required.");
      return;
    }

    if (fullName.trim().length < 2) {
      setError("Please provide your full legal name.");
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

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please verify.");
      return;
    }

    try {
      await signUp({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        confirmPassword,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Account creation failed.");
    }
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
          Create Recruiter Account
        </h2>
        <p className="mt-1 text-xs text-secondary font-meta-default">
          Join the ResumeIQ recruitment platform for transparent candidate intelligence.
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

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <div>
              <label className="block text-xs font-label-default text-on-surface mb-1">
                Full Name
              </label>
              <Input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Elena Rostov"
                disabled={isLoading}
                required
              />
            </div>

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
              <label className="block text-xs font-label-default text-on-surface mb-1">
                Password (minimum 8 characters)
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                disabled={isLoading}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-label-default text-on-surface mb-1">
                Confirm Password
              </label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
              icon={isLoading ? "hourglass_top" : "person_add"}
            >
              {isLoading ? "Setting Up Workspace..." : "Create Account & Enter Dashboard"}
            </Button>
          </form>

          <div className="mt-5 text-center pt-4 border-t border-outline-variant/20">
            <span className="text-xs text-secondary">
              Already have an active workspace account?{" "}
            </span>
            <Link
              href="/sign-in"
              className="text-xs font-body-medium text-on-surface underline hover:text-secondary"
            >
              Sign In
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
