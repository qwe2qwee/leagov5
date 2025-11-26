import { useResponsive } from "@/hooks/useResponsive";
import React from "react";
import { StyleSheet, View } from "react-native";
import DocumentCard from "./DocumentCard";
import DocumentEmptyState from "./DocumentEmptyState";

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

interface DocumentListProps {
  documents: Document[];
  onViewDocument: (document: Document) => void;
  onDeleteDocument: (document: Document) => void;
  translations: {
    myDocuments: string;
    noDocuments: string;
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

const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  onViewDocument,
  onDeleteDocument,
  translations,
}) => {
  const responsive = useResponsive();

  const styles = StyleSheet.create({
    documentsSection: {
      marginTop: responsive.getResponsiveValue(24, 28, 32, 36, 40),
    },
    sectionTitle: {
      fontSize: responsive.getFontSize(18, 17, 21),
      fontWeight: "600",
      marginBottom: responsive.getResponsiveValue(16, 20, 24, 28, 32),
      paddingHorizontal: responsive.getResponsiveValue(4, 6, 8, 10, 12),
    },
  });

  return (
    <View style={styles.documentsSection}>
      {documents.length === 0 ? (
        <DocumentEmptyState message={translations.noDocuments} />
      ) : (
        documents.map((document) => (
          <DocumentCard
            key={document.id}
            document={document}
            onView={onViewDocument}
            onDelete={onDeleteDocument}
            translations={{
              nationalId: translations.nationalId,
              drivingLicense: translations.drivingLicense,
              pending: translations.pending,
              approved: translations.approved,
              rejected: translations.rejected,
              uploadedOn: translations.uploadedOn,
              approvedOn: translations.approvedOn,
              rejectionReason: translations.rejectionReason,
              view: translations.view,
              delete: translations.delete,
            }}
          />
        ))
      )}
    </View>
  );
};

export default DocumentList;
