import {
  ExportDossier,
  ReportsOverviewMetrics,
} from "@/types/report";
import {
  MOCK_EXPORT_DOSSIERS,
  MOCK_REPORTS_METRICS,
} from "@/lib/mockData";
import { reportExportService, CustomReportConfig } from "./reportExportService";

export const reportsService = {
  async getReportsMetrics(): Promise<ReportsOverviewMetrics> {
    return MOCK_REPORTS_METRICS;
  },

  async getExportDossiers(): Promise<ExportDossier[]> {
    return MOCK_EXPORT_DOSSIERS;
  },

  async downloadReport(dossierId: string, format: "PDF" | "CSV"): Promise<string> {
    const dossier = MOCK_EXPORT_DOSSIERS.find((d) => d.id === dossierId);
    const reqId = dossier?.reqId || "REQ-4092";
    return reportExportService.exportDossier(dossierId, reqId, format);
  },

  async generateCustomExport(config: CustomReportConfig): Promise<string> {
    return reportExportService.generateCustomReport(config);
  },
};
