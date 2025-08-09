// Translation interface
interface SplashTranslations {
  appSubtitle: string;
  loading: string;
  footerText: string;
}

// Splash screen translations
export const splashTranslations: {
  en: SplashTranslations;
  ar: SplashTranslations;
} = {
  en: {
    appSubtitle: "Drive Your Dreams",
    loading: "Loading...",
    footerText: "Car Leasing Made Simple",
  },
  ar: {
    appSubtitle: "اقود أحلامك",
    loading: "جاري التحميل...",
    footerText: "تأجير السيارات أصبح بسيطاً",
  },
};
