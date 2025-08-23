import { AnnouncementSection } from "@/components/Home/AnnouncementCard";
import { SafeAreaScrollView } from "@/components/SafeAreaView";
import {
  Announcement,
  useAnnouncements,
} from "@/hooks/supabaseHooks/useAnnouncements";
import useLanguageStore from "@/store/useLanguageStore";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function HomeScreen() {
  const { currentLanguage } = useLanguageStore();
  const { data: announcements, isLoading, error, refetch } = useAnnouncements();
  const isRTL = currentLanguage === "ar";

  // Memoized sorted announcements (all together, sorted by priority and date)
  const sortedAnnouncements = useMemo(() => {
    if (!announcements || announcements.length === 0) {
      return [];
    }

    // Sort all announcements by priority first, then by creation date
    return announcements.sort((a: Announcement, b: Announcement) => {
      // Priority order: urgent > high > normal > low
      const priorityOrder = { urgent: 4, high: 3, normal: 2, low: 1 };
      const priorityDiff =
        (priorityOrder[b.priority] || 2) - (priorityOrder[a.priority] || 2);

      if (priorityDiff !== 0) return priorityDiff;

      // If same priority, sort by creation date (newest first)
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });
  }, [announcements]);

  const handleAnnouncementPress = (announcement: Announcement) => {
    console.log("Announcement pressed:", announcement.title_en);
    // Handle announcement press - navigate to details or show modal
  };

  const handleViewAllPress = () => {
    console.log("View all announcements pressed");
    // Navigate to announcements list screen
  };

  // Pull to refresh handler
  const onRefresh = React.useCallback(() => {
    refetch();
  }, [refetch]);

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaScrollView>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0066cc" />
          <Text style={styles.loadingText}>
            {isRTL ? "جاري التحميل..." : "Loading announcements..."}
          </Text>
        </View>
      </SafeAreaScrollView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaScrollView>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>
            {isRTL ? "خطأ في تحميل الإعلانات" : "Error loading announcements"}
          </Text>
          <Text style={styles.errorDetails}>
            {error instanceof Error ? error.message : "Unknown error occurred"}
          </Text>
        </View>
      </SafeAreaScrollView>
    );
  }

  // No announcements state
  if (!announcements || announcements.length === 0) {
    return (
      <SafeAreaScrollView
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={onRefresh}
            colors={["#0066cc"]} // Android
            tintColor="#0066cc" // iOS
            title={isRTL ? "جاري التحديث..." : "Refreshing..."} // iOS only
            titleColor="#666" // iOS only
          />
        }
        contentInsetAdjustmentBehavior="automatic" // iOS safe area handling
      >
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>
            {isRTL
              ? "لا توجد إعلانات متاحة حالياً"
              : "No announcements available"}
          </Text>
        </View>

        {/* Your other content can go here */}
        <View style={styles.otherContent}>
          <Text style={styles.placeholderText}>
            {isRTL
              ? "المحتوى الآخر سيظهر هنا"
              : "Other content will appear here"}
          </Text>
        </View>
      </SafeAreaScrollView>
    );
  }

  return (
    <SafeAreaScrollView
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={onRefresh}
          colors={["#0066cc"]} // Android
          tintColor="#0066cc" // iOS
          title={isRTL ? "جاري التحديث..." : "Refreshing..."} // iOS only
          titleColor="#666" // iOS only
        />
      }
      contentInsetAdjustmentBehavior="automatic" // iOS safe area handling
    >
      {/* All Announcements Section at the Top */}
      {sortedAnnouncements.length > 0 && (
        <AnnouncementSection
          announcements={sortedAnnouncements}
          onAnnouncementPress={handleAnnouncementPress}
          showAllButton={sortedAnnouncements.length > 3}
          onShowAllPress={handleViewAllPress}
        />
      )}

      {/* Your Other Content Goes Here */}
      <View style={styles.otherContent}>
        <Text style={styles.sectionTitle}>
          {isRTL ? "المحتوى الإضافي" : "Additional Content"}
        </Text>

        {/* Example of other content you can add */}
        <View style={styles.contentSection}>
          <Text style={styles.placeholderText}>
            {isRTL
              ? "يمكنك إضافة أي محتوى آخر هنا مثل:\n• قائمة المنتجات\n• الإحصائيات\n• الإعدادات السريعة\n• أو أي مكونات أخرى"
              : "You can add any other content here such as:\n• Product lists\n• Statistics\n• Quick settings\n• Or any other components"}
          </Text>
        </View>
      </View>
    </SafeAreaScrollView>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    minHeight: 200,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  errorText: {
    fontSize: 18,
    color: "#dc3545",
    textAlign: "center",
    marginBottom: 8,
    fontWeight: "600",
  },
  errorDetails: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 4,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  otherContent: {
    flex: 1,
    padding: 16,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
    color: "#333",
  },
  contentSection: {
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  placeholderText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
});
