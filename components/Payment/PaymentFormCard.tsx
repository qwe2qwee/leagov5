import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import useLanguageStore from "@/store/useLanguageStore";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

interface PaymentFormCardProps {
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

export default function PaymentFormCard({
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
}: PaymentFormCardProps) {
  const { colors } = useTheme();
  const responsive = useResponsive();
  const fonts = useFontFamily();
  const { currentLanguage, isRTL } = useLanguageStore();

  const t = {
    title: currentLanguage === "ar" ? "بيانات الدفع" : "Payment Details",
    cardNumber: currentLanguage === "ar" ? "رقم البطاقة" : "Card Number",
    cardName: currentLanguage === "ar" ? "الاسم على البطاقة" : "Name on Card",
    expiryDate: currentLanguage === "ar" ? "تاريخ الانتهاء" : "Expiry Date",
    cvv: "CVV",
    secure: currentLanguage === "ar" ? "دفع آمن ومشفر" : "Secure & Encrypted",
  };

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, "");
    const formatted = cleaned.match(/.{1,4}/g)?.join(" ") || cleaned;
    return formatted.substring(0, 19);
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderRadius: responsive.getBorderRadius("large"),
      padding: responsive.spacing.lg,
      marginBottom: responsive.spacing.xl,
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 4,
      borderWidth: 1,
      borderColor: colors.border,
    },
    header: {
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: responsive.spacing.lg,
    },
    headerTitleContainer: {
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      gap: responsive.spacing.sm,
    },
    headerTitle: {
      fontSize: responsive.getFontSize(18),
      fontFamily: fonts.Bold,
      color: colors.text,
    },
    logos: {
      flexDirection: isRTL ? "row-reverse" : "row",
      gap: 6,
    },
    logo: {
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      backgroundColor: colors.background,
    },
    logoText: {
      fontSize: 10,
      fontFamily: fonts.Bold,
      color: colors.textSecondary,
    },
    inputGroup: {
      marginBottom: responsive.spacing.md,
    },
    label: {
      fontSize: responsive.getFontSize(14),
      fontFamily: fonts.Medium,
      color: colors.text,
      marginBottom: 8,
      textAlign: isRTL ? "right" : "left",
    },
    inputWrapper: {
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: responsive.getBorderRadius("medium"),
      backgroundColor: colors.background,
      paddingHorizontal: responsive.spacing.md,
      height: 50,
    },
    inputWrapperError: {
      borderColor: colors.error,
    },
    input: {
      flex: 1,
      fontSize: responsive.getFontSize(16),
      fontFamily: fonts.Regular,
      color: colors.text,
      textAlign: isRTL ? "right" : "left",
      height: "100%",
    },
    icon: {
      marginHorizontal: 8,
    },
    row: {
      flexDirection: isRTL ? "row-reverse" : "row",
      gap: responsive.spacing.md,
    },
    halfInput: {
      flex: 1,
    },
    expiryContainer: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    expiryInput: {
      flex: 1,
      textAlign: "center",
      fontSize: responsive.getFontSize(16),
      fontFamily: fonts.Regular,
      color: colors.text,
    },
    slash: {
      fontSize: responsive.getFontSize(18),
      color: colors.textSecondary,
      marginHorizontal: 4,
    },
    errorText: {
      fontSize: responsive.getFontSize(12),
      fontFamily: fonts.Regular,
      color: colors.error,
      marginTop: 4,
      textAlign: isRTL ? "right" : "left",
    },
    secureBadge: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginTop: responsive.spacing.md,
      gap: 6,
      opacity: 0.7,
    },
    secureText: {
      fontSize: responsive.getFontSize(12),
      fontFamily: fonts.Medium,
      color: colors.success,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Ionicons name="card-outline" size={24} color={colors.primary} />
          <Text style={styles.headerTitle}>{t.title}</Text>
        </View>
        <View style={styles.logos}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>Mada</Text>
          </View>
          <View style={styles.logo}>
            <Text style={styles.logoText}>VISA</Text>
          </View>
          <View style={styles.logo}>
            <Text style={styles.logoText}>Mastercard</Text>
          </View>
        </View>
      </View>

      {/* Card Number */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>{t.cardNumber}</Text>
        <View
          style={[
            styles.inputWrapper,
            errors.cardNumber && styles.inputWrapperError,
          ]}
        >
          <Ionicons
            name="card"
            size={20}
            color={colors.textSecondary}
            style={styles.icon}
          />
          <TextInput
            style={styles.input}
            value={cardNumber}
            onChangeText={(text) => {
              setCardNumber(formatCardNumber(text.replace(/[^\d]/g, "")));
              if (errors.cardNumber) setErrors({ ...errors, cardNumber: "" });
            }}
            placeholder="0000 0000 0000 0000"
            keyboardType="number-pad"
            maxLength={19}
            placeholderTextColor={colors.textMuted}
            editable={!isDisabled}
          />
        </View>
        {errors.cardNumber && (
          <Text style={styles.errorText}>{errors.cardNumber}</Text>
        )}
      </View>

      {/* Card Name */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>{t.cardName}</Text>
        <View
          style={[
            styles.inputWrapper,
            errors.cardName && styles.inputWrapperError,
          ]}
        >
          <Ionicons
            name="person-outline"
            size={20}
            color={colors.textSecondary}
            style={styles.icon}
          />
          <TextInput
            style={styles.input}
            value={cardName}
            onChangeText={(text) => {
              setCardName(text);
              if (errors.cardName) setErrors({ ...errors, cardName: "" });
            }}
            placeholder="FULL NAME"
            autoCapitalize="characters"
            placeholderTextColor={colors.textMuted}
            editable={!isDisabled}
          />
        </View>
        {errors.cardName && (
          <Text style={styles.errorText}>{errors.cardName}</Text>
        )}
      </View>

      <View style={styles.row}>
        {/* Expiry Date */}
        <View style={styles.halfInput}>
          <Text style={styles.label}>{t.expiryDate}</Text>
          <View
            style={[
              styles.inputWrapper,
              (errors.expiryMonth || errors.expiryYear) &&
                styles.inputWrapperError,
            ]}
          >
            <Ionicons
              name="calendar-outline"
              size={20}
              color={colors.textSecondary}
              style={styles.icon}
            />
            <View style={styles.expiryContainer}>
              <TextInput
                style={styles.expiryInput}
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
                style={styles.expiryInput}
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
          </View>
          {(errors.expiryMonth || errors.expiryYear) && (
            <Text style={styles.errorText}>
              {errors.expiryMonth || errors.expiryYear}
            </Text>
          )}
        </View>

        {/* CVV */}
        <View style={styles.halfInput}>
          <Text style={styles.label}>{t.cvv}</Text>
          <View
            style={[styles.inputWrapper, errors.cvv && styles.inputWrapperError]}
          >
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={colors.textSecondary}
              style={styles.icon}
            />
            <TextInput
              style={[styles.input, { textAlign: "center" }]}
              value={cvv}
              onChangeText={(text) => {
                setCvv(text.replace(/[^\d]/g, "").substring(0, 4));
                if (errors.cvv) setErrors({ ...errors, cvv: "" });
              }}
              placeholder="123"
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
              placeholderTextColor={colors.textMuted}
              editable={!isDisabled}
            />
          </View>
          {errors.cvv && <Text style={styles.errorText}>{errors.cvv}</Text>}
        </View>
      </View>

      <View style={styles.secureBadge}>
        <Ionicons name="shield-checkmark" size={14} color={colors.success} />
        <Text style={styles.secureText}>{t.secure}</Text>
      </View>
    </View>
  );
}
