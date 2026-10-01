"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StepIndicator } from "@/components/ui/StepIndicator";
import { analysisService } from "@/services/analysisService";
import { ApiError } from "@/services/api";
import { SkillTag } from "@/components/ui/SkillTag";
import { ProgressBar } from "@/components/data-display/ProgressBar";
import { Button } from "@/components/ui/Button";
import { MOCK_PIPELINE_CONFIG } from "@/lib/mockData";

export default function RequirementsReviewPage() {
  const router = useRouter();
  const [isExecuting, setIsExecuting] = useState(false);
  const [execError, setExecError] = useState<string | null>(null);

  const handleRunAnalysis = async () => {
    const stagedFiles = analysisService.getStagedFiles();
    const jdText = analysisService.getStagedJobDescription();

    if (stagedFiles.length > 0 && jdText) {
      setIsExecuting(true);
      setExecError(null);
      try {
        await analysisService.runRealAnalysis(stagedFiles, jdText);
        router.push("/analysis");
      } catch (err: unknown) {
        setIsExecuting(false);
        setExecError(
          err instanceof ApiError
            ? err.message
            : "Failed to run analysis with FastAPI backend."
        );
      }
    } else {
      router.push("/analysis");
    }
  };

  const [requiredSkills, setRequiredSkills] = useState<string[]>(
    MOCK_PIPELINE_CONFIG.requiredSkills
  );
  const [preferredSkills, setPreferredSkills] = useState<string[]>(
    MOCK_PIPELINE_CONFIG.preferredSkills
  );

  const [newRequiredInput, setNewRequiredInput] = useState("");
  const [showAddRequired, setShowAddRequired] = useState(false);

  const [newPreferredInput, setNewPreferredInput] = useState("");
  const [showAddPreferred, setShowAddPreferred] = useState(false);

  const handleAddRequired = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRequiredInput.trim()) {
      setRequiredSkills((prev) => [...prev, newRequiredInput.trim()]);
      setNewRequiredInput("");
      setShowAddRequired(false);
    }
  };

  const handleAddPreferred = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPreferredInput.trim()) {
      setPreferredSkills((prev) => [...prev, newPreferredInput.trim()]);
      setNewPreferredInput("");
      setShowAddPreferred(false);
    }
  };

  const removeRequired = (skill: string) => {
    setRequiredSkills((prev) => prev.filter((s) => s !== skill));
  };

  const removePreferred = (skill: string) => {
    setPreferredSkills((prev) => prev.filter((s) => s !== skill));
  };

  return (
    <div className="max-w-[1200px] w-full mx-auto space-y-6">
      {/* Top Workflow Bar & Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-outline-variant/30">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 font-meta-medium text-meta-medium text-secondary">
              <span className="w-1.5 h-1.5 rounded-full bg-on-surface" />
              Requisition {MOCK_PIPELINE_CONFIG.reqId}
            </span>
            <span className="text-outline-variant font-meta-default text-meta-default">
              /
            </span>
            <span className="font-meta-default text-meta-default text-outline">
              {MOCK_PIPELINE_CONFIG.batchId}
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
            Review Requirements
          </h1>
          <p className="font-body-default text-body-default text-secondary mt-1">
            Confirm the requirements extracted from the job description before running candidate analysis.
          </p>
        </div>

        {/* Step Indicator */}
        <StepIndicator currentStep={3} />
      </div>

      {/* Top Grid — Extracted Requirements (Two columns) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left: Required Skills */}
        <div className="md:col-span-6 bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-6 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-primary" />
                <h2 className="font-label-default text-label-default uppercase tracking-wider text-on-surface font-semibold">
                  Required Skills (Must-Have)
                </h2>
              </div>
              <span className="font-code-mono text-[11px] px-2 py-0.5 rounded bg-surface-container-low text-secondary border border-outline-variant/30">
                {requiredSkills.length} items
              </span>
            </div>
            <p className="font-meta-default text-meta-default text-secondary mt-1">
              Must be verified in resume for core coverage score (30% weight).
            </p>

            <div className="flex flex-wrap gap-2 mt-4">
              {requiredSkills.map((skill) => (
                <SkillTag
                  key={skill}
                  name={skill}
                  variant="removable"
                  onRemove={() => removeRequired(skill)}
                />
              ))}

              {showAddRequired ? (
                <form
                  onSubmit={handleAddRequired}
                  className="inline-flex items-center gap-1"
                >
                  <input
                    type="text"
                    autoFocus
                    value={newRequiredInput}
                    onChange={(e) => setNewRequiredInput(e.target.value)}
                    placeholder="Skill name..."
                    className="h-[34px] px-2.5 rounded-lg border border-outline-variant/60 font-body-medium text-body-medium text-on-surface focus:outline-none focus:border-primary"
                  />
                  <button
                    type="submit"
                    className="h-[34px] px-2.5 rounded-lg bg-primary text-on-primary font-label-default text-label-default cursor-pointer"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddRequired(false)}
                    className="h-[34px] px-2 text-outline hover:text-on-surface cursor-pointer"
                  >
                    ✕
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowAddRequired(true)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 border border-dashed border-outline-variant/60 rounded-lg font-label-default text-label-default text-secondary hover:border-on-surface hover:text-on-surface bg-surface-container-low/30 hover:bg-surface-container-low transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    add
                  </span>
                  <span>Add skill</span>
                </button>
              )}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-outline-variant/20 flex items-center justify-between">
            <span className="font-meta-default text-meta-default text-outline">
              Weight allocation
            </span>
            <span className="font-code-mono text-meta-medium text-on-surface">
              30.00%
            </span>
          </div>
        </div>

        {/* Right: Preferred Skills */}
        <div className="md:col-span-6 bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-6 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full border border-secondary" />
                <h2 className="font-label-default text-label-default uppercase tracking-wider text-on-surface font-semibold">
                  Preferred Skills (Nice-To-Have)
                </h2>
              </div>
              <span className="font-code-mono text-[11px] px-2 py-0.5 rounded bg-surface-container-low text-secondary border border-outline-variant/30">
                {preferredSkills.length} items
              </span>
            </div>
            <p className="font-meta-default text-meta-default text-secondary mt-1">
              Optional contextual competencies.
            </p>

            <div className="flex flex-wrap gap-2 mt-4">
              {preferredSkills.map((skill) => (
                <SkillTag
                  key={skill}
                  name={skill}
                  variant="removable"
                  onRemove={() => removePreferred(skill)}
                />
              ))}

              {showAddPreferred ? (
                <form
                  onSubmit={handleAddPreferred}
                  className="inline-flex items-center gap-1"
                >
                  <input
                    type="text"
                    autoFocus
                    value={newPreferredInput}
                    onChange={(e) => setNewPreferredInput(e.target.value)}
                    placeholder="Skill name..."
                    className="h-[34px] px-2.5 rounded-lg border border-outline-variant/60 font-body-medium text-body-medium text-on-surface focus:outline-none focus:border-primary"
                  />
                  <button
                    type="submit"
                    className="h-[34px] px-2.5 rounded-lg bg-primary text-on-primary font-label-default text-label-default cursor-pointer"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddPreferred(false)}
                    className="h-[34px] px-2 text-outline hover:text-on-surface cursor-pointer"
                  >
                    ✕
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowAddPreferred(true)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 border border-dashed border-outline-variant/60 rounded-lg font-label-default text-label-default text-secondary hover:border-on-surface hover:text-on-surface bg-surface-container-low/30 hover:bg-surface-container-low transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    add
                  </span>
                  <span>Add skill</span>
                </button>
              )}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-outline-variant/20 flex items-center justify-between">
            <span className="font-meta-default text-meta-default text-outline">
              Bonus contextual modifier
            </span>
            <span className="font-code-mono text-meta-medium text-secondary">
              +5.00% cap
            </span>
          </div>
        </div>
      </div>

      {/* Job Context & Parsed Responsibilities Panel */}
      <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20 mb-5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-outline text-[18px]">
              fact_check
            </span>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">
              Job Context & Parsed Responsibilities
            </h3>
          </div>
          <span className="font-meta-default text-meta-default text-outline">
            Extracted from{" "}
            <span className="font-code-mono text-on-surface">
              JD_ML_Intern_2025.pdf
            </span>
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sub-section 1: Job Parameters */}
          <div className="lg:col-span-5 space-y-3.5 pr-0 lg:pr-6 border-b lg:border-b-0 lg:border-r border-outline-variant/20 pb-4 lg:pb-0">
            <span className="font-table-header text-table-header text-outline uppercase tracking-wider block">
              Job Parameters
            </span>
            <div className="space-y-2.5">
              <div className="flex items-start justify-between gap-4 py-1">
                <span className="font-body-default text-body-default text-secondary">
                  Target Requisition
                </span>
                <span className="font-body-medium text-body-medium text-on-surface text-right">
                  {MOCK_PIPELINE_CONFIG.targetRequisition}
                </span>
              </div>
              <div className="flex items-start justify-between gap-4 py-1 border-t border-outline-variant/15">
                <span className="font-body-default text-body-default text-secondary">
                  Experience
                </span>
                <span className="font-body-medium text-body-medium text-on-surface text-right">
                  {MOCK_PIPELINE_CONFIG.experience}
                </span>
              </div>
              <div className="flex items-start justify-between gap-4 py-1 border-t border-outline-variant/15">
                <span className="font-body-default text-body-default text-secondary">
                  Education
                </span>
                <span className="font-body-medium text-body-medium text-on-surface text-right">
                  {MOCK_PIPELINE_CONFIG.education}
                </span>
              </div>
              <div className="flex items-start justify-between gap-4 py-1 border-t border-outline-variant/15">
                <span className="font-body-default text-body-default text-secondary">
                  Work Authorization
                </span>
                <span className="font-body-medium text-body-medium text-on-surface text-right">
                  {MOCK_PIPELINE_CONFIG.workAuthorization}
                </span>
              </div>
            </div>
          </div>

          {/* Sub-section 2: Parsed Core Responsibilities */}
          <div className="lg:col-span-7 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="font-table-header text-table-header text-outline uppercase tracking-wider">
                Parsed Core Responsibilities
              </span>
              <span className="font-meta-default text-meta-default text-outline">
                Semantic benchmark
              </span>
            </div>
            <ul className="space-y-2 text-body-default font-body-default text-on-surface">
              {MOCK_PIPELINE_CONFIG.parsedResponsibilities.map((resp, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 p-2 rounded-lg bg-surface-container-low/40"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary mt-2 flex-shrink-0" />
                  <span>{resp}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Processing Status Section */}
      <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-label-default text-[15px] font-semibold text-on-surface">
                Analysis Pipeline Status
              </h3>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-code-mono font-medium bg-surface-container-high text-on-surface">
                RUNNING
              </span>
            </div>
            <p className="font-body-default text-body-default text-secondary mt-0.5">
              ResumeIQ is processing 24 resumes against {requiredSkills.length} verified required skills.
            </p>
          </div>
          <div className="text-right">
            <span className="font-code-mono text-headline-sm text-headline-sm font-semibold text-on-surface">
              {MOCK_PIPELINE_CONFIG.pipelineProgress}%
            </span>
            <span className="font-meta-default text-meta-default text-outline block">
              ETA {MOCK_PIPELINE_CONFIG.pipelineEta}
            </span>
          </div>
        </div>

        {/* Thin Progress Bar */}
        <ProgressBar
          value={MOCK_PIPELINE_CONFIG.pipelineProgress}
          height="md"
          className="mb-6"
        />

        {/* Step Checklist */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 font-body-default text-body-default">
          {MOCK_PIPELINE_CONFIG.stages.map((stage) => {
            const isCompleted = stage.status === "completed";
            const isInProgress = stage.status === "in_progress";
            return (
              <div
                key={stage.id}
                className={`p-3 rounded-lg border transition-colors ${
                  isInProgress
                    ? "border-on-surface/40 bg-surface-container-low"
                    : isCompleted
                    ? "border-outline-variant/20 bg-surface-container-low/30"
                    : "border-outline-variant/20 bg-surface-container-lowest text-outline"
                }`}
              >
                <div className="flex items-center justify-between text-on-surface">
                  <span
                    className={`font-label-default text-label-default ${
                      isInProgress ? "font-semibold" : "font-medium"
                    }`}
                  >
                    {stage.name}
                  </span>
                  {isCompleted && (
                    <span
                      className="material-symbols-outlined text-[16px] text-on-surface"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      check_circle
                    </span>
                  )}
                  {isInProgress && (
                    <span className="material-symbols-outlined text-[16px] text-primary animate-spin">
                      progress_activity
                    </span>
                  )}
                  {!isCompleted && !isInProgress && (
                    <span className="material-symbols-outlined text-[16px] text-outline">
                      radio_button_unchecked
                    </span>
                  )}
                </div>
                <span
                  className={`font-code-mono text-meta-default block mt-1 ${
                    isInProgress
                      ? "text-on-surface-variant font-medium"
                      : "text-outline"
                  }`}
                >
                  {stage.detail}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {execError && (
        <div className="p-4 rounded-lg bg-[#ef4444]/10 border border-[#ef4444]/30 text-on-surface flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[#ef4444] text-[20px] shrink-0 mt-0.5">error</span>
            <p className="font-body-default text-[#ef4444]">{execError}</p>
          </div>
          <button type="button" onClick={() => setExecError(null)} className="text-outline hover:text-on-surface">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {/* Footer Action Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-outline-variant/30 select-none">
        <div className="flex items-center gap-2 text-secondary">
          <span className="material-symbols-outlined text-[18px] text-outline">
            info
          </span>
          <span className="font-meta-default text-meta-default">
            Scoring formula:{" "}
            <strong className="font-medium text-on-surface">
              70% TF-IDF Text Similarity + 30% Required Skill Coverage
            </strong>
            . Auditable decision support.
          </span>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <Link href="/new-analysis">
            <Button variant="secondary" size="md">
              Back to Upload
            </Button>
          </Link>

          <Button
            variant="primary"
            size="md"
            icon={isExecuting ? "progress_activity" : "arrow_forward"}
            iconPosition="right"
            disabled={isExecuting}
            onClick={handleRunAnalysis}
          >
            {isExecuting ? "Analyzing Resumes..." : "Run Analysis & Rank Candidates"}
          </Button>
        </div>
      </div>
    </div>
  );
}
