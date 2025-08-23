// /hooks/auth/types.ts
import { Language } from "@/types";
import { Profile } from "@/types/supabase";
import { Session, User } from "@supabase/supabase-js";
import { ReactNode } from "react";

export type AuthMethod = "phone" | "email";
export type OtpType = "sms" | "email";
export type AuthPurpose = "signup" | "signin";
export type DbColumn = "phone" | "email";

export interface SignUpUserData {
  name: string;
  phone?: string;
  email?: string;
  age?: number;
  gender?: string;
  location?: string;
  user_latitude?: number;
  user_longitude?: number;
  language?: Language;
}

export interface PhoneValidationResult {
  isValid: boolean;
  normalized?: string;
  error?: string;
}

export interface ErrorMessages {
  readonly [key: string]: Readonly<Record<Language, string>>;
}

export interface AuthContextType {
  readonly session: Session | null;
  readonly user: User | null;
  readonly profile: Profile | null;

  // 🎯 نفصل بينهم
  readonly loading: boolean; // يخص session فقط
  readonly profileLoading: boolean; // يخص profile فقط

  signUpWithPhone: (
    phone: string,
    userData: SignUpUserData
  ) => Promise<AuthOperationResult>;

  signUpWithEmail: (
    email: string,
    userData: SignUpUserData
  ) => Promise<AuthOperationResult>;

  signInWithPhone: (phone: string) => Promise<AuthOperationResult>;
  signInWithEmail: (email: string) => Promise<AuthOperationResult>;
  signInWithPassword: (
    identifier: string,
    password: string
  ) => Promise<AuthOperationResult>;

  verifyOTP: (
    identifier: string,
    token: string,
    type: OtpType,
    purpose: AuthPurpose
  ) => Promise<AuthOperationResult>;

  resendOTP: (
    identifier: string,
    type: AuthMethod
  ) => Promise<Pick<AuthOperationResult, "error">>;

  signOut: () => Promise<Pick<AuthOperationResult, "error">>;
  updateProfile: (
    updates: Partial<Profile>
  ) => Promise<Pick<AuthOperationResult, "error">>;
  resetPassword: (email: string) => Promise<Pick<AuthOperationResult, "error">>;
  checkPhoneExists: (phone: string) => Promise<boolean>;
  checkEmailExists: (email: string) => Promise<boolean>;
}

export interface AuthProviderProps {
  children: ReactNode;
}

export interface EdgeFunctionRequest {
  phone: string;
}

export interface EdgeFunctionVerifyRequest {
  phone: string;
  token: string;
  purpose: AuthPurpose;
}

export interface LogErrorContext {
  [key: string]: unknown;
}

export interface ProfileSelectResult {
  email: string;
  is_verified: boolean;
}

export type AuthOperationResult<T = any> = {
  error: string | null | undefined;
  data?: T;
};
