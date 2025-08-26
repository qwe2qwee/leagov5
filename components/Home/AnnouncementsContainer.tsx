// -------------------------------------------------------------
// components/Home/AnnouncementsContainer.tsx
import { AnnouncementSection } from "@/components/Home/AnnouncementCard";
import React from "react";
import { Animated } from "react-native";

type Props = {
  announcements: any[];
  announcementScale: Animated.Value;
  announcementOpacity: Animated.Value;
  onAnnouncementPress: (a: any) => void;
  onShowAllPress: () => void;
};

export default function AnnouncementsContainer({
  announcements,
  announcementScale,
  announcementOpacity,
  onAnnouncementPress,
  onShowAllPress,
}: Props) {
  return (
    <Animated.View
      style={{
        transform: [{ scale: announcementScale }],
        opacity: announcementOpacity,
        paddingHorizontal: 16,
        paddingTop: 8,
      }}
    >
      <AnnouncementSection
        announcements={announcements}
        onAnnouncementPress={onAnnouncementPress as any}
        showAllButton={announcements.length > 3}
        onShowAllPress={onShowAllPress}
      />
    </Animated.View>
  );
}
