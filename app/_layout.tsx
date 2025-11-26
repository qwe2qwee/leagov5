import { useFonts } from "expo-font";
import { router, Stack } from "expo-router";
import * as SplashScreenExpo from "expo-splash-screen";
import { useEffect, useRef, useState } from "react";
import "react-native-reanimated";

import { AuthProvider } from "@/components/Auth/AuthProvider";
import SplashScreen from "@/components/SplashScreen";
import { ToastContainer } from "@/components/Toast/ToastContainer";
import { LocationProvider } from "@/context/LocationContext";
import { TabBarHeightProvider } from "@/context/TabBarHeightContext";

// منع إخفاء splash screen الافتراضي تلقائياً
SplashScreenExpo.preventAutoHideAsync();

export default function RootLayout() {
  const [isAppReady, setIsAppReady] = useState(false);
  const [showCustomSplash, setShowCustomSplash] = useState(true);
  const splashShownRef = useRef(false); // ✅ لتفادي تكرار السبلش

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

  // تجهيز التطبيق
  useEffect(() => {
    const prepare = async () => {
      try {
        if (fontsLoaded) {
          // انتظار بسيط بعد تحميل الخطوط
          await new Promise((resolve) => setTimeout(resolve, 500));
          setIsAppReady(true);
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

  // ✅ عند انتهاء شاشة Splash المخصصة
  const handleSplashFinish = () => {
    setShowCustomSplash(false);
    splashShownRef.current = true; // سجلنا أن السبلش انعرضت مرة واحدة

    // ⏳ تأخير بسيط لتفادي مشاكل الـ router أثناء mount
    setTimeout(() => {
      router.push("/(auth)/welcome");
    }, 150);
  };

  // ⏳ أثناء تحميل الخطوط أو التهيئة
  if (!fontsLoaded || !isAppReady) return null;

  // 🎬 عرض شاشة Splash فقط أول مرة
  if (showCustomSplash && !splashShownRef.current) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  // 🧭 التطبيق الرئيسي
  return (
    <AuthProvider>
      <LocationProvider>
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
          />
          <Stack.Screen
            name="screens/Language"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="screens/BookingDetailsScreen"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="screens/PaymentScreen"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="screens/Help" options={{ headerShown: false }} />
          <Stack.Screen name="screens/About" options={{ headerShown: false }} />
          </Stack>
          <ToastContainer />
        </TabBarHeightProvider>
      </LocationProvider>
    </AuthProvider>
  );
}
