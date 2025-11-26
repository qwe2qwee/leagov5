import { TextStyle, ViewStyle } from "react-native";

// Badge Component
export interface BadgeProps {
  children: string | number;
  variant?: "default" | "secondary" | "destructive" | "outline";
  style?: ViewStyle;
  textStyle?: TextStyle;
}

// Car interface (simplified version)
export interface Car {
  id: string;
  brand_ar: string;
  brand_en: string;
  model_ar: string;
  model_en: string;
  year: number;
  color_ar: string;
  color_en: string;
  images: string[];
  available: boolean;
  isNew?: boolean;
  discount?: number;
  price: {
    daily: number;
  };
  specs: {
    seats: number;
    transmission_ar: string;
    transmission_en: string;
  };
  branch: {
    location_ar: string;
    location_en: string;
    latitude?: number;
    longitude?: number;
  };
  distance_km?: number;
}

export interface CarCardProps {
  car: Car;
  onSelect?: (car: Car) => void;
  language?: "ar" | "en";
  cardWidth?: number; // For flexible width when cards are side by side
}
