// utils/auth/phoneValidator.ts
export interface PhoneValidationResult {
  isValid: boolean;
  normalized?: string;
  error?: string;
}

export const createPhoneNormalizer = (): ((
  phone: string
) => PhoneValidationResult) => {
  return (phone: string): PhoneValidationResult => {
    if (!phone || typeof phone !== "string") {
      return { isValid: false, error: "Phone number is required" };
    }

    let cleaned = phone.replace(/[^\d+]/g, "");

    if (cleaned.startsWith("+966")) {
      if (cleaned.length !== 13) {
        return { isValid: false, error: "Invalid Saudi phone number format" };
      }
    } else if (cleaned.startsWith("966")) {
      cleaned = "+" + cleaned;
      if (cleaned.length !== 13) {
        return { isValid: false, error: "Invalid Saudi phone number format" };
      }
    } else if (cleaned.startsWith("0")) {
      if (cleaned.length !== 10 || !cleaned.startsWith("05")) {
        return { isValid: false, error: "Invalid Saudi phone number format" };
      }
      cleaned = "+966" + cleaned.substring(1);
    } else if (cleaned.startsWith("5")) {
      if (cleaned.length !== 9) {
        return { isValid: false, error: "Invalid Saudi phone number format" };
      }
      cleaned = "+966" + cleaned;
    } else {
      return { isValid: false, error: "Invalid phone number format" };
    }

    return { isValid: true, normalized: cleaned };
  };
};
