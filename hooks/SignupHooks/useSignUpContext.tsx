import { Language } from "@/types";
import React, { createContext, ReactNode, useContext } from "react";
import { ScrollView } from "react-native";
import { useSignUpLogic } from "./useSignUpLogic";

interface FormData {
  name: string;
  email: string;
  password: string;
  phone: string;
}

interface FormErrors {
  name: string;
  email: string;
  phone: string;
}

interface SignUpContextType {
  // States
  form: FormData;
  loading: boolean;
  isModalVisible: boolean;
  errorModalVisible: boolean;
  errorMessage: string;
  isSuccess: boolean;
  isKeyboardVisible: boolean;
  keyboardHeight: number;
  fieldErrors: FormErrors;
  language: Language;
  isRTL: boolean;
  scrollViewRef: React.RefObject<ScrollView | null>;
  user: any;

  // Functions
  handleInputChange: (field: keyof FormData, value: string) => void;
  onSignUpPress: () => Promise<void>;
  handleOtpSubmit: (verify: string) => Promise<void>;
  handleResendOtp: () => Promise<void>;
  showError: (message: string, success?: boolean) => void;
  handleErrorModalClose: () => void;
  setModalVisible: (visible: boolean) => void;
  validateForm: () => boolean;
}

const SignUpContext = createContext<SignUpContextType | undefined>(undefined);

interface SignUpProviderProps {
  children: ReactNode;
}

export const SignUpProvider: React.FC<SignUpProviderProps> = ({ children }) => {
  const signUpLogic = useSignUpLogic();

  return (
    <SignUpContext.Provider value={signUpLogic}>
      {children}
    </SignUpContext.Provider>
  );
};

export const useSignUpContext = (): SignUpContextType => {
  const context = useContext(SignUpContext);
  if (!context) {
    throw new Error("useSignUpContext must be used within a SignUpProvider");
  }
  return context;
};
