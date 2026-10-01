export interface CandidateRankingItem {
  id: string;
  rank: number;
  candidateName: string;
  filename: string;
  matchScore: number; // e.g. 84
  jdSimilarity: number; // e.g. 82
  skillCoverage: number; // e.g. 90
  coreSkillsMatched: number; // e.g. 5
  coreSkillsTotal: number; // e.g. 5
  detectedSkills: string[];
  status: "Reviewed" | "Pending";
}

export interface RequirementEvidence {
  requirement: string;
  status: "Matched" | "Not found in resume";
  citationText?: string;
  sourceLocation?: string; // e.g. "Page 1, Experience"
}

export interface WorkExperienceItem {
  role: string;
  company: string;
  period: string;
}

export interface VerifiedProjectItem {
  name: string;
  tech: string;
}

export interface CandidateEducation {
  degree: string;
  gpa: string;
  accredited: boolean;
}

export interface CandidateDetail extends CandidateRankingItem {
  verifiedPdf: boolean;
  reqId: string;
  jobRole: string;
  pageCount: number;
  modelIdentifier: string; // e.g. "Deterministic Model v2.4"
  formulaDescription: string; // e.g. "70% Text + 30% Skill"
  targetSkillsCount: number;
  matchedSkills: string[];
  missingSkills: string[];
  evidenceList: RequirementEvidence[];
  objectiveSummary: string;
  ocrVersion: string;
  workExperience: WorkExperienceItem[];
  verifiedProjects: VerifiedProjectItem[];
  education: CandidateEducation;
  certificationsDetected: boolean;
  recruiterNotes: string;
  checksum: string;
  warnings?: string[];
}
