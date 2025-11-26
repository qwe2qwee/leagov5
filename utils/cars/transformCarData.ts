// ============================
// utils/transformCarData.ts
// ============================

export const transformCarData = (car: any) => ({
  id: car.id || car.car_id,
  brand_ar: car.brand_name_ar || car.car_brand || car.brand_name_en,
  brand_en: car.brand_name_en || car.car_brand,
  model_ar: car.model_name_ar || car.car_model || car.model_name_en,
  model_en: car.model_name_en || car.car_model,
  year: car.model_year || car.year,
  color_ar: car.color_name_ar || car.car_color || car.color_name_en,
  color_en: car.color_name_en || car.car_color,
  images:
    car.additional_images?.length > 0
      ? car.additional_images
      : car.main_image_url
      ? [car.main_image_url]
      : [
          "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400&h=300&fit=crop",
        ],
  available: car.status === "available" && car.available_quantity > 0,
  isNew: car.is_new,
  discount: car.discount_percentage,
  price: {
    daily: car.daily_price,
    weekly: car.weekly_price,
    monthly: car.monthly_price,
  },
  specs: {
    seats: car.seats,
    transmission_ar: car.transmission === "automatic" ? "أوتوماتيك" : "يدوي",
    transmission_en:
      car.transmission?.charAt(0).toUpperCase() + car.transmission?.slice(1),
    fuel_type: car.fuel_type,
  },
  branch: {
    location_ar:
      car.branch_location_ar || car.branch_location || car.branch_location_en,
    location_en: car.branch_location_en || car.branch_location,
    latitude: car.branch_latitude || car.latitude,
    longitude: car.branch_longitude || car.longitude,
  },
  distance_km: car.distance_km,
});
