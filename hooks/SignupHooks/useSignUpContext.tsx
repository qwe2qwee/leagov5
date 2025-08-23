import React, { createContext, ReactNode, useContext } from "react";
import { ScrollView } from "react-native";
import { useSignUpLogic } from "./useSignUpLogic";

interface SignUpContextType {
  isKeyboardVisible: boolean;
  keyboardHeight: number;
  scrollViewRef: React.RefObject<ScrollView | null>;
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
