/**
 * Authentication Data Contracts
 *
 * Isolated frontend contracts prepared for future backend/OAuth/JWT integration.
 */

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  company: string;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthSession {
  user: AuthUser;
  token: string;
  expiresAt: string;
}
