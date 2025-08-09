import { SafeAreaView } from "@/components/SafeAreaView";
import CustomButton from "@/components/ui/CustomButton";
import { useFontFamily } from "@/hooks/useFontFamily";
import { useSafeNavigate } from "@/utils/useSafeNavigate";
import { Text } from "react-native";

export default function HomeScreen() {
  const fonts = useFontFamily();
  const { push } = useSafeNavigate();

  return (
    <SafeAreaView>
      <Text style={{ fontFamily: fonts.SemiBold }}>Home</Text>
      <CustomButton
        title="Go to Profile"
        onPress={() => push("/(auth)/welcome")}
      />
    </SafeAreaView>
  );
}
