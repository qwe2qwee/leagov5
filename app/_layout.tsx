import "react-native-reanimated";

import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreenExpo from "expo-splash-screen";
import { useEffect, useState } from "react";

import { AuthProvider } from "@/components/Auth/AuthProvider";
import SplashScreen from "@/components/SplashScreen";
import { ToastContainer } from "@/components/Toast/ToastContainer";
import { TabBarHeightProvider } from "@/context/TabBarHeightContext";

// منع إخفاء splash screen تلقائياً
SplashScreenExpo.preventAutoHideAsync();

export default function RootLayout() {
  const [isAppReady, setIsAppReady] = useState(false);
  const [showCustomSplash, setShowCustomSplash] = useState(true);

  const [fontsLoaded] = useFonts({
    "Montserrat-Bold": require("../assets/fonts/Montserrat-Bold.ttf"),
    "Montserrat-ExtraBold": require("../assets/fonts/Montserrat-ExtraBold.ttf"),
    "Montserrat-ExtraLight": require("../assets/fonts/Montserrat-ExtraLight.ttf"),
    "Montserrat-Light": require("../assets/fonts/Montserrat-Light.ttf"),
    "Montserrat-Medium": require("../assets/fonts/Montserrat-Medium.ttf"),
    "Montserrat-Regular": require("../assets/fonts/Montserrat-Regular.ttf"),
    "Montserrat-SemiBold": require("../assets/fonts/Montserrat-SemiBold.ttf"),
    "Zain-Bold": require("../assets/fonts/Zain-Bold.ttf"),
    "Zain-ExtraBold": require("../assets/fonts/Zain-ExtraBold.ttf"),
    "Zain-ExtraLight": require("../assets/fonts/Zain-ExtraLight.ttf"),
    "Zain-Light": require("../assets/fonts/Zain-Light.ttf"),
    "Zain-Regular": require("../assets/fonts/Zain-Regular.ttf"),
  });

  useEffect(() => {
    const prepare = async () => {
      try {
        // انتظار تحميل الخطوط
        if (fontsLoaded) {
          // يمكنك إضافة المزيد من عمليات التحضير هنا
          // مثل تحميل البيانات المحفوظة، إعداد الإشعارات، إلخ
          await new Promise((resolve) => setTimeout(resolve, 500));

          setIsAppReady(true);
          // إخفاء splash screen الافتراضي من Expo
          await SplashScreenExpo.hideAsync();
        }
      } catch (e) {
        console.warn("Error during app preparation:", e);
        setIsAppReady(true);
        await SplashScreenExpo.hideAsync();
      }
    };

    prepare();
  }, [fontsLoaded]);

  const handleSplashFinish = () => {
    setShowCustomSplash(false);
  };

  // إذا الخطوط لم تحمل بعد أو التطبيق غير جاهز، أظهر null
  if (!fontsLoaded || !isAppReady) {
    return null;
  }

  // إذا كان custom splash يجب أن يظهر
  if (showCustomSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  // التطبيق الرئيسي
  return (
    <AuthProvider>
      <TabBarHeightProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen
            name="screens/Car-details"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="screens/Booking"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="+not-found" options={{ headerShown: false }} />
          <Stack.Screen
            name="screens/DocumentsUploadScreen"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="screens/ProfileEdit"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="screens/Location"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="otp-modal"
            options={{
              presentation: "modal",
              headerShown: false,
              gestureEnabled: true,
              animationDuration: 300,
            }}
          />
          <Stack.Screen
            name="screens/TermsAndConditions"
            options={{ headerShown: false }}
          />{" "}
          <Stack.Screen
            name="screens/Language"
            options={{ headerShown: false }}
          />{" "}
          <Stack.Screen name="screens/Help" options={{ headerShown: false }} />{" "}
          <Stack.Screen name="screens/About" options={{ headerShown: false }} />
        </Stack>
        <ToastContainer />
      </TabBarHeightProvider>
    </AuthProvider>
  );
}
