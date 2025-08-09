import { Stack } from "expo-router";

const Layout = () => {
  return (
    <Stack>
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="sign-up" options={{ headerShown: false }} />
      <Stack.Screen name="sign-in" options={{ headerShown: false }} />
      <Stack.Screen
        name="reset/ResetPassword"
        options={{ headerShown: false }}
      />
      <Stack.Screen name="reset/email" options={{ headerShown: false }} />
      <Stack.Screen name="reset/phone" options={{ headerShown: false }} />
    </Stack>
  );
};

export default Layout;
