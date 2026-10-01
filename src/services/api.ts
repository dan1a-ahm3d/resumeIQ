/**
 * API Client Configuration & Centralized FastAPI Integration
 * Connects Next.js to FastAPI ResumeIQ backend.
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8001/api/v1";

// ==========================================
// BACKEND RESPONSE INTERFACES (Pydantic Mappings)
// ==========================================

export interface HealthResponse {
  status: string;
  service: string;
}

export interface BackendResumePage {
  page_number: number;
  text: string;
}

export interface BackendParsedResume {
  filename: string;
  pages: BackendResumePage[];
  full_text: string;
  warnings: string[];
}

export interface BackendSkillEvidence {
  skill: string;
  matched_text: string;
  page_number?: number;
  context: string;
}

export interface ResumeParseResponse {
  parsed_resume: BackendParsedResume;
  detected_skills: BackendSkillEvidence[];
  warnings: string[];
}

export interface BackendRequirementEvidence {
  requirement: string;
  status: "matched" | "not_found";
  citation?: string | null;
  page_number?: number | null;
  message?: string | null;
}

export interface BackendScoreComponentDetail {
  score: number;
  weight: number;
  weighted_score: number;
}

export interface BackendScoreComponents {
  text_similarity: BackendScoreComponentDetail;
  required_skill_coverage: BackendScoreComponentDetail;
}

export interface CandidateAnalysis {
  candidate_id: string;
  filename: string;
  overall_score: number;
  components: BackendScoreComponents;
  text_similarity_percentage: number;
  skill_coverage_percentage: number;
  matched_skills: string[];
  missing_skills: string[];
  detected_skills: BackendSkillEvidence[];
  evidence: BackendRequirementEvidence[];
  warnings: string[];
}

export interface CandidateRanking {
  rank: number;
  candidate_id: string;
  filename: string;
  overall_score: number;
  text_similarity_percentage: number;
  skill_coverage_percentage: number;
  matched_count: number;
  missing_count: number;
  analysis?: CandidateAnalysis | null;
}

export interface MultiCandidateRankingResponse {
  job_title: string;
  total_candidates: number;
  rankings: CandidateRanking[];
}

// ==========================================
// ERROR HANDLING
// ==========================================

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ==========================================
// CORE API CLIENT
// ==========================================

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) || {}),
  };

  // When body is FormData, NEVER set Content-Type header manually.
  // The browser sets multipart/form-data boundary automatically.
  if (options.body instanceof FormData) {
    delete headers["Content-Type"];
  } else if (!headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers: Object.keys(headers).length > 0 ? headers : undefined,
    });

    if (!response.ok) {
      let errorDetail: any = null;
      try {
        errorDetail = await response.json();
      } catch {
        errorDetail = await response.text().catch(() => null);
      }

      let message = `Request failed with status ${response.status}`;
      if (typeof errorDetail === "object" && errorDetail !== null) {
        if (typeof errorDetail.detail === "string") {
          message = errorDetail.detail;
        } else if (Array.isArray(errorDetail.detail)) {
          // Pydantic validation errors (422)
          message = errorDetail.detail
            .map((d: any) => d.msg || JSON.stringify(d))
            .join("; ");
        } else if (errorDetail.message) {
          message = errorDetail.message;
        }
      }

      throw new ApiError(response.status, message, errorDetail);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const msg =
      (error as Error)?.message ||
      "Network error: Unable to connect to ResumeIQ backend service.";
    throw new ApiError(0, msg);
  }
}

// ==========================================
// TYPED API FUNCTIONS
// ==========================================

/**
 * 1. Health check: GET /api/v1/health
 */
export async function healthCheck(): Promise<HealthResponse> {
  return apiClient<HealthResponse>("/health", {
    method: "GET",
  });
}

/**
 * 2. Analyze single resume: POST /api/v1/analyze/resume
 */
export async function analyzeResume(file: File): Promise<ResumeParseResponse> {
  if (!file) {
    throw new ApiError(400, "Please select a resume PDF file to analyze.");
  }
  const formData = new FormData();
  formData.append("file", file);

  return apiClient<ResumeParseResponse>("/analyze/resume", {
    method: "POST",
    body: formData,
  });
}

/**
 * 3. Match resume against JD: POST /api/v1/analyze/match
 */
export async function matchResume(
  file: File,
  jobDescription: string
): Promise<CandidateAnalysis> {
  if (!file) {
    throw new ApiError(400, "Please select a resume PDF file.");
  }
  if (!jobDescription || !jobDescription.trim()) {
    throw new ApiError(400, "Job description cannot be empty.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("job_description", jobDescription.trim());

  return apiClient<CandidateAnalysis>("/analyze/match", {
    method: "POST",
    body: formData,
  });
}

/**
 * 4. Rank candidates: POST /api/v1/analyze/rank
 */
export async function rankCandidates(
  files: File[],
  jobDescription: string
): Promise<MultiCandidateRankingResponse> {
  if (!files || files.length === 0) {
    throw new ApiError(400, "At least one resume PDF must be provided.");
  }
  if (!jobDescription || !jobDescription.trim()) {
    throw new ApiError(400, "Job description cannot be empty.");
  }

  const formData = new FormData();
  files.forEach((f) => {
    formData.append("files", f);
  });
  formData.append("job_description", jobDescription.trim());

  return apiClient<MultiCandidateRankingResponse>("/analyze/rank", {
    method: "POST",
    body: formData,
  });
}

// Centralized export object
export const api = {
  healthCheck,
  analyzeResume,
  matchResume,
  rankCandidates,
};
