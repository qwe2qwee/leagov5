import { Card } from "@/components/ui/Card";
import CustomButton from "@/components/ui/CustomButton";
import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
  lockedDocuments?: {
    national_id?: boolean;
    driving_license?: boolean;
  };
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
  lockedDocuments,
  translations,
}) => {
  const { colors } = useTheme();
  const responsive = useResponsive();
  const fonts = useFontFamily();
  const { isRTL } = useLanguageStore();

  // Preview state
  const [previewVisible, setPreviewVisible] = React.useState(false);
  const [previewUri, setPreviewUri] = React.useState<string | null>(null);

  const handlePreview = (uri: string) => {
    setPreviewUri(uri);
    setPreviewVisible(true);
  };

  const styles = StyleSheet.create({
    uploadSection: {
      marginBottom: responsive.getResponsiveValue(24, 28, 32, 36, 40),
      borderRadius: responsive.getResponsiveValue(16, 20, 24, 28, 32),
      overflow: "hidden",
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      ...Platform.select({
        ios: {
          shadowColor: colors.text + "20",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        android: {
          elevation: 4,
        },
      }),
    },
    documentTypeRow: {
      flexDirection: isRTL ? "row-reverse" : "row",
      gap: responsive.getResponsiveValue(16, 20, 24, 28, 32),
      marginBottom: responsive.getResponsiveValue(16, 20, 24, 28, 32),
    },
    documentTypeButton: {
      flex: 1,
      padding: responsive.getResponsiveValue(20, 24, 28, 32, 36),
      backgroundColor: colors.backgroundSecondary,
      borderRadius: responsive.getResponsiveValue(16, 20, 24, 28, 32),
      borderWidth: 2,
      borderColor: colors.border,
      borderStyle: "dashed",
      alignItems: "center",
      justifyContent: "center",
      gap: responsive.getResponsiveValue(12, 14, 16, 18, 20),
      minHeight: responsive.getResponsiveValue(140, 160, 180, 200, 220),
    },
    documentTypeButtonSelected: {
      backgroundColor: colors.primary + "10",
      borderColor: colors.primary,
      borderStyle: "solid",
    },
    documentTypeButtonDisabled: {
      opacity: 0.5,
      backgroundColor: colors.background,
      borderColor: colors.border,
    },
    documentTypeIcon: {
      width: responsive.getResponsiveValue(56, 60, 64, 68, 72),
      height: responsive.getResponsiveValue(56, 60, 64, 68, 72),
      borderRadius: responsive.getResponsiveValue(28, 30, 32, 34, 36),
      backgroundColor: colors.surface,
      justifyContent: "center",
      alignItems: "center",
      ...Platform.select({
        ios: {
          shadowColor: colors.text + "20",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    documentTypeText: {
      fontSize: responsive.getFontSize(14, 13, 16),
      fontFamily: fonts.SemiBold || fonts.Medium,
      color: colors.text,
      textAlign: "center",
    },
    selectedFileName: {
      fontSize: responsive.getFontSize(11, 10, 13),
      fontFamily: fonts.Regular,
      color: colors.primary,
      textAlign: "center",
      marginTop: responsive.getResponsiveValue(4, 6, 8, 10, 12),
      backgroundColor: colors.primary + "15",
      paddingHorizontal: responsive.getResponsiveValue(8, 10, 12, 14, 16),
      paddingVertical: responsive.getResponsiveValue(4, 6, 8, 10, 12),
      borderRadius: responsive.getResponsiveValue(8, 10, 12, 14, 16),
      overflow: "hidden",
    },
    uploadButton: {
      marginTop: responsive.getResponsiveValue(8, 12, 16, 20, 24),
    },
    // Modal Styles
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContent: {
      width: "90%",
      height: "70%",
      backgroundColor: colors.surface,
      borderRadius: responsive.getResponsiveValue(16, 20, 24, 28, 32),
      overflow: "hidden",
    },
    modalImage: {
      width: "100%",
      height: "100%",
    },
    closeButton: {
      position: "absolute",
      top: responsive.getResponsiveValue(16, 20, 24, 28, 32),
      right: isRTL ? undefined : responsive.getResponsiveValue(16, 20, 24, 28, 32),
      left: isRTL ? responsive.getResponsiveValue(16, 20, 24, 28, 32) : undefined,
      zIndex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      borderRadius: 20,
      padding: 8,
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
              lockedDocuments?.national_id && styles.documentTypeButtonDisabled,
            ]}
            onPress={() => onSelectDocument("national_id")}
            disabled={uploading || lockedDocuments?.national_id}
          >
            <View style={styles.documentTypeIcon}>
              <Ionicons
                name={lockedDocuments?.national_id ? "checkmark-circle" : "id-card-outline"}
                size={responsive.getResponsiveValue(20, 22, 24, 26, 28)}
                color={
                  lockedDocuments?.national_id
                    ? colors.success
                    : selectedFiles.national_id
                    ? colors.primary
                    : colors.text
                }
              />
            </View>
            <Text style={styles.documentTypeText}>
              {translations.nationalId}
            </Text>
            {selectedFiles.national_id && (
              <TouchableOpacity onPress={() => handlePreview(selectedFiles.national_id!.uri)}>
                <Text style={styles.selectedFileName}>
                  {selectedFiles.national_id.name}
                </Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>

          {/* Driving License */}
          <TouchableOpacity
            style={[
              styles.documentTypeButton,
              selectedFiles.driving_license &&
                styles.documentTypeButtonSelected,
              lockedDocuments?.driving_license && styles.documentTypeButtonDisabled,
            ]}
            onPress={() => onSelectDocument("driving_license")}
            disabled={uploading || lockedDocuments?.driving_license}
          >
            <View style={styles.documentTypeIcon}>
              <Ionicons
                name={lockedDocuments?.driving_license ? "checkmark-circle" : "car-outline"}
                size={responsive.getResponsiveValue(20, 22, 24, 26, 28)}
                color={
                  lockedDocuments?.driving_license
                    ? colors.success
                    : selectedFiles.driving_license
                    ? colors.primary
                    : colors.text
                }
              />
            </View>
            <Text style={styles.documentTypeText}>
              {translations.drivingLicense}
            </Text>
            {selectedFiles.driving_license && (
              <TouchableOpacity onPress={() => handlePreview(selectedFiles.driving_license!.uri)}>
                <Text style={styles.selectedFileName}>
                  {selectedFiles.driving_license.name}
                </Text>
              </TouchableOpacity>
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

      {/* Preview Modal */}
      <Modal
        visible={previewVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPreviewVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setPreviewVisible(false)}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            {previewUri && (
              <Image
                source={{ uri: previewUri }}
                style={styles.modalImage}
                resizeMode="contain"
              />
            )}
          </View>
        </View>
      </Modal>
    </Card>
  );
};

export default DocumentUploadButton;
