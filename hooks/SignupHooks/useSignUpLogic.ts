import { useEffect, useRef, useState } from "react";
import {
  EmitterSubscription,
  Keyboard,
  Platform,
  ScrollView,
} from "react-native";

export const useSignUpLogic = () => {
  const scrollViewRef = useRef<ScrollView | null>(null);
  const keyboardShowSubscription = useRef<EmitterSubscription | null>(null);
  const keyboardHideSubscription = useRef<EmitterSubscription | null>(null);

  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // -------------------------
  // 🔁 Keyboard Handling
  // -------------------------

  useEffect(() => {
    const handleKeyboardShow = (event: any) => {
      setIsKeyboardVisible(true);
      setKeyboardHeight(event.endCoordinates.height);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    };

    const handleKeyboardHide = () => {
      setIsKeyboardVisible(false);
      setKeyboardHeight(0);
    };

    keyboardShowSubscription.current = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      handleKeyboardShow
    );
    keyboardHideSubscription.current = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      handleKeyboardHide
    );

    return () => {
      keyboardShowSubscription.current?.remove();
      keyboardHideSubscription.current?.remove();
    };
  }, []);

  return {
    scrollViewRef,
    isKeyboardVisible,
    keyboardHeight,
  };
};
