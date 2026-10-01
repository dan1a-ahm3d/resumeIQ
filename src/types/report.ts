export interface ExportDossier {
  id: string;
  reportName: string;
  reqId: string;
  department: string;
  candidateCount: number;
  dateCreated: string;
  formats: ("PDF" | "CSV")[];
}

export interface ReportsOverviewMetrics {
  generatedDossiers: number;
  candidatesEvaluated: number;
  rolesEvaluated: number;
  auditCheckpointsPercent: number;
  vectorCalibration: string;
}
