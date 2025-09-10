import { Card } from "@/components/ui/Card";
import { useResponsive } from "@/hooks/useResponsive";
import React from "react";
import { StyleSheet } from "react-native";
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
  });

  return (
    <Card style={styles.documentsSection}>
      <Card.Header>
        <Card.Title size="md">{translations.myDocuments}</Card.Title>
      </Card.Header>
      <Card.Content>
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
      </Card.Content>
    </Card>
  );
};

export default DocumentList;
