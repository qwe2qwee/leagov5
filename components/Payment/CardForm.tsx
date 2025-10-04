import { Card } from "@/components/ui/Card";
import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import { StyleSheet, Text, TextInput, View } from "react-native";

interface CardFormProps {
  cardNumber: string;
  setCardNumber: (value: string) => void;
  cardName: string;
  setCardName: (value: string) => void;
  expiryMonth: string;
  setExpiryMonth: (value: string) => void;
  expiryYear: string;
  setExpiryYear: (value: string) => void;
  cvv: string;
  setCvv: (value: string) => void;
  errors: Record<string, string>;
  setErrors: (errors: Record<string, string>) => void;
  isDisabled: boolean;
}

export default function CardForm({
  cardNumber,
  setCardNumber,
  cardName,
  setCardName,
  expiryMonth,
  setExpiryMonth,
  expiryYear,
  setExpiryYear,
  cvv,
  setCvv,
  errors,
  setErrors,
  isDisabled,
}: CardFormProps) {
  const { colors } = useTheme();
  const responsive = useResponsive();
  const fonts = useFontFamily();
  const { currentLanguage, isRTL } = useLanguageStore();

  const t = {
    title: currentLanguage === "ar" ? "بيانات البطاقة" : "Card Details",
    cardNumber: currentLanguage === "ar" ? "رقم البطاقة" : "Card Number",
    cardName: currentLanguage === "ar" ? "الاسم على البطاقة" : "Name on Card",
    expiryDate: currentLanguage === "ar" ? "تاريخ الانتهاء" : "Expiry Date",
    securityNote:
      currentLanguage === "ar"
        ? "جميع البيانات مشفرة وآمنة"
        : "All data is encrypted",
  };

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, "");
    const formatted = cleaned.match(/.{1,4}/g)?.join(" ") || cleaned;
    return formatted.substring(0, 19);
  };

  const styles = StyleSheet.create({
    container: {
      marginHorizontal: responsive.getResponsiveValue(12, 16, 20, 24, 28),
      marginTop: responsive.getResponsiveValue(12, 16, 20, 24, 28),
    },
    title: {
      fontSize: responsive.getFontSize(17, 16, 20),
      fontFamily: fonts.Bold || fonts.SemiBold,
      color: colors.text,
      marginBottom: responsive.getResponsiveValue(12, 16, 20, 22, 24),
      textAlign: isRTL ? "right" : "left",
    },
    inputContainer: {
      marginBottom: responsive.getResponsiveValue(14, 16, 20, 22, 24),
    },
    inputLabel: {
      fontSize: responsive.getFontSize(14, 13, 16),
      fontFamily: fonts.SemiBold || fonts.Medium,
      marginBottom: responsive.getResponsiveValue(6, 8, 10, 12, 14),
      textAlign: isRTL ? "right" : "left",
      color: colors.text,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: responsive.getResponsiveValue(8, 10, 12, 14, 16),
      padding: responsive.getResponsiveValue(10, 12, 14, 16, 18),
      fontSize: responsive.getFontSize(15, 14, 17),
      fontFamily: fonts.Regular,
      backgroundColor: colors.backgroundSecondary,
      color: colors.text,
      height: responsive.getInputHeight(),
    },
    inputError: { borderColor: colors.error, borderWidth: 1.5 },
    errorText: {
      fontSize: responsive.getFontSize(12, 11, 14),
      fontFamily: fonts.Regular,
      color: colors.error,
      marginTop: responsive.getResponsiveValue(4, 5, 6, 7, 8),
      textAlign: isRTL ? "right" : "left",
    },
    row: {
      flexDirection: isRTL ? "row-reverse" : "row",
      gap: responsive.getResponsiveValue(8, 10, 12, 14, 16),
    },
    expiryRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    expiryInput: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: responsive.getResponsiveValue(8, 10, 12, 14, 16),
      padding: responsive.getResponsiveValue(10, 12, 14, 16, 18),
      fontSize: responsive.getFontSize(15, 14, 17),
      fontFamily: fonts.Regular,
      backgroundColor: colors.backgroundSecondary,
      color: colors.text,
      width: responsive.getResponsiveValue(55, 60, 65, 70, 75),
      textAlign: "center",
    },
    slash: {
      fontSize: responsive.getFontSize(18, 17, 20),
      fontFamily: fonts.Bold,
      marginHorizontal: responsive.getResponsiveValue(6, 8, 10, 12, 14),
      color: colors.textSecondary,
    },
    securityNote: {
      fontSize: responsive.getFontSize(12, 11, 14),
      fontFamily: fonts.Medium || fonts.Regular,
      color: colors.success,
      textAlign: "center",
      marginTop: responsive.getResponsiveValue(8, 10, 12, 14, 16),
    },
  });

  return (
    <View style={styles.container}>
      <Card type="default">
        <Card.Content>
          <Text style={styles.title}>{t.title}</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{t.cardNumber}</Text>
            <TextInput
              style={[styles.input, errors.cardNumber && styles.inputError]}
              value={cardNumber}
              onChangeText={(text) => {
                setCardNumber(formatCardNumber(text.replace(/[^\d]/g, "")));
                if (errors.cardNumber) setErrors({ ...errors, cardNumber: "" });
              }}
              placeholder="1234 5678 9012 3456"
              keyboardType="number-pad"
              maxLength={19}
              textAlign="left"
              placeholderTextColor={colors.textMuted}
              editable={!isDisabled}
            />
            {errors.cardNumber && (
              <Text style={styles.errorText}>{errors.cardNumber}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{t.cardName}</Text>
            <TextInput
              style={[styles.input, errors.cardName && styles.inputError]}
              value={cardName}
              onChangeText={(text) => {
                setCardName(text);
                if (errors.cardName) setErrors({ ...errors, cardName: "" });
              }}
              placeholder="AHMED MOHAMMED"
              autoCapitalize="characters"
              textAlign="left"
              placeholderTextColor={colors.textMuted}
              editable={!isDisabled}
            />
            {errors.cardName && (
              <Text style={styles.errorText}>{errors.cardName}</Text>
            )}
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>{t.expiryDate}</Text>
              <View style={styles.expiryRow}>
                <TextInput
                  style={[
                    styles.expiryInput,
                    errors.expiryMonth && styles.inputError,
                  ]}
                  value={expiryMonth}
                  onChangeText={(text) => {
                    setExpiryMonth(text.replace(/[^\d]/g, "").substring(0, 2));
                    if (errors.expiryMonth)
                      setErrors({ ...errors, expiryMonth: "" });
                  }}
                  placeholder="MM"
                  keyboardType="number-pad"
                  maxLength={2}
                  placeholderTextColor={colors.textMuted}
                  editable={!isDisabled}
                />
                <Text style={styles.slash}>/</Text>
                <TextInput
                  style={[
                    styles.expiryInput,
                    errors.expiryYear && styles.inputError,
                  ]}
                  value={expiryYear}
                  onChangeText={(text) => {
                    setExpiryYear(text.replace(/[^\d]/g, "").substring(0, 2));
                    if (errors.expiryYear)
                      setErrors({ ...errors, expiryYear: "" });
                  }}
                  placeholder="YY"
                  keyboardType="number-pad"
                  maxLength={2}
                  placeholderTextColor={colors.textMuted}
                  editable={!isDisabled}
                />
              </View>
              {(errors.expiryMonth || errors.expiryYear) && (
                <Text style={styles.errorText}>
                  {errors.expiryMonth || errors.expiryYear}
                </Text>
              )}
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>CVV</Text>
              <TextInput
                style={[styles.input, errors.cvv && styles.inputError]}
                value={cvv}
                onChangeText={(text) => {
                  setCvv(text.replace(/[^\d]/g, "").substring(0, 4));
                  if (errors.cvv) setErrors({ ...errors, cvv: "" });
                }}
                placeholder="123"
                keyboardType="number-pad"
                maxLength={4}
                secureTextEntry
                textAlign="center"
                placeholderTextColor={colors.textMuted}
                editable={!isDisabled}
              />
              {errors.cvv && <Text style={styles.errorText}>{errors.cvv}</Text>}
            </View>
          </View>

          <Text style={styles.securityNote}>{t.securityNote}</Text>
        </Card.Content>
      </Card>
    </View>
  );
}
