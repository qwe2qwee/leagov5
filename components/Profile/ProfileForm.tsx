import { Card } from "@/components/ui/Card";
import CustomButton from "@/components/ui/CustomButton";
import { Select } from "@/components/ui/Select";
import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
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
  const { isRTL } = useLanguageStore();

  const handleAgeChange = (text: string) => {
    // Only allow numbers
    const numericText = text.replace(/[^0-9]/g, "");
    onAgeInputChange(numericText);
  };

  return (
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
            onProfileChange({ ...profile, full_name: text })
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
          onSubmitEditing={onAgeSubmit}
          placeholder={t.agePlaceholder}
          keyboardType="numeric"
        />

        {/* Gender */}
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
            {t.gender}
          </Text>

          <Select
            value={profile.gender || ""}
            onValueChange={(value) =>
              onProfileChange({ ...profile, gender: value })
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
          onPress={onSave}
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
  );
};

export default ProfileForm;
