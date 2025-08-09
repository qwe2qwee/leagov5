import { useTheme } from "@/hooks/useTheme";
import React from "react";
import type { ScrollViewProps, ViewProps } from "react-native";
import { ScrollView, StyleSheet, View, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Props للـ SafeAreaScrollView
interface SafeAreaScrollViewProps extends ScrollViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
}

// Props للـ SafeAreaView
interface SafeAreaViewProps extends ViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

// SafeAreaView مع إمكانية التمرير
export const SafeAreaScrollView: React.FC<SafeAreaScrollViewProps> = ({
  children,
  style,
  contentContainerStyle,
  showsVerticalScrollIndicator = false,
  ...scrollViewProps
}) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  return (
    <ScrollView
      style={[
        styles.container,
        { paddingTop: insets.top, backgroundColor: colors.background },
        style,
      ]}
      contentContainerStyle={[
        styles.contentContainer,
        contentContainerStyle,
        { justifyContent: "flex-start", alignItems: "center" },
      ]}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      {...scrollViewProps}
    >
      {children}
    </ScrollView>
  );
};

// SafeAreaView بدون تمرير
export const SafeAreaView: React.FC<SafeAreaViewProps> = ({
  children,
  style,
  ...viewProps
}) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          backgroundColor: colors.background,
          justifyContent: "flex-start",
          alignItems: "center",
        },
        style,
      ]}
      {...viewProps}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
});
