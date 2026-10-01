export type AnalysisStatus = "Completed" | "Processing" | "Draft";

export interface AnalysisSummary {
  id: string;
  jobRole: string;
  department: string;
  reqNumber: string;
  candidateCount: number;
  dateCreated: string;
  status: AnalysisStatus;
}

export interface StagedResume {
  id: string;
  filename: string;
  pages: number;
  sizeKb: number;
  status: "Ready" | "Processing" | "Failed";
}

export interface PipelineStage {
  id: number;
  name: string;
  status: "completed" | "in_progress" | "queued";
  detail: string;
}

export interface AnalysisPipelineConfig {
  runId: string;
  reqTitle: string;
  department: string;
  reqId: string;
  batchId: string;
  jobDescriptionText: string;
  detectedSkills: string[];
  requiredSkills: string[];
  preferredSkills: string[];
  weightAllocation: number; // e.g. 30%
  bonusModifierCap: number; // e.g. 5%
  targetRequisition: string;
  experience: string;
  education: string;
  workAuthorization: string;
  parsedResponsibilities: string[];
  pipelineProgress: number; // percentage, e.g. 65
  pipelineEta: string; // e.g. "~12 seconds"
  stages: PipelineStage[];
}
