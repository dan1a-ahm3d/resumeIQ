"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StepIndicator } from "@/components/ui/StepIndicator";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SkillTag } from "@/components/ui/SkillTag";
import { ResumeDropZone } from "@/components/modules/ResumeDropZone";
import { ResumeInspectionModal } from "@/components/modules/ResumeInspectionModal";
import { MOCK_PIPELINE_CONFIG, MOCK_STAGED_RESUMES } from "@/lib/mockData";
import { StagedResume } from "@/types/analysis";
import { analysisService } from "@/services/analysisService";
import { api, ApiError } from "@/services/api";

export default function NewAnalysisPage() {
  const router = useRouter();

  const [jobDescription, setJobDescription] = useState(
    MOCK_PIPELINE_CONFIG.jobDescriptionText
  );
  const [reqTitle, setReqTitle] = useState(MOCK_PIPELINE_CONFIG.reqTitle);
  const [department, setDepartment] = useState(MOCK_PIPELINE_CONFIG.department);
  const [reqId, setReqId] = useState(MOCK_PIPELINE_CONFIG.reqId);

  // Staged resumes UI model and actual File[] handles
  const [resumes, setResumes] = useState<StagedResume[]>(MOCK_STAGED_RESUMES);
  const [rawFiles, setRawFiles] = useState<File[]>([]);

  // Workflow states
  const [draftSaved, setDraftSaved] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Backend Health Status
  const [backendStatus, setBackendStatus] = useState<"checking" | "connected" | "offline">("checking");

  // Single resume inspection modal
  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [inspectFile, setInspectFile] = useState<File | null>(null);

  // Check backend health on mount
  useEffect(() => {
    let isMounted = true;
    api
      .healthCheck()
      .then((res) => {
        if (isMounted) {
          if (res.status === "ok") {
            setBackendStatus("connected");
          } else {
            setBackendStatus("offline");
          }
        }
      })
      .catch(() => {
        if (isMounted) setBackendStatus("offline");
      });

    // Sync any previously staged files in analysisService
    const existingStaged = analysisService.getStagedFiles();
    if (existingStaged.length > 0) {
      setRawFiles(existingStaged);
      setResumes(
        existingStaged.map((f, i) => ({
          id: `staged-${i}-${f.name}`,
          filename: f.name,
          pages: 1,
          sizeKb: Math.round(f.size / 1024) || 120,
          status: "Ready",
        }))
      );
    }

    return () => {
      isMounted = false;
    };
  }, []);

  const handleRemoveResume = (id: string) => {
    const itemToRemove = resumes.find((r) => r.id === id);
    setResumes((prev) => prev.filter((r) => r.id !== id));
    if (itemToRemove) {
      setRawFiles((prev) => prev.filter((f) => f.name !== itemToRemove.filename));
      analysisService.removeStagedFile(itemToRemove.filename);
    }
  };

  const handleAddFiles = (files: FileList | File[]) => {
    setAnalysisError(null);
    const fileArray = Array.from(files);
    const pdfFiles = fileArray.filter((f) =>
      f.name.toLowerCase().endsWith(".pdf")
    );

    if (pdfFiles.length < fileArray.length) {
      setAnalysisError("Only PDF documents (.pdf) are supported for resume analysis.");
    }

    if (pdfFiles.length === 0) return;

    const newItems: StagedResume[] = pdfFiles.map((f, i) => ({
      id: `staged-${Date.now()}-${i}`,
      filename: f.name,
      pages: 1,
      sizeKb: Math.round(f.size / 1024) || 120,
      status: "Ready",
    }));

    setResumes((prev) => [...prev, ...newItems]);
    setRawFiles((prev) => [...prev, ...pdfFiles]);
    analysisService.addStagedFiles(pdfFiles);
  };

  const handleInspectResume = (file: File) => {
    setInspectFile(file);
    setInspectModalOpen(true);
  };

  const handleLoadSampleTestCase = async () => {
    setAnalysisError(null);
    try {
      // 1. Fetch sample job description
      const jdRes = await fetch("/samples/ml_engineer.txt");
      if (jdRes.ok) {
        const jdText = await jdRes.text();
        setJobDescription(jdText);
        setReqTitle("Machine Learning Engineer");
        setDepartment("AI & Machine Learning");
        setReqId("REQ-4092");
      }

      // 2. Fetch sample candidate_alpha.pdf
      const pdfRes = await fetch("/samples/candidate_alpha.pdf");
      if (pdfRes.ok) {
        const pdfBlob = await pdfRes.blob();
        const sampleFile = new File([pdfBlob], "candidate_alpha.pdf", {
          type: "application/pdf",
        });

        // Replace or add to staged
        setResumes([
          {
            id: `sample-alpha-${Date.now()}`,
            filename: "candidate_alpha.pdf",
            pages: 1,
            sizeKb: Math.round(sampleFile.size / 1024) || 24,
            status: "Ready",
          },
        ]);
        setRawFiles([sampleFile]);
        analysisService.setStagedFiles([sampleFile]);
      }
    } catch {
      setAnalysisError("Could not load sample test files from local assets.");
    }
  };

  const handleSaveDraft = () => {
    analysisService.setStagedFiles(rawFiles);
    analysisService.setStagedJobDescription(jobDescription);
    analysisService.setStagedMetadata(reqTitle, reqId);
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 2000);
  };

  const handleContinueToReview = () => {
    analysisService.setStagedFiles(rawFiles);
    analysisService.setStagedJobDescription(jobDescription);
    analysisService.setStagedMetadata(reqTitle, reqId);
    router.push("/requirements-review");
  };

  const handleRunAnalysis = async () => {
    setAnalysisError(null);

    // Validation
    if (!jobDescription || !jobDescription.trim()) {
      setAnalysisError("Please enter or paste a job description before starting analysis.");
      return;
    }

    if (rawFiles.length === 0) {
      setAnalysisError(
        "Please upload at least one PDF resume or click 'Load Sample Test Case' to analyze."
      );
      return;
    }

    setIsAnalyzing(true);

    try {
      // Update metadata in service
      analysisService.setStagedMetadata(reqTitle, reqId);
      analysisService.setStagedJobDescription(jobDescription);

      // Execute real ranking against FastAPI endpoint POST /api/v1/analyze/rank
      await analysisService.runRealAnalysis(rawFiles, jobDescription);

      // Navigate to candidate ranking view
      router.push("/analysis");
    } catch (err: unknown) {
      setIsAnalyzing(false);
      if (err instanceof ApiError) {
        setAnalysisError(`Backend Analysis Error (${err.status}): ${err.message}`);
      } else {
        setAnalysisError(
          (err as Error)?.message ||
            "Unable to connect to ResumeIQ backend service. Ensure the FastAPI server is running on port 8001."
        );
      }
    }
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto pb-16">
      {/* Top Stepped Navigation & Workflow Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-space-lg mb-space-lg gap-space-md border-b border-outline-variant/30">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-space-xs text-outline font-meta-default text-meta-default uppercase tracking-wider mb-1">
            <span>Pipeline Setup</span>
            <span>/</span>
            <span className="text-on-surface-variant font-code-mono text-[11px]">
              {MOCK_PIPELINE_CONFIG.runId}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
              New Analysis
            </h1>
            {/* Backend Connectivity Status Indicator */}
            {backendStatus === "connected" && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-code-mono bg-[#15803d]/10 text-[#15803d] border border-[#15803d]/30">
                <span className="w-1.5 h-1.5 rounded-full bg-[#15803d]" />
                FastAPI Connected (:8001)
              </span>
            )}
            {backendStatus === "offline" && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-code-mono bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/30">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]" />
                Backend Offline (127.0.0.1:8001)
              </span>
            )}
          </div>
          <p className="font-body-default text-body-default text-outline">
            Stage candidate documents against algorithmic extraction benchmarks.
          </p>
        </div>

        {/* Stepped Workflow Indicator */}
        <StepIndicator currentStep={1} />
      </div>

      {/* Error Banner */}
      {analysisError && (
        <div className="mb-space-md p-4 rounded-lg bg-[#ef4444]/10 border border-[#ef4444]/30 text-on-surface flex items-start justify-between gap-3 animate-in fade-in duration-150">
          <div className="flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[#ef4444] text-[20px] shrink-0 mt-0.5">
              error
            </span>
            <div>
              <p className="font-label-default font-semibold text-[#ef4444]">
                Analysis Request Notice
              </p>
              <p className="font-body-default text-body-default text-on-surface-variant mt-0.5">
                {analysisError}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAnalysisError(null)}
            className="text-outline hover:text-on-surface p-1 rounded hover:bg-surface-container"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {/* Main Workspace Grid (65% / 35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* LEFT COLUMN (65% -> 8 of 12 columns) */}
        <div className="lg:col-span-8 flex flex-col gap-space-lg">
          {/* Panel 1: Job Description */}
          <section className="bg-surface-container-lowest rounded-lg border border-outline-variant/30 p-space-lg transition-all shadow-xs">
            <div className="flex items-center justify-between mb-space-xs">
              <div className="flex items-center gap-2">
                <label
                  htmlFor="job-desc"
                  className="font-headline-sm text-headline-sm text-on-surface"
                >
                  Job description
                </label>
                <span className="font-table-header text-table-header uppercase px-1.5 py-0.5 rounded bg-surface-container text-outline">
                  Input source
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleLoadSampleTestCase}
                  className="font-meta-medium text-[11px] text-primary hover:underline inline-flex items-center gap-1 cursor-pointer"
                  title="Loads candidate_alpha.pdf and ml_engineer.txt for instant verification"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    folder_open
                  </span>
                  <span>Load Sample Test Case</span>
                </button>
                <div className="flex items-center gap-1 text-outline font-meta-default text-meta-default">
                  <span className="material-symbols-outlined text-[16px]">
                    history
                  </span>
                  <span className="font-code-mono text-[11px]">Synced</span>
                </div>
              </div>
            </div>

            <p className="font-body-default text-body-default text-outline mb-space-md">
              Paste raw job description or requirement rubric to parse matching vectors.
            </p>

            <div className="relative rounded-lg border border-outline-variant/40 bg-surface-bright/40 focus-within:border-primary focus-within:bg-surface-container-lowest transition-colors">
              <textarea
                id="job-desc"
                rows={9}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste candidate benchmark text or full posting..."
                className="w-full bg-transparent p-3.5 font-code-mono text-[13px] leading-relaxed text-on-surface placeholder:text-outline/60 focus:outline-none resize-y"
              />

              <div className="flex flex-wrap items-center justify-between px-3 py-2 border-t border-outline-variant/20 bg-surface-container-lowest text-outline text-meta-default font-meta-default">
                <div className="flex items-center gap-space-sm">
                  <span className="text-outline font-code-mono text-[11px]">
                    UTF-8 encoded
                  </span>
                </div>
                <div className="inline-flex items-center gap-2 font-code-mono text-[11px] text-on-surface-variant">
                  <span>{jobDescription.length} characters</span>
                  <span className="text-outline-variant">•</span>
                  <span className="inline-flex items-center gap-1 font-body-medium text-body-medium text-on-surface">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Target requirements ready
                  </span>
                </div>
              </div>
            </div>

            {/* Semantic Parsed Badges Preview */}
            <div className="mt-space-md pt-space-sm flex items-center flex-wrap gap-1.5">
              <span className="font-table-header text-table-header uppercase text-outline mr-1 tracking-wider">
                Detected:
              </span>
              {MOCK_PIPELINE_CONFIG.detectedSkills.map((skill) => (
                <SkillTag key={skill} name={skill} variant="detected" />
              ))}
            </div>
          </section>

          {/* Panel 2: Resume Upload & Staging */}
          <ResumeDropZone
            resumes={resumes}
            rawFiles={rawFiles}
            onRemoveResume={handleRemoveResume}
            onAddFiles={handleAddFiles}
            onInspectFile={handleInspectResume}
          />
        </div>

        {/* RIGHT COLUMN (35% -> 4 of 12 columns) */}
        <aside className="lg:col-span-4 sticky top-20 flex flex-col gap-space-md">
          {/* Analysis Parameters & Information Panel */}
          <div className="bg-surface-container-lowest rounded-lg border border-outline-variant/30 p-space-lg flex flex-col gap-space-md shadow-xs">
            <div className="flex items-center justify-between pb-space-xs border-b border-outline-variant/20">
              <h3 className="font-headline-sm text-headline-sm text-on-surface">
                Analysis Information
              </h3>
              <span className="material-symbols-outlined text-outline text-[18px]">
                tune
              </span>
            </div>

            {/* Metadata Fields */}
            <div className="flex flex-col gap-space-md">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="req-title"
                  className="font-label-default text-label-default text-on-surface"
                >
                  Requisition / Job title
                </label>
                <Input
                  id="req-title"
                  value={reqTitle}
                  onChange={(e) => setReqTitle(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="req-dept"
                  className="font-label-default text-label-default text-on-surface"
                >
                  Department
                </label>
                <Input
                  id="req-dept"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="req-id"
                  className="font-label-default text-label-default text-on-surface"
                >
                  Requisition ID
                </label>
                <Input
                  id="req-id"
                  value={reqId}
                  onChange={(e) => setReqId(e.target.value)}
                  iconRight="tag"
                  className="font-code-mono text-[12px]"
                />
              </div>
            </div>

            {/* Explanatory Notice Box */}
            <div className="bg-surface-container-low rounded border border-outline-variant/30 p-3.5 flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 text-on-surface font-body-medium text-[13px]">
                <span className="material-symbols-outlined text-[16px] text-primary">
                  auto_read_play
                </span>
                <span>FastAPI Extraction Engine</span>
              </div>
              <p className="font-meta-default text-meta-default text-on-surface-variant leading-relaxed">
                Resumes will be parsed into text streams, analyzed with controlled NLP skill taxonomy, scored via TF-IDF cosine similarity, and ranked deterministically.
              </p>
            </div>

            {/* Methodology Reference */}
            <div className="rounded border border-outline-variant/20 bg-surface-bright p-3 flex flex-col gap-1">
              <span className="font-table-header text-table-header uppercase text-outline tracking-wider">
                Methodology Reference
              </span>
              <p className="font-code-mono text-[11px] text-on-surface-variant leading-normal">
                Scoring formula: <strong className="text-on-surface">70%</strong> Text Similarity + <strong className="text-on-surface">30%</strong> Required Skill Coverage.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-space-md border-t border-outline-variant/20 flex flex-col gap-2.5">
              {/* Primary Action: Direct analysis execution */}
              <Button
                variant="primary"
                size="lg"
                icon={isAnalyzing ? "progress_activity" : "bolt"}
                onClick={handleRunAnalysis}
                disabled={isAnalyzing}
                className="w-full"
              >
                {isAnalyzing ? "Analyzing Candidates..." : "Run Analysis & Rank Candidates"}
              </Button>

              {/* Multi-step review workflow action */}
              <Button
                variant="secondary"
                size="md"
                icon="arrow_forward"
                iconPosition="right"
                onClick={handleContinueToReview}
                disabled={isAnalyzing}
                className="w-full"
              >
                Continue to Requirements Review
              </Button>

              <Button
                variant="ghost"
                size="sm"
                icon="save"
                onClick={handleSaveDraft}
                className="w-full text-secondary"
              >
                {draftSaved ? "Draft Saved!" : "Save Staged Draft"}
              </Button>
            </div>

            <div className="text-center">
              <span className="font-meta-default text-[11px] text-outline">
                Source of truth: FastAPI Backend at 127.0.0.1:8001
              </span>
            </div>
          </div>

          {/* Quick Summary Mini-Card */}
          <div className="rounded-lg border border-outline-variant/20 bg-surface-container-low p-space-md flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-outline text-[18px]">
                verified_user
              </span>
              <span className="font-meta-medium text-meta-medium text-on-surface">
                Enterprise Compliance
              </span>
            </div>
            <span className="font-code-mono text-[11px] text-outline">
              SOC2 Type II
            </span>
          </div>
        </aside>
      </div>

      {/* Single Resume Inspection Modal */}
      <ResumeInspectionModal
        isOpen={inspectModalOpen}
        onClose={() => {
          setInspectModalOpen(false);
          setInspectFile(null);
        }}
        file={inspectFile}
      />
    </div>
  );
}
