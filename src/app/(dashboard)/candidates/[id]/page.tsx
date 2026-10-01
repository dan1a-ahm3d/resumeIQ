"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { SkillTag } from "@/components/ui/SkillTag";
import { MatchAnalysisCard } from "@/components/modules/MatchAnalysisCard";
import { RequirementEvidenceTable } from "@/components/modules/RequirementEvidenceTable";
import { NoticeBox } from "@/components/ui/NoticeBox";
import { CandidateDetail } from "@/types/candidate";
import { candidateService } from "@/services/candidateService";
import { MOCK_CANDIDATE_DETAIL_04 } from "@/lib/mockData";

export default function CandidateDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [candidate, setCandidate] = useState<CandidateDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [saveStatus, setSaveStatus] = useState("Auto-sync on");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const resolveId = async () => {
      let id = params?.id;
      if (params && typeof (params as any).then === "function") {
        const resolved = await (params as any);
        id = resolved.id;
      }
      return id || "candidate-04";
    };

    resolveId().then((cid) => {
      candidateService.getCandidateDetail(cid).then((data) => {
        if (isMounted) {
          setCandidate(data);
          setNotes(data.recruiterNotes || "");
          setIsLoading(false);
        }
      });
    });

    return () => {
      isMounted = false;
    };
  }, [params]);

  const handleSaveNotes = () => {
    if (candidate) {
      candidateService.saveRecruiterNotes(candidate.id, notes);
    }
    setIsSaved(true);
    setSaveStatus("Saved just now");
    setTimeout(() => {
      setIsSaved(false);
    }, 1800);
  };

  if (isLoading || !candidate) {
    return (
      <div className="w-full max-w-[1240px] mx-auto py-16 flex flex-col items-center justify-center gap-3 text-center">
        <span className="material-symbols-outlined text-[32px] text-primary animate-spin">
          progress_activity
        </span>
        <p className="font-body-medium text-body-medium text-on-surface">
          Loading candidate evaluation dossier...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1240px] mx-auto pb-space-xl">
      {/* Top Action & Navigation Header Bar */}
      <PageHeader
        className="mb-space-lg"
        breadcrumbs={
          <>
            <Link
              href="/analysis"
              className="hover:text-on-surface cursor-pointer transition-colors"
            >
              Candidates
            </Link>
            <span>/</span>
            <span className="font-code-mono text-code-mono text-outline">
              {candidate.reqId}
            </span>
            <span>/</span>
            <span className="font-meta-medium text-meta-medium text-on-surface">
              {candidate.candidateName}
            </span>
          </>
        }
        title={candidate.candidateName}
        badge={
          <span className="font-code-mono text-[11px] px-1.5 py-0.5 rounded bg-surface-container-high text-secondary uppercase font-medium">
            Verified PDF
          </span>
        }
        description={
          <>
            Source:{" "}
            <span className="font-code-mono text-code-mono text-on-surface">
              {candidate.filename}
            </span>{" "}
            ({candidate.pageCount} pages){" "}
            <span className="text-outline-variant mx-1">•</span>{" "}
            {candidate.jobRole}
          </>
        }
        actions={
          <>
            <Link href="/analysis">
              <Button variant="outline" icon="arrow_back">
                Back to Candidate Ranking
              </Button>
            </Link>
            <Button
              variant="outline"
              icon="picture_as_pdf"
              onClick={() => {
                alert(`Viewing verified document source: ${candidate.filename}`);
              }}
            >
              Original Resume (PDF)
            </Button>
            <Link href="/reports">
              <Button variant="primary" icon="download">
                Export Candidate Dossier
              </Button>
            </Link>
          </>
        }
      />

      {/* 12-Column Content Workbench: 8 cols (65%) Main / 4 cols (35%) Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* MAIN COLUMN: 8 Columns */}
        <div className="lg:col-span-8 flex flex-col gap-space-lg min-w-0">
          {/* Extraction Warnings Banner (if any) */}
          {candidate.warnings && candidate.warnings.length > 0 && (
            <NoticeBox icon="warning" variant="panel">
              <div className="space-y-1">
                <strong className="font-meta-medium text-on-surface">
                  Backend Extraction Notice:
                </strong>
                <ul className="list-disc list-inside space-y-0.5 text-[12px] text-on-surface-variant">
                  {candidate.warnings.map((w, idx) => (
                    <li key={idx}>{w}</li>
                  ))}
                </ul>
              </div>
            </NoticeBox>
          )}

          {/* 1. MATCH ANALYSIS METRICS ROW */}
          <MatchAnalysisCard
            matchScore={candidate.matchScore}
            rank={candidate.rank}
            jdSimilarity={candidate.jdSimilarity}
            skillCoverage={candidate.skillCoverage}
            coreSkillsMatched={candidate.coreSkillsMatched}
            coreSkillsTotal={candidate.coreSkillsTotal}
            targetSkillsCount={candidate.targetSkillsCount}
            modelIdentifier={candidate.modelIdentifier}
            formulaDescription={candidate.formulaDescription}
          />

          {/* 2. SKILLS BREAKDOWN SECTION */}
          <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-[6px] p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-on-surface">
                  checklist
                </span>
                <h2 className="font-headline-sm text-headline-sm text-on-surface">
                  Skills Breakdown
                </h2>
              </div>
              <span className="font-meta-default text-meta-default text-secondary">
                Verified by Semantic Parser
              </span>
            </div>

            <div className="space-y-4">
              {/* Matched Skills Group */}
              <div>
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-on-background" />
                  <span className="font-table-header text-table-header uppercase text-secondary tracking-wider">
                    Matched Skills ({candidate.matchedSkills.length})
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {candidate.matchedSkills.length > 0 ? (
                    candidate.matchedSkills.map((skill) => (
                      <SkillTag key={skill} name={skill} variant="matched" />
                    ))
                  ) : (
                    <span className="font-meta-default text-[12px] text-outline italic">
                      No required skills matched in resume.
                    </span>
                  )}
                </div>
              </div>

              {/* Not Found in Resume Group */}
              <div>
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-outline-variant" />
                  <span className="font-table-header text-table-header uppercase text-outline tracking-wider">
                    Not Found In Extracted Resume Text ({candidate.missingSkills.length})
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {candidate.missingSkills.length > 0 ? (
                    candidate.missingSkills.map((skill) => (
                      <SkillTag key={skill} name={skill} variant="missing" />
                    ))
                  ) : (
                    <span className="font-meta-default text-[12px] text-[#15803d]">
                      All required skills detected in resume.
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-outline-variant/20 flex items-center gap-2 text-outline">
              <span className="material-symbols-outlined text-[15px]">
                verified_user
              </span>
              <p className="font-meta-default text-[11px] leading-snug">
                Absence of a keyword from the submitted resume does not confirm lack of candidate competency. (Not found in extracted resume text)
              </p>
            </div>
          </div>

          {/* 3. REQUIREMENT EVIDENCE (CORE DIFFERENTIATOR) */}
          <RequirementEvidenceTable evidenceList={candidate.evidenceList} />

          {/* 4. ANALYSIS SUMMARY / RECRUITER NOTES */}
          <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-[6px] p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-on-surface">
                  subject
                </span>
                <h2 className="font-headline-sm text-headline-sm text-on-surface">
                  Objective Analysis Summary
                </h2>
              </div>
              <span className="font-code-mono text-[11px] uppercase tracking-wider text-outline">
                Audit Safe
              </span>
            </div>
            <p className="font-body-default text-body-default text-secondary leading-relaxed">
              {candidate.objectiveSummary}
            </p>
          </div>
        </div>

        {/* RIGHT SIDEBAR: 4 Columns (30% Persistent Panel) */}
        <aside className="lg:col-span-4 flex flex-col gap-space-md">
          <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-[6px] p-5 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-on-surface">
                  account_circle
                </span>
                <h3 className="font-headline-sm text-[15px] font-semibold text-on-surface">
                  Extracted Resume Profile
                </h3>
              </div>
              <span className="font-code-mono text-code-mono text-outline">
                {candidate.ocrVersion}
              </span>
            </div>

            {/* Section: Work Experience */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-table-header text-table-header uppercase text-secondary tracking-wider">
                  Work Experience
                </span>
                <span className="font-code-mono text-[11px] text-outline">
                  {candidate.workExperience.length} roles
                </span>
              </div>
              <div className="space-y-2 border-l border-outline-variant/40 pl-3 ml-1">
                {candidate.workExperience.map((exp, i) => (
                  <div key={i} className={i > 0 ? "pt-1.5" : ""}>
                    <p className="font-label-default text-label-default text-on-surface leading-snug">
                      {exp.role}
                    </p>
                    <div className="flex items-center justify-between text-secondary mt-0.5">
                      <span className="font-meta-default text-meta-default">
                        {exp.company}
                      </span>
                      <span className="font-code-mono text-[11px] text-outline">
                        {exp.period}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section: Verified Projects */}
            <div className="space-y-2.5 pt-2 border-t border-outline-variant/20">
              <div className="flex items-center justify-between">
                <span className="font-table-header text-table-header uppercase text-secondary tracking-wider">
                  Verified Projects
                </span>
                <span className="font-code-mono text-[11px] text-outline">
                  {candidate.verifiedProjects.length} items
                </span>
              </div>
              <div className="space-y-2.5">
                {candidate.verifiedProjects.length > 0 ? (
                  candidate.verifiedProjects.map((proj, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-[4px] bg-surface-container-low border border-outline-variant/30"
                    >
                      <p className="font-label-default text-label-default text-on-surface">
                        {proj.name}
                      </p>
                      <span className="font-meta-default text-meta-default text-secondary mt-0.5 block">
                        {proj.tech}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="font-meta-default text-[12px] text-outline italic">
                    Derived from extracted resume sections.
                  </p>
                )}
              </div>
            </div>

            {/* Section: Education */}
            <div className="space-y-2 pt-2 border-t border-outline-variant/20">
              <span className="font-table-header text-table-header uppercase text-secondary tracking-wider block">
                Education
              </span>
              <div>
                <p className="font-label-default text-label-default text-on-surface">
                  {candidate.education.degree}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-code-mono text-code-mono text-secondary">
                    {candidate.education.gpa}
                  </span>
                  <span className="text-outline-variant">•</span>
                  <span className="font-meta-default text-meta-default text-outline">
                    Accredited
                  </span>
                </div>
              </div>
            </div>

            {/* Section: Certifications */}
            <div className="space-y-2 pt-2 border-t border-outline-variant/20">
              <span className="font-table-header text-table-header uppercase text-secondary tracking-wider block">
                Certifications
              </span>
              <div className="flex items-center gap-1.5 text-outline">
                <span className="material-symbols-outlined text-[15px]">
                  not_interested
                </span>
                <span className="font-meta-default text-meta-default italic">
                  Not detected (Honest extraction)
                </span>
              </div>
            </div>

            {/* Recruiter Notes Form Field */}
            <div className="space-y-2.5 pt-3 border-t border-outline-variant/30">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="recruiterNotes"
                  className="font-table-header text-table-header uppercase text-on-surface tracking-wider"
                >
                  Recruiter Evaluation Notes
                </label>
                <span className="font-code-mono text-[10px] text-outline">
                  {saveStatus}
                </span>
              </div>
              <textarea
                id="recruiterNotes"
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add recruiter evaluation notes here..."
                className="w-full p-2.5 rounded-[6px] border border-outline-variant/50 bg-surface-container-lowest font-body-default text-body-default text-on-surface placeholder:text-outline focus:outline-none focus:border-on-surface focus:ring-1 focus:ring-on-surface transition-all resize-none"
              />
              <div className="flex items-center justify-between pt-1">
                <span className="font-meta-default text-[11px] text-outline">
                  Visible to internal hiring panel
                </span>
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  className="inline-flex items-center gap-1 h-7 px-3 rounded-[4px] bg-primary text-on-primary font-label-default text-[12px] hover:bg-[#1e293b] transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {isSaved ? "check" : "save"}
                  </span>
                  <span>{isSaved ? "Saved" : "Save Note"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Candidate Meta Document Snapshot Card */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-[6px] p-4 text-secondary flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-surface-container-low border border-outline-variant/30 flex items-center justify-center text-on-surface">
                <span className="material-symbols-outlined text-[18px]">
                  verified
                </span>
              </div>
              <div>
                <p className="font-label-default text-label-default text-on-surface leading-tight">
                  Checksum Verified
                </p>
                <span className="font-code-mono text-[10px] text-outline">
                  {candidate.checksum}
                </span>
              </div>
            </div>
            <span className="font-meta-default text-[11px] text-secondary">
              Logged
            </span>
          </div>
        </aside>
      </div>
    </div>
  );
}
