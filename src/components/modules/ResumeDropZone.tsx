"use client";

import React, { useState, useRef } from "react";
import { StagedResume } from "@/types/analysis";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";

interface ResumeDropZoneProps {
  resumes: StagedResume[];
  onRemoveResume: (id: string) => void;
  onAddFiles?: (files: FileList | File[]) => void;
  rawFiles?: File[];
  onInspectFile?: (file: File) => void;
  maxSlots?: number;
  className?: string;
}

export function ResumeDropZone({
  resumes,
  onRemoveResume,
  onAddFiles,
  rawFiles = [],
  onInspectFile,
  maxSlots = 50,
  className,
}: ResumeDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onAddFiles?.(e.dataTransfer.files);
    }
  };

  const totalKb = resumes.reduce((acc, r) => acc + r.sizeKb, 0);

  return (
    <section
      className={cn(
        "bg-surface-container-lowest rounded-lg border border-outline-variant/30 p-space-lg flex flex-col",
        className
      )}
    >
      <div className="flex items-center justify-between mb-space-md">
        <div>
          <h2 className="font-headline-sm text-headline-sm text-on-surface">
            Candidate Resumes
          </h2>
          <p className="font-meta-default text-meta-default text-outline mt-0.5">
            Ingest resume batch for structural parsing and semantic vector alignment.
          </p>
        </div>
        <div className="inline-flex items-center gap-1 px-2 py-1 rounded bg-surface-container text-on-surface font-code-mono text-[11px]">
          <span className="material-symbols-outlined text-[14px]">
            inventory_2
          </span>
          <span>
            {resumes.length} / {maxSlots} Slots
          </span>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            onAddFiles?.(e.target.files);
          }
        }}
      />

      {/* Drag and Drop Box */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "group cursor-pointer rounded-lg border border-dashed p-space-xl flex flex-col items-center justify-center text-center transition-all duration-150 select-none",
          isDragging
            ? "border-primary bg-surface-container-high/60"
            : "border-outline-variant/60 hover:border-primary/80 bg-surface-bright/50 hover:bg-surface-container-lowest"
        )}
      >
        <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface mb-space-sm group-hover:scale-105 transition-transform">
          <span className="material-symbols-outlined text-[22px]">
            cloud_upload
          </span>
        </div>
        <div className="flex items-center gap-1 font-body-medium text-body-medium text-on-surface mb-1">
          <span>Drop PDF resumes here or</span>
          <span className="text-on-surface font-headline-sm text-[14px] underline decoration-outline-variant underline-offset-2 hover:decoration-primary">
            choose files
          </span>
        </div>
        <p className="font-meta-default text-meta-default text-outline">
          PDF files only • Up to 50 resumes per batch • Max 15MB each
        </p>
      </div>

      {/* Uploaded Resumes Table */}
      {resumes.length > 0 && (
        <div className="mt-space-md border border-outline-variant/30 rounded-lg overflow-hidden bg-surface-container-lowest">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/70 border-b border-outline-variant/30 font-table-header text-table-header text-outline uppercase tracking-wider h-8">
                <th className="px-space-md py-1 font-semibold">Filename</th>
                <th className="px-space-md py-1 font-semibold">Pages</th>
                <th className="px-space-md py-1 font-semibold">Size</th>
                <th className="px-space-md py-1 font-semibold">Status</th>
                <th className="px-space-md py-1 font-semibold text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 font-body-default text-body-default text-on-surface">
              {resumes.map((resume) => {
                const matchedRawFile = rawFiles.find(
                  (f) => f.name === resume.filename
                );
                return (
                  <tr
                    key={resume.id}
                    className="hover:bg-surface-container-low/40 transition-colors h-10 group"
                  >
                    <td className="px-space-md py-2 font-code-mono text-[12px] flex items-center gap-2">
                      <span className="material-symbols-outlined text-outline text-[16px]">
                        picture_as_pdf
                      </span>
                      <span className="text-on-surface group-hover:underline">
                        {resume.filename}
                      </span>
                    </td>
                    <td className="px-space-md py-2 text-outline font-meta-default text-meta-default">
                      {resume.pages} {resume.pages === 1 ? "page" : "pages"}
                    </td>
                    <td className="px-space-md py-2 font-code-mono text-[11px] text-outline">
                      {resume.sizeKb} KB
                    </td>
                    <td className="px-space-md py-2">
                      <StatusBadge status={resume.status} />
                    </td>
                    <td className="px-space-md py-2 text-right">
                      {onInspectFile && matchedRawFile && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onInspectFile(matchedRawFile);
                          }}
                          className="text-outline hover:text-on-surface transition-colors p-1 rounded hover:bg-surface-container font-meta-medium text-meta-medium inline-flex items-center gap-0.5 cursor-pointer mr-2"
                          title={`Inspect ${resume.filename} structure and text`}
                        >
                          <span className="material-symbols-outlined text-[15px]">
                            find_in_page
                          </span>
                          <span className="text-[11px]">Inspect</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveResume(resume.id);
                        }}
                        className="text-outline hover:text-error transition-colors p-1 rounded hover:bg-surface-container font-meta-medium text-meta-medium inline-flex items-center gap-0.5 cursor-pointer"
                        title={`Remove ${resume.filename}`}
                      >
                        <span className="material-symbols-outlined text-[15px]">
                          close
                        </span>
                        <span className="text-[11px]">Remove</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-surface-container-low/50 border-t border-outline-variant/30 font-meta-default text-meta-default">
                <td
                  className="px-space-md py-2 text-outline flex items-center justify-between"
                  colSpan={5}
                >
                  <span className="font-code-mono text-[11px]">
                    {resumes.length} resumes staged • {totalKb} KB total
                  </span>
                  <span className="text-[11px] text-outline-variant">
                    Validation status: Passed
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </section>
  );
}
