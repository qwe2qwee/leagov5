import { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  EmitterSubscription,
  Keyboard,
  Platform,
  ScrollView,
} from "react-native";

interface UseKeyboardAndScrollOptions {
  /**
   * When true, uses advanced scrolling that measures input position
   * and scrolls precisely to keep it visible above the keyboard
   */
  useAdvancedScrolling?: boolean;
}

export const useSignInLogic = (options: UseKeyboardAndScrollOptions = {}) => {
  const { useAdvancedScrolling = false } = options;

  const scrollViewRef = useRef<ScrollView | null>(null);
  const inputRef = useRef<any>(null);
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

      if (useAdvancedScrolling) {
        // Advanced scrolling - measures input position and scrolls precisely
        setTimeout(() => {
          if (scrollViewRef.current && inputRef.current) {
            inputRef.current.measureInWindow(
              (x: number, y: number, width: number, height: number) => {
                const screenHeight = Dimensions.get("window").height;
                const scrollToY = Math.max(
                  0,
                  y +
                    height -
                    (screenHeight - event.endCoordinates.height - 100)
                );

                if (scrollToY > 0) {
                  scrollViewRef.current?.scrollTo({
                    y: scrollToY,
                    animated: true,
                  });
                }
              }
            );
          }
        }, 100);
      } else {
        // Simple scrolling - just scroll to end
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
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
  }, [useAdvancedScrolling]);

  return {
    scrollViewRef,
    inputRef,
    isKeyboardVisible,
    keyboardHeight,
  };
};
