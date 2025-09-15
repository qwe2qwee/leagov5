import ProfileEmpty from "@/components/Profile/ProfileEmpty";
import ProfileForm from "@/components/Profile/ProfileForm";
import ProfileHeader from "@/components/Profile/ProfileHeader";
import ProfileLoading from "@/components/Profile/ProfileLoading";
import { useAuthLogic } from "@/hooks/supabaseHooks/auth/useAuthLogic";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import { supabase } from "@/lib/supabase";
import useLanguageStore from "@/store/useLanguageStore";
import { useToast } from "@/store/useToastStore";
import { useSafeNavigate } from "@/utils/useSafeNavigate";
import React, { useEffect, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

// Import components

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

    // sync ageInput -> profile.age
    profile.age = ageInput !== "" ? parseInt(ageInput, 10) : null;

    setSaving(true);
    try {
      const { error: profileError } = await supabase.rpc(
        "update_user_profile",
        {
          _full_name: profile.full_name,
          _age: profile.age,
          _gender: profile.gender,
        }
      );

      if (profileError) throw profileError;

      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: profile.full_name },
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

  // Loading State
  if (loading) {
    return <ProfileLoading loadingText={t.loading} />;
  }

  // No Data State
  if (!profile) {
    return <ProfileEmpty noDataText={t.noData} />;
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["left", "right"]}
    >
      <View style={{ flex: 1 }}>
        {/* Header - Outside KeyboardAvoidingView */}
        <ProfileHeader
          onBack={back}
          title={t.title}
          subtitle={t.subtitle}
          backText={t.back}
        />

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
              <ProfileForm
                profile={profile}
                ageInput={ageInput}
                saving={saving}
                onProfileChange={setProfile}
                onAgeInputChange={setAgeInput}
                onAgeSubmit={handleAgeSubmit}
                onSave={handleSave}
                translations={{
                  description: t.description,
                  fullName: t.fullName,
                  email: t.email,
                  phone: t.phone,
                  age: t.age,
                  gender: t.gender,
                  agePlaceholder: t.agePlaceholder,
                  genderPlaceholder: t.genderPlaceholder,
                  male: t.male,
                  female: t.female,
                  save: t.save,
                  saving: t.saving,
                  cannotEdit: t.cannotEdit,
                }}
              />
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

export default ProfileScreen;
