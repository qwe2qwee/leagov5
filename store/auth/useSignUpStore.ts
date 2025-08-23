import { create } from "zustand";

// ------------------------------------
// 🔠 Type Definitions
// ------------------------------------

interface FormData {
  name: string;
  email: string;
  phone: string;
}

interface FormErrors {
  name: string;
  email: string;
  phone: string;
}

interface FormState {
  form: FormData;
  fieldErrors: FormErrors;
}

interface FormActions {
  handleInputChange: (field: keyof FormData, value: string) => void;
  setForm: (form: Partial<FormData>) => void;
  resetForm: () => void;
  validateField: (field: keyof FormData, value: string) => string;
  validateForm: () => boolean;
  setFieldErrors: (errors: Partial<FormErrors>) => void;
  clearFieldErrors: () => void;
  formatPhoneNumber: (phone: string) => string;
  resetState: () => void;
}

type FormStore = FormState & FormActions;

// ------------------------------------
// 🏪 Initial State
// ------------------------------------

const initialFormData: FormData = {
  name: "",
  email: "",
  phone: "",
};

const initialFieldErrors: FormErrors = {
  name: "",
  email: "",
  phone: "",
};

// ------------------------------------
// 🏪 Zustand Store (Minimal)
// ------------------------------------

export const useFormStore = create<FormStore>((set, get) => ({
  form: initialFormData,
  fieldErrors: initialFieldErrors,

  handleInputChange: (field, value) => {
    set((state) => ({
      form: { ...state.form, [field]: value },
      fieldErrors: { ...state.fieldErrors, [field]: "" }, // Clear error on change
    }));
  },

  setForm: (formData) => {
    set((state) => ({
      form: { ...state.form, ...formData },
    }));
  },

  resetForm: () => {
    set({
      form: initialFormData,
      fieldErrors: initialFieldErrors,
    });
  },

  formatPhoneNumber: (phone: string): string => {
    const digitsOnly = phone.replace(/\D/g, "");

    if (digitsOnly.startsWith("966")) {
      return `+${digitsOnly}`;
    } else if (digitsOnly.startsWith("0")) {
      return `+966${digitsOnly.substring(1)}`;
    } else if (digitsOnly.length === 9) {
      return `+966${digitsOnly}`;
    } else if (digitsOnly.length === 10 && digitsOnly.startsWith("5")) {
      return `+966${digitsOnly}`;
    }

    return phone;
  },

  validateField: (field, value) => {
    const { formatPhoneNumber } = get();

    switch (field) {
      case "name":
        return !value.trim()
          ? "Name is required"
          : value.length < 2
          ? "Name must be at least 2 characters"
          : "";

      case "email":
        if (!value.trim()) return "";
        return !/^\S+@\S+\.\S+$/.test(value) ? "Invalid email format" : "";

      case "phone":
        if (!value.trim()) return "";
        const formattedPhone = formatPhoneNumber(value);

        if (!/^\+966[5][0-9]{8}$/.test(formattedPhone)) {
          return "Phone number must start with 05 and be 10 digits";
        }
        return "";

      default:
        return "";
    }
  },

  validateForm: () => {
    const { form, validateField } = get();

    const newErrors: FormErrors = {
      name: validateField("name", form.name),
      email: validateField("email", form.email),
      phone: validateField("phone", form.phone),
    };

    set({ fieldErrors: newErrors });

    return Object.values(newErrors).every((error) => error === "");
  },

  setFieldErrors: (errors) => {
    set((state) => ({
      fieldErrors: { ...state.fieldErrors, ...errors },
    }));
  },

  clearFieldErrors: () => {
    set({ fieldErrors: initialFieldErrors });
  },

  resetState: () => {
    set({
      form: initialFormData,
      fieldErrors: initialFieldErrors,
    });
  },
}));
