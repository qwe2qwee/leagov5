import { TextInputProps, TouchableOpacityProps } from "react-native";

export declare interface ButtonProps extends TouchableOpacityProps {
  title?: string;
  bgVariant?: "primary" | "secondary" | "danger" | "outline" | "success";
  textVariant?: "primary" | "default" | "secondary" | "danger" | "success";
  IconLeft?: React.ComponentType<any>;
  IconRight?: React.ComponentType<any>;
  textStyle?: string;
  loading?: boolean;
}

export declare interface InputFieldProps extends TextInputProps {
  label: string;
  icon?: any;
  secureTextEntry?: boolean;
  labelStyle?: string;
  containerStyle?: string;
  inputStyle?: string;
  iconStyle?: string;
  maxLength?: number;
  onChangeText: (text: string) => void;
}

// Base types
type OtpType = "email" | "phone";
type AuthPurpose = "signup" | "signin" | "recovery";

// User and Session types (from Supabase)
interface User {
  id: string;
  email?: string;
  phone?: string;
  user_metadata?: Record<string, any>;
  app_metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  email_confirmed_at?: string;
  phone_confirmed_at?: string;
  last_sign_in_at?: string;
  role?: string;
  aud: string;
}

interface Session {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at?: number;
  token_type: string;
  user: User;
}

// Edge Function Request/Response types
interface EdgeFunctionVerifyRequest {
  phone: string;
  token: string;
  purpose: AuthPurpose;
  otp_code?: string;
  session_id?: string;
}

// Updated Edge Function Response type
interface EdgeFunctionResponse {
  success: boolean;
  message?: string;
  error?: string;

  // New direct session response
  user?: User;
  session?: Session;
  access_token?: string;
  refresh_token?: string;
  phone_verified?: boolean;

  // Fallback properties (for backward compatibility)
  needs_signin?: boolean;
  user_data?: User;
  verified?: boolean;
  manual_signin_required?: boolean;
}

// Auth Operation Result type
interface AuthOperationResult<T = any> {
  data?: T;
  error?: string;
}

// Supabase Auth Response types
interface SupabaseAuthResponse {
  user: User | null;
  session: Session | null;
}

// Phone validation result
interface PhoneValidationResult {
  isValid: boolean;
  normalized?: string;
  error?: string;
}

// Extended types for the verifyOTP response
interface VerifyOTPSuccessResponse {
  user: User;
  session?: Session;
  message?: string;
  verified?: boolean;
  manual_signin_required?: boolean;
}

interface VerifyOTPErrorResponse {
  error: string;
}

export interface VerifyOTPResult {
  data?: {
    user: any;
    session?: any;
    verified: boolean;
    manual_signin_required?: boolean;
    message?: string;
  };
  error?: string;
}
// Admin session creation response
interface AdminSessionResponse {
  user: User;
  session: Session;
}

// Magic link response
interface MagicLinkResponse {
  properties?: {
    access_token?: string;
    refresh_token?: string;
  };
}

// Updated function signatures
type VerifyOtpRequestFunction = (
  phone: string,
  token: string,
  purpose: AuthPurpose
) => Promise<AuthOperationResult<EdgeFunctionResponse>>;

type VerifyOTPFunction = (
  identifier: string,
  token: string,
  type: OtpType,
  purpose: AuthPurpose
) => Promise<VerifyOTPResult>;

type PhoneNormalizerFunction = (phone: string) => PhoneValidationResult;

type CreateUserProfileFunction = (user: User) => Promise<void>;

// Export all types
export type {
  AdminSessionResponse,
  AuthOperationResult,
  AuthPurpose,
  CreateUserProfileFunction,
  EdgeFunctionResponse,
  EdgeFunctionVerifyRequest,
  MagicLinkResponse,
  OtpType,
  PhoneNormalizerFunction,
  PhoneValidationResult,
  Session,
  SupabaseAuthResponse,
  User,
  VerifyOTPErrorResponse,
  VerifyOTPFunction,
  VerifyOtpRequestFunction,
  VerifyOTPSuccessResponse,
};
