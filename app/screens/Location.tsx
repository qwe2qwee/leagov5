import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Hooks
import { useFontFamily } from "@/hooks/useFontFamily";
import { useLocation } from "@/hooks/useLocation";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";

import useLanguageStore from "@/store/useLanguageStore";

// Components
import { Badge } from "@/components/ui/Badge2";
import { Card } from "@/components/ui/Card";
import CustomButton from "@/components/ui/CustomButton";
import { Select } from "@/components/ui/Select";
import { Separator } from "@/components/ui/Separator";

// Utils
import { useAuth } from "@/hooks/supabaseHooks/auth/context";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/store/useToastStore";
import { useSafeNavigate } from "@/utils/useSafeNavigate";

interface LocationData {
  location: string | null;
  user_latitude: number | null;
  user_longitude: number | null;
  location_accuracy: number | null;
  location_updated_at: string | null;
}

// Jeddah neighborhoods with Arabic/English support
const jeddahNeighborhoods = {
  ar: [
    "الحمراء",
    "النزلة اليمانية",
    "النزلة الشرقية",
    "البلد",
    "الرويس",
    "الصبح",
    "الكندرة",
    "أجياد",
    "الشاطئ",
    "الثغر",
    "الأندلس",
    "الزهراء",
    "الصفا",
    "الفيصلية",
    "السلامة",
    "الروضة",
    "النهضة",
    "الربوة",
    "الخالدية",
    "المحمدية",
    "البوادي",
    "النعيم",
    "الصحيفة",
    "الورود",
    "الحرازات",
    "أبحر الشمالية",
    "أبحر الجنوبية",
    "الشروق",
    "الياقوت",
    "الألماس",
    "اللؤلؤ",
    "المرجان",
    "الجوهرة",
    "النخيل",
    "الواحة",
    "السنابل",
    "الفلاح",
  ],
  en: [
    "Al Hamra",
    "Al Nazla Al Yamania",
    "Al Nazla Al Sharqiya",
    "Al Balad",
    "Al Rawais",
    "Al Sabh",
    "Al Kandara",
    "Ajyad",
    "Al Shati",
    "Al Thaghr",
    "Al Andalus",
    "Al Zahra",
    "Al Safa",
    "Al Faisaliya",
    "Al Salama",
    "Al Rawda",
    "Al Nahda",
    "Al Rabwa",
    "Al Khalidiya",
    "Al Mohammadiya",
    "Al Bawadi",
    "Al Naeem",
    "Al Sahifa",
    "Al Worod",
    "Al Harazat",
    "Obhur Al Shamaliya",
    "Obhur Al Janubiya",
    "Al Shorouq",
    "Al Yaqout",
    "Al Almas",
    "Al Lulu",
    "Al Marjan",
    "Al Jawhara",
    "Al Nakheel",
    "Al Wahat",
    "Al Sanabel",
    "Al Falah",
  ],
} as const;

export default function LocationScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const responsive = useResponsive();
  const fonts = useFontFamily();
  const { currentLanguage, isRTL } = useLanguageStore();
  const { showSuccess, showError } = useToast();
  const { back } = useSafeNavigate();
  const {
    getCurrentLocation,
    userLocation: currentGPSLocation,
    loading: gpsLoading,
    error: gpsError,
  } = useLocation();

  // Local state
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [gettingLocation, setGettingLocation] = useState<boolean>(false);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [latitudeText, setLatitudeText] = useState<string>("");
  const [longitudeText, setLongitudeText] = useState<string>("");
  const [accuracyText, setAccuracyText] = useState<string>("");

  // Localization
  const t = {
    title: currentLanguage === "ar" ? "معلومات الموقع" : "Location Information",
    subtitle:
      currentLanguage === "ar"
        ? "يمكنك تعديل معلومات موقعك الجغرافي هنا"
        : "You can edit your location information here",
    backHome: currentLanguage === "ar" ? "العودة للرئيسية" : "Back to Home",
    loading: currentLanguage === "ar" ? "جاري التحميل..." : "Loading...",
    noData:
      currentLanguage === "ar" ? "لم يتم العثور على البيانات" : "No data found",
    lastUpdate: currentLanguage === "ar" ? "آخر تحديث:" : "Last Update:",
    locationAccuracy:
      currentLanguage === "ar" ? "دقة الموقع:" : "Location Accuracy:",
    descriptiveLocation:
      currentLanguage === "ar" ? "الموقع الوصفي" : "Descriptive Location",
    selectNeighborhood:
      currentLanguage === "ar"
        ? "اختر الحي في جدة"
        : "Select neighborhood in Jeddah",
    latitude: currentLanguage === "ar" ? "خط العرض" : "Latitude",
    longitude: currentLanguage === "ar" ? "خط الطول" : "Longitude",
    accuracy:
      currentLanguage === "ar" ? "دقة الموقع (متر)" : "Accuracy (meters)",
    getCurrentLocation:
      currentLanguage === "ar"
        ? "استخدام موقعي الحالي"
        : "Use Current Location",
    gettingLocation:
      currentLanguage === "ar" ? "جاري تحديد الموقع..." : "Getting location...",
    saveChanges: currentLanguage === "ar" ? "حفظ التغييرات" : "Save Changes",
    saving: currentLanguage === "ar" ? "جاري الحفظ..." : "Saving...",
    latPlaceholder:
      currentLanguage === "ar"
        ? "خط العرض (-90 إلى 90)"
        : "Latitude (-90 to 90)",
    lngPlaceholder:
      currentLanguage === "ar"
        ? "خط الطول (-180 إلى 180)"
        : "Longitude (-180 to 180)",
    accuracyPlaceholder:
      currentLanguage === "ar"
        ? "دقة الموقع بالأمتار"
        : "Location accuracy in meters",
    saved: currentLanguage === "ar" ? "تم الحفظ" : "Saved",
    savedDesc:
      currentLanguage === "ar"
        ? "تم حفظ معلومات الموقع بنجاح"
        : "Location information saved successfully",
    error: currentLanguage === "ar" ? "خطأ" : "Error",
    fetchError:
      currentLanguage === "ar"
        ? "حدث خطأ في جلب البيانات"
        : "Error fetching data",
    saveError:
      currentLanguage === "ar"
        ? "حدث خطأ في حفظ البيانات"
        : "Error saving data",
    coordError:
      currentLanguage === "ar" ? "خطأ في الإحداثيات" : "Coordinate Error",
    coordErrorDesc:
      currentLanguage === "ar"
        ? "خط العرض يجب أن يكون بين -90 و 90، وخط الطول بين -180 و 180"
        : "Latitude must be between -90 and 90, longitude between -180 and 180",
    locationSuccess:
      currentLanguage === "ar"
        ? "تم الحصول على موقعك الحالي"
        : "Current location obtained",
    locationError:
      currentLanguage === "ar"
        ? "لم يتمكن من الحصول على موقعك"
        : "Unable to get your location",
    excellent: currentLanguage === "ar" ? "ممتازة" : "Excellent",
    good: currentLanguage === "ar" ? "جيدة" : "Good",
    poor: currentLanguage === "ar" ? "ضعيفة" : "Poor",
    notDetermined: currentLanguage === "ar" ? "غير محدد" : "Not determined",
    notUpdated: currentLanguage === "ar" ? "لم يتم التحديث" : "Not updated",
    meters: currentLanguage === "ar" ? "متر" : "meters",
  };

  // Load location data on mount
  useEffect(() => {
    if (user) {
      fetchLocation();
    }
  }, [user]);

  // Update text inputs when location data changes
  useEffect(() => {
    if (location) {
      setLatitudeText(location.user_latitude?.toString() || "");
      setLongitudeText(location.user_longitude?.toString() || "");
      setAccuracyText(location.location_accuracy?.toString() || "");
    }
  }, [location]);

  const fetchLocation = async (): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(
          "location, user_latitude, user_longitude, location_accuracy, location_updated_at"
        )
        .eq("user_id", user?.id)
        .single();

      if (error) throw error;
      setLocation(data as LocationData);
    } catch (error) {
      console.error("Error fetching location:", error);
      showError(t.fetchError);
    } finally {
      setLoading(false);
    }
  };

  const validateCoordinates = (
    lat: number | null,
    lng: number | null
  ): boolean => {
    if (lat === null || lng === null) return true;
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  };

  const handleSave = async (): Promise<void> => {
    if (!location) return;

    if (!validateCoordinates(location.user_latitude, location.user_longitude)) {
      showError(t.coordErrorDesc);
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.rpc("update_user_profile", {
        _location: location.location,
        _user_latitude: location.user_latitude,
        _user_longitude: location.user_longitude,
        _location_accuracy: location.location_accuracy,
      });

      if (error) throw error;

      await fetchLocation();
      showSuccess(t.savedDesc);
    } catch (error) {
      console.error("Error updating location:", error);
      showError(t.saveError);
    } finally {
      setSaving(false);
    }
  };

  const handleGetCurrentLocation = async (): Promise<void> => {
    setGettingLocation(true);
    try {
      const locationData = await getCurrentLocation({
        enableHighAccuracy: true,
        timeout: 10000,
        fallbackToDefault: true,
        defaultCity: "jeddah",
      });

      setLocation((prev) =>
        prev
          ? {
              ...prev,
              user_latitude: locationData.lat,
              user_longitude: locationData.lon,
              location_accuracy: null,
            }
          : null
      );

      showSuccess(
        `${t.locationSuccess} (${locationData.lat.toFixed(
          6
        )}, ${locationData.lon.toFixed(6)})`
      );
    } catch (error) {
      console.error("Error getting current location:", error);
      showError(t.locationError);
    } finally {
      setGettingLocation(false);
    }
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return t.notUpdated;

    const date = new Date(dateString);
    return date.toLocaleString(currentLanguage === "ar" ? "ar-SA" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getAccuracyBadgeVariant = (
    accuracy: number | null
  ):
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "success"
    | "warning"
    | "info" => {
    if (!accuracy) return "secondary";
    if (accuracy <= 10) return "success";
    if (accuracy <= 50) return "warning";
    return "destructive";
  };

  const getAccuracyText = (accuracy: number | null): string => {
    if (!accuracy) return t.notDetermined;
    if (accuracy <= 10) return t.excellent;
    if (accuracy <= 50) return t.good;
    return t.poor;
  };

  const handleNeighborhoodSelect = (value: string): void => {
    const cityPrefix = currentLanguage === "ar" ? "جدة - " : "Jeddah - ";
    setLocation((prev) =>
      prev
        ? {
            ...prev,
            location: `${cityPrefix}${value}`,
          }
        : null
    );
  };

  const updateCoordinate = (
    field: "latitude" | "longitude" | "accuracy",
    text: string
  ): void => {
    const value = text === "" ? null : parseFloat(text);

    if (field === "latitude") {
      setLatitudeText(text);
      setLocation((prev) => (prev ? { ...prev, user_latitude: value } : null));
    } else if (field === "longitude") {
      setLongitudeText(text);
      setLocation((prev) => (prev ? { ...prev, user_longitude: value } : null));
    } else {
      setAccuracyText(text);
      setLocation((prev) =>
        prev ? { ...prev, location_accuracy: value } : null
      );
    }
  };

  const IconComponent = ({
    name,
    size,
    color,
  }: {
    name: string;
    size: number;
    color: string;
  }) => <Ionicons name={name as any} size={size} color={color} />;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      paddingHorizontal: responsive.getResponsiveValue(16, 20, 24, 28, 32),
      paddingTop:
        responsive.safeAreaTop +
        responsive.getResponsiveValue(8, 12, 16, 20, 24),
    },
    header: {
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      marginBottom: responsive.getResponsiveValue(16, 20, 24, 28, 32),
    },
    backButton: {
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      paddingVertical: responsive.getResponsiveValue(8, 10, 12, 14, 16),
      paddingHorizontal: responsive.getResponsiveValue(12, 16, 20, 24, 28),
      backgroundColor: colors.backgroundSecondary,
      borderRadius: responsive.getResponsiveValue(8, 10, 12, 14, 16),
    },
    backText: {
      fontSize: responsive.getFontSize(14, 13, 16),
      fontFamily: fonts.Regular,
      color: colors.text,
      marginHorizontal: responsive.getResponsiveValue(6, 8, 10, 12, 14),
    },
    statusCard: {
      backgroundColor: colors.backgroundSecondary,
      borderRadius: responsive.getResponsiveValue(8, 10, 12, 14, 16),
      padding: responsive.getResponsiveValue(12, 16, 20, 24, 28),
      marginBottom: responsive.getResponsiveValue(16, 20, 24, 28, 32),
    },
    statusRow: {
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      marginBottom: responsive.getResponsiveValue(6, 8, 10, 12, 14),
    },
    statusText: {
      fontSize: responsive.getFontSize(13, 12, 15),
      fontFamily: fonts.Regular,
      color: colors.textSecondary,
      marginHorizontal: responsive.getResponsiveValue(6, 8, 10, 12, 14),
    },
    inputContainer: {
      marginBottom: responsive.getResponsiveValue(16, 20, 24, 28, 32),
    },
    inputLabel: {
      fontSize: responsive.getFontSize(14, 13, 16),
      fontFamily: fonts.Medium || fonts.Regular,
      color: colors.text,
      marginBottom: responsive.getResponsiveValue(6, 8, 10, 12, 14),
      textAlign: isRTL ? "right" : "left",
    },
    textInput: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: responsive.getResponsiveValue(8, 10, 12, 14, 16),
      paddingHorizontal: responsive.getResponsiveValue(12, 16, 20, 24, 28),
      paddingVertical: responsive.getResponsiveValue(10, 12, 14, 16, 18),
      fontSize: responsive.getFontSize(14, 13, 16),
      fontFamily: fonts.Regular,
      color: colors.text,
      backgroundColor: colors.surface,
      textAlign: isRTL ? "right" : "left",
      writingDirection: isRTL ? "rtl" : "ltr",
    },
    coordRow: {
      flexDirection: isRTL ? "row-reverse" : "row",
      justifyContent: "space-between",
      gap: responsive.getResponsiveValue(8, 12, 16, 20, 24),
    },
    coordContainer: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
    },
    loadingText: {
      fontSize: responsive.getFontSize(16, 15, 18),
      fontFamily: fonts.Regular,
      color: colors.text,
      marginTop: responsive.getResponsiveValue(12, 16, 20, 24, 28),
    },
    buttonSpacing: {
      height: responsive.getResponsiveValue(12, 16, 20, 24, 28),
    },
    bottomSpacing: {
      height: responsive.safeAreaBottom + 20,
    },
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>{t.loading}</Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>{t.noData}</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => back()}>
            <IconComponent
              name={isRTL ? "chevron-forward" : "chevron-back"}
              size={responsive.getResponsiveValue(18, 20, 22, 24, 26)}
              color={colors.text}
            />
            <Text style={styles.backText}>{t.backHome}</Text>
          </TouchableOpacity>
        </View>

        {/* Main Card */}
        <Card type="default">
          <Card.Header>
            <Card.Title size="lg">{t.title}</Card.Title>
            <Card.Description>{t.subtitle}</Card.Description>
          </Card.Header>

          <Card.Content>
            {/* Status Information */}
            {(location.location_updated_at || location.location_accuracy) && (
              <View style={styles.statusCard}>
                {location.location_updated_at && (
                  <View style={styles.statusRow}>
                    <IconComponent
                      name="time-outline"
                      size={responsive.getResponsiveValue(16, 18, 20, 22, 24)}
                      color={colors.textSecondary}
                    />
                    <Text style={styles.statusText}>
                      {t.lastUpdate} {formatDate(location.location_updated_at)}
                    </Text>
                  </View>
                )}

                {location.location_accuracy && (
                  <View style={styles.statusRow}>
                    <IconComponent
                      name="locate-outline"
                      size={responsive.getResponsiveValue(16, 18, 20, 22, 24)}
                      color={colors.textSecondary}
                    />
                    <Text style={styles.statusText}>{t.locationAccuracy}</Text>
                    <Badge
                      variant={getAccuracyBadgeVariant(
                        location.location_accuracy
                      )}
                    >
                      {Math.round(location.location_accuracy)} {t.meters} -{" "}
                      {getAccuracyText(location.location_accuracy)}
                    </Badge>
                  </View>
                )}
              </View>
            )}

            {/* Neighborhood Selection */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t.descriptiveLocation}</Text>
              <Select
                value={location.location?.replace(/^(جدة|Jeddah) - /, "") || ""}
                onValueChange={handleNeighborhoodSelect}
              >
                <Select.Trigger placeholder={t.selectNeighborhood} />
                <Select.Content>
                  {jeddahNeighborhoods[currentLanguage].map((neighborhood) => (
                    <Select.Item key={neighborhood} value={neighborhood}>
                      {neighborhood}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </View>

            <Separator />

            {/* Coordinates Input */}
            <View style={styles.coordRow}>
              <View style={styles.coordContainer}>
                <Text style={styles.inputLabel}>{t.latitude}</Text>
                <TextInput
                  style={styles.textInput}
                  value={latitudeText}
                  onChangeText={(text) => updateCoordinate("latitude", text)}
                  placeholder={t.latPlaceholder}
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.coordContainer}>
                <Text style={styles.inputLabel}>{t.longitude}</Text>
                <TextInput
                  style={styles.textInput}
                  value={longitudeText}
                  onChangeText={(text) => updateCoordinate("longitude", text)}
                  placeholder={t.lngPlaceholder}
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Accuracy Input - Only show if there's existing accuracy data */}
            {location.location_accuracy && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>{t.accuracy}</Text>
                <TextInput
                  style={styles.textInput}
                  value={accuracyText}
                  onChangeText={(text) => updateCoordinate("accuracy", text)}
                  placeholder={t.accuracyPlaceholder}
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                />
              </View>
            )}

            <Separator />

            {/* Get Current Location Button */}
            <CustomButton
              title={gettingLocation ? t.gettingLocation : t.getCurrentLocation}
              bgVariant="outline"
              textVariant="primary"
              onPress={handleGetCurrentLocation}
              loading={gettingLocation}
              disabled={gettingLocation || saving}
              IconLeft={() => (
                <IconComponent
                  name="location-outline"
                  size={responsive.getResponsiveValue(18, 20, 22, 24, 26)}
                  color={colors.text}
                />
              )}
            />

            <View style={styles.buttonSpacing} />

            {/* Save Button */}
            <CustomButton
              title={saving ? t.saving : t.saveChanges}
              bgVariant="primary"
              onPress={handleSave}
              loading={saving}
              disabled={saving || gettingLocation}
              IconLeft={() => (
                <IconComponent
                  name="save-outline"
                  size={responsive.getResponsiveValue(18, 20, 22, 24, 26)}
                  color={colors.textInverse}
                />
              )}
            />
          </Card.Content>
        </Card>

        {/* Bottom spacing for safe area */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Usage examples:

// Example 1: Navigation to this screen
// <CustomButton
//   title="Location Settings"
//   onPress={() => router.push('/location')}
// />

// Example 2: As part of onboarding flow
// <CustomButton
//   title="Setup Location"
//   onPress={() => router.push('/onboarding/location')}
// />

// Example 3: From profile settings
// <TouchableOpacity onPress={() => router.push('/settings/location')}>
//   <View style={settingsItemStyle}>
//     <Ionicons name="location-outline" size={24} />
//     <Text>Location Information</Text>
//   </View>
// </TouchableOpacity>
