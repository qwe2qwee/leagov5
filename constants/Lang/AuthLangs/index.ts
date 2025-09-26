import { images } from "@/constants";

// Type definitions for translations
interface LanguageTranslation {
  en: string;
  ar: string;
}

interface LoginTranslations {
  loginTitle: string;
  fillData: string;
  signUp: string;
  phone: string;
  email: string;
  password: string;
  signIn: string;
  forgotPassword: string;
  noAccount: string;
  createAccount: string;
  error: string;
  missingFields: string;
  invalidPhoneNumber: string;
}

interface SignUpTranslations {
  createAccount: string;
  fillData: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  placeHol: string;
  signUp: string;
  alreadyAccount: string;
  signIn: string;
  error: string;
  missingFields: string;
  invalidEmail: string;
  invalidPhone: string;
  weakPassword: string;
  emailExists: string;
  phoneNumberExists: string;
  invalidPhoneNumber: string;
  nameRequired: string;
  nameMinLength: string;
  emailRequired: string;
  phoneRequired: string;
  fixErrors: string;
  loading: string;
  signupError: string;
  otpResent: string;
  otpResendError: string;
}

interface ResetPasswordTranslations {
  title: string;
  newPasswordPlaceholder: string;
  confirmPasswordPlaceholder: string;
  successToastTitle: string;
  successToastMessage: string;
  errorEmptyFields: string;
  errorMismatch: string;
  errorShortPassword: string;
  errorOldPasswordMissing: string;
  errorResetFailed: string;
  confirmButton: string;
}

interface ForgetPasswordTranslations {
  enterPhone: string;
  enterEmail: string;
  phoneLabel: string;
  emailLabel: string;
  errorEmptyField: string;
  errorPhoneNotFound: string;
  errorEmailNotFound: string;
  sendOtpError: string;
  backButton: string;
  continue: string;
}
// Translation interface
interface OTPTranslations {
  title: string;
  descriptionText: string;
  verifying: string;
  verify: string;
  resendOTP: string;
  invalidOTP: string;
  completeOTP: string;
  verificationError: string;
}
interface VerificationForgotTranslations {
  verifyPhone: string;
  verifyEmail: string;
  otpPromptPhone: string;
  otpPromptEmail: string;
  resendCode: string;
  codeResent: string;
  continue: string;
  fullOtpRequired: string;
  otpSuccess: string;
  otpError: string;
  resendOtpError: string;
  userNotFound: string;
}

interface ModalResetTranslations {
  successTitle: string;
  errorTitle: string;
  buttonText: string;
}

interface DocumentErrors {
  document_pick_failed: LanguageTranslation;
  upload_failed: LanguageTranslation;
}

// Translation interface for ForgetReset component

// Updated interface to include all the new translation keys
interface ForgetResetTranslations {
  // Page titles and headers
  enterPhone: string;
  enterEmail: string;
  pageTitle: string;

  // Form labels and placeholders
  phoneLabel: string;
  emailLabel: string;
  phonePlaceholder: string;
  emailPlaceholder: string;

  // Button texts
  continue: string;
  loading: string;
  backButton: string;
  switchToEmail: string;
  switchToPhone: string;

  // Success messages
  otpSentPhone: string;
  otpSentEmail: string;
  verificationSuccessful: string;

  // Error messages
  errorEmptyField: string;
  errorPhoneNotFound: string;
  errorEmailNotFound: string;
  errorInvalidPhone: string;
  errorInvalidEmail: string;
  sendOtpError: string;
  networkError: string;
  serverError: string;

  // Loading and status messages
  checkingPhone: string;
  checkingEmail: string;
  sendingOtp: string;
  pleaseWait: string;

  // Navigation and interaction
  navigationLocked: string;
  processInProgress: string;

  // Accessibility and helper texts
  backButtonHint: string;
  switchTypeHint: string;
  continueButtonHint: string;

  // Nested objects
  verification: {
    verifyTitle: string;
    verificationSent: string;
    confirm: string;
    cancel: string;
    close: string;
  };

  errorModal: {
    title: string;
    ok: string;
    tryAgain: string;
  };

  toast: {
    success: string;
    error: string;
    warning: string;
    info: string;
  };
}

// Translation interface for SignUpModals component
interface SignUpModalsTranslations {
  accountCreatedSuccess: string;
  invalidVerificationCode: string;
  verificationFailed: string;
  verificationCodeResent: string;
  failedToResendCode: string;
}

export type TranslationSignUpKeys = keyof typeof translationsignUp;

// Translation interface for SignInModals
interface SignInModalsTranslations {
  // Modal titles and headers
  verificationCode: string;
  verificationCodeSentPhone: string;
  verificationCodeSentEmail: string;

  // Toast messages - Success
  signInSuccessful: string;
  verificationCodeResent: string;

  // Toast messages - Error/Warning
  invalidVerificationCode: string;
  verificationFailed: string;
  resendFailed: string;

  // Button text
  cancel: string;

  // Contact type labels
  phoneNumber: string;
  email: string;
}

// Translation interface for SignInOTPComponent
interface SignInOTPTranslations {
  // Header texts
  title: string;
  subtitlePhone: string;
  subtitleEmail: string;

  // Button texts
  verify: string;
  resend: string;
  close: string;

  // Timer and resend
  resendIn: string;
  seconds: string;

  // Validation messages
  invalidOTP: string;
  maxAttemptsReached: string;
  enterCompleteOTP: string;
  numbersOnlyError: string;

  // Success messages
  otpSent: string;
  successTitle: string;

  // Error messages
  failedToResend: string;

  // Contact type references
  phoneReference: string;
  emailReference: string;
}

// Updated interface for ForgetReset translations
interface ForgetResetTranslations {
  // Page titles and headers
  enterPhone: string;
  enterEmail: string;
  pageTitle: string;

  // Form labels and placeholders
  phoneLabel: string;
  emailLabel: string;
  phonePlaceholder: string;
  emailPlaceholder: string;

  // Button texts
  continue: string;
  loading: string;
  backButton: string;
  switchToEmail: string;
  switchToPhone: string;

  // Success messages
  otpSentPhone: string;
  otpSentEmail: string;
  verificationSuccessful: string;

  // Error messages
  errorEmptyField: string;
  errorPhoneNotFound: string;
  errorEmailNotFound: string;
  errorInvalidPhone: string;
  errorInvalidEmail: string;
  sendOtpError: string;
  networkError: string;
  serverError: string;

  // Loading and status messages
  checkingPhone: string;
  checkingEmail: string;
  sendingOtp: string;
  pleaseWait: string;

  // Navigation and interaction
  navigationLocked: string;
  processInProgress: string;

  // Accessibility and helper texts
  backButtonHint: string;
  switchTypeHint: string;
  continueButtonHint: string;

  // Nested objects
  verification: {
    verifyTitle: string;
    verificationSent: string;
    confirm: string;
    cancel: string;
    close: string;
  };

  errorModal: {
    title: string;
    ok: string;
    tryAgain: string;
  };

  toast: {
    success: string;
    error: string;
    warning: string;
    info: string;
  };
}

// Enhanced ForgetReset translations with all the new strings
export const forgetResetTranslations: {
  en: ForgetResetTranslations;
  ar: ForgetResetTranslations;
} = {
  en: {
    // Page titles and headers
    enterPhone: "Enter your phone number",
    enterEmail: "Enter your email address",
    pageTitle: "Reset Password",

    // Form labels and placeholders
    phoneLabel: "Phone Number",
    emailLabel: "Email Address",
    phonePlaceholder: "Enter 9 digits without country code",
    emailPlaceholder: "Enter your email address",

    // Button texts
    continue: "Continue",
    loading: "Loading...",
    backButton: "Back",
    switchToEmail: "Use Email Instead",
    switchToPhone: "Use Phone Instead",

    // Success messages
    otpSentPhone: "OTP sent to your phone 📱",
    otpSentEmail: "OTP sent to your email 📧",
    verificationSuccessful: "Verification successful! ✅",

    // Error messages
    errorEmptyField: "Please fill in the required field",
    errorPhoneNotFound: "Phone number not found",
    errorEmailNotFound: "Email address not found",
    errorInvalidPhone: "Please enter a valid 9-digit phone number",
    errorInvalidEmail: "Please enter a valid email address",
    sendOtpError: "Failed to send verification code",
    networkError: "Network error. Please check your connection",
    serverError: "Server error. Please try again later",

    // Loading and status messages
    checkingPhone: "Checking phone number...",
    checkingEmail: "Checking email address...",
    sendingOtp: "Sending verification code...",
    pleaseWait: "Please wait...",

    // Navigation and interaction
    navigationLocked: "Please wait for the current process to complete",
    processInProgress: "Process in progress...",

    // Accessibility and helper texts
    backButtonHint: "Go back to sign in",
    switchTypeHint: "Switch between phone and email verification",
    continueButtonHint: "Proceed to verification step",

    // Modal and verification texts
    verification: {
      verifyTitle: "Verify Code",
      verificationSent: "Verification code has been sent",
      confirm: "Confirm",
      cancel: "Cancel",
      close: "Close",
    },

    // Error modal texts
    errorModal: {
      title: "Error",
      ok: "OK",
      tryAgain: "Try Again",
    },

    // Toast messages
    toast: {
      success: "Success",
      error: "Error",
      warning: "Warning",
      info: "Information",
    },
  },

  ar: {
    // Page titles and headers
    enterPhone: "اكتب رقم جوالك",
    enterEmail: "اكتب إيميلك",
    pageTitle: "استعادة كلمة السر",

    // Form labels and placeholders
    phoneLabel: "الجوال",
    emailLabel: "الإيميل",
    phonePlaceholder: "اكتب 9 أرقام بدون كود الدولة",
    emailPlaceholder: "اكتب إيميلك",

    // Button texts
    continue: "كمّل",
    loading: "جارٍ التحميل...",
    backButton: "رجوع",
    switchToEmail: "استخدم الإيميل بدلاً من كذا",
    switchToPhone: "استخدم الجوال بدلاً من كذا",

    // Success messages
    otpSentPhone: "رسلنا لك رمز التحقق على جوالك 📱",
    otpSentEmail: "رسلنا لك رمز التحقق على إيميلك 📧",
    verificationSuccessful: "تم التحقق بنجاح! ✅",

    // Error messages
    errorEmptyField: "عبّي الخانة المطلوبة",
    errorPhoneNotFound: "ما لقينا رقم الجوال هذا",
    errorEmailNotFound: "ما لقينا الإيميل هذا",
    errorInvalidPhone: "اكتب رقم جوال صحيح من 9 أرقام",
    errorInvalidEmail: "اكتب إيميل صحيح",
    sendOtpError: "ما قدرنا نرسل رمز التحقق",
    networkError: "مشكلة في الشبكة، تأكد من الاتصال",
    serverError: "مشكلة في السيرفر، جرّب بعدين",

    // Loading and status messages
    checkingPhone: "نتأكد من رقم الجوال...",
    checkingEmail: "نتأكد من الإيميل...",
    sendingOtp: "نرسل رمز التحقق...",
    pleaseWait: "يرجى الانتظار...",

    // Navigation and interaction
    navigationLocked: "استنى خلاص العملية الحالية",
    processInProgress: "العملية قاعدة تتم...",

    // Accessibility and helper texts
    backButtonHint: "ارجع لصفحة تسجيل الدخول",
    switchTypeHint: "بدّل بين التحقق بالجوال أو الإيميل",
    continueButtonHint: "روح لخطوة التحقق",

    // Modal and verification texts
    verification: {
      verifyTitle: "أكّد الرمز",
      verificationSent: "رسلنا لك رمز التحقق",
      confirm: "أكّد",
      cancel: "رجوع",
      close: "سكّر",
    },

    // Error modal texts
    errorModal: {
      title: "خطأ",
      ok: "تم",
      tryAgain: "حاول مرة ثانية",
    },

    // Toast messages
    toast: {
      success: "نجح",
      error: "خطأ",
      warning: "تحذير",
      info: "معلومة",
    },
  },
};

// Keep all your existing translations (onboarding, login, signup, etc.)
// Add the updated forgetResetTranslations to replace the old one
// SignInOTPComponent translations
export const signInOTPTranslations: {
  en: SignInOTPTranslations;
  ar: SignInOTPTranslations;
} = {
  en: {
    // Header texts
    title: "Verification Code",
    subtitlePhone: "Enter the verification code sent to your phone",
    subtitleEmail: "Enter the verification code sent to your email",

    // Button texts
    verify: "Verify",
    resend: "Resend",
    close: "Close",

    // Timer and resend
    resendIn: "Resend in",
    seconds: "seconds",

    // Validation messages
    invalidOTP: "Invalid verification code",
    maxAttemptsReached: "Maximum attempts reached",
    enterCompleteOTP: "Please enter complete verification code",
    numbersOnlyError: "OTP should contain only numbers",

    // Success messages
    otpSent: "Verification code resent",
    successTitle: "Success",

    // Error messages
    failedToResend: "Failed to resend OTP",

    // Contact type references
    phoneReference: "phone",
    emailReference: "email",
  },
  ar: {
    // Header texts
    title: "رمز التحقق",
    subtitlePhone: "اكتب الرمز اللي وصل على جوالك",
    subtitleEmail: "اكتب الرمز اللي وصل على إيميلك",

    // Button texts
    verify: "أكّد",
    resend: "أرسل مرّة ثانية",
    close: "سكر",

    // Timer and resend
    resendIn: "نرجع نرسله بعد",
    seconds: "ثانية",

    // Validation messages
    invalidOTP: "الرمز مو صح",
    maxAttemptsReached: "خلاص خلصت المحاولات",
    enterCompleteOTP: "كمّل كتابة الرمز الله يعافيك",
    numbersOnlyError: "الرمز لازم يكون أرقام بس",

    // Success messages
    otpSent: "أرسلنا لك الرمز مرّة ثانية",
    successTitle: "تم",

    // Error messages
    failedToResend: "ما قدرنا نرسله، جرّب مرّة ثانية",

    // Contact type references
    phoneReference: "جوالك",
    emailReference: "إيميلك",
  },
};

// SignInModals translations
export const signInModalsTranslations: {
  en: SignInModalsTranslations;
  ar: SignInModalsTranslations;
} = {
  en: {
    // Modal titles and headers
    verificationCode: "Verification Code",
    verificationCodeSentPhone: "Verification code sent to your phone number",
    verificationCodeSentEmail: "Verification code sent to your email",

    // Toast messages - Success
    signInSuccessful: "Successfully signed in 🎉",
    verificationCodeResent: "Verification code resent 📤",

    // Toast messages - Error/Warning
    invalidVerificationCode: "Invalid verification code ⚠️",
    verificationFailed: "Verification failed ✕",
    resendFailed: "Failed to resend code ✕",

    // Button text
    cancel: "Cancel",

    // Contact type labels
    phoneNumber: "phone number",
    email: "email",
  },
  ar: {
    // Modal titles and headers
    verificationCode: "رمز التحقق",
    verificationCodeSentPhone: "رسلنا لك الرمز على جوالك",
    verificationCodeSentEmail: "رسلنا لك الرمز على إيميلك",

    // Toast messages - Success
    signInSuccessful: "دخلت الحساب بنجاح 🎉",
    verificationCodeResent: "أرسلنا الرمز من جديد 📤",

    // Toast messages - Error/Warning
    invalidVerificationCode: "الرمز اللي دخلته مو صحيح ⚠️",
    verificationFailed: "صار خطأ وقت التحقق ✕",
    resendFailed: "ما قدرنا نرسل الرمز ✕",

    // Button text
    cancel: "رجوع",

    // Contact type labels
    phoneNumber: "جوالك",
    email: "إيميلك",
  },
};

// SignUp Modals component translations
export const signUpModalsTranslations: {
  en: SignUpModalsTranslations;
  ar: SignUpModalsTranslations;
} = {
  en: {
    accountCreatedSuccess: "Account created successfully ✓",
    invalidVerificationCode: "Invalid verification code ⚠️",
    verificationFailed: "Verification failed ✕",
    verificationCodeResent: "Verification code resent 📤",
    failedToResendCode: "Failed to resend code ✕",
  },
  ar: {
    accountCreatedSuccess: "الحساب انشأناه بنجاح ✓",
    invalidVerificationCode: "الرمز اللي دخلته مو صحيح ⚠️",
    verificationFailed: "صار خطأ وقت التحقق ✕",
    verificationCodeResent: "أرسلنا الرمز من جديد 📤",
    failedToResendCode: "ما قدرنا نرسل الرمز ✕",
  },
};

// login translations
export const translationsLogin: {
  en: LoginTranslations;
  ar: LoginTranslations;
} = {
  en: {
    loginTitle: "Welcome Back!",
    fillData: "Please fill in the data to log in to your account",
    email: "Email",
    password: "Password",
    phone: "Phone",
    signIn: "Log In",
    forgotPassword: "Forgot Password?",
    signUp: "Sign Up",

    noAccount: "Don't have an account?",
    createAccount: "Create one",
    error: "Error",
    missingFields: "enter your Phone number.",
    invalidPhoneNumber: "The phone number must contain exactly 9 numbers ",
  },
  ar: {
    loginTitle: "يا هلا بعودتك!",
    fillData: "عبّي بياناتك عشان تدخل لحسابك",
    email: "الإيميل",
    password: "كلمة السر",
    signUp: "سجّل",

    signIn: "سجّل دخول",
    phone: "رقم الجوال",
    forgotPassword: "نسيت كلمة السر؟",
    noAccount: "ما عندك حساب؟",
    createAccount: "سوّي حساب",
    error: "فيه خطأ",
    missingFields: "اكتب رقم جوالك.",
    invalidPhoneNumber: "رقم الجوال لازم يكون 9 أرقام",
  },
};

// Basic translations for English and Arabic For Sign Up
export const translationsignUp: {
  en: SignUpTranslations;
  ar: SignUpTranslations;
} = {
  en: {
    createAccount: "Create Your Account",
    fillData: "Please fill in the required data below",
    name: "Name",
    email: "Email",
    phone: "Phone Number",
    password: "Password",
    placeHol: "500000000",
    signUp: "Sign Up",
    alreadyAccount: "Already have an account?",
    signIn: "Sign In",
    error: "Error",
    missingFields: "Please fill all fields",
    invalidEmail: "Invalid email format",
    invalidPhone: "Phone number must be 13 digits (including country code)",
    weakPassword: "Password must be at least 8 characters",
    emailExists: "Email already exists",
    phoneNumberExists: "Phone number already exists",
    invalidPhoneNumber: "The phone number must contain exactly 9 numbers ",
    nameRequired: "Name is required",
    nameMinLength: "Name must be at least 2 characters",
    emailRequired: "Email is required",
    phoneRequired: "Phone number is required",
    fixErrors: "Please fix the errors below",
    loading: "Loading...",
    signupError: "Error during signup",
    otpResent: "OTP resent successfully",
    otpResendError: "Failed to resend OTP",
  },
  ar: {
    createAccount: "سوّي حسابك",
    fillData: "عبّي البيانات المطلوبة تحت",
    name: "الاسم",
    email: "الإيميل",
    phone: "الجوال",
    password: "كلمة السر",
    placeHol: "500000000",
    signUp: "سجّل",
    alreadyAccount: "عندك حساب من قبل؟",
    signIn: "سجّل دخول",
    error: "فيه خطأ",
    missingFields: "عبي كل الخانات",
    invalidEmail: "الإيميل شكله مو صحيح",
    invalidPhone: "رقم الجوال لازم يكون 13 رقم (مع كود الدولة)",
    weakPassword: "كلمة السر لازم تكون 8 حروف أو أكثر",
    emailExists: "الإيميل موجود من قبل",
    phoneNumberExists: "رقم الجوال موجود من قبل",
    invalidPhoneNumber: "رقم الجوال لازم يكون 9 أرقام",
    // ✅ إضافات باللهجة
    nameRequired: "الاسم لازم تكتبه",
    nameMinLength: "الاسم لازم يكون حرفين أو أكثر",
    emailRequired: "الإيميل لازم تكتبه",
    phoneRequired: "رقم الجوال لازم تكتبه",
    fixErrors: "صلّح الأخطاء اللي تحت",
    loading: "جارٍ التحميل...",
    signupError: "صار خطأ وقت التسجيل",
    otpResent: "رسلنا رمز التحقق من جديد",
    otpResendError: "ما قدرنا نرسل الرمز",
  },
};

export const translationReset: {
  en: ResetPasswordTranslations;
  ar: ResetPasswordTranslations;
} = {
  en: {
    title: "Reset Password",
    newPasswordPlaceholder: "New Password",
    confirmPasswordPlaceholder: "Confirm Password",
    successToastTitle: "Done",
    successToastMessage: "Password reset successfully. 👋",
    errorEmptyFields:
      "Please enter the new password and confirmation password.",
    errorMismatch: "Passwords do not match.",
    errorShortPassword: "Password must be longer than 6 characters.",
    errorOldPasswordMissing: "Old password is missing. Please try again later.",
    errorResetFailed: "Failed to reset password. Please try again.",
    confirmButton: "Confirm",
  },
  ar: {
    title: "تغيير كلمة السر",
    newPasswordPlaceholder: "كلمة السر الجديدة",
    confirmPasswordPlaceholder: "أكّد كلمة السر",
    successToastTitle: "تم",
    successToastMessage: "تغيّرت كلمة السر بنجاح 👋",
    errorEmptyFields: "اكتب كلمة السر وكلمة السر الجديدة.",
    errorMismatch: "كلمات السر ما تطابقوا.",
    errorShortPassword: "كلمة السر لازم تكون أكثر من 6 حروف.",
    errorOldPasswordMissing: "كلمة السر القديمة مو موجودة. جرّب بعدين.",
    errorResetFailed: "ما قدرنا نغيّر كلمة السر. حاول مرّة ثانية.",
    confirmButton: "أكّد",
  },
};

export const onboarding = [
  {
    id: 1,
    skip: {
      en: "Skip",
      ar: "تخطى",
    },
    title: {
      en: "Find the perfect ride near you!",
      ar: "اعثر على السيارة المثالية بالقرب منك!",
    },
    description: {
      en: "Choose from a variety of cars at our convenient branch locations.",
      ar: "اختر من بين مجموعة متنوعة من السيارات في فروعنا القريبة.",
    },
    image: {
      en: images.onboarding1_en, // English image variant
      ar: images.onboarding1_ar, // Arabic image variant
    },
  },
  {
    id: 2,
    skip: {
      en: "Skip",
      ar: "تخطى",
    },
    title: {
      en: "Easy car rental at your nearest branch",
      ar: "تأجير السيارات بسهولة في أقرب فرع لك",
    },
    description: {
      en: "Our branches are ready to serve you. Just book and pick up your car.",
      ar: "فروعنا جاهزة لخدمتك. فقط احجز واستلم سيارتك.",
    },
    image: {
      en: images.onboarding2, // English image variant
      ar: images.onboarding2, // Arabic image variant
    },
  },
  {
    id: 3,
    title: {
      en: "Your ride, your rules!",
      ar: "رحلتك، قواعدك!",
    },
    description: {
      en: "Drive away in your chosen car. Pick it up from the nearest branch.",
      ar: "قد سيارتك التي اخترتها. استلمها من أقرب فرع.",
    },
    image: {
      en: images.onboarding3, // English image variant
      ar: images.onboarding3, // Arabic image variant
    },
  },
];

export const buttonTitles = {
  ar: {
    next: "التالي",
    getStarted: "ابدأ الآن",
  },
  en: {
    next: "Next",
    getStarted: "Get Started",
  },
};

export const data = {
  onboarding,
};
// Forget Password
export const translationForget: {
  en: ForgetPasswordTranslations;
  ar: ForgetPasswordTranslations;
} = {
  ar: {
    enterPhone: "اكتب رقم جوالك",
    enterEmail: "اكتب بريدك الإلكتروني",
    phoneLabel: "رقم الجوال",
    emailLabel: "الإيميل",
    errorEmptyField: "اكتب رقم جوالك أو بريدك الإلكتروني",
    errorPhoneNotFound: "ما لقينا رقم الجوال في التطبيق.",
    errorEmailNotFound: "ما لقينا البريد الإلكتروني في التطبيق.",
    sendOtpError: "صار خطأ وقت إرسال رمز التحقق. حاول مرّة ثانية.",
    backButton: "رجوع",
    continue: "كمل",
  },

  en: {
    enterPhone: "Enter your phone number",
    enterEmail: "Enter your email address",
    phoneLabel: "Phone Number",
    emailLabel: "Email Address",
    errorEmptyField: "Please enter your phone number or email address",
    errorPhoneNotFound: "Phone number not found in the app.",
    errorEmailNotFound: "Email not found in the app.",
    sendOtpError: "An error occurred while sending OTP. Please try again.",
    backButton: "Back",
    continue: "Continue",
  },
};

export const translationsVerificationForgot: {
  en: VerificationForgotTranslations;
  ar: VerificationForgotTranslations;
} = {
  ar: {
    verifyPhone: "تحقق من جوالك",
    verifyEmail: "تحقق من إيميلك",
    otpPromptPhone: "اكتب الرمز اللي أرسلناه على جوالك",
    otpPromptEmail: "اكتب الرمز اللي أرسلناه على إيميلك",
    resendCode: "أرسل الكود مرّة ثانية",
    codeResent: "أرسلنا الكود من جديد",
    continue: "كمل",
    fullOtpRequired: "اكتب الرمز كامل لو سمحت.",
    otpSuccess: "تم التحقق بنجاح.",
    otpError: "ما قدرنا نتحقق من الرمز.",
    resendOtpError: "صار خطأ وقت إعادة إرسال الرمز.",
    userNotFound: "ما لقينا المستخدم.",
  },
  en: {
    verifyPhone: "Verify Phone Number",
    verifyEmail: "Verify Email Address",
    otpPromptPhone: "Enter the verification code sent to your number",
    otpPromptEmail: "Enter the verification code sent to your email",
    resendCode: "Resend Code",
    codeResent: "Code Resent",
    continue: "Continue",
    fullOtpRequired: "Please enter the full verification code.",
    otpSuccess: "Verification successful.",
    otpError: "Failed to verify the code.",
    resendOtpError: "An error occurred while resending the code.",
    userNotFound: "Failed to find the user.",
  },
};

export const onboardingDocs = [
  {
    id: 1,
    skip: {
      en: "Next",
      ar: "قدّام",
    },
    title: {
      en: "Upload Your Identity",
      ar: "حمّل هويتك",
    },
    description: {
      en: "For secure rentals, upload a clear photo of your ID or driver's license. This step ensures your profile is verified and ready to start renting cars.",
      ar: "عشان تستأجر بأمان، صوّر هويتك أو الرخصة بوضوح وارفَعها. كذا نقدر نفعّل حسابك وتبدأ تستأجر على طول.",
    },
    selectUsersDocument: {
      en: "Select Identity",
      ar: "اختر الهوية",
    },
  },
  {
    id: 2,
    skip: {
      en: "Upload",
      ar: "ارفع",
    },
    title: {
      en: "Upload Your License",
      ar: "حمّل رخصتك",
    },
    description: {
      en: "To ensure compliance and safety, please select the type of license you hold. This helps us match you with vehicles that suit your license qualifications.",
      ar: "اختار نوع الرخصة اللي معاك عشان نطابقك مع السيارات المناسبة، ونضمن السلامة والأنظمة.",
    },
    selectUsersDocument: {
      en: "Select License",
      ar: "اختر الرخصة",
    },
    errors: {
      document_pick_failed: {
        en: "Document selection failed",
        ar: "ما قدرنا نختار المستند",
      },
      upload_failed: {
        en: "Upload failed, please try again",
        ar: "فشل الرفع، جرّب مرّة ثانية",
      },
    } satisfies DocumentErrors,
  },
];

// Error Modal reset
export const translationModalReset: {
  en: ModalResetTranslations;
  ar: ModalResetTranslations;
} = {
  ar: {
    successTitle: "نجاح",
    errorTitle: "خطأ",
    buttonText: "موافق",
  },
  en: {
    successTitle: "Success",
    errorTitle: "Error",
    buttonText: "OK",
  },
};

// OTP component translations
export const otpTranslations: {
  en: OTPTranslations;
  ar: OTPTranslations;
} = {
  en: {
    title: "Enter OTP",
    descriptionText: "We have just sent you a 4-digit code via your",
    verifying: "Verifying...",
    verify: "Verify",
    resendOTP: "Resend OTP",
    invalidOTP: "Invalid OTP, please try again.",
    completeOTP: "Please complete the OTP.",
    verificationError: "Verification error, please try again.",
  },
  ar: {
    title: "اكتب رمز التحقق",
    descriptionText: "رسلنا لك رمز التحقق المكون من 4 أرقام على",
    verifying: "قاعد نتحقق...",
    verify: "تأكد",
    resendOTP: "أرسل رمز التحقق مرة ثانية",
    invalidOTP: "رمز التحقق غلط، جرّب مرة ثانية.",
    completeOTP: "كمّل رمز التحقق لو سمحت.",
    verificationError: "صار خطأ في التحقق، حاول مرة ثانية.",
  },
};
