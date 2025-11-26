-- Drop existing functions to resolve overloading ambiguity
DROP FUNCTION IF EXISTS get_nearest_cars(FLOAT, FLOAT, INT);
DROP FUNCTION IF EXISTS get_nearest_cars(NUMERIC, NUMERIC, INT);

-- Create improved get_nearest_cars function
CREATE OR REPLACE FUNCTION get_nearest_cars(
  _user_lat FLOAT,
  _user_lon FLOAT,
  _limit INT DEFAULT 5
)
RETURNS TABLE (
  car_id UUID,
  brand_name_ar TEXT,
  brand_name_en TEXT,
  model_name_ar TEXT,
  model_name_en TEXT,
  color_name_ar TEXT,
  color_name_en TEXT,
  daily_price NUMERIC,
  branch_name_ar TEXT,
  branch_name_en TEXT,
  branch_location_ar TEXT,
  branch_location_en TEXT,
  distance_meters FLOAT,
  distance_km FLOAT,
  main_image_url TEXT,
  seats INT,
  fuel_type TEXT,
  transmission TEXT,
  is_new BOOLEAN,
  discount_percentage INT,
  actual_available_quantity INT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    cwd.id AS car_id,
    cwd.brand_name_ar,
    cwd.brand_name_en,
    cwd.model_name_ar,
    cwd.model_name_en,
    cwd.color_name_ar,
    cwd.color_name_en,
    cwd.daily_price,
    b.name_ar AS branch_name_ar,
    b.name_en AS branch_name_en,
    b.location_ar AS branch_location_ar,
    b.location_en AS branch_location_en,
    (
      6371000 * acos(
        LEAST(1.0, GREATEST(-1.0,
          cos(radians(_user_lat)) * cos(radians(b.latitude)) *
          cos(radians(b.longitude) - radians(_user_lon)) +
          sin(radians(_user_lat)) * sin(radians(b.latitude))
        ))
      )
    )::FLOAT AS distance_meters,
    (
      6371 * acos(
        LEAST(1.0, GREATEST(-1.0,
          cos(radians(_user_lat)) * cos(radians(b.latitude)) *
          cos(radians(b.longitude) - radians(_user_lon)) +
          sin(radians(_user_lat)) * sin(radians(b.latitude))
        ))
      )
    )::FLOAT AS distance_km,
    cwd.default_image_url AS main_image_url,
    cwd.seats,
    cwd.fuel_type,
    cwd.transmission,
    cwd.is_new,
    cwd.discount_percentage,
    cwd.actual_available_quantity
  FROM cars_with_details cwd
  JOIN branches b ON cwd.branch_id = b.id
  WHERE cwd.status = 'available'
    AND cwd.actual_available_quantity > 0
    AND b.latitude IS NOT NULL
    AND b.longitude IS NOT NULL
  ORDER BY distance_meters ASC
  LIMIT _limit;
END;
$$;
