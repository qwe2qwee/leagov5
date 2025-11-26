import { Card } from "@/components/ui/Card";
import CustomButton from "@/components/ui/CustomButton";
import { Select } from "@/components/ui/Select";
import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Text, View } from "react-native";
import FormInput from "./FormInput";

interface UserProfile {
  full_name: string;
  email: string;
  phone: string;
  age: number | null;
  gender: string | null;
}

interface ProfileFormProps {
  profile: UserProfile;
  ageInput: string;
  saving: boolean;
  onProfileChange: (profile: UserProfile) => void;
  onAgeInputChange: (text: string) => void;
  onAgeSubmit: () => void;
  onSave: () => void;
  translations: {
    description: string;
    fullName: string;
    email: string;
    phone: string;
    age: string;
    gender: string;
    agePlaceholder: string;
    genderPlaceholder: string;
    male: string;
    female: string;
    save: string;
    saving: string;
    cannotEdit: string;
  };
}

const ProfileForm: React.FC<ProfileFormProps> = ({
  profile,
  ageInput,
  saving,
  onProfileChange,
  onAgeInputChange,
  onAgeSubmit,
  onSave,
  translations: t,
}) => {
  const { colors } = useTheme();
  const responsive = useResponsive();
  const fonts = useFontFamily();
  const { isRTL, currentLanguage } = useLanguageStore();

  const genderLabels = {
    male: t.male,
    female: t.female,
  };

  const handleAgeChange = (text: string) => {
    // Only allow numbers
    const numericText = text.replace(/[^0-9]/g, "");
    onAgeInputChange(numericText);
  };

  // Validation states
  const nameValidation = useMemo(() => {
    if (!profile.full_name) return "default";
    if (profile.full_name.length < 3) return "error";
    return "success";
  }, [profile.full_name]);

  const ageValidation = useMemo(() => {
    if (!ageInput) return "default";
    const age = parseInt(ageInput);
    if (age < 18 || age > 100) return "error";
    return "success";
  }, [ageInput]);

  // Helper texts with validation
  const nameHelperText = useMemo(() => {
    if (nameValidation === "error") {
      return currentLanguage === "ar"
        ? "الاسم يجب أن يكون 3 أحرف على الأقل"
        : "Name must be at least 3 characters";
    }
    return "";
  }, [nameValidation, currentLanguage]);

  const ageHelperText = useMemo(() => {
    if (ageValidation === "error") {
      return currentLanguage === "ar"
        ? "العمر يجب أن يكون بين 18 و 100"
        : "Age must be between 18 and 100";
    }
    return "";
  }, [ageValidation, currentLanguage]);

  return (
    <Card type="default">
      <Card.Header>
        <Card.Description style={{ marginBottom: 0 }}>
          {t.description}
        </Card.Description>
      </Card.Header>

      <Card.Content>
        {/* Full Name with icon and validation */}
        <FormInput
          label={t.fullName}
          value={profile.full_name}
          onChangeText={(text) =>
            onProfileChange({ ...profile, full_name: text })
          }
          required={true}
          icon="person"
          maxLength={50}
          showCharCounter={true}
          validationState={nameValidation as "default" | "success" | "error"}
          helperText={nameHelperText}
          placeholder={
            currentLanguage === "ar"
              ? "أدخل اسمك الكامل"
              : "Enter your full name"
          }
        />

        {/* Email with icon - disabled */}
        <FormInput
          label={t.email}
          value={profile.email}
          onChangeText={() => {}}
          disabled={true}
          keyboardType="email-address"
          helperText={t.cannotEdit}
          icon="mail"
        />

        {/* Phone with icon - disabled */}
        <FormInput
          label={t.phone}
          value={profile.phone}
          onChangeText={() => {}}
          disabled={true}
          keyboardType="phone-pad"
          helperText={t.cannotEdit}
          icon="call"
        />

        {/* Age with icon and validation */}
        <FormInput
          label={t.age}
          value={ageInput}
          onChangeText={handleAgeChange}
          onSubmitEditing={onAgeSubmit}
          placeholder={t.agePlaceholder}
          keyboardType="numeric"
          icon="calendar"
          maxLength={3}
          validationState={ageValidation as "default" | "success" | "error"}
          helperText={ageHelperText}
        />

        {/* Gender with improved styling */}
        <View
          style={{
            marginBottom: responsive.getResponsiveValue(20, 24, 28, 32, 36),
          }}
        >
          {/* Label with icon */}
          <View
            style={{
              flexDirection: isRTL ? "row-reverse" : "row",
              alignItems: "center",
              marginBottom: responsive.getResponsiveValue(8, 10, 12, 14, 16),
            }}
          >
            <Ionicons
              name="male-female"
              size={responsive.getResponsiveValue(18, 20, 22, 24, 26)}
              color={colors.textSecondary}
              style={{
                marginRight: isRTL ? 0 : 8,
                marginLeft: isRTL ? 8 : 0,
              }}
            />
            <Text
              style={{
                fontSize: responsive.getFontSize(15, 14, 17),
                fontFamily: fonts.SemiBold || fonts.Medium || fonts.Regular,
                color: colors.text,
                textAlign: isRTL ? "right" : "left",
              }}
            >
              {t.gender}
            </Text>

            {/* Success indicator for gender */}
            {profile.gender && (
              <View
                style={{
                  marginLeft: isRTL ? 0 : 8,
                  marginRight: isRTL ? 8 : 0,
                }}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={responsive.getResponsiveValue(16, 18, 20, 22, 24)}
                  color={colors.success}
                />
              </View>
            )}
          </View>

          <Select
            value={profile.gender || ""}
            onValueChange={(value) =>
              onProfileChange({ ...profile, gender: value })
            }
          >
            <Select.Trigger placeholder={t.genderPlaceholder}>
              {/* Override SelectValue to show label instead of value */}
              {profile.gender && (
                <Text
                  style={{
                    fontSize: responsive.getFontSize(15, 14, 17),
                    fontFamily: fonts.Regular,
                    color: colors.text,
                    flex: 1,
                    textAlign: "right",
                  }}
                >
                  {genderLabels[profile.gender as keyof typeof genderLabels]}
                </Text>
              )}
            </Select.Trigger>

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
          onPress={onSave}
          loading={saving}
          disabled={
            saving ||
            nameValidation === "error" ||
            (ageInput !== "" && ageValidation === "error")
          }
          IconLeft={() => (
            <Ionicons
              name={saving ? "sync" : "checkmark-circle"}
              size={responsive.getResponsiveValue(20, 22, 24, 26, 28)}
              color={colors.textInverse}
            />
          )}
        />
      </Card.Footer>
    </Card>
  );
};

export default ProfileForm;

