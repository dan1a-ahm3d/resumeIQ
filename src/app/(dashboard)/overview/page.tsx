"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { MetricCard } from "@/components/ui/MetricCard";
import { FilterRibbon } from "@/components/ui/FilterRibbon";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Pagination } from "@/components/data-display/Pagination";
import { Button } from "@/components/ui/Button";
import { MOCK_ANALYSES, MOCK_OVERVIEW_METRICS } from "@/lib/mockData";
import { AnalysisSummary } from "@/types/analysis";
import { analysisService, OverviewMetrics } from "@/services/analysisService";

export default function OverviewPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [analyses, setAnalyses] = useState<AnalysisSummary[]>(MOCK_ANALYSES);
  const [metrics, setMetrics] = useState<OverviewMetrics>(MOCK_OVERVIEW_METRICS);
  const pageSize = 6;

  useEffect(() => {
    let isMounted = true;
    analysisService.getOverviewMetrics().then((m) => {
      if (isMounted) setMetrics(m);
    });
    analysisService.getRecentAnalyses().then((a) => {
      if (isMounted) setAnalyses(a);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter analyses
  const filteredAnalyses = useMemo(() => {
    return analyses.filter((item: AnalysisSummary) => {
      // Tab filter
      if (activeTab === "in-progress" && item.status !== "Processing") return false;
      if (activeTab === "completed" && item.status !== "Completed") return false;

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const roleMatch = item.jobRole.toLowerCase().includes(query);
        const deptMatch = item.department.toLowerCase().includes(query);
        const reqMatch = item.reqNumber.toLowerCase().includes(query);
        if (!roleMatch && !deptMatch && !reqMatch) return false;
      }
      return true;
    });
  }, [analyses, activeTab, searchQuery]);

  // Paginated analyses
  const paginatedAnalyses = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredAnalyses.slice(startIndex, startIndex + pageSize);
  }, [filteredAnalyses, currentPage]);

  const totalPages = Math.ceil(filteredAnalyses.length / pageSize) || 1;

  const tabOptions = [
    { key: "all", label: "All", count: analyses.length },
    {
      key: "in-progress",
      label: "In progress",
      count: analyses.filter((a) => a.status === "Processing").length,
    },
    {
      key: "completed",
      label: "Completed",
      count: analyses.filter((a) => a.status === "Completed").length,
    },
  ];

  return (
    <div className="max-w-[1240px] w-full mx-auto flex flex-col gap-space-lg">
      {/* Header Block */}
      <PageHeader
        title="Overview"
        description="Review recent candidate analyses and resume matching activity."
        actions={
          <Link href="/new-analysis">
            <Button variant="primary" icon="add">
              New Analysis
            </Button>
          </Link>
        }
      />

      {/* Compact 4-Column Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        <MetricCard
          title="Analyses"
          value={metrics.analysesCount}
          codeOrBadge="RUN-M30"
          subtext="Last 30 days"
        />
        <MetricCard
          title="Resumes processed"
          value={metrics.resumesProcessed}
          codeOrBadge={
            <span className="font-meta-medium text-meta-medium text-on-surface-variant bg-surface-container px-1.5 py-0.5 rounded">
              +{metrics.resumesThisWeek} this wk
            </span>
          }
          subtext={`+${metrics.resumesThisWeek} this week`}
        />
        <MetricCard
          title="Candidates reviewed"
          value={metrics.candidatesReviewed}
          codeOrBadge={
            <span className="font-meta-medium text-meta-medium text-on-surface">
              {metrics.matchRatePercent.toFixed(1)}%
            </span>
          }
          subtext={`${metrics.matchRatePercent.toFixed(1)}% avg match`}
        />
        <MetricCard
          title="Reports exported"
          value={metrics.reportsExported}
          codeOrBadge="SEC-AUD"
          subtext="Audit-ready dossiers"
        />
      </div>

      {/* Main Analysis Log Panel */}
      <section className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 flex flex-col shadow-xs overflow-hidden">
        {/* Panel Toolbar / Filter Ribbon */}
        <div className="p-space-md border-b border-outline-variant/30 flex flex-col md:flex-row items-center justify-between gap-space-md">
          <FilterRibbon
            tabs={tabOptions}
            activeTab={activeTab}
            onTabChange={(tab) => {
              setActiveTab(tab);
              setCurrentPage(1);
            }}
          />

          <div className="flex items-center gap-space-sm w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 md:w-64">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                search
              </span>
              <input
                type="text"
                placeholder="Search requisition or role..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-3 py-1.5 rounded border border-outline-variant/50 bg-surface-bright/50 text-on-surface placeholder:text-outline text-body-default font-body-default focus:outline-none focus:border-on-surface focus:bg-surface-container-lowest transition-colors"
              />
            </div>

            {/* Quick Action Button */}
            <Button variant="secondary" size="md" icon="tune">
              Filter
            </Button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-secondary font-table-header text-table-header uppercase tracking-wider select-none border-b border-outline-variant/30 h-10">
                <th className="py-2.5 px-space-md font-semibold">Job Role</th>
                <th className="py-2.5 px-space-md font-semibold">Department</th>
                <th className="py-2.5 px-space-md font-semibold">Req #</th>
                <th className="py-2.5 px-space-md font-semibold">Candidates</th>
                <th className="py-2.5 px-space-md font-semibold">Date Created</th>
                <th className="py-2.5 px-space-md font-semibold">Status</th>
                <th className="py-2.5 px-space-md font-semibold text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 font-body-default text-body-default text-on-surface">
              {paginatedAnalyses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-outline">
                    No analyses match your search criteria.
                  </td>
                </tr>
              ) : (
                paginatedAnalyses.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-surface-container-low/50 transition-colors group cursor-pointer"
                  >
                    <td className="py-3.5 px-space-md font-body-medium text-body-medium text-on-surface group-hover:underline">
                      <Link href="/analysis">{item.jobRole}</Link>
                    </td>
                    <td className="py-3.5 px-space-md text-secondary">
                      {item.department}
                    </td>
                    <td className="py-3.5 px-space-md font-code-mono text-code-mono text-outline">
                      {item.reqNumber}
                    </td>
                    <td className="py-3.5 px-space-md font-code-mono text-code-mono text-secondary">
                      {item.candidateCount}
                    </td>
                    <td className="py-3.5 px-space-md text-outline font-meta-default text-meta-default">
                      {item.dateCreated}
                    </td>
                    <td className="py-3.5 px-space-md">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="py-3.5 px-space-md text-right">
                      <Link
                        href="/analysis"
                        className="inline-flex items-center gap-1 font-label-default text-label-default text-on-surface hover:text-primary-container p-1 rounded hover:bg-surface-container"
                      >
                        <span>View</span>
                        <span className="material-symbols-outlined text-[15px]">
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

        {/* Pagination Footer */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredAnalyses.length}
          pageSize={pageSize}
          showPageNumbers={true}
          itemLabel="analyses"
          onPageChange={setCurrentPage}
        />
      </section>
    </div>
  );
}
