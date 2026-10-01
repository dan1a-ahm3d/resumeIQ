"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { MOCK_ANALYSES, MOCK_CANDIDATE_RANKINGS } from "@/lib/mockData";
import { reportsService } from "@/services/reportsService";
import { CustomReportConfig } from "@/services/reportExportService";

interface CustomReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (filename: string) => void;
}

export function CustomReportModal({ isOpen, onClose, onSuccess }: CustomReportModalProps) {
  const [selectedReq, setSelectedReq] = useState<string>("REQ-4092");
  const [candidateScope, setCandidateScope] = useState<"all" | "top5">("all");
  const [includeScores, setIncludeScores] = useState<boolean>(true);
  const [includeCoverage, setIncludeCoverage] = useState<boolean>(true);
  const [includeMatched, setIncludeMatched] = useState<boolean>(true);
  const [includeMissing, setIncludeMissing] = useState<boolean>(true);
  const [includeEvidence, setIncludeEvidence] = useState<boolean>(true);
  const [includeSummary, setIncludeSummary] = useState<boolean>(true);
  const [format, setFormat] = useState<"PDF" | "CSV">("PDF");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const candidateIds =
        candidateScope === "top5"
          ? MOCK_CANDIDATE_RANKINGS.slice(0, 5).map((c) => c.id)
          : MOCK_CANDIDATE_RANKINGS.map((c) => c.id);

      const config: CustomReportConfig = {
        reqId: selectedReq,
        candidateIds,
        includeMatchScores: includeScores,
        includeSkillCoverage: includeCoverage,
        includeMatchedSkills: includeMatched,
        includeMissingSkills: includeMissing,
        includeRequirementEvidence: includeEvidence,
        includeCandidateSummary: includeSummary,
        format,
      };

      const filename = await reportsService.generateCustomExport(config);
      onSuccess(filename);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate report.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary-container/40 backdrop-blur-xs p-4">
      <div className="bg-surface-container-lowest rounded-lg border border-outline-variant/40 shadow-xl max-w-xl w-full p-6 text-on-surface flex flex-col gap-4 animate-in fade-in-50 zoom-in-95">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-outline-variant/20 pb-3">
          <div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">
              Configure Custom Export Dossier
            </h3>
            <p className="font-meta-default text-meta-default text-secondary mt-0.5">
              Select parameters and compliance sections to assemble an audit-ready evaluation package.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-secondary hover:text-on-surface p-1 rounded-sm transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {error && (
          <div className="p-2.5 bg-error-container/40 border border-error/30 text-error rounded text-xs">
            {error}
          </div>
        )}

        {/* Modal Form */}
        <div className="space-y-4 text-xs font-body-default">
          {/* Target Requisition */}
          <div>
            <label className="font-label-default text-label-default text-on-surface block mb-1">
              Select Requisition / Role:
            </label>
            <select
              value={selectedReq}
              onChange={(e) => setSelectedReq(e.target.value)}
              className="w-full h-8 px-2.5 rounded border border-outline-variant/40 bg-surface-container-lowest text-on-surface font-body-default text-body-default focus:outline-none focus:border-primary"
            >
              {MOCK_ANALYSES.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.id} ? {a.jobRole} ({a.department})
                </option>
              ))}
            </select>
          </div>

          {/* Candidate Scope */}
          <div>
            <label className="font-label-default text-label-default text-on-surface block mb-1">
              Candidate Scope:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center gap-2 p-2 rounded border border-outline-variant/30 bg-surface-container-low/40 cursor-pointer">
                <input
                  type="radio"
                  name="candidateScope"
                  checked={candidateScope === "all"}
                  onChange={() => setCandidateScope("all")}
                  className="accent-primary"
                />
                <span className="font-body-medium">All Ranked Candidates</span>
              </label>
              <label className="flex items-center gap-2 p-2 rounded border border-outline-variant/30 bg-surface-container-low/40 cursor-pointer">
                <input
                  type="radio"
                  name="candidateScope"
                  checked={candidateScope === "top5"}
                  onChange={() => setCandidateScope("top5")}
                  className="accent-primary"
                />
                <span className="font-body-medium">Top 5 Shortlist Only</span>
              </label>
            </div>
          </div>

          {/* Content Checklist */}
          <div>
            <label className="font-label-default text-label-default text-on-surface block mb-1.5">
              Include Data Sections:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeScores}
                  onChange={(e) => setIncludeScores(e.target.checked)}
                  className="accent-primary rounded"
                />
                <span>Document Match Scores (70/30)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeCoverage}
                  onChange={(e) => setIncludeCoverage(e.target.checked)}
                  className="accent-primary rounded"
                />
                <span>Skill Coverage & Similarity</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeMatched}
                  onChange={(e) => setIncludeMatched(e.target.checked)}
                  className="accent-primary rounded"
                />
                <span>Matched Skills Breakdown</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeMissing}
                  onChange={(e) => setIncludeMissing(e.target.checked)}
                  className="accent-primary rounded"
                />
                <span>Missing Requirements Notice</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeEvidence}
                  onChange={(e) => setIncludeEvidence(e.target.checked)}
                  className="accent-primary rounded"
                />
                <span>Verbatim Text Citations</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeSummary}
                  onChange={(e) => setIncludeSummary(e.target.checked)}
                  className="accent-primary rounded"
                />
                <span>Executive Candidate Summary</span>
              </label>
            </div>
          </div>

          {/* Export Format */}
          <div>
            <label className="font-label-default text-label-default text-on-surface block mb-1">
              Export Format:
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="exportFormat"
                  value="PDF"
                  checked={format === "PDF"}
                  onChange={() => setFormat("PDF")}
                  className="accent-primary"
                />
                <span className="font-body-medium">PDF Evaluation Dossier (.pdf)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="exportFormat"
                  value="CSV"
                  checked={format === "CSV"}
                  onChange={() => setFormat("CSV")}
                  className="accent-primary"
                />
                <span className="font-body-medium">Structured CSV Data Table (.csv)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2 border-t border-outline-variant/20 pt-4 mt-2">
          <Button variant="secondary" onClick={onClose} disabled={isGenerating}>
            Cancel
          </Button>
          <Button
            variant="dark"
            icon={isGenerating ? "hourglass_top" : "download"}
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? "Assembling Dossier..." : "Generate & Download"}
          </Button>
        </div>
      </div>
    </div>
  );
}
