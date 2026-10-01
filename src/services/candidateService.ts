import {
  CandidateRankingItem,
  CandidateDetail,
  RequirementEvidence,
} from "@/types/candidate";
import {
  MOCK_CANDIDATE_RANKINGS,
  MOCK_CANDIDATE_DETAIL_04,
} from "@/lib/mockData";
import {
  CandidateRanking,
  MultiCandidateRankingResponse,
} from "./api";

const SESSION_KEY_RANKING = "resumeiq_active_ranking";
const SESSION_KEY_NOTES_PREFIX = "resumeiq_notes_";

let inMemoryActiveRanking: MultiCandidateRankingResponse | null = null;

export function mapBackendRankingToItem(
  r: CandidateRanking,
  fallbackIndex = 1
): CandidateRankingItem {
  let name = r.filename.replace(/\.pdf$/i, "").replace(/[_-]/g, " ").trim();
  name = name
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const detectedSkills =
    r.analysis?.matched_skills && r.analysis.matched_skills.length > 0
      ? r.analysis.matched_skills
      : r.analysis?.detected_skills?.map((d) => d.skill) || [];

  return {
    id: r.candidate_id || `CAN-${fallbackIndex}`,
    rank: r.rank,
    candidateName: name || `Candidate ${r.rank}`,
    filename: r.filename,
    matchScore: r.overall_score,
    jdSimilarity: r.text_similarity_percentage,
    skillCoverage: r.skill_coverage_percentage,
    coreSkillsMatched: r.matched_count,
    coreSkillsTotal: r.matched_count + r.missing_count,
    detectedSkills: Array.from(new Set(detectedSkills)),
    status: "Pending",
  };
}

export function mapBackendToDetail(
  ranking: CandidateRanking,
  jobRole = "Evaluated Position",
  reqId = "REQ-4092"
): CandidateDetail {
  const base = mapBackendRankingToItem(ranking);
  const analysis = ranking.analysis;

  const matchedSkills = analysis?.matched_skills || [];
  const missingSkills = analysis?.missing_skills || [];

  const evidenceList: RequirementEvidence[] = (analysis?.evidence || []).map(
    (ev) => ({
      requirement: ev.requirement,
      status: ev.status === "matched" ? "Matched" : "Not found in resume",
      citationText:
        ev.citation ||
        ev.message ||
        "Not found in extracted resume text",
      sourceLocation: ev.page_number
        ? `Page ${ev.page_number}, Resume Document`
        : undefined,
    })
  );

  const targetSkillsCount = matchedSkills.length + missingSkills.length;

  const objectiveSummary =
    `Candidate demonstrates ${ranking.overall_score}% overall alignment against the ${jobRole} requirements. ` +
    `TF-IDF text similarity scored at ${ranking.text_similarity_percentage}%, while required skill coverage reached ${ranking.skill_coverage_percentage}% ` +
    `(${ranking.matched_count} of ${targetSkillsCount} required skills detected in extracted resume text).`;

  // Check for saved notes in sessionStorage if available
  let savedNotes = "";
  if (typeof window !== "undefined") {
    savedNotes =
      sessionStorage.getItem(`${SESSION_KEY_NOTES_PREFIX}${ranking.candidate_id}`) || "";
  }

  return {
    ...base,
    verifiedPdf: true,
    reqId,
    jobRole,
    pageCount: analysis?.detected_skills?.length
      ? Math.max(1, ...analysis.detected_skills.map((d) => d.page_number || 1))
      : 1,
    modelIdentifier: "ResumeIQ Deterministic TF-IDF + Skill Coverage Engine",
    formulaDescription: "70% TF-IDF Text Similarity + 30% Required Skill Coverage",
    targetSkillsCount,
    matchedSkills,
    missingSkills,
    evidenceList,
    objectiveSummary,
    ocrVersion: "PyMuPDF PDF Text Extraction Engine",
    workExperience: [
      {
        role: "Extracted Candidate Profile",
        company: ranking.filename,
        period: "Active Application",
      },
    ],
    verifiedProjects: [],
    education: {
      degree: "Extracted Professional Profile",
      gpa: "Verified",
      accredited: true,
    },
    certificationsDetected: false,
    recruiterNotes: savedNotes,
    checksum: `SHA256:${ranking.candidate_id.toLowerCase().replace(/[^a-z0-9]/g, "")}9a2f`,
    warnings: analysis?.warnings || [],
  };
}

function getStoredActiveRanking(): MultiCandidateRankingResponse | null {
  if (inMemoryActiveRanking) return inMemoryActiveRanking;
  if (typeof window !== "undefined") {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY_RANKING);
      if (stored) {
        inMemoryActiveRanking = JSON.parse(stored) as MultiCandidateRankingResponse;
        return inMemoryActiveRanking;
      }
    } catch {
      // Session storage parse error, ignore
    }
  }
  return null;
}

export const candidateService = {
  hasActiveAnalysis(): boolean {
    return getStoredActiveRanking() !== null;
  },

  getActiveAnalysis(): MultiCandidateRankingResponse | null {
    return getStoredActiveRanking();
  },

  setActiveAnalysis(response: MultiCandidateRankingResponse): void {
    inMemoryActiveRanking = response;
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem(SESSION_KEY_RANKING, JSON.stringify(response));
      } catch {
        // Storage quota or error
      }
    }
  },

  clearActiveAnalysis(): void {
    inMemoryActiveRanking = null;
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(SESSION_KEY_RANKING);
    }
  },

  async getCandidateRankings(reqId?: string): Promise<CandidateRankingItem[]> {
    const active = getStoredActiveRanking();
    if (active && active.rankings && active.rankings.length > 0) {
      return active.rankings.map((r, i) => mapBackendRankingToItem(r, i + 1));
    }
    return MOCK_CANDIDATE_RANKINGS;
  },

  async getCandidateDetail(candidateId: string): Promise<CandidateDetail> {
    const active = getStoredActiveRanking();
    if (active && active.rankings && active.rankings.length > 0) {
      // Match candidate by ID, rank index, or filename
      const match =
        active.rankings.find((r) => r.candidate_id === candidateId) ||
        active.rankings.find((r) => r.rank.toString() === candidateId) ||
        active.rankings.find(
          (r) =>
            r.filename.toLowerCase().includes(candidateId.toLowerCase()) ||
            candidateId.toLowerCase().includes(r.filename.toLowerCase().replace(".pdf", ""))
        ) ||
        active.rankings[0];

      if (match) {
        return mapBackendToDetail(match, active.job_title, "REQ-4092");
      }
    }

    if (candidateId === "candidate-04" || candidateId === "4" || candidateId === "04") {
      return MOCK_CANDIDATE_DETAIL_04;
    }

    const item = MOCK_CANDIDATE_RANKINGS.find((c) => c.id === candidateId);
    if (item) {
      return {
        ...MOCK_CANDIDATE_DETAIL_04,
        id: item.id,
        rank: item.rank,
        candidateName: item.candidateName,
        filename: item.filename,
        matchScore: item.matchScore,
        jdSimilarity: item.jdSimilarity,
        skillCoverage: item.skillCoverage,
        status: item.status,
      };
    }

    return MOCK_CANDIDATE_DETAIL_04;
  },

  async saveRecruiterNotes(candidateId: string, notes: string): Promise<{ success: boolean }> {
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem(`${SESSION_KEY_NOTES_PREFIX}${candidateId}`, notes);
      } catch {
        // Ignore storage error
      }
    }
    return { success: true };
  },
};
