/**
 * User Profile Service
 *
 * Manages recruiter profile, professional credentials, and personal workspace notes.
 * Prepares the profile module for future REST / FastAPI sync.
 */

import { UserProfile, UserProfileUpdate } from "@/types/profile";

const PROFILE_STORAGE_KEY = "resumeiq_user_profile";

const DEFAULT_PROFILE: UserProfile = {
  id: "usr-01",
  fullName: "Elena Rostov",
  email: "elena.rostov@talent.resumeiq.internal",
  phone: "+1 (555) 438-9210",
  role: "Talent Lead",
  company: "Talent Platform Group",
  experienceYears: 8,
  interests: [
    "Machine Learning Recruitment",
    "Technical Assessment Calibration",
    "Evidence-Backed Screening",
    "Engineering Leadership",
    "Algorithmic Fairness",
  ],
  professionalSummary:
    "Senior technical recruitment lead with 8+ years of experience scaling high-performing AI/ML, distributed infrastructure, and core software engineering organizations. Dedicated to replacing opaque black-box screening with transparent, verifiable candidate evaluation rubrics.",
  highlights: [
    "Orchestrated technical evaluation pipelines for 250+ engineering requisitions across North America and Europe.",
    "Established structured requirement-verification protocols, increasing candidate quality calibration by 34%.",
    "Championed bias-mitigated hiring procedures compliant with EEOC audit benchmarks.",
    "Keynote contributor on algorithmic recruitment transparency and evidence-based talent dossiers.",
  ],
  skills: [
    "Technical Screening & Rubrics",
    "Executive Calibration",
    "EEOC Compliance & Auditing",
    "Competency Framework Design",
    "Pipeline Velocity Analytics",
    "Vector Relevance Evaluation",
  ],
  certifications: [
    "Certified Diversity & Inclusion Recruiter (CDIR) — 2024",
    "SHRM Senior Certified Professional (SHRM-SCP) — 2023",
    "Advanced Technical Sourcing Certification (ATSC) — 2022",
  ],
  notes:
    "Review Q4 calibration matrices for Machine Learning Intern (#4092) and Data Analyst (#3881) roles. Remind hiring managers to inspect verbatim citation logs in ResumeIQ dossiers before final offer committee sign-offs.",
  createdAt: "2024-01-15T09:00:00Z",
  updatedAt: "2026-09-30T14:22:00Z",
};

class ProfileService {
  private profile: UserProfile = DEFAULT_PROFILE;

  constructor() {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
        if (stored) {
          this.profile = JSON.parse(stored);
        } else {
          localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(DEFAULT_PROFILE));
        }
      } catch {
        this.profile = DEFAULT_PROFILE;
      }
    }
  }

  public async getProfile(): Promise<UserProfile> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
        if (stored) {
          this.profile = JSON.parse(stored);
        }
      } catch {}
    }
    return { ...this.profile };
  }

  public async updateProfile(update: UserProfileUpdate): Promise<UserProfile> {
    await new Promise((resolve) => setTimeout(resolve, 350));
    this.profile = {
      ...this.profile,
      ...update,
      updatedAt: new Date().toISOString(),
    };

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(this.profile));
      } catch {}
    }

    return { ...this.profile };
  }

  public async updateNotes(notes: string): Promise<UserProfile> {
    return this.updateProfile({ notes });
  }
}

export const profileService = new ProfileService();
