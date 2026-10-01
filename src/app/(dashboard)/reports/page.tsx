"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { MetricCard } from "@/components/ui/MetricCard";
import { Button } from "@/components/ui/Button";
import { CustomReportModal } from "@/components/modules/CustomReportModal";
import {
  MOCK_EXPORT_DOSSIERS,
  MOCK_REPORTS_METRICS,
} from "@/lib/mockData";
import { reportsService } from "@/services/reportsService";
import { ExportDossier } from "@/types/report";

export default function ReportsPage() {
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [dossiers, setDossiers] = useState<ExportDossier[]>(MOCK_EXPORT_DOSSIERS);

  const handleDownload = async (dossierId: string, format: "PDF" | "CSV") => {
    try {
      const filename = await reportsService.downloadReport(dossierId, format);
      setDownloadNotice(`Successfully generated and downloaded: ${filename}`);
      setTimeout(() => setDownloadNotice(null), 4000);
    } catch {
      setDownloadNotice(`Download failed for ${dossierId}. Please try again.`);
      setTimeout(() => setDownloadNotice(null), 4000);
    }
  };

  const handleCustomReportSuccess = (filename: string) => {
    setDownloadNotice(`Generated and downloaded custom dossier: ${filename}`);
    setTimeout(() => setDownloadNotice(null), 5000);

    const newEntry: ExportDossier = {
      id: "dos-custom-" + Date.now().toString().slice(-4),
      reportName: `Custom Export — ${filename.replace(/^resumeiq-custom-analysis-/, "").replace(/\.\w+$/, "")}`,
      reqId: "REQ-4092",
      department: "AI & Analytics",
      candidateCount: 24,
      dateCreated: "Just now",
      formats: [filename.endsWith(".pdf") ? "PDF" : "CSV"],
    };
    setDossiers((prev) => [newEntry, ...prev]);
  };

  return (
    <div className="max-w-[1240px] w-full mx-auto pb-space-xl space-y-space-lg">
      {/* Top Action & View Header */}
      <PageHeader
        title="Reports & Export Dossiers"
        description="Auditable export packages and historical verification dossiers formatted for compliance."
        actions={
          <>
            <Button
              variant="secondary"
              icon="history"
              onClick={() => {
                setDownloadNotice("Compliance audit log verified: All candidate citations correspond with extracted text.");
                setTimeout(() => setDownloadNotice(null), 3500);
              }}
            >
              Audit Log
            </Button>
            <Button
              variant="dark"
              icon="file_download"
              onClick={() => setIsModalOpen(true)}
            >
              Generate Custom Export
            </Button>
          </>
        }
      />

      {/* Metrics Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-space-md">
        <MetricCard
          title="Generated Dossiers"
          value={dossiers.length}
          icon="inventory_2"
          subtext="total exports"
        />
        <MetricCard
          title="Candidates Evaluated"
          value="2,419"
          icon="groups"
          subtext="across 42 roles"
        />
        <MetricCard
          title="Audit Checkpoints"
          value={`${MOCK_REPORTS_METRICS.auditCheckpointsPercent}%`}
          icon="verified_user"
          subtext="EEOC compliant"
        />
        <MetricCard
          title="Vector Calibration"
          value={MOCK_REPORTS_METRICS.vectorCalibration}
          icon="tune"
          subtext="cosine anchor"
        />
      </div>

      {/* Download notice banner */}
      {downloadNotice && (
        <div className="p-3 bg-surface-container text-on-surface font-meta-medium text-meta-medium rounded-[4px] border border-outline-variant/30 flex items-center justify-between gap-2 animate-in fade-in-50">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-secondary">
              check_circle
            </span>
            <span>{downloadNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setDownloadNotice(null)}
            className="text-secondary hover:text-on-surface text-xs font-semibold cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* SECTION — REPORTS & EXPORT DOSSIERS */}
      <section className="bg-surface-container-lowest rounded-[6px] p-6 shadow-xs border border-outline-variant/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm mb-4">
          <div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">
              Exported Candidate Analyses
            </h2>
            <p className="font-meta-default text-meta-default text-secondary mt-0.5">
              Historical verification packages formatted for legal compliance and executive calibration.
            </p>
          </div>
          <div className="flex items-center gap-space-xs">
            <span className="font-code-mono text-code-mono bg-surface-container-low text-secondary px-2 py-0.5 rounded-[4px]">
              Displaying {dossiers.length} of 42 records
            </span>
          </div>
        </div>

        {/* Data Table */}
        <div className="w-full overflow-x-auto rounded-[4px] bg-surface-container-low/40 border border-outline-variant/20">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="h-8 bg-surface-container-low text-secondary border-b border-outline-variant/20 select-none">
                <th className="px-3.5 font-table-header text-table-header uppercase tracking-wider">
                  Report Name
                </th>
                <th className="px-3.5 font-table-header text-table-header uppercase tracking-wider">
                  Requisition / Role
                </th>
                <th className="px-3.5 font-table-header text-table-header uppercase tracking-wider">
                  Candidates
                </th>
                <th className="px-3.5 font-table-header text-table-header uppercase tracking-wider">
                  Created Date
                </th>
                <th className="px-3.5 font-table-header text-table-header uppercase tracking-wider">
                  Formats
                </th>
                <th className="px-3.5 font-table-header text-table-header uppercase tracking-wider text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-surface-container-lowest font-body-default text-body-default text-on-surface divide-y divide-outline-variant/15">
              {dossiers.map((dossier) => (
                <tr
                  key={dossier.id}
                  className="h-10 hover:bg-surface-container-low/50 transition-colors"
                >
                  <td className="px-3.5 py-2 font-body-medium text-body-medium text-on-surface">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-secondary">
                        description
                      </span>
                      <span className="truncate max-w-[280px]">
                        {dossier.reportName}
                      </span>
                    </div>
                  </td>
                  <td className="px-3.5 py-2">
                    <span className="font-code-mono text-code-mono text-secondary">
                      {dossier.reqId}
                    </span>
                    <span className="text-secondary/70 text-meta-default ml-1 font-meta-default">
                      ({dossier.department})
                    </span>
                  </td>
                  <td className="px-3.5 py-2 font-code-mono text-code-mono text-on-surface">
                    {dossier.candidateCount} candidates
                  </td>
                  <td className="px-3.5 py-2 text-secondary font-meta-default text-meta-default">
                    {dossier.dateCreated}
                  </td>
                  <td className="px-3.5 py-2">
                    <div className="flex items-center gap-1 select-none">
                      {dossier.formats.map((fmt) => (
                        <span
                          key={fmt}
                          className="bg-surface-container text-on-surface text-[11px] font-code-mono px-1.5 py-0.5 rounded-[3px]"
                        >
                          {fmt}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-3.5 py-2 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleDownload(dossier.id, "PDF")}
                        className="h-7 px-2.5 bg-surface-container-lowest hover:bg-surface-container-low text-on-surface font-meta-medium text-meta-medium rounded-[4px] shadow-xs border border-outline-variant/30 transition-colors cursor-pointer"
                        title="Download auditable PDF dossier"
                      >
                        Download PDF
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownload(dossier.id, "CSV")}
                        className="h-7 px-2.5 bg-surface-container-lowest hover:bg-surface-container-low text-on-surface font-meta-medium text-meta-medium rounded-[4px] shadow-xs border border-outline-variant/30 transition-colors cursor-pointer"
                        title="Download structured CSV table"
                      >
                        Download CSV
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footnote */}
        <div className="flex items-center gap-2 mt-4 text-secondary font-meta-default text-meta-default select-none">
          <span className="material-symbols-outlined text-[15px] text-secondary">
            verified
          </span>
          <span>
            All exported dossiers include complete verbatim citation logs and EEOC audit parity checkpoints.
          </span>
        </div>
      </section>

      {/* Custom Report Configuration Modal */}
      <CustomReportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleCustomReportSuccess}
      />
    </div>
  );
}
