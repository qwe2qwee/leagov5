import React, { createContext, ReactNode, useContext } from "react";
import { ScrollView } from "react-native";
import { useSignInLogic } from "./useSignInLogic";

interface SignUpContextType {
  isKeyboardVisible: boolean;
  keyboardHeight: number;
  scrollViewRef: React.RefObject<ScrollView | null>;
}

const SignUpContext = createContext<SignUpContextType | undefined>(undefined);

interface SignUpProviderProps {
  children: ReactNode;
}

export const SignInProvider: React.FC<SignUpProviderProps> = ({ children }) => {
  const signUpLogic = useSignInLogic();

  return (
    <SignUpContext.Provider value={signUpLogic}>
      {children}
    </SignUpContext.Provider>
  );
};

export const useSignInContext = (): SignUpContextType => {
  const context = useContext(SignUpContext);
  if (!context) {
    throw new Error("useSignUpContext must be used within a SignUpProvider");
  }
  return context;
};
