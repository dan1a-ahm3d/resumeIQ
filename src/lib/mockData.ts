/**
 * DEVELOPMENT FIXTURES & MOCK DATA
 * 
 * IMPORTANT: This data strictly reproduces the approved Stitch UI export fixtures
 * for visual verification and local UI rendering.
 * 
 * The future production data flow will connect to the FastAPI backend.
 */

import {
  AnalysisSummary,
  StagedResume,
  AnalysisPipelineConfig,
} from "@/types/analysis";
import {
  CandidateRankingItem,
  CandidateDetail,
} from "@/types/candidate";
import {
  ExportDossier,
  ReportsOverviewMetrics,
} from "@/types/report";
import { MethodologySettings } from "@/types/settings";

export const MOCK_OVERVIEW_METRICS = {
  analysesCount: 24,
  resumesProcessed: 482,
  resumesThisWeek: 38,
  candidatesReviewed: 164,
  matchRatePercent: 34.0,
  reportsExported: 42,
};

export const MOCK_ANALYSES: AnalysisSummary[] = [
  {
    id: "REQ-4092",
    jobRole: "Machine Learning Intern",
    department: "AI & Analytics",
    reqNumber: "#4092",
    candidateCount: 24,
    dateCreated: "Sep 30, 2026",
    status: "Completed",
  },
  {
    id: "REQ-3881",
    jobRole: "Data Analyst Intern",
    department: "Business Intelligence",
    reqNumber: "#3881",
    candidateCount: 18,
    dateCreated: "Sep 28, 2026",
    status: "Completed",
  },
  {
    id: "REQ-3610",
    jobRole: "Senior Backend Engineer",
    department: "Core Infrastructure",
    reqNumber: "#3610",
    candidateCount: 36,
    dateCreated: "Sep 25, 2026",
    status: "Completed",
  },
  {
    id: "REQ-3550",
    jobRole: "Frontend Engineer (React)",
    department: "Design Engineering",
    reqNumber: "#3550",
    candidateCount: 29,
    dateCreated: "Sep 22, 2026",
    status: "Completed",
  },
  {
    id: "REQ-3490",
    jobRole: "Applied ML Scientist",
    department: "Research Lab",
    reqNumber: "#3490",
    candidateCount: 15,
    dateCreated: "Sep 18, 2026",
    status: "Processing",
  },
  {
    id: "REQ-3312",
    jobRole: "DevOps & Site Reliability",
    department: "Platform Engineering",
    reqNumber: "#3312",
    candidateCount: 22,
    dateCreated: "Sep 14, 2026",
    status: "Completed",
  },
];

export const MOCK_STAGED_RESUMES: StagedResume[] = [
  {
    id: "res-01",
    filename: "candidate_01.pdf",
    pages: 2,
    sizeKb: 142,
    status: "Ready",
  },
  {
    id: "res-02",
    filename: "candidate_02.pdf",
    pages: 1,
    sizeKb: 98,
    status: "Ready",
  },
  {
    id: "res-03",
    filename: "candidate_03.pdf",
    pages: 2,
    sizeKb: 165,
    status: "Ready",
  },
  {
    id: "res-04",
    filename: "candidate_04.pdf",
    pages: 2,
    sizeKb: 154,
    status: "Ready",
  },
];

export const MOCK_PIPELINE_CONFIG: AnalysisPipelineConfig = {
  runId: "RUN_ID_8829",
  reqTitle: "Machine Learning Intern",
  department: "AI & Analytics Team",
  reqId: "REQ-4092",
  batchId: "Batch #2409-ML",
  jobDescriptionText: `Role: Applied Machine Learning Associate
Requirements:
- 1–3 years practical development experience with Python, PyTorch/TensorFlow, and Scikit-learn
- Strong SQL and relational data extraction skills
- Experience with Git version control and collaborative code review
- Preferred: Containerization with Docker, AWS deployment familiarity
- Education: B.S. or M.S. in Computer Science or related quantitative field`,
  detectedSkills: ["Python", "PyTorch/TensorFlow", "Scikit-learn", "SQL", "Docker"],
  requiredSkills: ["Python", "SQL", "Machine Learning", "Scikit-learn", "Git"],
  preferredSkills: ["Docker", "AWS"],
  weightAllocation: 30.0,
  bonusModifierCap: 5.0,
  targetRequisition: "Machine Learning Intern (REQ-4092)",
  experience: "0–2 years (Entry / Associate)",
  education: "Computer Science, Data Science, or related field",
  workAuthorization: "Open to CPT/OPT Sponsorship",
  parsedResponsibilities: [
    "Build and evaluate baseline machine learning models on unstructured datasets",
    "Construct and optimize SQL analytical queries for feature warehousing",
    "Maintain version-controlled repositories and participate in code reviews",
  ],
  pipelineProgress: 65,
  pipelineEta: "~12 seconds",
  stages: [
    { id: 1, name: "1. Parse Files", status: "completed", detail: "24/24 completed" },
    { id: 2, name: "2. Structure OCR", status: "completed", detail: "24/24 completed" },
    { id: 3, name: "3. Skill Taxonomy", status: "completed", detail: "24/24 completed" },
    { id: 4, name: "4. TF-IDF Vectors", status: "in_progress", detail: "16 of 24 resumes" },
    { id: 5, name: "5. Match & Score", status: "queued", detail: "Queued" },
  ],
};

export const MOCK_CANDIDATE_RANKINGS: CandidateRankingItem[] = [
  {
    id: "candidate-04",
    rank: 1,
    candidateName: "Candidate 04",
    filename: "candidate_04.pdf",
    matchScore: 84,
    jdSimilarity: 82,
    skillCoverage: 90,
    coreSkillsMatched: 5,
    coreSkillsTotal: 5,
    detectedSkills: ["Python", "SQL", "Machine Learning", "Git", "Scikit-learn"],
    status: "Reviewed",
  },
  {
    id: "candidate-01",
    rank: 2,
    candidateName: "Candidate 01",
    filename: "candidate_01.pdf",
    matchScore: 81,
    jdSimilarity: 79,
    skillCoverage: 86,
    coreSkillsMatched: 4,
    coreSkillsTotal: 5,
    detectedSkills: ["Python", "SQL", "Machine Learning", "Git"],
    status: "Reviewed",
  },
  {
    id: "candidate-07",
    rank: 3,
    candidateName: "Candidate 07",
    filename: "candidate_07.pdf",
    matchScore: 76,
    jdSimilarity: 74,
    skillCoverage: 79,
    coreSkillsMatched: 4,
    coreSkillsTotal: 5,
    detectedSkills: ["Python", "SQL", "Scikit-learn", "Git"],
    status: "Reviewed",
  },
  {
    id: "candidate-12",
    rank: 4,
    candidateName: "Candidate 12",
    filename: "candidate_12.pdf",
    matchScore: 73,
    jdSimilarity: 72,
    skillCoverage: 75,
    coreSkillsMatched: 3,
    coreSkillsTotal: 5,
    detectedSkills: ["Python", "Machine Learning", "Git"],
    status: "Reviewed",
  },
  {
    id: "candidate-03",
    rank: 5,
    candidateName: "Candidate 03",
    filename: "candidate_03.pdf",
    matchScore: 69,
    jdSimilarity: 68,
    skillCoverage: 71,
    coreSkillsMatched: 3,
    coreSkillsTotal: 5,
    detectedSkills: ["Python", "SQL", "Git"],
    status: "Pending",
  },
  {
    id: "candidate-18",
    rank: 6,
    candidateName: "Candidate 18",
    filename: "candidate_18.pdf",
    matchScore: 64,
    jdSimilarity: 62,
    skillCoverage: 68,
    coreSkillsMatched: 3,
    coreSkillsTotal: 5,
    detectedSkills: ["Python", "Git"],
    status: "Pending",
  },
];

export const MOCK_CANDIDATE_DETAIL_04: CandidateDetail = {
  id: "candidate-04",
  rank: 2,
  candidateName: "Candidate 04",
  filename: "candidate_04.pdf",
  verifiedPdf: true,
  reqId: "REQ-4092",
  jobRole: "Machine Learning Intern",
  pageCount: 2,
  matchScore: 84,
  jdSimilarity: 82,
  skillCoverage: 90,
  coreSkillsMatched: 5,
  coreSkillsTotal: 5,
  detectedSkills: ["Python", "SQL", "Machine Learning", "Git", "Scikit-learn"],
  status: "Reviewed",
  modelIdentifier: "Deterministic Model v2.4",
  formulaDescription: "70% Text + 30% Skill",
  targetSkillsCount: 7,
  matchedSkills: ["Python", "SQL", "Machine Learning", "Scikit-learn", "Git"],
  missingSkills: ["Docker", "AWS"],
  evidenceList: [
    {
      requirement: "Python",
      status: "Matched",
      citationText: "“Developed high-throughput data processing pipelines using Python and Pandas for unstructured log streams.”",
      sourceLocation: "Page 1, Experience",
    },
    {
      requirement: "SQL",
      status: "Matched",
      citationText: "“Constructed and optimized complex SQL queries for relational analytical warehousing across 2M+ records.”",
      sourceLocation: "Page 1, Experience",
    },
    {
      requirement: "Machine Learning",
      status: "Matched",
      citationText: "“Trained supervised classification and regression models evaluating accuracy and precision curves.”",
      sourceLocation: "Page 2, Projects",
    },
    {
      requirement: "Scikit-learn",
      status: "Matched",
      citationText: "“Implemented clustering and predictive classification modules leveraging Scikit-learn and NumPy.”",
      sourceLocation: "Page 2, Projects",
    },
    {
      requirement: "Git",
      status: "Matched",
      citationText: "“Maintained team repositories on GitHub, managing PR reviews and version tagging workflows.”",
      sourceLocation: "Page 2, Technical Skills",
    },
    {
      requirement: "Docker",
      status: "Not found in resume",
      citationText: "— (No explicit mention detected in submitted resume document)",
    },
    {
      requirement: "AWS",
      status: "Not found in resume",
      citationText: "— (No explicit mention detected in submitted resume document)",
    },
  ],
  objectiveSummary:
    "The submitted resume demonstrates verified skill overlap with core job criteria including Python, SQL, Git, and Scikit-learn, supported by documented project implementation evidence. Cloud containerization tools (Docker, AWS) were not detected in the provided resume document.",
  ocrVersion: "OCR v1.2",
  workExperience: [
    {
      role: "Machine Learning Intern",
      company: "ABC Technologies",
      period: "2025–2026",
    },
    {
      role: "Data Intern",
      company: "FinTech Solutions",
      period: "Summer 2024",
    },
  ],
  verifiedProjects: [
    {
      name: "Fraud Detection System",
      tech: "Tech: Python, Scikit-learn",
    },
    {
      name: "Resume Classification Model",
      tech: "Tech: TF-IDF, NLP",
    },
  ],
  education: {
    degree: "B.Tech in Computer Science & Engineering",
    gpa: "GPA 3.8 / 4.0",
    accredited: true,
  },
  certificationsDetected: false,
  recruiterNotes:
    "Candidate demonstrated solid foundations during technical pre-screen. Code repo inspected on GitHub; well-structured modular code.",
  checksum: "SHA256: 8a7c...3f01",
};

export const MOCK_REPORTS_METRICS: ReportsOverviewMetrics = {
  generatedDossiers: 148,
  candidatesEvaluated: 2419,
  rolesEvaluated: 42,
  auditCheckpointsPercent: 100,
  vectorCalibration: "v2.4-strict cosine anchor",
};

export const MOCK_EXPORT_DOSSIERS: ExportDossier[] = [
  {
    id: "dos-01",
    reportName: "ML Intern — Candidate Match Dossier",
    reqId: "REQ-4092",
    department: "AI Team",
    candidateCount: 24,
    dateCreated: "Sep 30, 2026",
    formats: ["PDF", "CSV"],
  },
  {
    id: "dos-02",
    reportName: "Data Analyst Intern — Evaluation Batch",
    reqId: "REQ-3881",
    department: "Analytics",
    candidateCount: 18,
    dateCreated: "Sep 28, 2026",
    formats: ["PDF", "CSV"],
  },
  {
    id: "dos-03",
    reportName: "Senior Backend Engineer — Audit Matrix",
    reqId: "REQ-3610",
    department: "Infrastructure",
    candidateCount: 36,
    dateCreated: "Sep 25, 2026",
    formats: ["PDF", "CSV"],
  },
  {
    id: "dos-04",
    reportName: "Frontend Engineer (React) — Scoring Log",
    reqId: "REQ-3550",
    department: "Design Eng",
    candidateCount: 29,
    dateCreated: "Sep 22, 2026",
    formats: ["PDF", "CSV"],
  },
];

export const MOCK_METHODOLOGY_SETTINGS: MethodologySettings = {
  textSimilarityWeight: 70,
  skillCoverageWeight: 30,
};
