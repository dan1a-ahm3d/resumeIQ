import React from "react";
import { RequirementEvidence } from "@/types/candidate";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";

interface RequirementEvidenceTableProps {
  evidenceList: RequirementEvidence[];
  className?: string;
}

export function RequirementEvidenceTable({
  evidenceList,
  className,
}: RequirementEvidenceTableProps) {
  return (
    <div
      className={cn(
        "bg-surface-container-lowest border border-outline-variant/40 rounded-[6px] overflow-hidden shadow-xs",
        className
      )}
    >
      <div className="p-4 border-b border-outline-variant/30 flex items-center justify-between bg-surface-container-lowest">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-on-surface">
            fact_check
          </span>
          <h2 className="font-headline-sm text-headline-sm text-on-surface">
            Requirement Evidence
          </h2>
        </div>
        <span className="font-code-mono text-code-mono text-secondary">
          {evidenceList.length} Requirements Analyzed
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low border-b border-outline-variant/30 h-8 select-none">
              <th className="py-2 px-4 font-table-header text-table-header text-secondary uppercase tracking-wider w-[180px]">
                Requirement
              </th>
              <th className="py-2 px-3 font-table-header text-table-header text-secondary uppercase tracking-wider w-[150px]">
                Status
              </th>
              <th className="py-2 px-4 font-table-header text-table-header text-secondary uppercase tracking-wider">
                Exact Resume Citation / Evidence
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20 font-body-default text-body-default">
            {evidenceList.map((item, idx) => {
              const isMatched = item.status === "Matched";
              return (
                <tr
                  key={idx}
                  className="hover:bg-surface-container-low/40 transition-colors"
                >
                  <td className="py-3 px-4 align-top font-label-default text-label-default text-on-surface">
                    {item.requirement}
                  </td>
                  <td className="py-3 px-3 align-top whitespace-nowrap">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="py-3 px-4 align-top">
                    {isMatched ? (
                      <>
                        <p className="font-body-default text-[13px] text-on-surface leading-relaxed mb-1">
                          {item.citationText}
                        </p>
                        {item.sourceLocation && (
                          <span className="inline-flex items-center gap-1 font-code-mono text-[11px] text-secondary">
                            <span className="material-symbols-outlined text-[13px]">
                              description
                            </span>
                            Source: {item.sourceLocation}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="font-code-mono text-[12px] text-outline leading-relaxed block">
                        {item.citationText || "— (No explicit mention detected in submitted resume document)"}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
