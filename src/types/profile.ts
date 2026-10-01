/**
 * User Profile Data Contract
 *
 * Strict TypeScript types for internal recruiter profile management.
 * Isolated from presentation components for seamless future backend integration.
 */

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  company: string;
  experienceYears: number;
  interests: string[];
  professionalSummary: string;
  highlights: string[];
  skills: string[];
  certifications: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type UserProfileUpdate = Partial<Omit<UserProfile, "id" | "createdAt" | "email">>;
