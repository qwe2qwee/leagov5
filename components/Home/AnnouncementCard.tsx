import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  FlatList,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Interface للإعلان بناءً على قاعدة البيانات
interface Announcement {
  id: string;
  title_en: string;
  title_ar?: string;
  description_en?: string;
  description_ar?: string;
  image_url?: string;
  is_active: boolean;
  is_featured: boolean;
  branch_id?: string;
  created_by: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
  priority?: "low" | "normal" | "high" | "urgent";
}

interface AnnouncementCardProps {
  announcement: Announcement;
  onPress?: (announcement: Announcement) => void;
  style?: any;
  index?: number;
}

export const AnnouncementCard: React.FC<AnnouncementCardProps> = ({
  announcement,
  onPress,
  style,
  index = 0,
}) => {
  const { colors } = useTheme();
  const fonts = useFontFamily();
  const {
    width,
    height,
    getFontSize,
    getSpacing,
    getResponsiveValue,
    isVerySmallScreen,
    isSmallScreen,
    isMediumScreen,
    isLargeScreen,
    isVeryLargeScreen,
    scaleFactor,
  } = useResponsive();
  const { currentLanguage } = useLanguageStore();
  const isRTL = currentLanguage === "ar";

  // الحصول على المحتوى المترجم
  const title = isRTL
    ? announcement.title_ar || announcement.title_en
    : announcement.title_en;
  const description = isRTL
    ? announcement.description_ar || announcement.description_en
    : announcement.description_en;

  // التعامل مع الضغط
  const handlePress = () => {
    if (onPress) {
      onPress(announcement);
    }
  };

  // تنسيق التاريخ
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      return isRTL ? "الآن" : "Now";
    } else if (diffHours < 24) {
      return isRTL ? `منذ ${diffHours} ساعة` : `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return isRTL ? `منذ ${diffDays} يوم` : `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString(isRTL ? "ar-SA" : "en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  // الحصول على لون الأولوية
  const getPriorityColor = () => {
    switch (announcement.priority) {
      case "urgent":
        return "#FF4444";
      case "high":
        return "#FF8800";
      case "low":
        return "#888888";
      default:
        return colors.primary;
    }
  };

  // أبعاد الكرت - محسنة وديناميكية
  const cardWidth = getResponsiveValue(
    width * 0.92, // Very small screens - 92%
    width * 0.9, // Small screens - 90%
    width * 0.88, // Medium screens - 88%
    width * 0.85, // Large screens - 85%
    width * 0.82 // Very large screens - 82%
  );

  const cardHeight = getResponsiveValue(
    140, // Very small screens
    145, // Small screens
    155, // Medium screens
    165, // Large screens
    175 // Very large screens
  );

  // أحجام الخط الديناميكية - متكيفة مع الكرت الأقصر
  const titleFontSize = getFontSize(
    getResponsiveValue(13, 14, 15, 17, 18),
    11, // minimum
    20 // maximum
  );

  const descriptionFontSize = getFontSize(
    getResponsiveValue(10, 11, 12, 13, 14),
    9, // minimum
    15 // maximum
  );

  const badgeFontSize = getFontSize(
    getResponsiveValue(8, 9, 9, 10, 0),
    7, // minimum
    12 // maximum
  );

  const dateFontSize = getFontSize(
    getResponsiveValue(9, 10, 10, 11, 9),
    8, // minimum
    13 // maximum
  );

  const actionFontSize = getFontSize(
    getResponsiveValue(10, 11, 11, 12, 9),
    9, // minimum
    14 // maximum
  );

  // أحجام الأيقونات الديناميكية - أصغر لتناسب الكرت الأقصر
  const iconSize = getResponsiveValue(9, 10, 11, 12, 14);
  const actionIconSize = getResponsiveValue(10, 11, 12, 14, 15);
  const dateIconSize = getResponsiveValue(9, 10, 10, 11, 12);

  // المسافات الديناميكية - مقللة لتناسب الطول الأقصر
  const borderRadius = getSpacing(getResponsiveValue(10, 12, 14, 17, 20));
  const cardPadding = getSpacing(getResponsiveValue(8, 10, 12, 15, 18));
  const marginHorizontal = getSpacing(getResponsiveValue(6, 7, 8, 9, 10));
  const marginLeft =
    index === 0
      ? getSpacing(getResponsiveValue(12, 14, 16, 18, 20))
      : marginHorizontal;

  // مسافات داخلية للعناصر - مقللة ومحسنة
  const badgePadding = {
    horizontal: getSpacing(getResponsiveValue(5, 6, 7, 9, 10)),
    vertical: getSpacing(getResponsiveValue(2, 3, 3, 4, 5)),
  };

  const actionButtonPadding = {
    horizontal: getSpacing(getResponsiveValue(6, 8, 10, 13, 16)),
    vertical: getSpacing(getResponsiveValue(3, 4, 5, 6, 8)),
  };

  const dateContainerPadding = {
    horizontal: getSpacing(getResponsiveValue(5, 6, 7, 9, 10)),
    vertical: getSpacing(getResponsiveValue(2, 3, 3, 4, 5)),
  };

  const styles = StyleSheet.create({
    container: {
      width: cardWidth,
      height: cardHeight,
      borderRadius: borderRadius,
      overflow: "hidden",
      marginHorizontal: marginHorizontal,
      marginLeft: marginLeft,
      backgroundColor: colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      elevation: 3,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3,
    },
    imageBackground: {
      flex: 1,
      justifyContent: "flex-end",
    },
    gradient: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: "65%",
    },
    content: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      padding: cardPadding,
    },
    header: {
      flexDirection: isRTL ? "row-reverse" : "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: getSpacing(getResponsiveValue(4, 5, 5, 7, 2)),
      minHeight: getResponsiveValue(32, 34, 36, 40, 44), // ارتفاع أدنى للهيدر
    },
    featuredBadge: {
      backgroundColor: getPriorityColor(),
      paddingHorizontal: badgePadding.horizontal,
      paddingVertical: badgePadding.vertical,
      borderRadius: getSpacing(getResponsiveValue(6, 7, 8, 10, 12)),
      flexDirection: "row",
      alignItems: "center",
    },
    featuredText: {
      color: "#FFFFFF",
      fontSize: badgeFontSize,
      fontFamily: fonts.SemiBold,
      marginLeft: isRTL ? 0 : getSpacing(getResponsiveValue(2, 3, 3, 4, 4)),
      marginRight: isRTL ? getSpacing(getResponsiveValue(2, 3, 3, 4, 4)) : 0,
      textAlign: "center",
      flexShrink: 1, // يسمح للنص بالتقلص إذا لزم الأمر
    },
    title: {
      fontSize: titleFontSize,
      fontFamily: fonts.Bold,
      color: "#FFFFFF",
      textAlign: isRTL ? "right" : "left",
      lineHeight: titleFontSize * 1.2,
      marginBottom: getSpacing(getResponsiveValue(3, 4, 5, 7, 8)),
      flex: 1,
      paddingRight: isRTL
        ? 0
        : getSpacing(getResponsiveValue(6, 8, 10, 12, 14)),
      paddingLeft: isRTL ? getSpacing(getResponsiveValue(6, 8, 10, 12, 14)) : 0,
      textShadowColor: "rgba(0,0,0,0.5)",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 3,
      maxWidth: "75%", // يحد من عرض العنوان لإفساح المجال للشارة
    },
    description: {
      fontSize: descriptionFontSize,
      fontFamily: fonts.Regular,
      color: "rgba(255, 255, 255, 0.9)",
      textAlign: isRTL ? "right" : "left",
      lineHeight: descriptionFontSize * 1.3,
      marginBottom: getSpacing(getResponsiveValue(4, 5, 5, 7, 8)),
      textShadowColor: "rgba(0,0,0,0.3)",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    footer: {
      flexDirection: isRTL ? "row-reverse" : "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    dateContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      paddingHorizontal: dateContainerPadding.horizontal,
      paddingVertical: dateContainerPadding.vertical,
      borderRadius: getSpacing(getResponsiveValue(8, 9, 10, 11, 12)),
    },
    dateText: {
      fontSize: dateFontSize,
      fontFamily: fonts.Medium,
      color: "rgba(255, 255, 255, 0.9)",
      marginLeft: isRTL ? 0 : getSpacing(3),
      marginRight: isRTL ? getSpacing(3) : 0,
    },
    actionButton: {
      backgroundColor: "rgba(255, 255, 255, 0.25)",
      paddingHorizontal: actionButtonPadding.horizontal,
      paddingVertical: actionButtonPadding.vertical,
      borderRadius: getSpacing(getResponsiveValue(10, 11, 12, 15, 18)),
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: "rgba(255, 255, 255, 0.3)",
    },
    actionText: {
      fontSize: actionFontSize,
      fontFamily: fonts.SemiBold,
      color: "#FFFFFF",
      marginRight: isRTL ? 0 : getSpacing(3),
      marginLeft: isRTL ? getSpacing(3) : 0,
    },
    // نسخة بديلة بدون صورة للإعلانات النصية
    textOnlyContainer: {
      backgroundColor: colors.surface,
      padding: cardPadding,
      justifyContent: "space-between",
    },
    textOnlyHeader: {
      flexDirection: isRTL ? "row-reverse" : "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: getSpacing(getResponsiveValue(6, 7, 8, 10, 12)),
    },
    textOnlyTitle: {
      fontSize: titleFontSize,
      fontFamily: fonts.Bold,
      color: colors.text,
      textAlign: isRTL ? "right" : "left",
      lineHeight: titleFontSize * 1.2,
      flex: 1,
      paddingRight: isRTL
        ? 0
        : getSpacing(getResponsiveValue(6, 8, 10, 12, 14)),
      paddingLeft: isRTL ? getSpacing(getResponsiveValue(6, 8, 10, 12, 14)) : 0,
      maxWidth: "75%", // يحد من عرض العنوان لإفساح المجال للشارة
    },
    textOnlyDescription: {
      fontSize: descriptionFontSize,
      fontFamily: fonts.Regular,
      color: colors.textSecondary,
      textAlign: isRTL ? "right" : "left",
      lineHeight: descriptionFontSize * 1.4,
      marginBottom: getSpacing(getResponsiveValue(6, 7, 8, 10, 12)),
    },
    textOnlyFooter: {
      flexDirection: isRTL ? "row-reverse" : "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    textOnlyDate: {
      fontSize: dateFontSize,
      fontFamily: fonts.Regular,
      color: colors.textMuted,
    },
    priorityIndicator: {
      width: getResponsiveValue(2, 3, 3, 4, 5),
      height: "100%",
      position: "absolute",
      right: isRTL ? undefined : 0,
      left: isRTL ? 0 : undefined,
      backgroundColor: getPriorityColor(),
    },
  });

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      {announcement.image_url ? (
        // كرت مع صورة
        <ImageBackground
          source={{ uri: announcement.image_url }}
          style={styles.imageBackground}
          imageStyle={{ borderRadius: borderRadius }}
        >
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.75)"]}
            style={styles.gradient}
          />

          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title} numberOfLines={2}>
                {title}
              </Text>
              {(announcement.is_featured ||
                announcement.priority !== "normal") && (
                <View style={styles.featuredBadge}>
                  <Ionicons
                    name={
                      announcement.priority === "urgent"
                        ? "warning"
                        : announcement.is_featured
                        ? "star"
                        : "flag"
                    }
                    size={iconSize}
                    color="#FFFFFF"
                  />
                  <Text style={styles.featuredText}>
                    {announcement.priority === "urgent"
                      ? isRTL
                        ? "عاجل"
                        : "Urgent"
                      : announcement.is_featured
                      ? isRTL
                        ? "مميز"
                        : "Featured"
                      : isRTL
                      ? "هام"
                      : "Important"}
                  </Text>
                </View>
              )}
            </View>

            {description && (
              <Text style={styles.description} numberOfLines={2}>
                {description}
              </Text>
            )}

            <View style={styles.footer}>
              <View style={styles.dateContainer}>
                <Ionicons
                  name="time-outline"
                  size={dateIconSize}
                  color="rgba(255, 255, 255, 0.8)"
                />
                <Text style={styles.dateText}>
                  {formatDate(announcement.created_at)}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={handlePress}
              >
                <Text style={styles.actionText}>{isRTL ? "عرض" : "View"}</Text>
                <Ionicons
                  name={isRTL ? "chevron-back" : "chevron-forward"}
                  size={actionIconSize}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>
      ) : (
        // كرت نصي بدون صورة
        <View style={styles.textOnlyContainer}>
          <View style={styles.priorityIndicator} />

          <View style={styles.textOnlyHeader}>
            <Text style={styles.textOnlyTitle} numberOfLines={2}>
              {title}
            </Text>
            {(announcement.is_featured ||
              announcement.priority !== "normal") && (
              <View
                style={[
                  styles.featuredBadge,
                  { backgroundColor: getPriorityColor() },
                ]}
              >
                <Ionicons
                  name={
                    announcement.priority === "urgent"
                      ? "warning"
                      : announcement.is_featured
                      ? "star"
                      : "flag"
                  }
                  size={iconSize}
                  color="#FFFFFF"
                />
                <Text style={styles.featuredText}>
                  {announcement.priority === "urgent"
                    ? isRTL
                      ? "عاجل"
                      : "Urgent"
                    : announcement.is_featured
                    ? isRTL
                      ? "مميز"
                      : "Featured"
                    : isRTL
                    ? "هام"
                    : "Important"}
                </Text>
              </View>
            )}
          </View>

          {description && (
            <Text style={styles.textOnlyDescription} numberOfLines={3}>
              {description}
            </Text>
          )}

          <View style={styles.textOnlyFooter}>
            <Text style={styles.textOnlyDate}>
              {formatDate(announcement.created_at)}
            </Text>

            <TouchableOpacity onPress={handlePress}>
              <Ionicons
                name={isRTL ? "chevron-back" : "chevron-forward"}
                size={actionIconSize}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

// مكون القسم الأفقي للإعلانات
interface AnnouncementSectionProps {
  announcements: Announcement[];
  title?: string;
  onAnnouncementPress?: (announcement: Announcement) => void;
  showAllButton?: boolean;
  onShowAllPress?: () => void;
}

export const AnnouncementSection: React.FC<AnnouncementSectionProps> = ({
  announcements,
  title,
  onAnnouncementPress,
  showAllButton = false,
  onShowAllPress,
}) => {
  const { colors } = useTheme();
  const fonts = useFontFamily();
  const { getFontSize, getSpacing, getResponsiveValue } = useResponsive();
  const { currentLanguage } = useLanguageStore();
  const isRTL = currentLanguage === "ar";

  const cardHeight = getResponsiveValue(
    180, // Very small screens
    185, // Small screens
    185, // Medium screens
    185, // Large screens
    195 // Very large screens
  );
  if (!announcements.length) return null;

  // أحجام العنوان الديناميكية
  const titleFontSize = getFontSize(
    getResponsiveValue(16, 17, 18, 19, 20),
    14, // minimum
    22 // maximum
  );

  const viewAllFontSize = getFontSize(
    getResponsiveValue(12, 13, 14, 14, 15),
    11, // minimum
    16 // maximum
  );

  // المسافات الديناميكية
  const sectionMarginBottom = getSpacing(getResponsiveValue(16, 18, 2, 2, 2));
  const horizontalPadding = getSpacing(getResponsiveValue(12, 14, 16, 18, 20));
  const titleMarginBottom = getSpacing(getResponsiveValue(8, 10, 12, 14, 16));

  return (
    <View
      style={{
        height: cardHeight + horizontalPadding,
        paddingTop: horizontalPadding / 2,
      }}
    >
      {title && (
        <View
          style={{
            flexDirection: isRTL ? "row-reverse" : "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: titleFontSize,
              fontFamily: fonts.Bold,
              color: colors.text,
              textAlign: isRTL ? "right" : "left",
            }}
          >
            {title}
          </Text>

          {showAllButton && (
            <TouchableOpacity onPress={onShowAllPress}>
              <Text
                style={{
                  fontSize: viewAllFontSize,
                  fontFamily: fonts.Medium,
                  color: colors.primary,
                }}
              >
                {isRTL ? "عرض الكل" : "View All"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <FlatList
        data={announcements}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <AnnouncementCard
            announcement={item}
            index={index}
            onPress={onAnnouncementPress}
          />
        )}
        contentContainerStyle={{
          paddingRight: horizontalPadding,
        }}
        inverted={isRTL}
      />
    </View>
  );
};

export default AnnouncementCard;
