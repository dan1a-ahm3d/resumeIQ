import React from "react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col selection:bg-surface-container-high">
      {/* 1. Header / Navigation */}
      <header className="sticky top-0 z-50 h-16 bg-surface-container-lowest/90 backdrop-blur-md border-b border-outline-variant/30 px-6 sm:px-12 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
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
            <span className="font-table-header text-[10px] text-outline tracking-wider uppercase mt-0.5">
              Recruitment Intelligence
            </span>
          </div>
        </div>

        {/* Public Nav Links */}
        <nav className="hidden md:flex items-center gap-6 font-body-medium text-body-medium text-secondary">
          <a href="#capabilities" className="hover:text-on-surface transition-colors">
            What It Does
          </a>
          <a href="#workflow" className="hover:text-on-surface transition-colors">
            How It Works
          </a>
          <a href="#benefits" className="hover:text-on-surface transition-colors">
            Product Benefits
          </a>
          <a href="#safeguards" className="hover:text-on-surface transition-colors">
            Safeguards
          </a>
        </nav>

        {/* Auth CTA Controls */}
        <div className="flex items-center gap-3">
          <Link
            href="/sign-in"
            className="h-8 px-3.5 inline-flex items-center justify-center rounded font-label-default text-label-default text-on-surface hover:bg-surface-container-low transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="h-8 px-3.5 inline-flex items-center justify-center rounded-[6px] font-label-default text-label-default bg-[#0f172a] text-white hover:bg-slate-800 transition-colors shadow-xs"
          >
            Sign Up
          </Link>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="pt-16 pb-20 px-6 sm:px-12 max-w-[1240px] w-full mx-auto flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-outline-variant/40 bg-surface-container-lowest text-secondary font-code-mono text-[11px] mb-6 shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#087f68]" />
          DECISION-SUPPORT INTELLIGENCE FOR RECRUITMENT TEAMS
        </div>

        <h1 className="font-headline-lg sm:text-[38px] sm:leading-[46px] text-on-surface max-w-3xl font-bold tracking-tight">
          Evidence-Backed Resume Intelligence & Transparent Candidate Ranking
        </h1>

        <p className="mt-5 text-[16px] leading-[26px] text-secondary max-w-2xl font-body-default">
          ResumeIQ converts unstructured PDF resumes and job descriptions into inspectable candidate comparisons.
          Empower talent teams with objective technical skill coverage, full-text vector similarity, and verbatim text citations.
        </p>

        {/* Hero CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-8">
          <Link
            href="/sign-up"
            className="h-10 px-5 inline-flex items-center justify-center gap-2 rounded-[6px] font-label-default text-label-default bg-[#0f172a] text-white hover:bg-slate-800 transition-all shadow-sm"
          >
            <span>Create Recruiter Account</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
          <Link
            href="/sign-in"
            className="h-10 px-5 inline-flex items-center justify-center gap-2 rounded-[6px] font-label-default text-label-default bg-surface-container-lowest border border-outline-variant/40 text-on-surface hover:bg-surface-container-low transition-colors shadow-xs"
          >
            <span>Open Demo Dashboard</span>
          </Link>
        </div>

        {/* 3. Product Interface Preview Card */}
        <div className="w-full max-w-4xl mt-12 bg-surface-container-lowest border border-outline-variant/40 rounded-lg p-6 shadow-sm text-left">
          <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3 mb-4">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#087f68]" />
              <span className="font-body-medium text-body-medium text-on-surface">
                Candidate Calibration Matrix ? Machine Learning Intern (#4092)
              </span>
            </div>
            <span className="font-code-mono text-[11px] text-secondary bg-surface-container-low px-2 py-0.5 rounded border border-outline-variant/20">
              Scoring Model: S = 0.70·T + 0.30·K
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded border border-outline-variant/20 bg-surface-container-low/30">
              <span className="font-table-header text-[10px] text-secondary uppercase tracking-wider block">
                Top Candidate Match
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-headline-md text-[24px] font-bold text-[#087f68]">84.0</span>
                <span className="text-secondary text-xs">/ 100 Document Match</span>
              </div>
              <div className="mt-3 text-[12px] space-y-1 font-body-default text-secondary">
                <div className="flex justify-between">
                  <span>TF-IDF Text Similarity (T):</span>
                  <span className="font-code-mono text-on-surface">82.0</span>
                </div>
                <div className="flex justify-between">
                  <span>Required Skill Coverage (K):</span>
                  <span className="font-code-mono text-on-surface">90.0%</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded border border-outline-variant/20 bg-surface-container-low/30 col-span-2">
              <span className="font-table-header text-[10px] text-secondary uppercase tracking-wider block mb-1.5">
                Verbatim Evidence Citation
              </span>
              <p className="text-[12.5px] italic text-on-surface leading-relaxed border-l-2 border-[#087f68] pl-3 py-0.5">
                &ldquo;Developed predictive model evaluation pipelines in Python using scikit-learn and SQL database queries. Configured Git branch workflows and Docker container environments for reproducibility.&rdquo;
              </p>
              <div className="flex flex-wrap items-center gap-1.5 mt-3">
                <span className="px-2 py-0.5 rounded text-[11px] font-code-mono bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe]">
                  ? Python (Verified)
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-code-mono bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe]">
                  ? SQL (Verified)
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-code-mono bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe]">
                  ? scikit-learn (Verified)
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-code-mono bg-[#fff7ed] text-[#c2410c] border border-[#fed7aa]">
                  ? Deep Learning (not found in text)
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Core Capabilities Section */}
      <section id="capabilities" className="py-16 bg-surface-container-lowest border-y border-outline-variant/30">
        <div className="max-w-[1240px] w-full mx-auto px-6 sm:px-12">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="font-table-header text-table-header text-secondary uppercase tracking-wider">
              Core Capabilities
            </span>
            <h2 className="font-headline-lg text-headline-lg text-on-surface mt-1.5">
              Engineered for Transparent Evaluation
            </h2>
            <p className="font-meta-default text-meta-default text-secondary mt-2">
              ResumeIQ eliminates opaque AI scoring by grounding every match metric in verifiable textual evidence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-lg border border-outline-variant/30 bg-surface-container-low/30 hover:border-outline-variant/60 transition-colors">
              <div className="w-9 h-9 rounded bg-[#0f172a] text-white flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[20px]">upload_file</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">
                Multi-PDF Ingestion
              </h3>
              <p className="font-body-default text-body-default text-secondary mt-2 leading-relaxed">
                Accepts batches of 1 to 25 text-based PDF resumes with file integrity, magic byte verification, and password encryption checks.
              </p>
            </div>

            <div className="p-5 rounded-lg border border-outline-variant/30 bg-surface-container-low/30 hover:border-outline-variant/60 transition-colors">
              <div className="w-9 h-9 rounded bg-[#0f172a] text-white flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[20px]">fact_check</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">
                Boundary-Aware Matching
              </h3>
              <p className="font-body-default text-body-default text-secondary mt-2 leading-relaxed">
                Resolves technical aliases (e.g. sklearn ? scikit-learn) with zero false-positives between Java and JavaScript or R language.
              </p>
            </div>

            <div className="p-5 rounded-lg border border-outline-variant/30 bg-surface-container-low/30 hover:border-outline-variant/60 transition-colors">
              <div className="w-9 h-9 rounded bg-[#0f172a] text-white flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[20px]">calculate</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">
                Dual-Component Scoring
              </h3>
              <p className="font-body-default text-body-default text-secondary mt-2 leading-relaxed">
                Computes 70% TF-IDF batch cosine similarity and 30% confirmed required-skill coverage with human-reviewed weighting.
              </p>
            </div>

            <div className="p-5 rounded-lg border border-outline-variant/30 bg-surface-container-low/30 hover:border-outline-variant/60 transition-colors">
              <div className="w-9 h-9 rounded bg-[#0f172a] text-white flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[20px]">verified</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">
                Auditable Dossiers
              </h3>
              <p className="font-body-default text-body-default text-secondary mt-2 leading-relaxed">
                Export publication-grade PDF and CSV dossiers with full score breakdowns, EEOC checkpoints, and verbatim citation excerpts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. How It Works (Workflow Pipeline) */}
      <section id="workflow" className="py-16 max-w-[1240px] w-full mx-auto px-6 sm:px-12">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="font-table-header text-table-header text-secondary uppercase tracking-wider">
            Workflow Architecture
          </span>
          <h2 className="font-headline-lg text-headline-lg text-on-surface mt-1.5">
            Structured Human-in-the-Loop Pipeline
          </h2>
          <p className="font-meta-default text-meta-default text-secondary mt-2">
            Recruiters retain full control at each verification phase before candidate scores are calculated.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-5 rounded-lg border border-outline-variant/30 bg-surface-container-lowest">
            <span className="font-code-mono text-xs text-[#087f68] font-bold block mb-2">PHASE 01</span>
            <h4 className="font-headline-sm text-headline-sm text-on-surface">Input & Ingestion</h4>
            <p className="font-body-default text-body-default text-secondary mt-2 text-xs leading-relaxed">
              Paste the target job description and upload candidate resumes. The engine verifies document structure and selectable text layers.
            </p>
          </div>

          <div className="p-5 rounded-lg border border-outline-variant/30 bg-surface-container-lowest">
            <span className="font-code-mono text-xs text-[#087f68] font-bold block mb-2">PHASE 02</span>
            <h4 className="font-headline-sm text-headline-sm text-on-surface">Requirements Review</h4>
            <p className="font-body-default text-body-default text-secondary mt-2 text-xs leading-relaxed">
              Inspect candidate required and preferred criteria. Move or calibrate skills manually before running batch vectorization.
            </p>
          </div>

          <div className="p-5 rounded-lg border border-outline-variant/30 bg-surface-container-lowest">
            <span className="font-code-mono text-xs text-[#087f68] font-bold block mb-2">PHASE 03</span>
            <h4 className="font-headline-sm text-headline-sm text-on-surface">Vector & Evidence Engine</h4>
            <p className="font-body-default text-body-default text-secondary mt-2 text-xs leading-relaxed">
              Batch-fitted TF-IDF calculates full-text cosine similarity while the skill extractor records verbatim context excerpts.
            </p>
          </div>

          <div className="p-5 rounded-lg border border-outline-variant/30 bg-surface-container-lowest">
            <span className="font-code-mono text-xs text-[#087f68] font-bold block mb-2">PHASE 04</span>
            <h4 className="font-headline-sm text-headline-sm text-on-surface">Ranking & Export</h4>
            <p className="font-body-default text-body-default text-secondary mt-2 text-xs leading-relaxed">
              Compare ranked candidates, inspect citation evidence side-by-side, and download compliance-ready PDF and CSV reports.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Benefits & Ethical Safeguards */}
      <section id="safeguards" className="py-16 bg-surface-container-lowest border-t border-outline-variant/30">
        <div className="max-w-[1240px] w-full mx-auto px-6 sm:px-12">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="font-table-header text-table-header text-secondary uppercase tracking-wider">
              Responsible AI Design
            </span>
            <h2 className="font-headline-lg text-headline-lg text-on-surface mt-1.5">
              Built on Privacy, Fairness, and Explainability
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-lg border border-outline-variant/30 bg-surface-container-low/30">
              <div className="flex items-center gap-2 mb-2 text-[#087f68]">
                <span className="material-symbols-outlined text-[20px]">shield</span>
                <span className="font-headline-sm text-headline-sm text-on-surface">Zero Demographic Ingestion</span>
              </div>
              <p className="font-body-default text-body-default text-secondary text-xs leading-relaxed">
                Candidate names, photographs, gender, age, nationality, and street addresses are excluded from ranking calculations.
              </p>
            </div>

            <div className="p-5 rounded-lg border border-outline-variant/30 bg-surface-container-low/30">
              <div className="flex items-center gap-2 mb-2 text-[#087f68]">
                <span className="material-symbols-outlined text-[20px]">spellcheck</span>
                <span className="font-headline-sm text-headline-sm text-on-surface">Factual Absence Framing</span>
              </div>
              <p className="font-body-default text-body-default text-secondary text-xs leading-relaxed">
                When a skill is undetected, it is labeled &ldquo;not found in extracted resume text&rdquo; rather than asserting applicant incompetence.
              </p>
            </div>

            <div className="p-5 rounded-lg border border-outline-variant/30 bg-surface-container-low/30">
              <div className="flex items-center gap-2 mb-2 text-[#087f68]">
                <span className="material-symbols-outlined text-[20px]">lock</span>
                <span className="font-headline-sm text-headline-sm text-on-surface">Ephemeral In-Memory Processing</span>
              </div>
              <p className="font-body-default text-body-default text-secondary text-xs leading-relaxed">
                Uploaded resumes are held in temporary memory for the active analysis session and never persisted to external databases.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Bottom Call to Action */}
      <section className="py-16 px-6 sm:px-12 max-w-[1240px] w-full mx-auto text-center">
        <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-8 sm:p-12 shadow-sm">
          <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">
            Ready to calibrate your recruitment workflow?
          </h2>
          <p className="font-body-default text-body-default text-secondary mt-2 max-w-xl mx-auto">
            Experience evidence-backed candidate comparison and export compliant recruitment dossiers.
          </p>
          <div className="flex items-center justify-center gap-3 mt-6">
            <Link
              href="/sign-up"
              className="h-9 px-5 inline-flex items-center justify-center rounded-[6px] font-label-default text-label-default bg-[#0f172a] text-white hover:bg-slate-800 transition-colors shadow-xs"
            >
              Get Started Now
            </Link>
            <Link
              href="/sign-in"
              className="h-9 px-5 inline-flex items-center justify-center rounded-[6px] font-label-default text-label-default bg-surface-container-lowest border border-outline-variant/40 text-on-surface hover:bg-surface-container-low transition-colors shadow-xs"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* 8. Footer */}
      <footer className="mt-auto border-t border-outline-variant/30 py-8 px-6 sm:px-12 bg-surface-container-lowest">
        <div className="max-w-[1240px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-secondary">
          <div className="flex items-center gap-2">
            <span className="font-headline-sm text-on-surface text-xs font-bold">ResumeIQ</span>
            <span>? Version 1.0.5</span>
            <span>? Enterprise Recruitment Intelligence</span>
          </div>

          <p className="text-[11px] text-outline text-center sm:text-right max-w-md">
            Notice: ResumeIQ is an assistive decision-support prototype. It does not decide whom to hire or predict employment suitability.
          </p>
        </div>
      </footer>
    </div>
  );
}
