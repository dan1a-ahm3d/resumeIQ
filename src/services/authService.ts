/**
 * Authentication Service
 *
 * Provides a clean authentication abstraction.
 * Prepares the application for real backend / FastAPI / OAuth integration.
 *
 * SECURITY SAFEGUARDS:
 * - Passwords are NEVER stored in localStorage or sessionStorage.
 * - Sensitive credentials are not persisted in client-side code.
 */

import { AuthUser, SignInCredentials, SignUpData, AuthSession } from "@/types/auth";

const SESSION_STORAGE_KEY = "resumeiq_auth_session";

// Default demo persona matching the approved Stitch platform identity
const DEFAULT_USER: AuthUser = {
  id: "usr-01",
  fullName: "Elena Rostov",
  email: "elena.rostov@talent.resumeiq.internal",
  role: "Talent Lead",
  company: "Talent Platform Group",
};

class AuthService {
  private inMemoryUser: AuthUser | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          this.inMemoryUser = parsed.user || DEFAULT_USER;
        } else {
          // Initialize active development session with default user
          this.inMemoryUser = DEFAULT_USER;
          sessionStorage.setItem(
            SESSION_STORAGE_KEY,
            JSON.stringify({
              user: DEFAULT_USER,
              token: "mock-jwt-token-dev",
              expiresAt: new Date(Date.now() + 86400000).toISOString(),
            })
          );
        }
      } catch {
        this.inMemoryUser = DEFAULT_USER;
      }
    }
  }

  public getCurrentUser(): AuthUser | null {
    if (typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          return parsed.user;
        }
      } catch {
        // Fall back to memory
      }
    }
    return this.inMemoryUser;
  }

  public isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  public async signIn(credentials: SignInCredentials): Promise<AuthUser> {
    // Artificial latency simulating secure auth handshake
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (!credentials.email || !credentials.password) {
      throw new Error("Both email and password are required.");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(credentials.email)) {
      throw new Error("Please enter a valid email address.");
    }

    if (credentials.password.length < 8) {
      throw new Error("Password must be at least 8 characters.");
    }

    const user: AuthUser = {
      id: "usr-auth-" + Math.random().toString(36).substring(2, 7),
      fullName: credentials.email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "Recruiter User",
      email: credentials.email,
      role: "Talent Specialist",
      company: "Recruitment Team",
    };

    this.inMemoryUser = user;

    if (typeof window !== "undefined") {
      sessionStorage.setItem(
        SESSION_STORAGE_KEY,
        JSON.stringify({
          user,
          token: "mock-session-token-" + Date.now(),
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
        })
      );
    }

    return user;
  }

  public async signUp(data: SignUpData): Promise<AuthUser> {
    await new Promise((resolve) => setTimeout(resolve, 600));

    if (!data.fullName.trim()) {
      throw new Error("Full name is required.");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new Error("Please enter a valid email address.");
    }

    if (data.password.length < 8) {
      throw new Error("Password must be at least 8 characters in length.");
    }

    if (data.password !== data.confirmPassword) {
      throw new Error("Passwords do not match.");
    }

    const user: AuthUser = {
      id: "usr-new-" + Math.random().toString(36).substring(2, 7),
      fullName: data.fullName.trim(),
      email: data.email.trim(),
      role: "Talent Specialist",
      company: "Enterprise HR",
    };

    this.inMemoryUser = user;

    if (typeof window !== "undefined") {
      sessionStorage.setItem(
        SESSION_STORAGE_KEY,
        JSON.stringify({
          user,
          token: "mock-session-token-" + Date.now(),
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
        })
      );
    }

    return user;
  }

  public signOut(): void {
    this.inMemoryUser = null;
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }
}

export const authService = new AuthService();
