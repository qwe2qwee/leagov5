import { Card } from "@/components/ui/Card";
import CustomButton from "@/components/ui/CustomButton";
import { Select } from "@/components/ui/Select";
import { useAuthLogic } from "@/hooks/supabaseHooks/auth/useAuthLogic";
import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import { supabase } from "@/lib/supabase";
import useLanguageStore from "@/store/useLanguageStore";
import { useToast } from "@/store/useToastStore";
import { useSafeNavigate } from "@/utils/useSafeNavigate";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

interface UserProfile {
  full_name: string;
  email: string;
  phone: string;
  age: number | null;
  gender: string | null;
}

const ProfileScreen = () => {
  const { user } = useAuthLogic();
  const { showSuccess, showError } = useToast();
  const { back } = useSafeNavigate();
  const { colors } = useTheme();
  const responsive = useResponsive();
  const fonts = useFontFamily();
  const { currentLanguage, isRTL } = useLanguageStore();
  const insets = useSafeAreaInsets();

  // Add refs for managing keyboard state
  const scrollViewRef = useRef<ScrollView>(null);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // State management
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [ageInput, setAgeInput] = useState("");

  // Keyboard listeners
  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => {
        setIsKeyboardVisible(true);
        setKeyboardHeight(e.endCoordinates.height);
      }
    );

    const hideSubscription = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setIsKeyboardVisible(false);
        setKeyboardHeight(0);
      }
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // Translations
  const t = {
    title: currentLanguage === "ar" ? "الملف الشخصي" : "Profile",
    subtitle:
      currentLanguage === "ar"
        ? "إدارة معلوماتك الشخصية"
        : "Manage your personal information",
    description:
      currentLanguage === "ar"
        ? "يمكنك تعديل معلوماتك الشخصية هنا. البريد الإلكتروني ورقم الهاتف لا يمكن تغييرهما."
        : "You can edit your personal information here. Email and phone cannot be changed.",
    fullName: currentLanguage === "ar" ? "الاسم الكامل" : "Full Name",
    email: currentLanguage === "ar" ? "البريد الإلكتروني" : "Email Address",
    phone: currentLanguage === "ar" ? "رقم الهاتف" : "Phone Number",
    age: currentLanguage === "ar" ? "العمر" : "Age",
    gender: currentLanguage === "ar" ? "الجنس" : "Gender",
    agePlaceholder:
      currentLanguage === "ar"
        ? "أدخل عمرك (18-100)"
        : "Enter your age (18-100)",
    genderPlaceholder:
      currentLanguage === "ar" ? "اختر الجنس" : "Select gender",
    male: currentLanguage === "ar" ? "ذكر" : "Male",
    female: currentLanguage === "ar" ? "أنثى" : "Female",
    save: currentLanguage === "ar" ? "حفظ التغييرات" : "Save Changes",
    saving: currentLanguage === "ar" ? "جاري الحفظ..." : "Saving...",
    back: currentLanguage === "ar" ? "رجوع" : "Back",
    loading: currentLanguage === "ar" ? "جاري التحميل..." : "Loading...",
    noData:
      currentLanguage === "ar" ? "لم يتم العثور على البيانات" : "No data found",
    cannotEdit:
      currentLanguage === "ar" ? "لا يمكن التعديل" : "Cannot be edited",
    ageError:
      currentLanguage === "ar"
        ? "العمر يجب أن يكون بين 18 و 100 سنة"
        : "Age must be between 18 and 100",
    fetchError:
      currentLanguage === "ar" ? "خطأ في جلب البيانات" : "Error fetching data",
    saveError:
      currentLanguage === "ar" ? "خطأ في حفظ البيانات" : "Error saving data",
    saveSuccess:
      currentLanguage === "ar"
        ? "تم حفظ المعلومات بنجاح"
        : "Profile updated successfully",
  };

  // Fetch profile data
  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, email, phone, age, gender")
        .eq("user_id", user?.id)
        .single();

      if (error) throw error;

      setProfile(data);
      setAgeInput(data.age?.toString() || "");
    } catch (error) {
      console.error("Error fetching profile:", error);
      showError(t.fetchError);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    setSaving(true);
    try {
      // Update profile in database using RPC
      const { error: profileError } = await supabase.rpc(
        "update_user_profile",
        {
          _full_name: profile.full_name,
          _age: profile.age,
          _gender: profile.gender,
        }
      );

      if (profileError) throw profileError;

      // Update user metadata in auth
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: profile.full_name,
        },
      });

      if (authError) throw authError;

      showSuccess(t.saveSuccess);
      Keyboard.dismiss();
    } catch (error) {
      console.error("Error updating profile:", error);
      showError(t.saveError);
    } finally {
      setSaving(false);
    }
  };

  const handleAgeChange = (text: string) => {
    // Only allow numbers
    const numericText = text.replace(/[^0-9]/g, "");
    setAgeInput(numericText);
  };

  const handleAgeSubmit = () => {
    if (!profile) return;

    if (ageInput === "") {
      setProfile({ ...profile, age: null });
      return;
    }

    const age = parseInt(ageInput);
    if (age < 18 || age > 100) {
      showError(t.ageError);
      setAgeInput(profile.age?.toString() || "");
      return;
    }

    setProfile({ ...profile, age });
  };

  // Reusable Input Component
  const FormInput = ({
    label,
    value,
    onChangeText,
    placeholder,
    disabled = false,
    keyboardType = "default",
    onSubmitEditing,
    required = false,
    helperText,
  }: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    disabled?: boolean;
    keyboardType?: "default" | "numeric" | "email-address" | "phone-pad";
    onSubmitEditing?: () => void;
    required?: boolean;
    helperText?: string;
  }) => (
    <View
      style={{
        marginBottom: responsive.getResponsiveValue(20, 24, 28, 32, 36),
      }}
    >
      <Text
        style={{
          fontSize: responsive.getFontSize(15, 14, 17),
          fontFamily: fonts.SemiBold || fonts.Medium || fonts.Regular,
          color: colors.text,
          marginBottom: responsive.getResponsiveValue(6, 8, 10, 12, 14),
          textAlign: isRTL ? "right" : "left",
        }}
      >
        {label}
        {required && <Text style={{ color: colors.error }}> *</Text>}
      </Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        editable={!disabled}
        keyboardType={keyboardType}
        onSubmitEditing={onSubmitEditing}
        returnKeyType={onSubmitEditing ? "done" : "next"}
        style={{
          minHeight: responsive.getInputHeight(),
          paddingHorizontal: responsive.getResponsiveValue(16, 18, 20, 22, 24),
          paddingVertical: responsive.getResponsiveValue(14, 16, 18, 20, 22),
          backgroundColor: disabled
            ? colors.backgroundTertiary
            : colors.surface,
          borderWidth: 1.5,
          borderColor: disabled ? colors.borderLight : colors.border,
          borderRadius: responsive.getResponsiveValue(12, 14, 16, 18, 20),
          fontSize: responsive.getFontSize(16, 15, 18),
          fontFamily: fonts.Regular,
          color: disabled ? colors.textMuted : colors.text,
          textAlign: isRTL ? "right" : "left",
          opacity: disabled ? 0.7 : 1,
        }}
        placeholderTextColor={colors.textMuted}
      />

      {helperText && (
        <Text
          style={{
            fontSize: responsive.getFontSize(12, 11, 14),
            fontFamily: fonts.Regular,
            color: colors.textMuted,
            marginTop: responsive.getResponsiveValue(6, 8, 10, 12, 14),
            textAlign: isRTL ? "right" : "left",
          }}
        >
          {helperText}
        </Text>
      )}
    </View>
  );

  // Loading State
  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={["left", "right", "top"]}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: colors.background,
            paddingHorizontal: responsive.getResponsiveValue(
              20,
              24,
              28,
              32,
              36
            ),
          }}
        >
          <ActivityIndicator
            size="large"
            color={colors.primary}
            style={{
              marginBottom: responsive.getResponsiveValue(20, 24, 28, 32, 36),
            }}
          />
          <Text
            style={{
              fontSize: responsive.getFontSize(16, 15, 18),
              fontFamily: fonts.Medium || fonts.Regular,
              color: colors.textSecondary,
              textAlign: "center",
            }}
          >
            {t.loading}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // No Data State
  if (!profile) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={["left", "right", "top"]}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: colors.background,
            paddingHorizontal: responsive.getResponsiveValue(
              20,
              24,
              28,
              32,
              36
            ),
          }}
        >
          <Ionicons
            name="person-circle-outline"
            size={responsive.getResponsiveValue(80, 90, 100, 110, 120)}
            color={colors.textMuted}
            style={{
              marginBottom: responsive.getResponsiveValue(20, 24, 28, 32, 36),
            }}
          />
          <Text
            style={{
              fontSize: responsive.getFontSize(16, 15, 18),
              fontFamily: fonts.Medium || fonts.Regular,
              color: colors.textSecondary,
              textAlign: "center",
            }}
          >
            {t.noData}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Calculate dynamic bottom padding based on keyboard state
  const getContentPadding = () => {
    if (Platform.OS === "ios") {
      return Math.max(
        responsive.getResponsiveValue(24, 28, 32, 36, 40),
        insets.bottom + 20
      );
    }
    // For Android, add extra padding when keyboard is visible
    return isKeyboardVisible
      ? keyboardHeight + responsive.getResponsiveValue(24, 28, 32, 36, 40)
      : Math.max(
          responsive.getResponsiveValue(24, 28, 32, 36, 40),
          insets.bottom + 20
        );
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["left", "right"]}
    >
      <View style={{ flex: 1 }}>
        {/* Header - Outside KeyboardAvoidingView */}
        <View
          style={{
            flexDirection: isRTL ? "row-reverse" : "row",
            alignItems: "center",
            paddingTop:
              insets.top + responsive.getResponsiveValue(12, 16, 20, 24, 28),
            paddingHorizontal: responsive.getResponsiveValue(
              20,
              24,
              28,
              32,
              36
            ),
            paddingBottom: responsive.getResponsiveValue(20, 24, 28, 32, 36),
            backgroundColor: colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: colors.borderLight,
            shadowColor: colors.text,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 3,
            elevation: 2,
          }}
        >
          <TouchableOpacity
            onPress={() => back()}
            style={{
              flexDirection: isRTL ? "row-reverse" : "row",
              alignItems: "center",
              paddingVertical: responsive.getResponsiveValue(8, 10, 12, 14, 16),
              paddingHorizontal: responsive.getResponsiveValue(
                12,
                14,
                16,
                18,
                20
              ),
              borderRadius: responsive.getResponsiveValue(10, 12, 14, 16, 18),
              backgroundColor: colors.backgroundSecondary,
              marginRight: isRTL
                ? 0
                : responsive.getResponsiveValue(16, 20, 24, 28, 32),
              marginLeft: isRTL
                ? responsive.getResponsiveValue(16, 20, 24, 28, 32)
                : 0,
            }}
          >
            <Ionicons
              name={isRTL ? "chevron-forward" : "chevron-back"}
              size={responsive.getResponsiveValue(20, 22, 24, 26, 28)}
              color={colors.text}
            />
            <Text
              style={{
                fontSize: responsive.getFontSize(15, 14, 17),
                fontFamily: fonts.Medium || fonts.Regular,
                color: colors.text,
                marginHorizontal: responsive.getResponsiveValue(
                  8,
                  10,
                  12,
                  14,
                  16
                ),
              }}
            >
              {t.back}
            </Text>
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: responsive.getFontSize(22, 20, 26),
                fontFamily: fonts.Bold || fonts.SemiBold || fonts.Regular,
                color: colors.text,
                textAlign: isRTL ? "right" : "left",
                marginBottom: responsive.getResponsiveValue(2, 4, 6, 8, 10),
              }}
            >
              {t.title}
            </Text>
            <Text
              style={{
                fontSize: responsive.getFontSize(14, 13, 16),
                fontFamily: fonts.Regular,
                color: colors.textSecondary,
                textAlign: isRTL ? "right" : "left",
              }}
            >
              {t.subtitle}
            </Text>
          </View>
        </View>

        {/* Content with KeyboardAvoidingView */}
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={0}
        >
          <TouchableWithoutFeedback
            onPress={Keyboard.dismiss}
            accessible={false}
          >
            <ScrollView
              ref={scrollViewRef}
              style={{ flex: 1 }}
              contentContainerStyle={{
                paddingHorizontal: responsive.getResponsiveValue(
                  20,
                  24,
                  28,
                  32,
                  36
                ),
                paddingTop: responsive.getResponsiveValue(24, 28, 32, 36, 40),
                paddingBottom: getContentPadding(),
              }}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              showsVerticalScrollIndicator={false}
              bounces={true}
              scrollEnabled={true}
            >
              <Card type="default">
                <Card.Header>
                  <Card.Description style={{ marginBottom: 0 }}>
                    {t.description}
                  </Card.Description>
                </Card.Header>

                <Card.Content>
                  {/* Full Name */}
                  <FormInput
                    label={t.fullName}
                    value={profile.full_name}
                    onChangeText={(text) =>
                      setProfile({ ...profile, full_name: text })
                    }
                    required={true}
                  />

                  {/* Email */}
                  <FormInput
                    label={t.email}
                    value={profile.email}
                    onChangeText={() => {}}
                    disabled={true}
                    keyboardType="email-address"
                    helperText={t.cannotEdit}
                  />

                  {/* Phone */}
                  <FormInput
                    label={t.phone}
                    value={profile.phone}
                    onChangeText={() => {}}
                    disabled={true}
                    keyboardType="phone-pad"
                    helperText={t.cannotEdit}
                  />

                  {/* Age */}
                  <FormInput
                    label={t.age}
                    value={ageInput}
                    onChangeText={handleAgeChange}
                    onSubmitEditing={handleAgeSubmit}
                    placeholder={t.agePlaceholder}
                    keyboardType="numeric"
                  />

                  {/* Gender */}
                  <View
                    style={{
                      marginBottom: responsive.getResponsiveValue(
                        20,
                        24,
                        28,
                        32,
                        36
                      ),
                    }}
                  >
                    <Text
                      style={{
                        fontSize: responsive.getFontSize(15, 14, 17),
                        fontFamily:
                          fonts.SemiBold || fonts.Medium || fonts.Regular,
                        color: colors.text,
                        marginBottom: responsive.getResponsiveValue(
                          6,
                          8,
                          10,
                          12,
                          14
                        ),
                        textAlign: isRTL ? "right" : "left",
                      }}
                    >
                      {t.gender}
                    </Text>

                    <Select
                      value={profile.gender || ""}
                      onValueChange={(value) =>
                        setProfile({ ...profile, gender: value })
                      }
                    >
                      <Select.Trigger placeholder={t.genderPlaceholder} />
                      <Select.Content>
                        <Select.Item value="male">{t.male}</Select.Item>
                        <Select.Item value="female">{t.female}</Select.Item>
                      </Select.Content>
                    </Select>
                  </View>
                </Card.Content>

                <Card.Footer>
                  <CustomButton
                    title={saving ? t.saving : t.save}
                    bgVariant="primary"
                    onPress={handleSave}
                    loading={saving}
                    disabled={saving}
                    IconLeft={() => (
                      <Ionicons
                        name="checkmark-circle"
                        size={responsive.getResponsiveValue(20, 22, 24, 26, 28)}
                        color={colors.textInverse}
                      />
                    )}
                  />
                </Card.Footer>
              </Card>
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

export default ProfileScreen;
