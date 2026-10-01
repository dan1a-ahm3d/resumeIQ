"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { SkillTag } from "@/components/ui/SkillTag";
import { api, ResumeParseResponse, ApiError } from "@/services/api";

interface ResumeInspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: File | null;
}

export function ResumeInspectionModal({
  isOpen,
  onClose,
  file,
}: ResumeInspectionModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ResumeParseResponse | null>(null);

  useEffect(() => {
    if (!isOpen || !file) {
      setData(null);
      setError(null);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    api
      .analyzeResume(file)
      .then((res) => {
        if (isMounted) {
          setData(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(
            err instanceof ApiError
              ? err.message
              : "Failed to extract resume text from backend."
          );
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, file]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-outline-variant/20 flex items-center justify-between bg-surface-container-low/40">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-primary text-[22px]">
              description
            </span>
            <div>
              <h2 className="font-headline-sm text-headline-sm text-on-surface">
                Resume Extraction & Analysis
              </h2>
              <p className="font-meta-default text-meta-default text-outline mt-0.5">
                Backend extraction endpoint: POST /api/v1/analyze/resume
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-outline hover:text-on-surface p-1 rounded-full hover:bg-surface-container transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {loading && (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
              <span className="material-symbols-outlined text-[32px] text-primary animate-spin">
                progress_activity
              </span>
              <p className="font-body-medium text-body-medium text-on-surface">
                Extracting PDF text and detecting skills via FastAPI backend...
              </p>
              <span className="font-code-mono text-[11px] text-outline">
                {file?.name} ({Math.round((file?.size || 0) / 1024)} KB)
              </span>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-lg bg-[#ef4444]/10 border border-[#ef4444]/30 text-on-surface flex items-start gap-3">
              <span className="material-symbols-outlined text-[#ef4444] text-[20px] shrink-0 mt-0.5">
                error
              </span>
              <div className="space-y-1">
                <p className="font-label-default font-semibold text-[#ef4444]">
                  Analysis Error
                </p>
                <p className="font-body-default text-body-default text-on-surface-variant">
                  {error}
                </p>
              </div>
            </div>
          )}

          {!loading && !error && data && (
            <div className="space-y-5">
              {/* Document Overview Metadata */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/30 flex flex-col">
                  <span className="font-table-header text-[10px] text-outline uppercase tracking-wider">
                    Filename
                  </span>
                  <span className="font-code-mono text-[12px] text-on-surface truncate mt-1" title={data.parsed_resume.filename}>
                    {data.parsed_resume.filename}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/30 flex flex-col">
                  <span className="font-table-header text-[10px] text-outline uppercase tracking-wider">
                    Pages
                  </span>
                  <span className="font-code-mono text-[13px] text-on-surface font-semibold mt-1">
                    {data.parsed_resume.pages.length}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/30 flex flex-col">
                  <span className="font-table-header text-[10px] text-outline uppercase tracking-wider">
                    Full Text Length
                  </span>
                  <span className="font-code-mono text-[13px] text-on-surface font-semibold mt-1">
                    {data.parsed_resume.full_text.length} chars
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/30 flex flex-col">
                  <span className="font-table-header text-[10px] text-outline uppercase tracking-wider">
                    Skills Detected
                  </span>
                  <span className="font-code-mono text-[13px] text-on-surface font-semibold mt-1">
                    {data.detected_skills.length}
                  </span>
                </div>
              </div>

              {/* Detected Skills Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-table-header text-table-header uppercase text-secondary tracking-wider">
                    Detected Skills ({data.detected_skills.length})
                  </span>
                  <span className="font-code-mono text-[11px] text-outline">
                    Controlled Taxonomy
                  </span>
                </div>
                {data.detected_skills.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 p-3 rounded-lg bg-surface-container-low/50 border border-outline-variant/30 max-h-36 overflow-y-auto">
                    {data.detected_skills.map((ev, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-container border border-outline-variant/40 text-[11px] font-code-mono text-on-surface"
                        title={`Page ${ev.page_number || 1}: \"${ev.context}\"`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        <span>{ev.skill}</span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="font-meta-default text-outline italic">
                    No matching taxonomy skills detected in extracted text.
                  </p>
                )}
              </div>

              {/* Warnings Section (if any) */}
              {data.warnings && data.warnings.length > 0 && (
                <div className="p-3.5 rounded-lg bg-surface-container-high border border-outline-variant/40 space-y-1">
                  <span className="font-label-default text-[12px] font-semibold text-on-surface flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[15px] text-outline">
                      warning
                    </span>
                    Extraction Warnings
                  </span>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px] font-meta-default text-outline">
                    {data.warnings.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Extracted Text Preview Box */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-table-header text-table-header uppercase text-secondary tracking-wider">
                    Extracted Text Preview
                  </span>
                  <span className="font-code-mono text-[11px] text-outline">
                    PyMuPDF Raw Text Stream
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/30 max-h-48 overflow-y-auto font-code-mono text-[11px] leading-relaxed text-on-surface whitespace-pre-wrap select-text">
                  {data.parsed_resume.full_text || "No text could be extracted from this PDF."}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-outline-variant/20 bg-surface-container-low/40 flex items-center justify-between">
          <span className="font-meta-default text-[11px] text-outline">
            ResumeIQ Decision Support Engine • FastAPI
          </span>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
