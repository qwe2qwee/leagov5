// src/components/TopBar.tsx
import { icons } from "@/constants";
import { useSafeNavigate } from "@/utils/useSafeNavigate";
import React from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "../SafeAreaView";

interface TopBarProps {
  title: string;
}

const TopBar: React.FC<TopBarProps> = ({ title }) => {
  const { back, push } = useSafeNavigate();

  return (
    <SafeAreaView>
      <View style={styles.row}>
        {/* Back Button */}
        <Pressable onPress={() => back()} style={styles.iconButton}>
          <Image
            source={icons.backArrow}
            resizeMode="contain"
            style={styles.backIcon}
          />
        </Pressable>

        {/* Title */}
        <Text numberOfLines={1} ellipsizeMode="tail" style={styles.title}>
          {title}
        </Text>

        {/* Support Page Button */}
        <TouchableOpacity
          onPress={() => push("/screens/profilePage/ContactUs")}
          style={[styles.iconButton, styles.supportButton]}
        >
          <Image
            source={icons.support}
            resizeMode="contain"
            style={styles.supportIcon}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16, // px-4
    paddingVertical: 8, // py-2
    width: "83.333%", // w-5/6
    alignSelf: "center",
    marginTop: 0,
  },
  iconButton: {
    backgroundColor: "#ffffff",
    borderRadius: 999,
    padding: 12, // p-3
    // shadow (iOS)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    // elevation (Android)
    elevation: 6,
  },
  supportButton: {
    padding: 8, // p-2 (slightly smaller)
  },
  backIcon: {
    width: 24, // w-6
    height: 24,
  },
  supportIcon: {
    width: 20, // w-5
    height: 20,
  },
  title: {
    width: "75%", // w-9/12
    textAlign: "center",
    fontSize: 18, // text-lg
    fontWeight: "700",
    color: "#000",
  },
});

export default TopBar;
