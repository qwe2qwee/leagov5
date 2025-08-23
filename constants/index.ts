import { City } from "@/types";

export const icons = {
  arrowDown: require("../assets/icons/arrow-down.png"),
  arrowUp: require("../assets/icons/arrow-up.png"),
  backArrow: require("../assets/icons/back-arrow.png"),
  bills: require("../assets/icons/bills.png"),
  checkmark: require("../assets/icons/check.png"),
  close: require("../assets/icons/close.png"),
  dollar: require("../assets/icons/dollar.png"),
  sendpassLogo: require("../assets/icons/sendpassLogo.png"),
  smartphone: require("../assets/icons/smartphone.png"),
  route: require("../assets/icons/route.png"),
  email: require("../assets/icons/email.png"),
  eyecross: require("../assets/icons/eyecross.png"),
  google: require("../assets/icons/google.png"),
  home: require("../assets/icons/home.png"),
  list: require("../assets/icons/list.png"),
  lock: require("../assets/icons/lock.png"),
  map: require("../assets/icons/map.png"),
  marker: require("../assets/icons/marker.png"),
  out: require("../assets/icons/out.png"),
  riyalsymbol: require("../assets/icons/riyalsymbol.png"),
  person: require("../assets/icons/person.png"),
  pin: require("../assets/icons/pin.png"),
  point: require("../assets/icons/point.png"),
  profile: require("../assets/icons/profile.png"),
  search: require("../assets/icons/search.png"),
  star: require("../assets/icons/star.png"),
  target: require("../assets/icons/target.png"),
  to: require("../assets/icons/to.png"),
  people: require("../assets/icons/people.png"),
  phone: require("../assets/icons/Phone.png"),
  backHome: require("../assets/icons/backHome.png"),
  hyundai: require("../assets/icons/hyundai1.png"),
  HeartD: require("../assets/icons/HeartD.png"),
  Danger: require("../assets/icons/Danger.png"),
  Time: require("../assets/icons/Time.png"),
  docsImage: require("../assets/icons/docsImage.png"),
  support: require("../assets/icons/support.png"),
  point1: require("../assets/icons/point1.png"),
  fallbackMap: require("../assets/icons/fallbackMap.png"),
  add: require("../assets/icons/add.png"),
  camera: require("../assets/icons/camera.png"),
  Illustration: require("../assets/icons/Illustration.png"),
};

export const images = {
  onboarding1_en: require("../assets/images/onboarding1_en.png"),
  onboarding1_ar: require("../assets/images/onboarding1_ar.png"),
  onboarding2: require("../assets/images/onboarding2.png"),
  onboarding3: require("../assets/images/onboarding3.png"),
  signUpCar: require("../assets/images/signUpCar.png"),
};

// Define the Colors object and its type
export const Colors = {
  RED: "#FF0000",
  BLUE: "#0000FF",
  GREEN: "#008000",
  YELLOW: "#FFFF00",
  ORANGE: "#FFA500",
  PURPLE: "#800080",
  PINK: "#FFC0CB",
  BROWN: "#A52A2A",
  BLACK: "#000000",
  WHITE: "#FFFFFF",
  GRAY: "#808080",
  CYAN: "#00FFFF",
  MAGENTA: "#FF00FF",
  LIME: "#00FF00",
  NAVY: "#000080",
  TEAL: "#008080",
  OLIVE: "#808000",
  MAROON: "#800000",
  SILVER: "#C0C0C0",
  GOLD: "#FFD700",
} as const;

type ColorName = keyof typeof Colors;

export function getColorHashCode(colorName: string): string {
  // Convert the color name to uppercase
  const colorNameUpperCase = colorName.toUpperCase() as ColorName;

  // Check if the color name exists in the Colors object
  if (colorNameUpperCase in Colors) {
    return Colors[colorNameUpperCase];
  } else {
    return "Color not found";
  }
}

// Mock function to fetch car details (replace with actual Appwrite query)
export async function fetchCarDetails(
  carId: string
): Promise<{ name: string | null; year: string | null; color: string | null }> {
  try {
    console.log(`Fetching car details for carId: ${carId}`);
    // Replace the following line with actual Appwrite database query
    return {
      name: `CarName-${carId}`,
      year: `Year-${carId}`,
      color: `Color-${carId}`,
    };
  } catch (error) {
    console.error("Error fetching car details:", error);
    return { name: null, year: null, color: null };
  }
}

// Function to calculate the distance in kilometers between two points
export const calculateDistanceInKmm = (loc1: any, loc2: any) => {
  const toRad = (value: any) => (value * Math.PI) / 180;

  const R = 6371; // Radius of the Earth in kilometers
  const dLat = toRad(loc2.lat - loc1.lat);
  const dLon = toRad(loc2.lon - loc1.lon);
  const lat1 = toRad(loc1.lat);
  const lat2 = toRad(loc2.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1)); // Distance formatted to one decimal place
};

export function generateRandomPassword(
  length: number = 12, // Default password length
  includeUppercase: boolean = true,
  includeNumbers: boolean = true,
  includeSymbols: boolean = true
): string {
  const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
  const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numberChars = "0123456789";
  const symbolChars = "!@#$%^&*()_+[]{}|;:,.<>?";

  let characterPool = lowercaseChars;

  if (includeUppercase) characterPool += uppercaseChars;
  if (includeNumbers) characterPool += numberChars;
  if (includeSymbols) characterPool += symbolChars;

  if (characterPool.length === 0) {
    throw new Error("At least one character type must be selected.");
  }

  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characterPool.length);
    password += characterPool[randomIndex];
  }

  return password;
}

export const getAvailableRentType = (rentType: any, t: any) => {
  if (rentType?.monthly?.availability) {
    return { type: t.monthly, price: rentType.monthly.price };
  } else if (rentType?.weekly?.availability) {
    return { type: t.weekly, price: rentType.weekly.price };
  } else if (rentType?.daily?.availability) {
    return { type: t.daily, price: rentType.daily.price };
  } else {
    return { type: t.notAvailable, price: t.n }; // Fallback
  }
};

export const calculateDays = (
  startDate: Date | null,
  endDate: Date | null
): number => {
  if (!startDate || !endDate) return 0;

  const diffTime = endDate.getTime() - startDate.getTime(); // Time difference in milliseconds
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Convert to days
  return diffDays;
};

export const cities: City[] = [
  {
    name: "Jeddah",
    neighborhoods: [
      {
        name: { en: "Al Safa", ar: "الصّفا" },
        lat: 21.583301,
        lon: 39.205425,
      },
      {
        name: { en: "Al Salamah", ar: "السلامة" },
        lat: 21.584546,
        lon: 39.157053,
      },
      {
        name: { en: "Al Rawdah", ar: "الروضة" },
        lat: 21.568743,
        lon: 39.15774,
      },
      {
        name: { en: "Al Faisaliyah", ar: "الفيصلية" },
        lat: 21.565765,
        lon: 39.182146,
      },
      {
        name: { en: "Al Hamra", ar: "الحمراء" },
        lat: 21.62487,
        lon: 39.125568,
      },
      {
        name: { en: "Al Aziziyah", ar: "العزيزية" },
        lat: 21.55463,
        lon: 39.190225,
      },
      {
        name: { en: "Al Rehab", ar: "الرحاب" },
        lat: 21.548738,
        lon: 39.225671,
      },
      {
        name: { en: "Al Khalidiyah", ar: "الخالدية" },
        lat: 21.556913,
        lon: 39.134286,
      },
      {
        name: { en: "Al Bawadi", ar: "البوادي" },
        lat: 21.604099,
        lon: 39.164518,
      },
      {
        name: { en: "Al Zahra", ar: "الزهراء" },
        lat: 21.592033,
        lon: 39.13511,
      },
      {
        name: { en: "Al Shati", ar: "الشاطئ" },
        lat: 21.581561,
        lon: 39.116352,
      },
      {
        name: { en: "Al Naseem", ar: "النسيم" },
        lat: 21.51923,
        lon: 39.231168,
      },
      {
        name: { en: "Al Andalous", ar: "الأندلس" },
        lat: 21.537035,
        lon: 39.131648,
      },
      {
        name: { en: "Al Balad", ar: "البلد" },
        lat: 21.484396,
        lon: 39.186204,
      },
      {
        name: { en: "Al Mohamadiyah", ar: "المحمدية" },
        lat: 21.645478,
        lon: 39.127077,
      },
      {
        name: { en: "Al Marwah", ar: "المروة" },
        lat: 21.619564,
        lon: 39.200186,
      },
      {
        name: { en: "Al Naeem", ar: "النعيم" },
        lat: 21.620505,
        lon: 39.148591,
      },
      {
        name: { en: "Al Sharafiyah", ar: "الشرفية" },
        lat: 21.525362,
        lon: 39.187825,
      },
      {
        name: { en: "Al Thagher", ar: "الثغر" },
        lat: 21.480003,
        lon: 39.22431,
      },
      {
        name: { en: "Prince Fawaz", ar: "الأمير فواز" },
        lat: 21.424979,
        lon: 39.298643,
      },
      {
        name: { en: "Al Salihiyah", ar: "الصالحية" },
        lat: 21.765829,
        lon: 39.211559,
      },
      // إضافة الحيانية
      {
        name: { en: "Al Hamdaniyah", ar: "الحمدانية" },
        lat: 21.750914,
        lon: 39.195752,
      },
      // الأحياء الجديدة المضافة
      {
        name: { en: "Al Baghdadiyah", ar: "البغدادية" },
        lat: 21.493193,
        lon: 39.178531,
      },
      {
        name: { en: "Al Ruwais", ar: "الرويس" },
        lat: 21.504848,
        lon: 39.169144,
      },
      {
        name: { en: "Al Samer", ar: "السامر" },
        lat: 21.590109,
        lon: 39.243783,
      },
      {
        name: { en: "Al Kandrah", ar: "الكندرة" },
        lat: 21.492566,
        lon: 39.199798,
      },
      {
        name: { en: "Al Murjan", ar: "المرجان" },
        lat: 21.683575,
        lon: 39.103891,
      },
      {
        name: { en: "Al Waha", ar: "الواحة" },
        lat: 21.557057,
        lon: 39.241236,
      },
      {
        name: { en: "Al Sabeel", ar: "السبيل" },
        lat: 21.480362,
        lon: 39.201619,
      },
      {
        name: { en: "Al Nuzha", ar: "النزهة" },
        lat: 21.621447,
        lon: 39.172133,
      },
      {
        name: { en: "Al Rabwah", ar: "الربوة" },
        lat: 21.598497,
        lon: 39.185189,
      },
    ],
  },
  // Add more cities as needed
];

export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export const blurhash =
  "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";
