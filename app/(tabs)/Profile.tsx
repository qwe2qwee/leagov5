import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SafeAreaView } from "@/components/SafeAreaView";
import { Text } from "react-native";

const profile = () => {
  return (
    <SafeAreaView>
      <Text>profile</Text>
      <LanguageSwitcher />
    </SafeAreaView>
  );
};

export default profile;
