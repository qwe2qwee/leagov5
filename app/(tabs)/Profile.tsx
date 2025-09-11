import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SafeAreaView } from "@/components/SafeAreaView";
import { router } from "expo-router";
import { Text, TouchableOpacity } from "react-native";

const profile = () => {
  return (
    <SafeAreaView>
      <TouchableOpacity onPress={() => router.push("/screens/ProfileEdit")}>
        <Text style={{ color: "red" }}>profile</Text>
      </TouchableOpacity>
      <LanguageSwitcher />
    </SafeAreaView>
  );
};

export default profile;
