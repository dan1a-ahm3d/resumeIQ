"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SkillTag } from "@/components/ui/SkillTag";
import { NoticeBox } from "@/components/ui/NoticeBox";
import { Pagination } from "@/components/data-display/Pagination";
import { Button } from "@/components/ui/Button";
import { CandidateRankingItem } from "@/types/candidate";
import { candidateService } from "@/services/candidateService";

export default function CandidateAnalysisPage() {
  const router = useRouter();
  const [candidates, setCandidates] = useState<CandidateRankingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [jobTitle, setJobTitle] = useState("Machine Learning Intern (REQ-4092)");
  const [isRealBackend, setIsRealBackend] = useState(false);

  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  useEffect(() => {
    let isMounted = true;
    candidateService.getCandidateRankings().then((data) => {
      if (isMounted) {
        setCandidates(data);
        const hasReal = candidateService.hasActiveAnalysis();
        setIsRealBackend(hasReal);
        if (hasReal) {
          const active = candidateService.getActiveAnalysis();
          if (active?.job_title) {
            setJobTitle(`${active.job_title} (REQ-4092)`);
          }
        }
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const countAll = candidates.length;
  const count80Plus = useMemo(
    () => candidates.filter((c) => c.matchScore >= 80).length,
    [candidates]
  );
  const count70To79 = useMemo(
    () =>
      candidates.filter((c) => c.matchScore >= 70 && c.matchScore < 80).length,
    [candidates]
  );
  const countUnder70 = useMemo(
    () => candidates.filter((c) => c.matchScore < 70).length,
    [candidates]
  );

  const avgMatch = useMemo(() => {
    if (candidates.length === 0) return "0.0";
    const sum = candidates.reduce((acc, c) => acc + c.matchScore, 0);
    return (sum / candidates.length).toFixed(1);
  }, [candidates]);

  const filteredCandidates = useMemo(() => {
    return candidates.filter((cand: CandidateRankingItem) => {
      // Bracket filter
      if (activeFilter === "80-plus" && cand.matchScore < 80) return false;
      if (
        activeFilter === "70-79" &&
        (cand.matchScore < 70 || cand.matchScore >= 80)
      )
        return false;
      if (activeFilter === "under-70" && cand.matchScore >= 70) return false;

      // Keyword query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const nameMatch = cand.candidateName.toLowerCase().includes(q);
        const fileMatch = cand.filename.toLowerCase().includes(q);
        const skillMatch = cand.detectedSkills.some((s) =>
          s.toLowerCase().includes(q)
        );
        if (!nameMatch && !fileMatch && !skillMatch) return false;
      }

      return true;
    });
  }, [candidates, activeFilter, searchQuery]);

  const paginatedCandidates = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredCandidates.slice(startIndex, startIndex + pageSize);
  }, [filteredCandidates, currentPage]);

  const totalPages = Math.ceil(filteredCandidates.length / pageSize) || 1;

  return (
    <div className="max-w-[1240px] w-full mx-auto space-y-space-md">
      {/* Header Block */}
      <PageHeader
        breadcrumbs={
          <>
            <span>Triage Workspace</span>
            <span>/</span>
            <span>Requisition Pipeline</span>
            <span>/</span>
            <span className="font-code-mono text-on-surface">REQ-4092</span>
          </>
        }
        title="Candidate Analysis"
        badge={
          isRealBackend ? (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-code-mono bg-[#15803d]/10 text-[#15803d] border border-[#15803d]/30">
              <span className="w-1.5 h-1.5 rounded-full bg-[#15803d]" />
              Real FastAPI Analysis
            </span>
          ) : undefined
        }
        description={
          <>
            {candidates.length} resumes analyzed against:{" "}
            <span className="font-body-medium text-on-surface">{jobTitle}</span>
          </>
        }
        actions={
          <>
            <Link href="/new-analysis">
              <Button variant="secondary" icon="add">
                New Analysis
              </Button>
            </Link>
            <Link href="/reports">
              <Button variant="secondary" icon="arrow_downward">
                Export Report
              </Button>
            </Link>
            <Button
              variant="ghost"
              icon="sync"
              onClick={() => router.push("/new-analysis")}
            >
              Re-run Analysis
            </Button>
          </>
        }
      />

      {/* Filter & Metrics Control Ribbon */}
      <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-space-md border border-outline-variant/30">
        {/* Left Filters */}
        <div className="flex flex-wrap items-center gap-space-md">
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-2.5 text-outline text-[16px] pointer-events-none">
              search
            </span>
            <input
              type="text"
              placeholder="Search by name, file, or skill..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-8 pr-3 py-1.5 rounded-lg border border-outline-variant/50 bg-surface-container-low text-on-surface placeholder:text-outline text-body-default font-body-default focus:outline-none focus:border-on-surface focus:ring-1 focus:ring-on-surface transition-all w-64"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 text-outline hover:text-on-surface p-0.5"
              >
                <span className="material-symbols-outlined text-[14px]">
                  close
                </span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-lg border border-outline-variant/30">
            <button
              type="button"
              onClick={() => {
                setActiveFilter("all");
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded font-label-default text-label-default transition-colors cursor-pointer ${
                activeFilter === "all"
                  ? "bg-surface-container-lowest text-on-surface shadow-xs"
                  : "text-secondary hover:text-on-surface"
              }`}
            >
              All{" "}
              <span className="font-code-mono text-meta-default ml-0.5 text-outline">
                {countAll}
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveFilter("80-plus");
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded font-label-default text-label-default transition-colors cursor-pointer ${
                activeFilter === "80-plus"
                  ? "bg-surface-container-lowest text-on-surface shadow-xs"
                  : "text-secondary hover:text-on-surface"
              }`}
            >
              80%+{" "}
              <span className="font-code-mono text-meta-default ml-0.5 text-outline">
                {count80Plus}
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveFilter("70-79");
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded font-label-default text-label-default transition-colors cursor-pointer ${
                activeFilter === "70-79"
                  ? "bg-surface-container-lowest text-on-surface shadow-xs"
                  : "text-secondary hover:text-on-surface"
              }`}
            >
              70–79%{" "}
              <span className="font-code-mono text-meta-default ml-0.5 text-outline">
                {count70To79}
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveFilter("under-70");
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded font-label-default text-label-default transition-colors cursor-pointer ${
                activeFilter === "under-70"
                  ? "bg-surface-container-lowest text-on-surface shadow-xs"
                  : "text-secondary hover:text-on-surface"
              }`}
            >
              Under 70%{" "}
              <span className="font-code-mono text-meta-default ml-0.5 text-outline">
                {countUnder70}
              </span>
            </button>
          </div>
        </div>

        {/* Right Summary Counters */}
        <div className="flex items-center gap-space-md text-secondary font-meta-default text-meta-default border-t lg:border-t-0 pt-2 lg:pt-0 select-none">
          <div className="flex items-center gap-1.5">
            <span className="text-outline">Avg Match:</span>
            <span className="font-code-mono font-meta-medium text-on-surface">
              {avgMatch}%
            </span>
          </div>
          <span className="text-outline-variant">•</span>
          <div className="flex items-center gap-1.5">
            <span className="text-outline">Evaluated:</span>
            <span className="font-code-mono font-meta-medium text-on-surface">
              {candidates.length}/{candidates.length}
            </span>
          </div>
          <span className="text-outline-variant">•</span>
          <div
            className="flex items-center gap-1.5"
            title="Semantic weighted scoring configuration"
          >
            <span className="text-outline">Formula:</span>
            <span className="font-code-mono text-on-surface">
              70% Text + 30% Skill
            </span>
          </div>
        </div>
      </div>

      {/* Candidate Match Analysis Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-xs overflow-hidden flex flex-col border border-outline-variant/30">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-secondary font-table-header text-table-header uppercase tracking-wider select-none border-b border-outline-variant/30">
                <th className="py-3 px-space-md w-[220px]" scope="col">
                  Rank & Candidate
                </th>
                <th className="py-3 px-space-md w-[190px]" scope="col">
                  Match Score
                </th>
                <th className="py-3 px-space-md w-[130px]" scope="col">
                  JD Similarity
                </th>
                <th className="py-3 px-space-md w-[180px]" scope="col">
                  Skill Coverage
                </th>
                <th className="py-3 px-space-md" scope="col">
                  Detected Skills
                </th>
                <th className="py-3 px-space-md w-[110px]" scope="col">
                  Status
                </th>
                <th
                  className="py-3 px-space-md text-right w-[200px]"
                  scope="col"
                >
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/15 text-body-default font-body-default">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-outline">
                    <div className="flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-[20px] animate-spin text-primary">
                        progress_activity
                      </span>
                      <span>Loading candidate rankings...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedCandidates.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-outline">
                    No candidates match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedCandidates.map((cand) => (
                  <tr
                    key={cand.id}
                    className="hover:bg-surface-container-low/60 transition-colors group"
                  >
                    {/* Rank & Candidate */}
                    <td className="py-3.5 px-space-md">
                      <div className="flex items-center gap-space-sm">
                        <span className="font-code-mono text-meta-default font-meta-medium text-outline">
                          #{cand.rank < 10 ? `0${cand.rank}` : cand.rank}
                        </span>
                        <div className="flex flex-col min-w-0">
                          <span className="font-body-medium text-body-medium text-on-surface truncate">
                            {cand.candidateName}
                          </span>
                          <span className="font-code-mono text-meta-default text-outline truncate">
                            {cand.filename}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Match Score */}
                    <td className="py-3.5 px-space-md">
                      <div className="flex items-center gap-2.5">
                        <span className="font-code-mono font-headline-sm text-headline-sm text-on-surface w-9">
                          {cand.matchScore}%
                        </span>
                        <div className="h-1 flex-1 bg-surface-container rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary-container rounded-full"
                            style={{ width: `${Math.min(cand.matchScore, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* JD Similarity */}
                    <td className="py-3.5 px-space-md">
                      <span className="font-code-mono text-body-default text-on-surface">
                        {cand.jdSimilarity}%
                      </span>
                    </td>

                    {/* Skill Coverage */}
                    <td className="py-3.5 px-space-md">
                      <div className="flex flex-col">
                        <span className="font-code-mono text-body-medium text-on-surface">
                          {cand.skillCoverage}%
                        </span>
                        <span className="font-meta-default text-meta-default text-outline">
                          {cand.coreSkillsMatched} of {cand.coreSkillsTotal} core skills
                        </span>
                      </div>
                    </td>

                    {/* Detected Skills */}
                    <td className="py-3.5 px-space-md">
                      <div className="flex flex-wrap gap-1 items-center">
                        {cand.detectedSkills.slice(0, 5).map((skill) => (
                          <SkillTag key={skill} name={skill} variant="table" />
                        ))}
                        {cand.detectedSkills.length > 5 && (
                          <span className="font-code-mono text-[10px] text-outline">
                            +{cand.detectedSkills.length - 5}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-space-md">
                      <StatusBadge status={cand.status} />
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-space-md text-right">
                      <Link
                        href={`/candidates/${cand.id}`}
                        className="inline-flex items-center gap-0.5 font-label-default text-label-default text-on-surface hover:text-primary-container group-hover:underline"
                      >
                        <span>View scorecard & evidence</span>
                        <span className="material-symbols-outlined text-[14px]">
                          arrow_forward
                        </span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredCandidates.length}
          pageSize={pageSize}
          showPageNumbers={true}
          itemLabel="ranked candidates"
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Audit / Decision-Support Disclaimer Notice */}
      <NoticeBox icon="verified_user" variant="panel">
        <strong className="font-meta-medium text-on-surface">
          Decision-support notice:
        </strong>{" "}
        Match scores reflect algorithmic similarity and keyword coverage rubrics against the submitted job description. Final candidate evaluations remain 100% human-directed.
      </NoticeBox>
    </div>
  );
}
