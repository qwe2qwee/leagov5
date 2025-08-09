// hooks/useFontFamily.ts
import useLanguageStore from "@/store/useLanguageStore";

type FontWeight =
  | "ExtraLight"
  | "Light"
  | "Regular"
  | "Medium"
  | "SemiBold"
  | "Bold"
  | "ExtraBold";

// We return a partial record: some weights may be missing (for Zain)
export function useFontFamily(): Partial<Record<FontWeight, string>> {
  const { currentLanguage } = useLanguageStore();

  // Use override if provided, otherwise use current language from store
  const lang = currentLanguage ?? "ar";

  if (lang === "en") {
    // Montserrat: you loaded all seven weights
    return {
      ExtraLight: "Montserrat-ExtraLight",
      Light: "Montserrat-Light",
      Regular: "Montserrat-Regular",
      Medium: "Montserrat-Medium",
      SemiBold: "Montserrat-SemiBold",
      Bold: "Montserrat-Bold",
      ExtraBold: "Montserrat-ExtraBold",
    };
  } else {
    // Zain: you only loaded 5 weights
    return {
      ExtraLight: "Zain-ExtraLight",
      Light: "Zain-Light",
      Regular: "Zain-Regular",
      Bold: "Zain-Bold",
      ExtraBold: "Zain-ExtraBold",
    };
  }
}
