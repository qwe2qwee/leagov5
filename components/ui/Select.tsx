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
    const b = parseInt(color.slice(7), 16);
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

// Select Value Component - Improved responsive typography
const SelectValue: React.FC<SelectValueProps> = React.memo(
  ({ placeholder = "اختر خيار...", style }) => {
    const { value } = useSelectContext();
    const { colors } = useTheme();
    const responsive = useResponsive();
    const fontFamily = useFontFamily();

    const valueStyle: TextStyle = React.useMemo(
      () => ({
        // Better responsive font size
        fontSize: responsive.getFontSize(15, 14, 17),
        fontFamily: fontFamily.Regular,
        color: value ? colors.text : colors.textSecondary,
        flex: 1,
        textAlign: "right",
        // Improved responsive line height
        lineHeight: Math.round(responsive.getFontSize(15, 14, 17) * 1.3),
      }),
      [responsive, fontFamily.Regular, value, colors.text, colors.textSecondary]
    );

    return (
      <Text style={[valueStyle, style]} numberOfLines={1}>
        {value || placeholder}
      </Text>
    );
  }
);

// Select Trigger Component - Improved responsive sizing
const SelectTrigger: React.FC<SelectTriggerProps> = React.memo(
  ({ children, style, placeholder, disabled = false }) => {
    const { open, setOpen } = useSelectContext();
    const { colors } = useTheme();
    const responsive = useResponsive();

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
        // Better responsive height using input height helper
        height: responsive.getInputHeight(),
        // Improved responsive horizontal padding
        paddingHorizontal: responsive.getResponsiveValue(12, 16, 20, 24, 28),
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: open ? colors.primary : colors.border,
        // Better responsive border radius
        borderRadius: responsive.getResponsiveValue(8, 10, 12, 14, 16),
        opacity: disabled ? 0.5 : 1,
      }),
      [
        responsive,
        colors.surface,
        open,
        colors.primary,
        colors.border,
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
          // Responsive icon size
          size={responsive.getResponsiveValue(14, 16, 18, 20, 22)}
          color={colors.textSecondary}
          style={{
            marginLeft: responsive.getResponsiveValue(6, 8, 10, 12, 14),
          }}
        />
      </TouchableOpacity>
    );
  }
);

// Select Content Component - Improved responsive sizing
const SelectContent: React.FC<SelectContentProps> = React.memo(
  ({ children, style, position = "bottom" }) => {
    const { open, setOpen } = useSelectContext();
    const { colors } = useTheme();
    const responsive = useResponsive();

    const handleClose = React.useCallback(() => {
      setOpen(false);
    }, [setOpen]);

    const contentStyle: ViewStyle = React.useMemo(
      () => ({
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        // Better responsive border radius
        borderRadius: responsive.getResponsiveValue(10, 12, 14, 16, 18),
        // Responsive max height that scales with screen size
        maxHeight: responsive.getResponsiveValue(250, 280, 320, 360, 400),
        // Better responsive horizontal margin
        marginHorizontal: responsive.getResponsiveValue(12, 16, 20, 24, 28),
      }),
      [colors.surface, colors.border, responsive]
    );

    const scrollStyle: ViewStyle = React.useMemo(
      () => ({
        // Better responsive padding
        padding: responsive.getResponsiveValue(4, 6, 8, 10, 12),
      }),
      [responsive]
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
          // Better responsive padding for modal positioning
          paddingTop:
            position === "top"
              ? responsive.getResponsiveValue(24, 32, 40, 48, 56)
              : 0,
          paddingBottom:
            position === "bottom"
              ? responsive.getResponsiveValue(24, 32, 40, 48, 56)
              : 0,
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

// Select Label Component - Improved responsive typography
const SelectLabel: React.FC<SelectLabelProps> = React.memo(
  ({ children, style }) => {
    const { colors } = useTheme();
    const responsive = useResponsive();
    const fontFamily = useFontFamily();

    const labelStyle: TextStyle = React.useMemo(
      () => ({
        // Better responsive font size for labels
        fontSize: responsive.getFontSize(13, 12, 15),
        fontFamily:
          fontFamily.SemiBold || fontFamily.Bold || fontFamily.Regular,
        color: colors.textSecondary,
        // Better responsive horizontal padding
        paddingHorizontal: responsive.getResponsiveValue(12, 16, 20, 24, 28),
        // Better responsive vertical padding
        paddingVertical: responsive.getResponsiveValue(6, 8, 10, 12, 14),
        textAlign: "right",
        // Improved responsive line height
        lineHeight: Math.round(responsive.getFontSize(13, 12, 15) * 1.3),
      }),
      [
        responsive,
        fontFamily.SemiBold,
        fontFamily.Bold,
        fontFamily.Regular,
        colors.textSecondary,
      ]
    );

    return <Text style={[labelStyle, style]}>{children}</Text>;
  }
);

// Select Item Component - Improved responsive sizing
const SelectItem: React.FC<SelectItemProps> = React.memo(
  ({ value, children, disabled = false, style }) => {
    const { value: selectedValue, onValueChange, setOpen } = useSelectContext();
    const { colors } = useTheme();
    const responsive = useResponsive();
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
        // Better responsive vertical padding
        paddingVertical: responsive.getResponsiveValue(10, 12, 16, 18, 20),
        // Better responsive horizontal padding
        paddingHorizontal: responsive.getResponsiveValue(12, 16, 20, 24, 28),
        backgroundColor: isSelected
          ? withOpacity(colors.primary, 0.1)
          : "transparent",
        // Better responsive border radius
        borderRadius: responsive.getResponsiveValue(6, 8, 10, 12, 14),
        // Better responsive vertical margin
        marginVertical: responsive.getResponsiveValue(2, 3, 4, 5, 6),
        opacity: disabled ? 0.5 : 1,
      }),
      [responsive, isSelected, colors.primary, disabled]
    );

    const textStyle: TextStyle = React.useMemo(
      () => ({
        flex: 1,
        // Better responsive font size for items
        fontSize: responsive.getFontSize(15, 14, 17),
        fontFamily: fontFamily.Regular,
        color: isSelected ? colors.primary : colors.text,
        textAlign: "right",
        // Improved responsive line height
        lineHeight: Math.round(responsive.getFontSize(15, 14, 17) * 1.3),
      }),
      [responsive, fontFamily.Regular, isSelected, colors.primary, colors.text]
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
            // Responsive checkmark icon size
            size={responsive.getResponsiveValue(14, 16, 18, 20, 22)}
            color={colors.primary}
            style={{
              marginRight: responsive.getResponsiveValue(6, 8, 10, 12, 14),
            }}
          />
        )}
      </TouchableOpacity>
    );
  }
);

// Select Separator Component - Improved responsive sizing
const SelectSeparator: React.FC<SelectSeparatorProps> = React.memo(
  ({ style }) => {
    const { colors } = useTheme();
    const responsive = useResponsive();

    const separatorStyle: ViewStyle = React.useMemo(
      () => ({
        height: 1,
        backgroundColor: colors.border,
        // Better responsive vertical margin
        marginVertical: responsive.getResponsiveValue(3, 4, 5, 6, 7),
        // Better responsive horizontal margin
        marginHorizontal: responsive.getResponsiveValue(8, 10, 12, 14, 16),
      }),
      [colors.border, responsive]
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

// Basic usage examples:

// Example 1: Simple car type selector
// <Select value={carType} onValueChange={setCarType}>
//   <Select.Trigger placeholder="Select car type" />
//   <Select.Content>
//     <Select.Item value="economy">Economy</Select.Item>
//     <Select.Item value="standard">Standard</Select.Item>
//     <Select.Item value="luxury">Luxury</Select.Item>
//   </Select.Content>
// </Select>

// Example 2: Location selector with groups
// <Select value={location} onValueChange={setLocation}>
//   <Select.Trigger placeholder="Pick up location" />
//   <Select.Content>
//     <Select.Label>Popular Locations</Select.Label>
//     <Select.Item value="airport">Airport</Select.Item>
//     <Select.Item value="downtown">Downtown</Select.Item>
//     <Select.Separator />
//     <Select.Label>All Locations</Select.Label>
//     <Select.Item value="suburb1">Suburb Area 1</Select.Item>
//     <Select.Item value="suburb2">Suburb Area 2</Select.Item>
//   </Select.Content>
// </Select>

// Example 3: Fuel type selector
// <Select value={fuelType} onValueChange={setFuelType}>
//   <Select.Trigger placeholder="Fuel preference" />
//   <Select.Content position="top">
//     <Select.Item value="gasoline">Gasoline</Select.Item>
//     <Select.Item value="electric">Electric</Select.Item>
//     <Select.Item value="hybrid">Hybrid</Select.Item>
//   </Select.Content>
// </Select>
