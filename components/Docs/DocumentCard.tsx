import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import { supabase } from "@/lib/supabase";
import useLanguageStore from "@/store/useLanguageStore";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Modal from "react-native-modal";

interface Document {
  id: string;
  user_id: string;
  document_type: "national_id" | "driving_license";
  document_url: string;
  status: "pending" | "approved" | "rejected";
  rejection_reason?: string;
  created_at: string;
  verified_at?: string;
}

interface DocumentCardProps {
  document: Document;
  onView: (document: Document) => void;
  onDelete: (document: Document) => void;
  translations: {
    nationalId: string;
    drivingLicense: string;
    pending: string;
    approved: string;
    rejected: string;
    uploadedOn: string;
    approvedOn: string;
    rejectionReason: string;
    view: string;
    delete: string;
  };
}

const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onView,
  onDelete,
  translations,
}) => {
  const { colors } = useTheme();
  const responsive = useResponsive();
  const fonts = useFontFamily();
  const { currentLanguage, isRTL } = useLanguageStore();

  // State for image viewer
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loadingImage, setLoadingImage] = useState(false);

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return colors.success;
      case "rejected":
        return colors.error;
      default:
        return colors.warning;
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return "checkmark-circle";
      case "rejected":
        return "close-circle";
      default:
        return "time";
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(
      currentLanguage === "ar" ? "ar-SA" : "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );
  };

  // View document image
  const viewDocumentImage = async () => {
    setLoadingImage(true);
    try {
      const { data } = await supabase.storage
        .from("documents")
        .createSignedUrl(document.document_url, 3600); // 1 hour expiry

      if (data?.signedUrl) {
        setImageUrl(data.signedUrl);
        setShowImageModal(true);
        onView(document); // Call the original onView callback
      } else {
        Alert.alert("Error", "Unable to load document image");
      }
    } catch (error) {
      console.error("View document error:", error);
      Alert.alert("Error", "Failed to load document image");
    } finally {
      setLoadingImage(false);
    }
  };

  // Close modal and reset image URL
  const closeModal = () => {
    setShowImageModal(false);
    setImageUrl(null);
  };

  const styles = StyleSheet.create({
    documentCard: {
      backgroundColor: colors.surface,
      borderRadius: responsive.getResponsiveValue(16, 20, 24, 28, 32),
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: responsive.getResponsiveValue(16, 20, 24, 28, 32),
      overflow: "hidden",
      ...Platform.select({
        ios: {
          shadowColor: colors.text + "20",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
        },
        android: {
          elevation: 3,
        },
      }),
    },
    cardHeader: {
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      padding: responsive.getResponsiveValue(16, 20, 24, 28, 32),
      paddingBottom: responsive.getResponsiveValue(12, 16, 20, 24, 28),
    },
    documentIcon: {
      width: responsive.getResponsiveValue(52, 56, 60, 64, 68),
      height: responsive.getResponsiveValue(52, 56, 60, 64, 68),
      borderRadius: responsive.getResponsiveValue(26, 28, 30, 32, 34),
      backgroundColor: colors.primary + "15",
      justifyContent: "center",
      alignItems: "center",
      marginRight: isRTL
        ? 0
        : responsive.getResponsiveValue(16, 20, 24, 28, 32),
      marginLeft: isRTL ? responsive.getResponsiveValue(16, 20, 24, 28, 32) : 0,
    },
    documentInfo: {
      flex: 1,
    },
    documentTitle: {
      fontSize: responsive.getFontSize(16, 15, 18),
      fontFamily: fonts.SemiBold || fonts.Medium,
      color: colors.text,
      marginBottom: responsive.getResponsiveValue(4, 6, 8, 10, 12),
      textAlign: isRTL ? "right" : "left",
    },
    documentDate: {
      fontSize: responsive.getFontSize(12, 11, 14),
      fontFamily: fonts.Regular,
      color: colors.textSecondary,
      textAlign: isRTL ? "right" : "left",
      lineHeight: responsive.getFontSize(18, 17, 21),
    },
    cardBody: {
      paddingHorizontal: responsive.getResponsiveValue(16, 20, 24, 28, 32),
      paddingBottom: responsive.getResponsiveValue(16, 20, 24, 28, 32),
    },
    statusContainer: {
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: responsive.getResponsiveValue(16, 20, 24, 28, 32),
      paddingTop: responsive.getResponsiveValue(12, 16, 20, 24, 28),
      borderTopWidth: 1,
      borderTopColor: colors.border + "50",
    },
    statusBadge: {
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      paddingHorizontal: responsive.getResponsiveValue(12, 14, 16, 18, 20),
      paddingVertical: responsive.getResponsiveValue(6, 8, 10, 12, 14),
      borderRadius: responsive.getResponsiveValue(20, 22, 24, 26, 28),
      gap: responsive.getResponsiveValue(6, 8, 10, 12, 14),
    },
    statusText: {
      fontSize: responsive.getFontSize(12, 11, 14),
      fontFamily: fonts.Medium,
      color: colors.textInverse,
    },
    actionButtons: {
      flexDirection: isRTL ? "row-reverse" : "row",
      gap: responsive.getResponsiveValue(12, 16, 20, 24, 28),
    },
    actionButton: {
      flex: 1,
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: responsive.getResponsiveValue(12, 14, 16, 18, 20),
      paddingHorizontal: responsive.getResponsiveValue(16, 18, 20, 22, 24),
      borderRadius: responsive.getResponsiveValue(12, 14, 16, 18, 20),
      backgroundColor: colors.backgroundSecondary,
      gap: responsive.getResponsiveValue(8, 10, 12, 14, 16),
    },
    viewButton: {
      backgroundColor: colors.primary + "10",
      borderWidth: 1,
      borderColor: colors.primary + "20",
    },
    deleteButton: {
      backgroundColor: colors.error + "10",
      borderWidth: 1,
      borderColor: colors.error + "20",
    },
    actionButtonText: {
      fontSize: responsive.getFontSize(13, 12, 15),
      fontFamily: fonts.Medium,
      color: colors.text,
    },
    viewButtonText: {
      color: colors.primary,
    },
    deleteButtonText: {
      color: colors.error,
    },
    rejectionContainer: {
      margin: responsive.getResponsiveValue(16, 20, 24, 28, 32),
      marginTop: 0,
      padding: responsive.getResponsiveValue(16, 20, 24, 28, 32),
      backgroundColor: colors.error + "10",
      borderRadius: responsive.getResponsiveValue(12, 16, 20, 24, 28),
      borderLeftWidth: 4,
      borderLeftColor: colors.error,
    },
    rejectionTitle: {
      fontSize: responsive.getFontSize(13, 12, 15),
      fontFamily: fonts.SemiBold,
      color: colors.error,
      marginBottom: responsive.getResponsiveValue(4, 6, 8, 10, 12),
      textAlign: isRTL ? "right" : "left",
    },
    rejectionText: {
      fontSize: responsive.getFontSize(12, 11, 14),
      fontFamily: fonts.Regular,
      color: colors.error,
      textAlign: isRTL ? "right" : "left",
      lineHeight: responsive.getFontSize(18, 17, 21),
    },
    // Enhanced Modal styles for react-native-modal
    modalContent: {
      backgroundColor: colors.surface,
      borderRadius: responsive.getResponsiveValue(24, 28, 32, 36, 40),
      margin: responsive.getResponsiveValue(20, 24, 28, 32, 36),
      maxHeight: "85%",
      overflow: "hidden",
    },
    modalHeader: {
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: responsive.getResponsiveValue(20, 24, 28, 32, 36),
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.backgroundSecondary,
    },
    modalTitle: {
      fontSize: responsive.getFontSize(16, 15, 18),
      fontFamily: fonts.SemiBold,
      color: colors.text,
      flex: 1,
      textAlign: isRTL ? "right" : "left",
    },
    closeButton: {
      width: responsive.getResponsiveValue(32, 36, 40, 44, 48),
      height: responsive.getResponsiveValue(32, 36, 40, 44, 48),
      borderRadius: responsive.getResponsiveValue(16, 18, 20, 22, 24),
      backgroundColor: colors.surface,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    imageContainer: {
      height: responsive.getResponsiveValue(400, 450, 500, 550, 600),
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
      margin: responsive.getResponsiveValue(16, 20, 24, 28, 32),
      borderRadius: responsive.getResponsiveValue(16, 20, 24, 28, 32),
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    },
    documentImage: {
      width: "100%",
      height: "100%",
    },
    loadingContainer: {
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      fontSize: responsive.getFontSize(14, 13, 16),
      fontFamily: fonts.Regular,
      color: colors.textSecondary,
      marginTop: responsive.getResponsiveValue(12, 16, 20, 24, 28),
    },
  });

  return (
    <>
      <View style={styles.documentCard}>
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={styles.documentIcon}>
            <Ionicons
              name={
                document.document_type === "national_id" ? "id-card" : "car"
              }
              size={responsive.getResponsiveValue(24, 26, 28, 30, 32)}
              color={colors.primary}
            />
          </View>

          <View style={styles.documentInfo}>
            <Text style={styles.documentTitle}>
              {document.document_type === "national_id"
                ? translations.nationalId
                : translations.drivingLicense}
            </Text>
            <Text style={styles.documentDate}>
              {translations.uploadedOn} {formatDate(document.created_at)}
            </Text>
            {document.status === "approved" && document.verified_at && (
              <Text style={[styles.documentDate, { color: colors.success }]}>
                {translations.approvedOn} {formatDate(document.verified_at)}
              </Text>
            )}
          </View>
        </View>

        {/* Card Body */}
        <View style={styles.cardBody}>
          {/* Status and Actions */}
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(document.status) },
              ]}
            >
              <Ionicons
                name={getStatusIcon(document.status)}
                size={responsive.getResponsiveValue(14, 16, 18, 20, 22)}
                color={colors.textInverse}
              />
              <Text style={styles.statusText}>
                {document.status === "approved"
                  ? translations.approved
                  : document.status === "rejected"
                  ? translations.rejected
                  : translations.pending}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.viewButton]}
              onPress={viewDocumentImage}
              disabled={loadingImage}
            >
              {loadingImage ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <>
                  <Ionicons
                    name="eye-outline"
                    size={responsive.getResponsiveValue(18, 20, 22, 24, 26)}
                    color={colors.primary}
                  />
                  <Text
                    style={[styles.actionButtonText, styles.viewButtonText]}
                  >
                    {translations.view}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {document.status !== "approved" && (
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => onDelete(document)}
              >
                <Ionicons
                  name="trash-outline"
                  size={responsive.getResponsiveValue(18, 20, 22, 24, 26)}
                  color={colors.error}
                />
                <Text
                  style={[styles.actionButtonText, styles.deleteButtonText]}
                >
                  {translations.delete}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Rejection Reason */}
        {document.status === "rejected" && document.rejection_reason && (
          <View style={styles.rejectionContainer}>
            <Text style={styles.rejectionTitle}>
              {translations.rejectionReason}
            </Text>
            <Text style={styles.rejectionText}>
              {document.rejection_reason}
            </Text>
          </View>
        )}
      </View>

      {/* Enhanced Image Viewer Modal using react-native-modal */}
      <Modal
        isVisible={showImageModal}
        onBackdropPress={closeModal}
        onBackButtonPress={closeModal}
        onSwipeComplete={closeModal}
        swipeDirection={["down", "up"]}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        animationInTiming={400}
        animationOutTiming={300}
        backdropTransitionInTiming={400}
        backdropTransitionOutTiming={300}
        style={{ margin: 0, justifyContent: "flex-end" }}
        propagateSwipe={true}
        scrollHorizontal={true}
        avoidKeyboard={true}
      >
        <View style={styles.modalContent}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {document.document_type === "national_id"
                ? translations.nationalId
                : translations.drivingLicense}
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Ionicons
                name="close"
                size={responsive.getResponsiveValue(20, 22, 24, 26, 28)}
                color={colors.text}
              />
            </TouchableOpacity>
          </View>

          {/* Image Container */}
          <View style={styles.imageContainer}>
            {imageUrl ? (
              <Image
                source={{ uri: imageUrl }}
                style={styles.documentImage}
                resizeMode="contain"
                onError={() => {
                  Alert.alert("Error", "Failed to load document image");
                  closeModal();
                }}
              />
            ) : (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Loading document...</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};

export default DocumentCard;
