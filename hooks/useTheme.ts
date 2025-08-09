// hooks/useTheme.ts
import Colors from "@/constants/Colors";
import { useColorScheme } from "react-native";

export type ThemeScheme = "light" | "dark";

export interface Theme {
  scheme: ThemeScheme;
  colors: typeof Colors.light; // Both light and dark have the same structure
}

export function useTheme(): Theme {
  const colorScheme = useColorScheme();
  const scheme: ThemeScheme = colorScheme ?? "light";

  // Get the appropriate color set based on the current scheme
  const colors = Colors[scheme];

  return {
    scheme,
    colors,
  };
}

// Optional: Helper hook to get brand colors (theme-independent)
export function useBrandColors() {
  return Colors.brand;
}

// Optional: Helper hook to get semantic colors (theme-independent)
export function useSemanticColors() {
  return Colors.semantic;
}
