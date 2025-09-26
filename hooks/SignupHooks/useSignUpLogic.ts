import { useRef, useState } from "react";
import { ScrollView } from "react-native";

export const useSignUpLogic = () => {
  const scrollViewRef = useRef<ScrollView | null>(null);

  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // -------------------------
  // 🔁 Keyboard Handling
  // -------------------------

  return {
    scrollViewRef,
    isKeyboardVisible,
    keyboardHeight,
  };
};
