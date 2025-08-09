import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

interface CustomOtpInputsProps {
  numberOfInputs: number;
  onChangeOtp: (otp: string) => void;
  autoFocus?: boolean;
  secureTextEntry?: boolean;
}

const CustomOtpInputs: React.FC<CustomOtpInputsProps> = ({
  numberOfInputs = 6,
  onChangeOtp,
  autoFocus = true,
  secureTextEntry = false,
}) => {
  const [otp, setOtp] = useState<string[]>(new Array(numberOfInputs).fill(""));
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const { colors } = useTheme();
  const fontFamily = useFontFamily();
  const {
    width,
    height,
    isSmallScreen,
    isVerySmallScreen,
    getResponsiveValue,
  } = useResponsive();

  // حساب العرض المتاح للحاويات مع هوامش آمنة
  const containerPadding = getResponsiveValue(16, 20, 24, 28, 32);
  const availableWidth = width - containerPadding * 2;

  // حساب العرض الأمثل لكل حقل إدخال
  const spacingBetweenInputs = getResponsiveValue(4, 6, 8, 10, 12);
  const totalSpacing = spacingBetweenInputs * (numberOfInputs - 1);
  const inputWidth = Math.floor(
    (availableWidth - totalSpacing) / numberOfInputs
  );

  // التأكد من أن العرض لا يقل عن الحد الأدنى ولا يزيد عن الحد الأقصى
  const minInputWidth = isVerySmallScreen ? 35 : 40;
  const maxInputWidth = isSmallScreen ? 50 : 55;
  const finalInputWidth = Math.max(
    minInputWidth,
    Math.min(maxInputWidth, inputWidth)
  );

  // ارتفاع الحقل يجب أن يكون متناسباً
  const inputHeight = finalInputWidth;

  const styles = createStyles(
    colors,
    fontFamily,
    finalInputWidth,
    inputHeight,
    spacingBetweenInputs,
    isSmallScreen,
    isVerySmallScreen
  );

  useEffect(() => {
    const otpValue = otp.join("");
    onChangeOtp(otpValue);
  }, [otp, onChangeOtp]);

  useEffect(() => {
    if (autoFocus) {
      inputRefs.current[0]?.focus();
    }
  }, [autoFocus]);

  const handleChange = (value: string, index: number) => {
    // السماح بحرف واحد فقط
    const sanitizedValue = value.replace(/[^0-9]/g, "").slice(0, 1);

    const newOtp = [...otp];
    newOtp[index] = sanitizedValue;
    setOtp(newOtp);

    // الانتقال التلقائي للحقل التالي
    if (sanitizedValue && index < numberOfInputs - 1) {
      inputRefs.current[index + 1]?.focus();
      setActiveIndex(index + 1);
    } else if (sanitizedValue && index === numberOfInputs - 1) {
      // إذا كان هذا آخر حقل، قم بإزالة التركيز
      inputRefs.current[index]?.blur();
      setActiveIndex(-1);
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace") {
      if (otp[index] === "" && index > 0) {
        // إذا كان الحقل فارغاً، انتقل للحقل السابق
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
        setActiveIndex(index - 1);
      } else {
        // امسح الحقل الحالي
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    }
  };

  const handleFocus = (index: number) => {
    setActiveIndex(index);
  };

  const handleBlur = () => {
    setActiveIndex(-1);
  };

  // وظيفة للنقر على الحقل لتحديد الموضع المناسب
  const handleInputPress = (index: number) => {
    // العثور على أول حقل فارغ أو الحقل المنقور عليه
    const firstEmptyIndex = otp.findIndex((digit) => digit === "");
    const targetIndex =
      firstEmptyIndex !== -1 ? Math.min(firstEmptyIndex, index) : index;

    inputRefs.current[targetIndex]?.focus();
    setActiveIndex(targetIndex);
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        {Array.from({ length: numberOfInputs }, (_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleInputPress(index)}
            activeOpacity={0.8}
          >
            <TextInput
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              style={[
                styles.input,
                activeIndex === index && styles.inputActive,
                otp[index] && styles.inputFilled,
              ]}
              value={otp[index]}
              onChangeText={(value) => handleChange(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              onFocus={() => handleFocus(index)}
              onBlur={handleBlur}
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              maxLength={1}
              selectTextOnFocus
              secureTextEntry={secureTextEntry}
              textAlign="center"
              returnKeyType="next"
              blurOnSubmit={false}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const createStyles = (
  colors: any,
  fontFamily: any,
  inputWidth: number,
  inputHeight: number,
  spacing: number,
  isSmallScreen: boolean,
  isVerySmallScreen: boolean
) =>
  StyleSheet.create({
    container: {
      width: "100%",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: isVerySmallScreen ? 16 : isSmallScreen ? 20 : 24,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing, // استخدام gap بدلاً من marginHorizontal لضمان التوزيع المتساوي
    },
    input: {
      width: inputWidth,
      height: inputHeight,
      borderWidth: 2,
      borderColor: colors.border || "#E5E7EB",
      backgroundColor: colors.inputBackground || colors.background || "#FFFFFF",
      borderRadius: isVerySmallScreen ? 8 : isSmallScreen ? 10 : 12,
      fontSize: isVerySmallScreen ? 16 : isSmallScreen ? 18 : 20,
      fontFamily: fontFamily?.Bold || fontFamily?.SemiBold || "System",
      color: colors.text || "#1F2937",
      textAlign: "center",
      // ضمان المحاذاة العمودية المثالية
      includeFontPadding: false,
      textAlignVertical: "center",
      // إضافة ظلال خفيفة للجمالية
      shadowColor: colors.shadow || "#000000",
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    inputActive: {
      borderColor: colors.primary || "#3B82F6",
      backgroundColor:
        colors.inputActiveBackground || colors.inputBackground || "#FFFFFF",
      shadowColor: colors.primary || "#3B82F6",
      shadowOffset: {
        width: 0,
        height: 0,
      },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 2,
    },
    inputFilled: {
      borderColor: colors.success || colors.primary || "#10B981",
      backgroundColor:
        colors.inputFilledBackground || colors.inputBackground || "#FFFFFF",
    },
  });

export default CustomOtpInputs;
