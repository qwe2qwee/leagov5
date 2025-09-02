import { useFontFamily } from "@/hooks/useFontFamily";
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import * as React from "react";
import {
  ScrollView,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import Modal from "react-native-modal";

// Helper function for opacity
const withOpacity = (color: string, opacity: number): string => {
  if (color.startsWith("#")) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  if (color.startsWith("rgba")) {
    return color.replace(/[\d.]+\)$/g, `${opacity})`);
  }
  return color;
};

// Properly typed interfaces
interface SelectContextType {
  value?: string;
  onValueChange?: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  disabled?: boolean;
}

interface SelectTriggerProps {
  children?: React.ReactNode;
  style?: ViewStyle;
  placeholder?: string;
  disabled?: boolean;
  onPress?: () => void;
}

interface SelectContentProps {
  children: React.ReactNode;
  style?: ViewStyle;
  position?: "top" | "bottom";
}

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  disabled?: boolean;
  style?: ViewStyle;
  onPress?: () => void;
}

interface SelectLabelProps {
  children: React.ReactNode;
  style?: TextStyle;
}

interface SelectValueProps {
  placeholder?: string;
  style?: TextStyle;
}

interface SelectSeparatorProps {
  style?: ViewStyle;
}

// Context for Select state management
const SelectContext = React.createContext<SelectContextType | null>(null);

const useSelectContext = (): SelectContextType => {
  const context = React.useContext(SelectContext);
  if (!context) {
    throw new Error("Select components must be used within a Select");
  }
  return context;
};

// Main Select Component (Root)
const Select: React.FC<SelectProps> = React.memo(
  ({ value, onValueChange, children, disabled = false }) => {
    const [open, setOpen] = React.useState(false);

    const handleSetOpen = React.useCallback(
      (newOpen: boolean) => {
        if (!disabled) {
          setOpen(newOpen);
        }
      },
      [disabled]
    );

    const contextValue = React.useMemo(
      (): SelectContextType => ({
        value,
        onValueChange,
        open,
        setOpen: handleSetOpen,
      }),
      [value, onValueChange, open, handleSetOpen]
    );

    return (
      <SelectContext.Provider value={contextValue}>
        {children}
      </SelectContext.Provider>
    );
  }
);

// Select Group Component
const SelectGroup: React.FC<{ children: React.ReactNode }> = React.memo(
  ({ children }) => {
    return <View>{children}</View>;
  }
);

// Select Value Component
const SelectValue: React.FC<SelectValueProps> = React.memo(
  ({ placeholder = "اختر خيار...", style }) => {
    const { value } = useSelectContext();
    const { colors } = useTheme();
    const { typography } = useResponsive();
    const fontFamily = useFontFamily();

    const valueStyle: TextStyle = React.useMemo(
      () => ({
        fontSize: typography.body,
        fontFamily: fontFamily.Regular,
        color: value ? colors.text : colors.textSecondary,
        flex: 1,
        textAlign: "right",
      }),
      [
        typography.body,
        fontFamily.Regular,
        value,
        colors.text,
        colors.textSecondary,
      ]
    );

    return (
      <Text style={[valueStyle, style]} numberOfLines={1}>
        {value || placeholder}
      </Text>
    );
  }
);

// Select Trigger Component
const SelectTrigger: React.FC<SelectTriggerProps> = React.memo(
  ({ children, style, placeholder, disabled = false }) => {
    const { open, setOpen } = useSelectContext();
    const { colors } = useTheme();
    const { getInputHeight, spacing, getBorderRadius } = useResponsive();

    const handlePress = React.useCallback(() => {
      if (!disabled) {
        setOpen(!open);
      }
    }, [disabled, open, setOpen]);

    const triggerStyle: ViewStyle = React.useMemo(
      () => ({
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        height: getInputHeight(),
        paddingHorizontal: spacing.md,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: open ? colors.primary : colors.border,
        borderRadius: getBorderRadius("small"),
        opacity: disabled ? 0.5 : 1,
      }),
      [
        getInputHeight,
        spacing.md,
        colors.surface,
        open,
        colors.primary,
        colors.border,
        getBorderRadius,
        disabled,
      ]
    );

    return (
      <TouchableOpacity
        style={[triggerStyle, style]}
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.7}
      >
        {children || <SelectValue placeholder={placeholder} />}
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={16}
          color={colors.textSecondary}
          style={{ marginLeft: spacing.sm }}
        />
      </TouchableOpacity>
    );
  }
);

// Select Content Component
const SelectContent: React.FC<SelectContentProps> = React.memo(
  ({ children, style, position = "bottom" }) => {
    const { open, setOpen } = useSelectContext();
    const { colors } = useTheme();
    const { spacing, getBorderRadius } = useResponsive();

    const handleClose = React.useCallback(() => {
      setOpen(false);
    }, [setOpen]);

    const contentStyle: ViewStyle = React.useMemo(
      () => ({
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: getBorderRadius("medium"),
        maxHeight: 300,
        marginHorizontal: spacing.md,
      }),
      [colors.surface, colors.border, getBorderRadius, spacing.md]
    );

    const scrollStyle: ViewStyle = React.useMemo(
      () => ({
        padding: spacing.xs,
      }),
      [spacing.xs]
    );

    return (
      <Modal
        isVisible={open}
        onBackdropPress={handleClose}
        onBackButtonPress={handleClose}
        backdropOpacity={0.5}
        animationIn={position === "top" ? "slideInDown" : "slideInUp"}
        animationOut={position === "top" ? "slideOutUp" : "slideOutDown"}
        animationInTiming={300}
        animationOutTiming={250}
        backdropTransitionInTiming={300}
        backdropTransitionOutTiming={250}
        style={{
          justifyContent: position === "top" ? "flex-start" : "flex-end",
          margin: 0,
          paddingTop: position === "top" ? spacing.xl : 0,
          paddingBottom: position === "bottom" ? spacing.xl : 0,
        }}
      >
        <View style={[contentStyle, style]}>
          <ScrollView style={scrollStyle} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
        </View>
      </Modal>
    );
  }
);

// Select Label Component
const SelectLabel: React.FC<SelectLabelProps> = React.memo(
  ({ children, style }) => {
    const { colors } = useTheme();
    const { typography, spacing } = useResponsive();
    const fontFamily = useFontFamily();

    const labelStyle: TextStyle = React.useMemo(
      () => ({
        fontSize: typography.caption,
        fontFamily:
          fontFamily.SemiBold || fontFamily.Bold || fontFamily.Regular,
        color: colors.textSecondary,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        textAlign: "right",
      }),
      [
        typography.caption,
        fontFamily.SemiBold,
        fontFamily.Bold,
        fontFamily.Regular,
        colors.textSecondary,
        spacing.md,
        spacing.sm,
      ]
    );

    return <Text style={[labelStyle, style]}>{children}</Text>;
  }
);

// Select Item Component
const SelectItem: React.FC<SelectItemProps> = React.memo(
  ({ value, children, disabled = false, style }) => {
    const { value: selectedValue, onValueChange, setOpen } = useSelectContext();
    const { colors } = useTheme();
    const { spacing, getBorderRadius, typography } = useResponsive();
    const fontFamily = useFontFamily();

    const isSelected = selectedValue === value;

    const handlePress = React.useCallback(() => {
      if (!disabled && onValueChange) {
        onValueChange(value);
        setOpen(false);
      }
    }, [disabled, onValueChange, value, setOpen]);

    const itemStyle: ViewStyle = React.useMemo(
      () => ({
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
        backgroundColor: isSelected
          ? withOpacity(colors.primary, 0.1)
          : "transparent",
        borderRadius: getBorderRadius("small"),
        marginVertical: spacing.xs,
        opacity: disabled ? 0.5 : 1,
      }),
      [
        spacing.md,
        spacing.xs,
        isSelected,
        colors.primary,
        getBorderRadius,
        disabled,
      ]
    );

    const textStyle: TextStyle = React.useMemo(
      () => ({
        flex: 1,
        fontSize: typography.body,
        fontFamily: fontFamily.Regular,
        color: isSelected ? colors.primary : colors.text,
        textAlign: "right",
      }),
      [
        typography.body,
        fontFamily.Regular,
        isSelected,
        colors.primary,
        colors.text,
      ]
    );

    return (
      <TouchableOpacity
        style={[itemStyle, style]}
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Text style={textStyle}>{children}</Text>
        {isSelected && (
          <Ionicons
            name="checkmark"
            size={16}
            color={colors.primary}
            style={{ marginRight: spacing.sm }}
          />
        )}
      </TouchableOpacity>
    );
  }
);

// Select Separator Component
const SelectSeparator: React.FC<SelectSeparatorProps> = React.memo(
  ({ style }) => {
    const { colors } = useTheme();
    const { spacing } = useResponsive();

    const separatorStyle: ViewStyle = React.useMemo(
      () => ({
        height: 1,
        backgroundColor: colors.border,
        marginVertical: spacing.xs,
        marginHorizontal: spacing.sm,
      }),
      [colors.border, spacing.xs, spacing.sm]
    );

    return <View style={[separatorStyle, style]} />;
  }
);

// Set display names
Select.displayName = "Select";
SelectGroup.displayName = "SelectGroup";
SelectValue.displayName = "SelectValue";
SelectTrigger.displayName = "SelectTrigger";
SelectContent.displayName = "SelectContent";
SelectLabel.displayName = "SelectLabel";
SelectItem.displayName = "SelectItem";
SelectSeparator.displayName = "SelectSeparator";

// Compound component with proper typing
const SelectWithComponents = Object.assign(Select, {
  Group: SelectGroup,
  Value: SelectValue,
  Trigger: SelectTrigger,
  Content: SelectContent,
  Label: SelectLabel,
  Item: SelectItem,
  Separator: SelectSeparator,
});

export {
  SelectWithComponents as Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};

export default SelectWithComponents;
