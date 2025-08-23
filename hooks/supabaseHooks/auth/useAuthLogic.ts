// /hooks/auth/useAuthLogic.ts
import { supabase } from "@/lib/supabase";
import useLanguageStore from "@/store/useLanguageStore";
import { Language } from "@/types";
import { AuthOperationResult, VerifyOTPResult } from "@/types/AuthTypes";
import { Profile } from "@/types/supabase";
import { sendOtpRequest, verifyOtpRequest } from "@/utils/auth/edgeFunctions";
import { getLocalizedErrorMessage } from "@/utils/auth/errorMessages";
import { logError } from "@/utils/auth/logError";
import { createPhoneNormalizer } from "@/utils/auth/phoneValidator";
import {
  checkCustomerExists,
  createCustomerProfile,
  getCurrentCustomerProfile,
  updateCustomerProfile,
} from "@/utils/auth/profile";
import { withRetry } from "@/utils/auth/retry";
import { Session, User } from "@supabase/supabase-js";
import Constants from "expo-constants";
import {
  MutableRefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AuthMethod,
  AuthPurpose,
  OtpType,
  ProfileSelectResult,
  SignUpUserData,
} from "../../../types/authtyps";

export const useAuthLogic = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [profileLoading, setProfileLoading] = useState<boolean>(false);

  const { currentLanguage } = useLanguageStore();

  const languageRef: MutableRefObject<Language> =
    useRef<Language>(currentLanguage);
  const phoneNormalizer = useMemo(() => createPhoneNormalizer(), []);

  useEffect(() => {
    languageRef.current = currentLanguage;
  }, [currentLanguage]);

  const fetchProfile = useCallback(
    async (silent: boolean = false): Promise<void> => {
      if (!silent) {
        setProfileLoading(true);
      }

      try {
        const profileData = await getCurrentCustomerProfile();

        if (profileData) {
          setProfile(profileData as Profile);
        } else {
          if (!silent) {
            setProfile(null);
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        if (!silent) {
          setProfile(null);
        }
      } finally {
        if (!silent) {
          setProfileLoading(false);
        }
      }
    },
    []
  );

  // Session management
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const initAuth = async (): Promise<void> => {
      try {
        setLoading(true);

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Error getting session:", error);
          throw error;
        }

        if (!isMounted) return;

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchProfile();
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        logError("INIT_AUTH", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      if (event !== "TOKEN_REFRESHED") {
        setLoading(true);
      }

      try {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          try {
            fetchProfile(true).catch(() => {
              console.warn(
                "Silent profile fetch failed during auth state change"
              );
            });
          } catch (error) {
            console.warn(
              "Failed to fetch profile during auth state change:",
              error
            );
          }
        } else {
          setProfile(null);
        }
      } finally {
        if (event !== "TOKEN_REFRESHED") {
          setLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      controller.abort();
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const checkPhoneExists = useCallback(
    async (phone: string): Promise<boolean> => {
      try {
        const validation = phoneNormalizer(phone);
        if (!validation.isValid || !validation.normalized) return false;
        return await checkCustomerExists("phone", validation.normalized);
      } catch (error) {
        logError("CHECK_PHONE_EXISTS", error, { phone });
        return false;
      }
    },
    [phoneNormalizer]
  );

  const checkEmailExists = useCallback(
    async (email: string): Promise<boolean> => {
      try {
        return await checkCustomerExists("email", email.toLowerCase());
      } catch (error) {
        logError("CHECK_EMAIL_EXISTS", error, { email });
        return false;
      }
    },
    []
  );

  function generateRandomPassword(length = 12) {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  // Authentication handlers
  const handleAuth = useCallback(
    async (
      method: AuthMethod,
      identifier: string,
      userData?: SignUpUserData
    ): Promise<AuthOperationResult> => {
      try {
        const lang = languageRef.current;
        let normalizedIdentifier = identifier;

        if (method === "phone") {
          const validation = phoneNormalizer(identifier);
          if (!validation.isValid || !validation.normalized) {
            return { error: validation.error };
          }
          normalizedIdentifier = validation.normalized;
        } else {
          normalizedIdentifier = identifier.toLowerCase();
        }

        const exists =
          method === "phone"
            ? await checkPhoneExists(normalizedIdentifier)
            : await checkEmailExists(normalizedIdentifier);

        if (userData && exists) {
          return { error: getLocalizedErrorMessage(`${method}Exists`, lang) };
        } else if (!userData && !exists) {
          return { error: getLocalizedErrorMessage(`${method}NotFound`, lang) };
        }

        if (method === "phone") {
          const result = await sendOtpRequest(normalizedIdentifier, lang);
          return result;
        }

        // Email flows
        const options: any = { shouldCreateUser: Boolean(userData) };

        if (userData) {
          const phoneValidation = userData.phone
            ? phoneNormalizer(userData.phone)
            : null;
          const randomPassword = generateRandomPassword();

          options.data = {
            full_name: userData.name || "",
            phone: phoneValidation?.normalized || userData.phone || "",
            email: userData.email || "",
            password: randomPassword,
            age: userData.age || null,
            gender: userData.gender || null,
            location: userData.location || null,
            user_latitude: userData.user_latitude || null,
            user_longitude: userData.user_longitude || null,
            signup_method: method,
          };
        }

        const { data, error } = await supabase.auth.signInWithOtp({
          email: normalizedIdentifier,
          options,
        });

        if (error) throw error;
        return { data };
      } catch (error) {
        const operation = userData ? "SIGNUP" : "SIGNIN";
        logError(`${operation}_WITH_${method.toUpperCase()}`, error, {
          identifier,
        });
        return {
          error: getLocalizedErrorMessage(
            userData ? "signupError" : "signinError",
            languageRef.current
          ),
        };
      }
    },
    [checkPhoneExists, checkEmailExists, phoneNormalizer]
  );

  const signUpWithEmail = useCallback(
    (email: string, userData: SignUpUserData): Promise<AuthOperationResult> => {
      const updatedUserData = { ...userData };
      if (userData.phone) {
        const phoneValidation = phoneNormalizer(userData.phone);
        updatedUserData.phone = phoneValidation.normalized || userData.phone;
      }

      return handleAuth("email", email.toLowerCase(), updatedUserData);
    },
    [handleAuth, phoneNormalizer]
  );

  const signUpWithPhone = useCallback(
    (phone: string, userData: SignUpUserData): Promise<AuthOperationResult> => {
      const phoneValidation = phoneNormalizer(phone);
      if (!phoneValidation.isValid || !phoneValidation.normalized) {
        return Promise.resolve({ error: phoneValidation.error });
      }

      return handleAuth("phone", phoneValidation.normalized, {
        ...userData,
        phone: phoneValidation.normalized,
      });
    },
    [handleAuth, phoneNormalizer]
  );

  const signInWithPhone = useCallback(
    (phone: string): Promise<AuthOperationResult> => {
      const phoneValidation = phoneNormalizer(phone);
      if (!phoneValidation.isValid || !phoneValidation.normalized) {
        return Promise.resolve({ error: phoneValidation.error });
      }
      return handleAuth("phone", phoneValidation.normalized);
    },
    [handleAuth, phoneNormalizer]
  );

  const signInWithEmail = useCallback(
    (email: string): Promise<AuthOperationResult> =>
      handleAuth("email", email.toLowerCase()),
    [handleAuth]
  );

  const signInWithPassword = useCallback(
    async (
      identifier: string,
      password: string
    ): Promise<AuthOperationResult> => {
      try {
        const lang = languageRef.current;
        let authIdentifier = identifier;

        if (!identifier.includes("@")) {
          const phoneValidation = phoneNormalizer(identifier);
          if (!phoneValidation.isValid || !phoneValidation.normalized) {
            return { error: phoneValidation.error };
          }

          const { data: profile } = await supabase
            .from("profiles")
            .select("email, is_verified")
            .eq("phone", phoneValidation.normalized)
            .single();

          const profileData = profile as ProfileSelectResult | null;

          if (!profileData?.email) {
            return { error: getLocalizedErrorMessage("phoneNotFound", lang) };
          }

          if (!profileData.is_verified) {
            return {
              error: getLocalizedErrorMessage("accountNotVerified", lang),
            };
          }

          authIdentifier = profileData.email;
        } else {
          const { data: profile } = await supabase
            .from("profiles")
            .select("is_verified")
            .eq("email", identifier.toLowerCase())
            .single();

          const profileData = profile as Pick<
            ProfileSelectResult,
            "is_verified"
          > | null;

          if (!profileData) {
            return { error: getLocalizedErrorMessage("emailNotFound", lang) };
          }

          if (!profileData.is_verified) {
            return {
              error: getLocalizedErrorMessage("accountNotVerified", lang),
            };
          }
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email: authIdentifier.toLowerCase(),
          password,
        });

        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            return { error: getLocalizedErrorMessage("wrongPassword", lang) };
          }
          if (error.message.includes("Email not confirmed")) {
            return {
              error: getLocalizedErrorMessage("emailNotConfirmed", lang),
            };
          }
          throw error;
        }

        return { data };
      } catch (error) {
        logError("SIGNIN_WITH_PASSWORD", error, { identifier });
        return {
          error: getLocalizedErrorMessage(
            "invalidCredentials",
            languageRef.current
          ),
        };
      }
    },
    [phoneNormalizer]
  );

  const verifyOTP = useCallback(
    async (
      identifier: string,
      token: string,
      type: OtpType,
      purpose: AuthPurpose
    ): Promise<VerifyOTPResult> => {
      const lang = languageRef.current;

      try {
        // ----------------- Email OTP -----------------
        if (type === "email") {
          const { data, error } = await supabase.auth.verifyOtp({
            email: identifier.toLowerCase(),
            token,
            type: "email",
          });

          if (error) {
            const message = error.message.includes("expired")
              ? getLocalizedErrorMessage("otpExpired", lang)
              : getLocalizedErrorMessage("invalidOTP", lang);
            return { error: message };
          }

          if (purpose === "signup" && data.user) {
            await withRetry(() => createCustomerProfile(data.user as any));
          }

          if (
            purpose === "signin" &&
            !data.session?.access_token &&
            data.user?.email &&
            (data.user as any).password
          ) {
            try {
              const { data: signInData, error: signInError } =
                await supabase.auth.signInWithPassword({
                  email: data.user.email,
                  password: (data.user as any).password,
                });

              if (!signInError && signInData?.session) {
                setSession(signInData.session);
                setUser(signInData.user as any);
                await supabase.auth.refreshSession().catch(() => {});
                if (signInData.user) {
                  fetchProfile(true).catch(() => {
                    console.warn(
                      "Silent profile fetch failed after email signin"
                    );
                  });
                }
                return {
                  data: {
                    user: signInData.user,
                    session: signInData.session,
                    verified: true,
                    message: getLocalizedErrorMessage(
                      "signedInSuccessfully",
                      lang
                    ),
                  },
                };
              }
            } catch (e) {
              console.warn("Email fallback signInWithPassword failed:", e);
            }
          }

          return {
            data: { user: data.user, session: data.session, verified: true },
          };
        }

        // ----------------- Phone OTP -----------------
        const res: any = await verifyOtpRequest(
          identifier,
          token,
          purpose,
          lang
        );
        if (res.error) return { error: res.error };

        const tempPassword = res.data?.temp_password;
        const serverUser = res.data?.user;

        if (!serverUser) {
          console.error("verifyOtpRequest returned no user data", { res });
          return { error: getLocalizedErrorMessage("invalidOTP", lang) };
        }

        // إنشاء الـ profile في حالة التسجيل
        if (purpose === "signup") {
          try {
            await withRetry(() => createCustomerProfile(serverUser));
          } catch (profileErr) {
            console.warn(
              "createCustomerProfile failed (continuing):",
              profileErr
            );
          }
        }

        if (!serverUser.email || !tempPassword) {
          console.error(
            "Missing email or temp_password in serverUser:",
            serverUser
          );
          return {
            data: {
              user: serverUser || { id: "", phone: identifier },
              verified: true,
              manual_signin_required: true,
              message: getLocalizedErrorMessage(
                "phoneVerifiedPleaseSignin",
                lang
              ),
            },
          };
        }

        try {
          const { data: signInData, error: signInError } =
            await supabase.auth.signInWithPassword({
              email: serverUser.email,
              password: tempPassword,
            });

          if (signInError) {
            console.error("signInWithPassword failed:", signInError);
            return { error: getLocalizedErrorMessage("loginFailed", lang) };
          }

          if (!signInData?.session || !signInData?.user) {
            console.error("signIn returned no session/user:", signInData);
            return { error: getLocalizedErrorMessage("loginFailed", lang) };
          }

          setSession(signInData.session);
          setUser(signInData.user as any);

          try {
            await supabase.auth.refreshSession();
          } catch (refreshError) {
            console.warn("Session refresh failed:", refreshError);
          }

          if (signInData.user) {
            try {
              await fetchProfile();
            } catch (profileError) {
              console.warn("Profile fetch failed:", profileError);
            }
          }

          return {
            data: {
              user: signInData.user as any,
              session: signInData.session,
              verified: true,
              message: getLocalizedErrorMessage("signedInSuccessfully", lang),
            },
          };
        } catch (signinEx) {
          console.error("Error during password signin:", signinEx);
          return { error: getLocalizedErrorMessage("loginFailed", lang) };
        }
      } catch (error) {
        console.error("VERIFY_OTP Error:", error);
        logError("VERIFY_OTP", error, { identifier, type });
        return {
          error: getLocalizedErrorMessage("invalidOTP", languageRef.current),
        };
      }
    },
    [phoneNormalizer, fetchProfile]
  );

  const resendOTP = useCallback(
    async (
      identifier: string,
      type: AuthMethod
    ): Promise<Pick<AuthOperationResult, "error">> => {
      try {
        if (type === "email") {
          const { error } = await supabase.auth.signInWithOtp({
            email: identifier.toLowerCase(),
          });
          if (error) throw error;
          return {};
        }

        const res = await sendOtpRequest(identifier, languageRef.current);
        if (res.error) return { error: res.error };
        return {};
      } catch (error) {
        logError("RESEND_OTP", error, { identifier, type });
        return {
          error: getLocalizedErrorMessage("networkError", languageRef.current),
        };
      }
    },
    []
  );

  const signOut = useCallback(async (): Promise<
    Pick<AuthOperationResult, "error">
  > => {
    try {
      await supabase.auth.signOut();
      return {};
    } catch (error) {
      logError("SIGN_OUT", error);
      return { error: "Sign out failed" };
    }
  }, []);

  const updateProfile = useCallback(
    async (
      updates: Partial<Profile>
    ): Promise<Pick<AuthOperationResult, "error">> => {
      if (!user) return { error: "No user logged in" };

      try {
        // تحويل البيانات للصيغة المطلوبة في updateCustomerProfile
        const customerUpdates = {
          full_name: updates.full_name,
          phone: updates.phone,
          location: updates.location,
          age: updates.age,
          gender: updates.gender,
          user_latitude: updates.user_latitude,
          user_longitude: updates.user_longitude,
        };

        await updateCustomerProfile(customerUpdates as any);

        // تحديث الـ profile المحلي
        setProfile((prev) => (prev ? { ...prev, ...updates } : null));
        return {};
      } catch (error) {
        logError("UPDATE_PROFILE", error, { updates });
        return { error: "Profile update failed" };
      }
    },
    [user]
  );

  const resetPassword = useCallback(
    async (email: string): Promise<Pick<AuthOperationResult, "error">> => {
      try {
        await supabase.auth.resetPasswordForEmail(email.toLowerCase(), {
          redirectTo: Constants?.expoConfig?.extra?.DEEP_LINK_URL
            ? `${Constants.expoConfig.extra.DEEP_LINK_URL}/reset-password`
            : `myapp://reset-password`,
        });
        return {};
      } catch (error) {
        logError("RESET_PASSWORD", error, { email });
        return { error: "Password reset failed" };
      }
    },
    []
  );

  // Memoized context value
  const contextValue = useMemo(
    () => ({
      session,
      user,
      profile,
      loading,
      profileLoading,
      signUpWithPhone,
      signUpWithEmail,
      signInWithPhone,
      signInWithEmail,
      signInWithPassword,
      verifyOTP,
      resendOTP,
      signOut,
      updateProfile,
      resetPassword,
      checkPhoneExists,
      checkEmailExists,
    }),
    [
      session,
      user,
      profile,
      loading,
      profileLoading,
      signUpWithPhone,
      signUpWithEmail,
      signInWithPhone,
      signInWithEmail,
      signInWithPassword,
      verifyOTP,
      resendOTP,
      signOut,
      updateProfile,
      resetPassword,
      checkPhoneExists,
      checkEmailExists,
    ]
  );

  return contextValue;
};
