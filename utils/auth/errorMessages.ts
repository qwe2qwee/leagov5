// /utils/auth/errorMessages.ts
import { Language } from "@/types";
import { ErrorMessages } from "@/types/authtyps";

export const getLocalizedErrorMessage = (
  errorType: string,
  language: Language = "en"
): string => {
  const messages: ErrorMessages = {
    phoneExists: {
      ar: "رقم الهاتف مسجل مسبقاً",
      en: "Phone number already registered",
    },
    emailExists: {
      ar: "البريد الإلكتروني مسجل مسبقاً",
      en: "Email already registered",
    },
    phoneNotFound: {
      ar: "رقم الهاتف غير مسجل",
      en: "Phone number not found",
    },
    emailNotFound: {
      ar: "البريد الإلكتروني غير مسجل",
      en: "Email not found",
    },
    invalidCredentials: {
      ar: "بيانات الدخول غير صحيحة",
      en: "Invalid credentials",
    },
    invalidOTP: {
      ar: "رمز التحقق غير صحيح",
      en: "Invalid verification code",
    },
    otpExpired: {
      ar: "انتهت صلاحية رمز التحقق",
      en: "Verification code expired",
    },
    networkError: {
      ar: "خطأ في الاتصال",
      en: "Network error",
    },
    signupError: {
      ar: "خطأ في إنشاء الحساب",
      en: "Sign up error",
    },
    signinError: {
      ar: "خطأ في تسجيل الدخول",
      en: "Sign in error",
    },
    accountNotVerified: {
      ar: "الحساب غير مفعل. يرجى تأكيد حسابك أولاً",
      en: "Account not verified. Please verify your account first",
    },
    wrongPassword: {
      ar: "كلمة المرور غير صحيحة",
      en: "Incorrect password",
    },
    emailNotConfirmed: {
      ar: "يرجى تأكيد الإيميل أولاً",
      en: "Please confirm your email first",
    },
    phoneVerifiedSigninManually: {
      ar: "تم التحقق من الهاتف. يرجى تسجيل الدخول يدوياً.",
      en: "Phone verified. Please sign in manually.",
    },
    phoneVerifiedPleaseSignin: {
      ar: "تم التحقق من هاتفك بنجاح. يرجى تسجيل الدخول.",
      en: "Phone verified successfully. Please sign in.",
    },
    signedInSuccessfully: {
      ar: "تم تسجيل الدخول بنجاح",
      en: "Signed in successfully",
    },
    emailLinkSent: {
      ar: "تم إرسال رابط تسجيل الدخول إلى بريدك الإلكتروني",
      en: "Sign-in link sent to your email",
    },
    loginFailed: {
      ar: "فشل في تسجيل الدخول",
      en: "Login failed",
    },
    accountDeleted: {
      ar: "تم حذف هذا الحساب. لا يمكن تسجيل الدخول.",
      en: "This account has been deleted. Cannot login.",
    },
  } as const;

  return messages[errorType]?.[language] || "An error occurred";
};
