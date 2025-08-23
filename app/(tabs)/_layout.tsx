import {
  TabList,
  Tabs,
  TabSlot,
  TabTrigger,
  TabTriggerSlotProps,
} from "expo-router/ui";
import React from "react";
import {
  Image,
  ImageSourcePropType,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { icons } from "@/constants";
import { Colors } from "@/constants/Colors";
import { useTabBarHeight } from "@/context/TabBarHeightContext";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// زر التاب
interface CustomTabButtonProps
  extends React.PropsWithChildren,
    TabTriggerSlotProps {
  iconSource: ImageSourcePropType;
}

const CustomTabButton = React.forwardRef<View, CustomTabButtonProps>(
  (props, ref) => {
    const { isSmallScreen, isMediumScreen } = useResponsive();
    const { colors } = useTheme();

    const filteredProps = Object.fromEntries(
      Object.entries(props).filter(([_, value]) => value !== null)
    );

    const getIconSize = () => {
      if (isSmallScreen) return 24;
      if (isMediumScreen) return 26;
      return 28;
    };

    const getContainerSize = () => {
      if (isSmallScreen) return { width: 50, height: 50, borderRadius: 25 };
      if (isMediumScreen) return { width: 55, height: 55, borderRadius: 27.5 };
      return { width: 60, height: 60, borderRadius: 30 };
    };

    return (
      <TouchableOpacity
        ref={ref}
        onPress={props.onPress !== null ? props.onPress : undefined}
        {...filteredProps}
        style={styles.tabButton}
      >
        <View
          style={[
            styles.iconContainer,
            getContainerSize(),
            {
              backgroundColor: props.isFocused ? colors.primary : "transparent",
            },
          ]}
        >
          <Image
            source={props.iconSource}
            style={{
              width: getIconSize(),
              height: getIconSize(),
              tintColor: props.isFocused ? colors.textInverse : colors.icon,
            }}
            resizeMode="contain"
          />
        </View>
      </TouchableOpacity>
    );
  }
);
CustomTabButton.displayName = "CustomTabButton";

// تخطيط التابز
export default function TabLayout() {
  const { isSmallScreen, isMediumScreen } = useResponsive();
  const { setHeight } = useTabBarHeight();
  const insets = useSafeAreaInsets();

  const getTabBarHeight = () => {
    if (isSmallScreen) return 70;
    if (isMediumScreen) return 75;
    return 80;
  };

  const getHorizontalMargin = () => {
    if (isSmallScreen) return 15;
    if (isMediumScreen) return 18;
    return 20;
  };

  return (
    <Tabs>
      <TabSlot />

      {/* Custom Tab Bar */}
      <View
        style={[
          styles.customTabBar,
          {
            backgroundColor: Colors["dark"].backgroundTertiary,
            height: getTabBarHeight(),
            marginHorizontal: getHorizontalMargin(),
            bottom: insets.bottom + 15, // +30 عشان عامل bottom:30
          },
        ]}
        onLayout={(event) => {
          const { height } = event.nativeEvent.layout;
          setHeight(height * 2); // +30 عشان عامل bottom:30
        }}
      >
        <TabTrigger name="index" href="/" asChild>
          <CustomTabButton iconSource={icons.home} />
        </TabTrigger>

        <TabTrigger name="Cars" href="/Cars" asChild>
          <CustomTabButton iconSource={icons.search} />
        </TabTrigger>

        <TabTrigger name="Bills" href="/Bills" asChild>
          <CustomTabButton iconSource={icons.bills} />
        </TabTrigger>

        <TabTrigger name="Profile" href="/Profile" asChild>
          <CustomTabButton iconSource={icons.people} />
        </TabTrigger>
      </View>

      {/* مخفي */}
      <TabList style={{ display: "none" }}>
        <TabTrigger name="index" href="/" />
        <TabTrigger name="Cars" href="/Cars" />
        <TabTrigger name="Bills" href="/Bills" />
        <TabTrigger name="Profile" href="/Profile" />
      </TabList>
    </Tabs>
  );
}

const styles = StyleSheet.create({
  customTabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderRadius: 50,
    paddingVertical: 8,
    position: "absolute",
    left: 0,
    right: 0,
  },
  tabButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 50,
    overflow: "hidden",
  },
});
