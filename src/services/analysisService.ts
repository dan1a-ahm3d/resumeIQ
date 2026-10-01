import {
  AnalysisSummary,
  StagedResume,
  AnalysisPipelineConfig,
} from "@/types/analysis";
import {
  MOCK_ANALYSES,
  MOCK_STAGED_RESUMES,
  MOCK_PIPELINE_CONFIG,
  MOCK_OVERVIEW_METRICS,
} from "@/lib/mockData";
import {
  api,
  MultiCandidateRankingResponse,
  CandidateAnalysis,
  ResumeParseResponse,
} from "./api";
import { candidateService } from "./candidateService";

export interface OverviewMetrics {
  analysesCount: number;
  resumesProcessed: number;
  resumesThisWeek: number;
  candidatesReviewed: number;
  matchRatePercent: number;
  reportsExported: number;
}

// In-memory staged files and JD state for smooth multi-step workflow
let stagedFilesInMemory: File[] = [];
let stagedJobDescription: string = "";
let stagedJobTitle: string = "Machine Learning Engineer";
let stagedReqId: string = "REQ-4092";

export const analysisService = {
  // Staging accessors
  getStagedFiles(): File[] {
    return stagedFilesInMemory;
  },

  setStagedFiles(files: File[]): void {
    stagedFilesInMemory = files;
  },

  addStagedFiles(files: File[]): void {
    stagedFilesInMemory = [...stagedFilesInMemory, ...files];
  },

  removeStagedFile(filename: string): void {
    stagedFilesInMemory = stagedFilesInMemory.filter((f) => f.name !== filename);
  },

  clearStagedFiles(): void {
    stagedFilesInMemory = [];
  },

  getStagedJobDescription(): string {
    return stagedJobDescription;
  },

  setStagedJobDescription(jd: string): void {
    stagedJobDescription = jd;
  },

  getStagedMetadata(): { jobTitle: string; reqId: string } {
    return { jobTitle: stagedJobTitle, reqId: stagedReqId };
  },

  setStagedMetadata(jobTitle: string, reqId: string): void {
    stagedJobTitle = jobTitle;
    stagedReqId = reqId;
  },

  /**
   * Primary entry point: Runs real multi-candidate ranking against FastAPI
   */
  async runRealAnalysis(
    files: File[],
    jobDescription: string
  ): Promise<MultiCandidateRankingResponse> {
    if (!files || files.length === 0) {
      throw new Error("Please upload at least one resume PDF.");
    }
    if (!jobDescription || !jobDescription.trim()) {
      throw new Error("Job description cannot be empty.");
    }

    const response = await api.rankCandidates(files, jobDescription);
    candidateService.setActiveAnalysis(response);
    return response;
  },

  /**
   * Single resume-to-job matching via FastAPI
   */
  async runSingleMatch(
    file: File,
    jobDescription: string
  ): Promise<CandidateAnalysis> {
    return api.matchResume(file, jobDescription);
  },

  /**
   * Single resume structural parsing via FastAPI
   */
  async runResumeParse(file: File): Promise<ResumeParseResponse> {
    return api.analyzeResume(file);
  },

  /**
   * Health check
   */
  async checkBackendHealth(): Promise<{ status: string; service: string }> {
    return api.healthCheck();
  },

  async getOverviewMetrics(): Promise<OverviewMetrics> {
    const active = candidateService.getActiveAnalysis();
    if (active && active.rankings && active.rankings.length > 0) {
      const avgScore =
        active.rankings.reduce((acc, r) => acc + r.overall_score, 0) /
        active.rankings.length;

      return {
        analysesCount: MOCK_OVERVIEW_METRICS.analysesCount + 1,
        resumesProcessed:
          MOCK_OVERVIEW_METRICS.resumesProcessed + active.total_candidates,
        resumesThisWeek:
          MOCK_OVERVIEW_METRICS.resumesThisWeek + active.total_candidates,
        candidatesReviewed: active.total_candidates,
        matchRatePercent: Number(avgScore.toFixed(1)),
        reportsExported: MOCK_OVERVIEW_METRICS.reportsExported,
      };
    }
    return MOCK_OVERVIEW_METRICS;
  },

  async getRecentAnalyses(): Promise<AnalysisSummary[]> {
    const active = candidateService.getActiveAnalysis();
    if (active && active.rankings && active.rankings.length > 0) {
      const liveSummary: AnalysisSummary = {
        id: "RUN-LIVE-" + active.total_candidates,
        jobRole: active.job_title || stagedJobTitle || "Machine Learning Engineer",
        department: "AI & Analytics",
        reqNumber: stagedReqId || "REQ-4092",
        candidateCount: active.total_candidates,
        dateCreated: "Just now",
        status: "Completed",
      };
      return [liveSummary, ...MOCK_ANALYSES];
    }
    return MOCK_ANALYSES;
  },

  async getStagedResumes(runId?: string): Promise<StagedResume[]> {
    if (stagedFilesInMemory.length > 0) {
      return stagedFilesInMemory.map((f, i) => ({
        id: `staged-${i}-${f.name}`,
        filename: f.name,
        pages: 1,
        sizeKb: Math.round(f.size / 1024),
        status: "Ready",
      }));
    }
    return MOCK_STAGED_RESUMES;
  },

  async getPipelineConfig(runId?: string): Promise<AnalysisPipelineConfig> {
    return MOCK_PIPELINE_CONFIG;
  },

  async updateRequirements(
    runId: string,
    requiredSkills: string[],
    preferredSkills: string[]
  ): Promise<{ success: boolean }> {
    return { success: true };
  },

  async runAnalysis(runId: string): Promise<{ jobId: string; status: string }> {
    return { jobId: "job-8829", status: "started" };
  },
};
