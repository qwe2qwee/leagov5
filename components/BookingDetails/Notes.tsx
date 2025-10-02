import Section from "@/components/BookingDetails/Section";
import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import { StyleSheet, Text } from "react-native";

interface NotesProps {
  notes?: string;
}

export default function Notes({ notes }: NotesProps) {
  const { colors } = useTheme();
  const responsive = useResponsive();
  const fonts = useFontFamily();
  const { currentLanguage, isRTL } = useLanguageStore();

  const t = {
    title: currentLanguage === "ar" ? "ملاحظات" : "Notes",
  };

  if (!notes) return null;

  const styles = StyleSheet.create({
    text: {
      fontSize: responsive.getFontSize(14, 13, 16),
      fontFamily: fonts.Regular,
      color: colors.text,
      lineHeight: responsive.getFontSize(14, 13, 16) * 1.5,
      textAlign: isRTL ? "right" : "left",
    },
  });

  return (
    <Section title={t.title}>
      <Text style={styles.text}>{notes}</Text>
    </Section>
  );
}
