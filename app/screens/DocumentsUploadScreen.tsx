import DocumentHeader from "@/components/Docs/DocumentHeader";
import DocumentList from "@/components/Docs/DocumentList";
import DocumentUploadButton from "@/components/Docs/DocumentUploadButton";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import { supabase } from "@/lib/supabase";
import useLanguageStore from "@/store/useLanguageStore";
import * as ImagePicker from "expo-image-picker";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

// Types matching web version exactly
interface Document {
  id: string;
  user_id: string;
  document_type: "national_id" | "driving_license";
  document_url: string; // File path in storage
  status: "pending" | "approved" | "rejected";
  rejection_reason?: string;
  created_at: string;
  verified_at?: string;
}

interface SelectedFile {
  uri: string;
  name: string;
  size: number;
  mimeType: string;
}

const DocumentUploadScreen: React.FC = () => {
  const { colors } = useTheme();
  const responsive = useResponsive();
  const { currentLanguage } = useLanguageStore();

  // State
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<{
    national_id?: SelectedFile;
    driving_license?: SelectedFile;
  }>({});
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  // Constants
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png"];

  // Translations
  const t = {
    title: currentLanguage === "ar" ? "إدارة الوثائق" : "Document Management",
    subtitle:
      currentLanguage === "ar"
        ? "ارفع وثائقك الرسمية للمراجعة والموافقة"
        : "Upload your official documents for review and approval",
    uploadNew:
      currentLanguage === "ar" ? "رفع وثيقة جديدة" : "Upload New Document",
    updateDocument:
      currentLanguage === "ar" ? "تحديث الوثيقة" : "Update Document",
    nationalId: currentLanguage === "ar" ? "الهوية الوطنية" : "National ID",
    drivingLicense:
      currentLanguage === "ar" ? "رخصة القيادة" : "Driving License",
    myDocuments: currentLanguage === "ar" ? "وثائقي" : "My Documents",
    upload: currentLanguage === "ar" ? "رفع الوثيقة" : "Upload Document",
    uploading: currentLanguage === "ar" ? "جاري الرفع..." : "Uploading...",
    updating: currentLanguage === "ar" ? "جاري التحديث..." : "Updating...",

    // Status
    pending: currentLanguage === "ar" ? "قيد المراجعة" : "Under Review",
    approved: currentLanguage === "ar" ? "مقبولة" : "Approved",
    rejected: currentLanguage === "ar" ? "مرفوضة" : "Rejected",

    // Messages
    success:
      currentLanguage === "ar"
        ? "تم رفع الوثيقة بنجاح"
        : "Document uploaded successfully",
    updateSuccess:
      currentLanguage === "ar"
        ? "تم تحديث الوثيقة بنجاح"
        : "Document updated successfully",
    reviewMessage:
      currentLanguage === "ar"
        ? "ستتم مراجعة الوثيقة قريباً"
        : "Document will be reviewed soon",
    replaceConfirm:
      currentLanguage === "ar"
        ? "لديك وثيقة موجودة من نفس النوع. هل تريد استبدالها؟"
        : "You already have a document of this type. Do you want to replace it?",
    replace: currentLanguage === "ar" ? "استبدال" : "Replace",
    error: currentLanguage === "ar" ? "خطأ" : "Error",
    uploadError:
      currentLanguage === "ar" ? "خطأ في رفع الوثيقة" : "Upload error",
    selectDocument:
      currentLanguage === "ar"
        ? "يرجى اختيار وثيقة للرفع"
        : "Please select a document to upload",
    fileTooLarge:
      currentLanguage === "ar" ? "حجم الملف كبير جداً" : "File too large",
    fileTooLargeMessage:
      currentLanguage === "ar"
        ? "يرجى اختيار ملف أقل من 5 ميجابايت"
        : "Please select a file smaller than 5MB",
    unsupportedFormat:
      currentLanguage === "ar" ? "نوع ملف غير مدعوم" : "Unsupported file type",
    unsupportedFormatMessage:
      currentLanguage === "ar"
        ? "يرجى اختيار ملف JPG أو PNG"
        : "Please select a JPG or PNG file",
    permissionDenied:
      currentLanguage === "ar" ? "تم رفض الإذن" : "Permission denied",
    permissionMessage:
      currentLanguage === "ar"
        ? "يرجى السماح بالوصول للمعرض في الإعدادات"
        : "Please allow gallery access in settings",
    loading: currentLanguage === "ar" ? "جاري التحميل..." : "Loading...",
    noDocuments:
      currentLanguage === "ar"
        ? "لا توجد وثائق مرفوعة بعد"
        : "No documents uploaded yet",
    uploadedOn: currentLanguage === "ar" ? "رُفعت في:" : "Uploaded on:",
    approvedOn: currentLanguage === "ar" ? "تمت الموافقة في:" : "Approved on:",
    rejectionReason:
      currentLanguage === "ar" ? "سبب الرفض:" : "Rejection Reason:",
    view: currentLanguage === "ar" ? "عرض" : "View",
    delete: currentLanguage === "ar" ? "حذف" : "Delete",
    cancel: currentLanguage === "ar" ? "إلغاء" : "Cancel",
  };

  // Load documents on mount
  useEffect(() => {
    loadDocuments();
  }, []);

  // Load user documents
  const loadDocuments = useCallback(async () => {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Ensure only latest document per type (in case of any database inconsistencies)
      const uniqueDocs: Document[] = [];
      const seenTypes = new Set<string>();

      (data || []).forEach((doc) => {
        if (!seenTypes.has(doc.document_type)) {
          uniqueDocs.push(doc);
          seenTypes.add(doc.document_type);
        }
      });

      setDocuments(uniqueDocs);
    } catch (error) {
      console.error("Error loading documents:", error);
      Alert.alert(t.error, "Failed to load documents");
    } finally {
      setLoading(false);
    }
  }, [t.error]);

  // Check if document type exists
  const getExistingDocument = (
    documentType: "national_id" | "driving_license"
  ): Document | undefined => {
    return documents.find((doc) => doc.document_type === documentType);
  };

  // Validate file
  const validateFile = (asset: any): { valid: boolean; error?: string } => {
    if (!asset.fileSize || asset.fileSize > MAX_FILE_SIZE) {
      return { valid: false, error: t.fileTooLargeMessage };
    }

    if (
      !asset.mimeType ||
      !ALLOWED_TYPES.includes(asset.mimeType.toLowerCase())
    ) {
      return { valid: false, error: t.unsupportedFormatMessage };
    }

    return { valid: true };
  };

  // Select document file
  const selectDocument = async (
    documentType: "national_id" | "driving_license"
  ) => {
    try {
      // Request permission
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(t.permissionDenied, t.permissionMessage);
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];

        // Validate file
        const validation = validateFile(asset);
        if (!validation.valid) {
          Alert.alert(
            validation.error?.includes("حجم") ||
              validation.error?.includes("large")
              ? t.fileTooLarge
              : t.unsupportedFormat,
            validation.error
          );
          return;
        }

        // Create file object
        const selectedFile: SelectedFile = {
          uri: asset.uri,
          name: asset.fileName || `${documentType}_${Date.now()}.jpg`,
          size: asset.fileSize || 0,
          mimeType: asset.mimeType || "image/jpeg",
        };

        // Update selected files
        setSelectedFiles((prev) => ({
          ...prev,
          [documentType]: selectedFile,
        }));
      }
    } catch (error) {
      console.error("Document selection error:", error);
      Alert.alert(t.error, "Failed to select document");
    }
  };

  // Upload or update documents
  const uploadDocuments = async () => {
    const filesToUpload = Object.entries(selectedFiles).filter(
      ([_, file]) => file
    );

    if (filesToUpload.length === 0) {
      Alert.alert(t.error, t.selectDocument);
      return;
    }

    setUploading(true);
    let isUpdate = false;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Process each selected file
      for (const [documentType, file] of filesToUpload) {
        if (!file) continue;

        const docType = documentType as "national_id" | "driving_license";
        const existingDoc = getExistingDocument(docType);

        // Create unique filename
        const fileExt = file.name.split(".").pop() || "jpg";
        const fileName = `${user.id}/${documentType}_${Date.now()}.${fileExt}`;

        // Create FormData
        const formData = new FormData();
        formData.append("file", {
          uri:
            Platform.OS === "ios" ? file.uri.replace("file://", "") : file.uri,
          type: file.mimeType,
          name: file.name,
        } as any);

        // Upload new file to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from("documents")
          .upload(fileName, formData, {
            contentType: file.mimeType,
            upsert: true,
          });

        if (uploadError) throw uploadError;

        if (existingDoc) {
          // Update existing document
          isUpdate = true;

          // Delete old file from storage (ignore errors as file might not exist)
          await supabase.storage
            .from("documents")
            .remove([existingDoc.document_url])
            .catch(() => {}); // Silently fail if old file doesn't exist

          // Update database record
          const { error: updateError } = await supabase
            .from("documents")
            .update({
              document_url: fileName,
              status: "pending", // Reset status to pending for re-review
              rejection_reason: null, // Clear any previous rejection reason
              verified_at: null, // Clear verification date
            })
            .eq("id", existingDoc.id);

          if (updateError) throw updateError;
        } else {
          // Create new document record
          const { error: dbError } = await supabase.from("documents").insert({
            user_id: user.id,
            document_type: docType,
            document_url: fileName,
            status: "pending",
          });

          if (dbError) throw dbError;
        }
      }

      // Clear selected files and reload documents
      setSelectedFiles({});
      await loadDocuments();

      Alert.alert(isUpdate ? t.updateSuccess : t.success, t.reviewMessage);
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert(t.error, t.uploadError);
    } finally {
      setUploading(false);
    }
  };

  // Delete document
  const deleteDocument = async (document: Document) => {
    Alert.alert(
      t.delete,
      `${t.delete} ${
        document.document_type === "national_id"
          ? t.nationalId
          : t.drivingLicense
      }?`,
      [
        { text: t.cancel, style: "cancel" },
        {
          text: t.delete,
          style: "destructive",
          onPress: async () => {
            try {
              // Delete from storage
              const { error: storageError } = await supabase.storage
                .from("documents")
                .remove([document.document_url]);

              if (storageError)
                console.warn("Storage delete error:", storageError);

              // Delete from database
              const { error: dbError } = await supabase
                .from("documents")
                .delete()
                .eq("id", document.id);

              if (dbError) throw dbError;

              // Reload documents
              await loadDocuments();
              Alert.alert(t.success, "Document deleted successfully");
            } catch (error) {
              console.error("Delete error:", error);
              Alert.alert(t.error, "Failed to delete document");
            }
          },
        },
      ]
    );
  };

  // View document
  const viewDocument = async (document: Document) => {
    try {
      const { data } = await supabase.storage
        .from("documents")
        .createSignedUrl(document.document_url, 3600); // 1 hour expiry

      // You can add logic here to open the URL in a browser or image viewer
      // For example: Linking.openURL(data.signedUrl);
    } catch (error) {
      console.error("View document error:", error);
      Alert.alert(t.error, "Failed to view document");
    }
  };

  // Get button text based on existing documents
  const getUploadButtonText = (docType: "national_id" | "driving_license") => {
    const existingDoc = getExistingDocument(docType);
    if (existingDoc) {
      return t.updateDocument;
    }
    return t.uploadNew;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      padding: responsive.getResponsiveValue(16, 20, 24, 28, 32),
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      fontSize: responsive.getFontSize(16, 15, 18),
      color: colors.textSecondary,
      marginTop: responsive.getResponsiveValue(12, 16, 20, 24, 28),
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

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Component */}
        <DocumentHeader title={t.title} subtitle={t.subtitle} />

        {/* Upload Section Component */}
        <DocumentUploadButton
          selectedFiles={selectedFiles}
          onSelectDocument={selectDocument}
          onUpload={uploadDocuments}
          uploading={uploading}
          translations={{
            uploadNew: t.uploadNew,
            nationalId: t.nationalId,
            drivingLicense: t.drivingLicense,
            upload: t.upload,
            uploading: t.uploading,
          }}
        />

        {/* Documents List Component */}
        <DocumentList
          documents={documents}
          onViewDocument={viewDocument}
          onDeleteDocument={deleteDocument}
          translations={{
            myDocuments: t.myDocuments,
            noDocuments: t.noDocuments,
            nationalId: t.nationalId,
            drivingLicense: t.drivingLicense,
            pending: t.pending,
            approved: t.approved,
            rejected: t.rejected,
            uploadedOn: t.uploadedOn,
            approvedOn: t.approvedOn,
            rejectionReason: t.rejectionReason,
            view: t.view,
            delete: t.delete,
          }}
        />
      </ScrollView>
    </View>
  );
};

export default DocumentUploadScreen;
