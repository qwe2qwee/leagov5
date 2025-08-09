import { useTheme } from "@/hooks/useTheme";
import { Link, Stack } from "expo-router";
import { StatusBar, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function NotFoundScreen() {
  const { colors, scheme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <>
      <StatusBar
        barStyle={scheme === "light" ? "dark-content" : "light-content"}
        backgroundColor={colors.background}
      />
      <Stack.Screen
        options={{
          title: "Oops!",
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerTitleStyle: {
            color: colors.text,
          },
        }}
      />
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          },
        ]}
      >
        {/* Error Icon */}
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: colors.backgroundSecondary },
          ]}
        >
          <Text style={[styles.errorIcon, { color: colors.primary }]}>404</Text>
        </View>

        {/* Error Messages */}
        <Text style={[styles.title, { color: colors.text }]}>
          This screen does not exist.
        </Text>

        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          The page you're looking for couldn't be found.
        </Text>

        {/* Action Button */}
        <Link
          href="/"
          style={[styles.link, { backgroundColor: colors.primary }]}
        >
          <Text style={[styles.linkText, { color: colors.textInverse }]}>
            Go to home screen!
          </Text>
        </Link>

        {/* Additional Help Text */}
        <Text style={[styles.helpText, { color: colors.textMuted }]}>
          If you believe this is an error, please contact support.
        </Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  errorIcon: {
    fontSize: 32,
    fontWeight: "800",
    fontFamily: "System",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
    fontFamily: "System",
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 24,
    fontFamily: "System",
  },
  link: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  linkText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    fontFamily: "System",
  },
  helpText: {
    fontSize: 14,
    fontWeight: "400",
    textAlign: "center",
    fontFamily: "System",
  },
});
