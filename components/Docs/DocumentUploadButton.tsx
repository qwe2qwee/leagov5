import { Card } from "@/components/ui/Card";
import CustomButton from "@/components/ui/CustomButton";
import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface SelectedFile {
  uri: string;
  name: string;
  size: number;
  mimeType: string;
}

interface DocumentUploadButtonProps {
  selectedFiles: {
    national_id?: SelectedFile;
    driving_license?: SelectedFile;
  };
  onSelectDocument: (type: "national_id" | "driving_license") => void;
  onUpload: () => void;
  uploading: boolean;
  translations: {
    uploadNew: string;
    nationalId: string;
    drivingLicense: string;
    upload: string;
    uploading: string;
  };
}

const DocumentUploadButton: React.FC<DocumentUploadButtonProps> = ({
  selectedFiles,
  onSelectDocument,
  onUpload,
  uploading,
  translations,
}) => {
  const { colors } = useTheme();
  const responsive = useResponsive();
  const fonts = useFontFamily();
  const { isRTL } = useLanguageStore();

  const styles = StyleSheet.create({
    uploadSection: {
      marginBottom: responsive.getResponsiveValue(24, 28, 32, 36, 40),
    },
    documentTypeRow: {
      flexDirection: isRTL ? "row-reverse" : "row",
      gap: responsive.getResponsiveValue(12, 16, 20, 24, 28),
      marginBottom: responsive.getResponsiveValue(16, 20, 24, 28, 32),
    },
    documentTypeButton: {
      flex: 1,
      padding: responsive.getResponsiveValue(12, 16, 20, 24, 28),
      backgroundColor: colors.backgroundSecondary,
      borderRadius: responsive.getResponsiveValue(8, 10, 12, 14, 16),
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      gap: responsive.getResponsiveValue(8, 10, 12, 14, 16),
    },
    documentTypeButtonSelected: {
      backgroundColor: colors.primary + "20",
      borderColor: colors.primary,
    },
    documentTypeIcon: {
      width: responsive.getResponsiveValue(40, 44, 48, 52, 56),
      height: responsive.getResponsiveValue(40, 44, 48, 52, 56),
      borderRadius: responsive.getResponsiveValue(20, 22, 24, 26, 28),
      backgroundColor: colors.backgroundTertiary,
      justifyContent: "center",
      alignItems: "center",
    },
    documentTypeText: {
      fontSize: responsive.getFontSize(12, 11, 14),
      fontFamily: fonts.Medium || fonts.Regular,
      color: colors.text,
      textAlign: "center",
    },
    selectedFileName: {
      fontSize: responsive.getFontSize(10, 9, 12),
      fontFamily: fonts.Regular,
      color: colors.textSecondary,
      textAlign: "center",
      marginTop: responsive.getResponsiveValue(4, 6, 8, 10, 12),
    },
    uploadButton: {
      marginTop: responsive.getResponsiveValue(16, 20, 24, 28, 32),
    },
  });

  return (
    <Card style={styles.uploadSection}>
      <Card.Header>
        <Card.Title size="md">{translations.uploadNew}</Card.Title>
      </Card.Header>
      <Card.Content>
        <View style={styles.documentTypeRow}>
          {/* National ID */}
          <TouchableOpacity
            style={[
              styles.documentTypeButton,
              selectedFiles.national_id && styles.documentTypeButtonSelected,
            ]}
            onPress={() => onSelectDocument("national_id")}
            disabled={uploading}
          >
            <View style={styles.documentTypeIcon}>
              <Ionicons
                name="id-card-outline"
                size={responsive.getResponsiveValue(20, 22, 24, 26, 28)}
                color={selectedFiles.national_id ? colors.primary : colors.text}
              />
            </View>
            <Text style={styles.documentTypeText}>
              {translations.nationalId}
            </Text>
            {selectedFiles.national_id && (
              <Text style={styles.selectedFileName}>
                {selectedFiles.national_id.name}
              </Text>
            )}
          </TouchableOpacity>

          {/* Driving License */}
          <TouchableOpacity
            style={[
              styles.documentTypeButton,
              selectedFiles.driving_license &&
                styles.documentTypeButtonSelected,
            ]}
            onPress={() => onSelectDocument("driving_license")}
            disabled={uploading}
          >
            <View style={styles.documentTypeIcon}>
              <Ionicons
                name="car-outline"
                size={responsive.getResponsiveValue(20, 22, 24, 26, 28)}
                color={
                  selectedFiles.driving_license ? colors.primary : colors.text
                }
              />
            </View>
            <Text style={styles.documentTypeText}>
              {translations.drivingLicense}
            </Text>
            {selectedFiles.driving_license && (
              <Text style={styles.selectedFileName}>
                {selectedFiles.driving_license.name}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Upload Button */}
        {Object.keys(selectedFiles).length > 0 && (
          <View style={styles.uploadButton}>
            <CustomButton
              title={uploading ? translations.uploading : translations.upload}
              onPress={onUpload}
              loading={uploading}
              disabled={uploading}
              bgVariant="primary"
              IconLeft={() => (
                <Ionicons
                  name="cloud-upload-outline"
                  size={responsive.getIconSize("small")}
                  color={colors.textInverse}
                />
              )}
            />
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

export default DocumentUploadButton;
