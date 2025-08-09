// Type definitions
export type Language = "en" | "ar";

export interface Neighborhood {
  name: {
    en: string; // English name
    ar: string; // Arabic name
  };
  lat: number;
  lon: number;
}

export interface City {
  name: string;
  neighborhoods: Neighborhood[];
}

export type Gender = "male" | "female" | "other";
