import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/hooks/useTheme";
import { Image, StyleSheet, View } from "react-native";

interface CarImageProps {
  imageUrl?: string;
}

export default function CarImage({ imageUrl }: CarImageProps) {
  const { colors } = useTheme();
  const responsive = useResponsive();

  const styles = StyleSheet.create({
    container: {
      marginHorizontal: responsive.getResponsiveValue(12, 16, 20, 24, 28),
      marginTop: responsive.getResponsiveValue(12, 16, 20, 24, 28),
      borderRadius: responsive.getResponsiveValue(10, 12, 14, 16, 18),
      overflow: "hidden",
      backgroundColor: colors.surface,
    },
    image: {
      width: "100%",
      height: responsive.getResponsiveValue(200, 220, 250, 280, 300),
    },
  });

  return (
    <View style={styles.container}>
      <Image
        source={{
          uri: imageUrl || "https://via.placeholder.com/400",
        }}
        style={styles.image}
        resizeMode="cover"
      />
    </View>
  );
}
