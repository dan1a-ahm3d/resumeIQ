import React from "react";
import { cn } from "@/lib/utils";

interface MatchAnalysisCardProps {
  matchScore: number;
  rank: number;
  jdSimilarity: number;
  skillCoverage: number;
  coreSkillsMatched: number;
  coreSkillsTotal: number;
  targetSkillsCount?: number;
  modelIdentifier?: string;
  formulaDescription?: string;
  className?: string;
}

export function MatchAnalysisCard({
  matchScore,
  rank,
  jdSimilarity,
  skillCoverage,
  coreSkillsMatched,
  coreSkillsTotal,
  targetSkillsCount = 7,
  modelIdentifier = "Deterministic Model v2.4",
  formulaDescription = "Formula: 70% Text + 30% Skill",
  className,
}: MatchAnalysisCardProps) {
  return (
    <div
      className={cn(
        "bg-surface-container-lowest border border-outline-variant/40 rounded-[6px] p-5 shadow-xs",
        className
      )}
    >
      <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-outline-variant/20">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-on-surface">
            tune
          </span>
          <h2 className="font-headline-sm text-headline-sm text-on-surface">
            Match Analysis
          </h2>
        </div>
        <div className="inline-flex items-center gap-1.5 font-code-mono text-code-mono text-secondary">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
          {modelIdentifier}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        {/* Metric 1: Match Score */}
        <div className="bg-surface-container-lowest p-3.5 rounded-[6px] border border-outline-variant/30 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-table-header text-table-header text-secondary uppercase tracking-wider">
              Overall Match
            </span>
            <span className="font-code-mono text-[11px] px-1 rounded bg-secondary-container text-on-secondary-container">
              Rank #{rank}
            </span>
          </div>
          <div className="flex items-baseline gap-1 my-1">
            <span className="font-headline-lg text-[28px] leading-tight font-semibold text-on-surface">
              {matchScore}%
            </span>
            <span className="font-meta-default text-meta-default text-outline">
              / 100
            </span>
          </div>
          <p className="font-meta-default text-[11px] text-outline mt-1 leading-snug">
            {formulaDescription}
          </p>
        </div>

        {/* Metric 2: JD Similarity */}
        <div className="bg-surface-container-lowest p-3.5 rounded-[6px] border border-outline-variant/30 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-table-header text-table-header text-secondary uppercase tracking-wider">
              JD Similarity
            </span>
            <span className="material-symbols-outlined text-[16px] text-outline">
              analytics
            </span>
          </div>
          <div className="flex items-baseline gap-1 my-1">
            <span className="font-headline-lg text-[28px] leading-tight font-semibold text-on-surface">
              {jdSimilarity}%
            </span>
            <span className="font-meta-default text-meta-default text-outline">
              dense
            </span>
          </div>
          <p className="font-meta-default text-[11px] text-outline mt-1 leading-snug">
            Vector TF-IDF similarity
          </p>
        </div>

        {/* Metric 3: Skill Coverage */}
        <div className="bg-surface-container-lowest p-3.5 rounded-[6px] border border-outline-variant/30 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-table-header text-table-header text-secondary uppercase tracking-wider">
              Skill Coverage
            </span>
            <span className="font-code-mono text-[11px] text-secondary font-medium">
              {coreSkillsMatched}/{targetSkillsCount} Target
            </span>
          </div>
          <div className="flex items-baseline gap-1 my-1">
            <span className="font-headline-lg text-[28px] leading-tight font-semibold text-on-surface">
              {skillCoverage}%
            </span>
            <span className="font-meta-default text-meta-default text-outline">
              core
            </span>
          </div>
          <p className="font-meta-default text-[11px] text-outline mt-1 leading-snug">
            {coreSkillsMatched} of {coreSkillsTotal} required skills detected
          </p>
        </div>
      </div>

      <div className="flex items-start gap-2 pt-2 border-t border-outline-variant/20">
        <span className="material-symbols-outlined text-[15px] text-outline mt-0.5">
          info
        </span>
        <p className="font-meta-default text-[11px] leading-normal text-outline">
          Match score reflects similarity between the job description and resume content using the configured scoring methodology.
        </p>
      </div>
    </div>
  );
}
